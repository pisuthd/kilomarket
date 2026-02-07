import {
    NitroliteClient,
    WalletStateSigner,
    createECDSAMessageSigner,
    createEIP712AuthMessageSigner,
    createAuthRequestMessage,
    createAuthVerifyMessageFromChallenge,
    createGetLedgerBalancesMessage,
    createCloseChannelMessage,
    createCreateChannelMessage,
    createTransferMessage,
    createResizeChannelMessage,
} from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import WebSocket from 'ws';
import { ethers } from 'ethers';

// Yellow Network Configuration  
const YELLOW_CONFIG: any = {
    WS_URL: 'wss://clearnet-sandbox.yellow.com/ws',
    ADDRESSES: {
        custody: '0x019B65A265EB3363822f2752141b3dF16131b262',
        adjudicator: '0x7c7ccbc98469190849BCC6c926307794fDfB11F2',
    },
    CHAIN_ID: 11155111, // Sepolia
    CHALLENGE_DURATION: 3600n,
    TOKEN: '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb' // ytest.usd
};

interface ChannelInfo {
    channel_id: string;
    status: 'open' | 'closed';
    token: string;
    amount: string;
    balance?: string;
    created_at?: number;
}

interface YellowClientState {
    ws: WebSocket | null;
    client: NitroliteClient | null;
    sessionPrivateKey: string;
    sessionAccount: any;
    sessionSigner: any;
    isAuthenticated: boolean;
    channels: ChannelInfo[];
    account: any;
    publicClient: any;
    walletClient: any;
    messageHandlers: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>;
}

export class YellowNetworkClient {
    private state: YellowClientState;

    constructor(walletPrivateKey: string) {
        this.state = {
            ws: null,
            client: null,
            sessionPrivateKey: '',
            sessionAccount: null,
            sessionSigner: null,
            isAuthenticated: false,
            channels: [],
            account: null,
            publicClient: null,
            walletClient: null,
            messageHandlers: new Map()
        };

        this.initializeClients(walletPrivateKey);
    }

    private initializeClients(walletPrivateKey: string) {
        // Validate wallet private key
        if (!walletPrivateKey) {
            throw new Error('Wallet private key is required');
        }
        
        if (typeof walletPrivateKey !== 'string') {
            throw new Error(`Wallet private key must be a string, got ${typeof walletPrivateKey}`);
        }

        // Setup account
        const formattedPrivateKey = walletPrivateKey.startsWith('0x') ? walletPrivateKey : `0x${walletPrivateKey}`;
        this.state.account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

        // Setup Viem clients
        const RPC_URL = 'https://1rpc.io/sepolia'; // Public fallback
        this.state.publicClient = createPublicClient({
            chain: sepolia,
            transport: http(RPC_URL),
        });

        this.state.walletClient = createWalletClient({
            account: this.state.account,
            chain: sepolia,
            transport: http(RPC_URL),
        });

        // Initialize Nitrolite client
        this.state.client = new NitroliteClient({
            publicClient: this.state.publicClient,
            walletClient: this.state.walletClient,
            addresses: YELLOW_CONFIG.ADDRESSES,
            challengeDuration: YELLOW_CONFIG.CHALLENGE_DURATION,
            chainId: YELLOW_CONFIG.CHAIN_ID,
            stateSigner: new WalletStateSigner(this.state.walletClient),
        });
    }

    private async setupWebSocket(): Promise<void> {
        if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.state.ws = new WebSocket(YELLOW_CONFIG.WS_URL);

            this.state.ws.on('open', () => {
                // Set up centralized message handler
                this.state.ws!.on('message', this.handleWebSocketMessage.bind(this));
                resolve();
            });

            this.state.ws.on('error', (err: Error) => {
                console.error('WebSocket error:', err);
                reject(err);
            });
        });
    }

    private handleWebSocketMessage(data: any): void {
        try {
            const response = JSON.parse(data.toString());
            // console.log('Received WS message:', JSON.stringify(response, null, 2));

            // Handle error responses
            if (response.error) {
                // Check if any handler is waiting for this error
                for (const [messageType, handler] of this.state.messageHandlers.entries()) {
                    clearTimeout(handler.timeout);
                    handler.reject(new Error(response.error.message || 'WebSocket operation failed'));
                    this.state.messageHandlers.delete(messageType);
                }
                return;
            }

            // Handle response messages
            if (response.res && response.res[1]) {
                const messageType = response.res[1];
                const handler = this.state.messageHandlers.get(messageType);
                
                if (handler) {
                    clearTimeout(handler.timeout);
                    handler.resolve(response);
                    this.state.messageHandlers.delete(messageType);
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    private async sendAndWaitForResponse<T>(message: string, expectedMessageType: string, timeoutMs: number = 30000): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.state.messageHandlers.delete(expectedMessageType);
                reject(new Error(`${expectedMessageType} timeout`));
            }, timeoutMs);

            // Store the handler for this message type
            this.state.messageHandlers.set(expectedMessageType, { resolve, reject, timeout });

            // Send the message
            this.state.ws!.send(message);
        });
    }

    private async setupSessionKeys(): Promise<void> {
        // Generate session keypair
        this.state.sessionPrivateKey = generatePrivateKey();
        this.state.sessionAccount = privateKeyToAccount(this.state.sessionPrivateKey as `0x${string}`);
        this.state.sessionSigner = createECDSAMessageSigner(this.state.sessionPrivateKey as `0x${string}`);
    }

    private async authenticate(): Promise<void> {
        if (this.state.isAuthenticated) {
            return;
        }

        await this.setupWebSocket();
        await this.setupSessionKeys();

        // Auth parameters
        const authParams = {
            session_key: this.state.sessionAccount.address,
            allowances: [{ asset: 'ytest.usd', amount: '1000000000' }],
            expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
            scope: 'test.app',
        };

        const authRequestMsg = await createAuthRequestMessage({
            address: this.state.account.address,
            application: 'KiloMarket MCP',
            ...authParams
        });

        // Send auth request
        this.state.ws!.send(authRequestMsg);

        // Wait for auth challenge
        const challengeResponse = await this.sendAndWaitForResponse<any>(authRequestMsg, 'auth_challenge', 30000);
        
        // Handle auth challenge
        const challenge = challengeResponse.res[2].challenge_message;
        const signer = createEIP712AuthMessageSigner(
            this.state.walletClient,
            authParams,
            { name: 'KiloMarket MCP' }
        );

        const verifyMsg = await createAuthVerifyMessageFromChallenge(signer, challenge);
        
        // Send verify message and wait for auth verify response
        await this.sendAndWaitForResponse<any>(verifyMsg, 'auth_verify', 30000);
        
        this.state.isAuthenticated = true;
    }

    async listChannels(): Promise<ChannelInfo[]> {
        await this.authenticate();

        // Send ledger balances request (this will return channels in the response)
        const ledgerMsg = await createGetLedgerBalancesMessage(
            this.state.sessionSigner,
            this.state.account.address,
            Date.now()
        );

        // Use centralized message handling to get ledger balances first
        const response = await this.sendAndWaitForResponse<any>(ledgerMsg, 'channels', 10000);
        
        // Extract channels from the ledger balances response
        const channels = response.res[2].channels || [];
        const channelInfos: ChannelInfo[] = channels.map((channel: any) => ({
            channel_id: channel.channel_id,
            status: channel.status,
            token: channel.token,
            amount: channel.amount,
            // balance: channel.balance,
            created_at: channel.created_at
        }));

        this.state.channels = channelInfos;
        return channelInfos;
    }

    async closeChannel(channelId?: string): Promise<string> {
        await this.authenticate();

        // Get channels if not provided
        let targetChannelId = channelId;
        if (!targetChannelId) {
            const channels = await this.listChannels();
            const openChannel = channels.find(c => c.status === 'open');
            if (!openChannel) {
                throw new Error('No open channels found to close');
            }
            targetChannelId = openChannel.channel_id;
        }

        // Send close request
        const closeMsg = await createCloseChannelMessage(
            this.state.sessionSigner,
            targetChannelId as `0x${string}`,
            this.state.account.address
        );

        // Use centralized message handling
        const response = await this.sendAndWaitForResponse<any>(closeMsg, 'close_channel', 60000);
        
        const { channel_id, state, server_signature } = response.res[2];

        // Submit close to blockchain
        const txHash = await this.state.client!.closeChannel({
            finalState: {
                intent: state.intent,
                version: BigInt(state.version),
                data: state.state_data || state.data,
                allocations: state.allocations.map((a: any) => ({
                    destination: a.destination,
                    token: a.token,
                    amount: BigInt(a.amount),
                })),
                channelId: channel_id,
                serverSignature: server_signature,
            },
            stateData: state.state_data || state.data || '0x',
        });
        
        return txHash;
    }

    async createChannel(): Promise<string> {
        await this.authenticate();

        // Send create channel request
        const createMsg = await createCreateChannelMessage(
            this.state.sessionSigner,
            {
                chain_id: YELLOW_CONFIG.CHAIN_ID,
                token: YELLOW_CONFIG.TOKEN,
            }
        );

        // Use centralized message handling
        const response = await this.sendAndWaitForResponse<any>(createMsg, 'create_channel', 60000);
        
        const { channel_id, channel, state, server_signature } = response.res[2];

        // Submit to blockchain
        const unsignedInitialState = {
            intent: state.intent,
            version: BigInt(state.version),
            data: state.state_data,
            allocations: state.allocations.map((a: any) => ({
                destination: a.destination,
                token: a.token,
                amount: BigInt(a.amount),
            })),
        };

        const result = await this.state.client!.createChannel({
            channel,
            unsignedInitialState,
            serverSignature: server_signature,
        });
        
        const txHash = typeof result === 'string' ? result : result.txHash;
        return txHash;
    }

    async transfer(destination: string, amount: string): Promise<void> {
        await this.authenticate();

        const dest = destination as `0x${string}`

        // Send transfer request
        const transferMsg = await createTransferMessage(
            this.state.sessionSigner,
            {
                destination: dest,
                allocations: [{
                    asset: 'ytest.usd',
                    amount
                }]
            },
            Date.now()
        );

        // Use centralized message handling
        await this.sendAndWaitForResponse<any>(transferMsg, 'transfer', 10000);
    }

    async depositToCustody(amount: bigint, tokenAddress?: string): Promise<string> {
        if (!this.state.client) {
            throw new Error('Nitrolite client not initialized');
        }

        try {
            const token = tokenAddress || YELLOW_CONFIG.TOKEN;
            const txHash = await this.state.client.deposit(token as `0x${string}`, amount);
            return txHash;
        } catch (error) {
            throw new Error(`Failed to deposit to custody: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async withdrawFromCustody(tokenAddress: string, amount: bigint): Promise<string> {
        if (!this.state.client) {
            throw new Error('Nitrolite client not initialized');
        }

        try {
            const txHash = await this.state.client.withdrawal(tokenAddress as `0x${string}`, amount);
            return txHash;
        } catch (error) {
            throw new Error(`Failed to withdraw from custody: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getCustodyBalance(tokenAddress: string): Promise<bigint> {
        if (!this.state.client) {
            throw new Error('Nitrolite client not initialized');
        }

        try {
            const result = await this.state.publicClient.readContract({
                address: YELLOW_CONFIG.ADDRESSES.custody,
                abi: [{
                    type: 'function',
                    name: 'getAccountsBalances',
                    inputs: [{ name: 'users', type: 'address[]' }, { name: 'tokens', type: 'address[]' }],
                    outputs: [{ type: 'uint256[]' }],
                    stateMutability: 'view'
                }] as const,
                functionName: 'getAccountsBalances',
                args: [[this.state.account.address], [tokenAddress as `0x${string}`]],
            }) as bigint[];

            return result[0];
        } catch (error) {
            throw new Error(`Failed to get custody balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getLedgerBalances(): Promise<any[]> {
        await this.authenticate();

        // Send ledger balances request
        const ledgerMsg = await createGetLedgerBalancesMessage(
            this.state.sessionSigner,
            this.state.account.address,
            Date.now()
        );

        // Use centralized message handling
        const response = await this.sendAndWaitForResponse<any>(ledgerMsg, 'get_ledger_balances', 10000);
        const balances = response.res[2].ledger_balances || [];
        return balances;
    }

    async resizeChannel(channelId: string, allocateAmount: bigint): Promise<string> {
        await this.authenticate();

        // Send resize request
        const resizeMsg = await createResizeChannelMessage(
            this.state.sessionSigner,
            {
                channel_id: channelId as `0x${string}`,
                allocate_amount: allocateAmount,
                funds_destination: this.state.account.address,
            }
        );

        // Use centralized message handling
        const response = await this.sendAndWaitForResponse<any>(resizeMsg, 'resize_channel', 60000);
        
        const { channel_id, state, server_signature } = response.res[2];

        // Construct the resize state object expected by the SDK
        const resizeState = {
            intent: state.intent,
            version: BigInt(state.version),
            data: state.state_data || state.data,
            allocations: state.allocations.map((a: any) => ({
                destination: a.destination,
                token: a.token,
                amount: BigInt(a.amount),
            })),
            channelId: channel_id,
            serverSignature: server_signature,
        };

        // Get proof states if needed
        try {
            const onChainData = await this.state.client!.getChannelData(channel_id as `0x${string}`);
            const proofStates = onChainData.lastValidState ? [onChainData.lastValidState] : [];
            
            // Submit resize to blockchain
            const result = await this.state.client!.resizeChannel({
                resizeState,
                proofStates: proofStates,
            });
            
            const txHash = typeof result === 'string' ? result : result.txHash;
            return txHash;
        } catch (error: any) {
            // Try without proof states if it failed
            const result = await this.state.client!.resizeChannel({
                resizeState,
                proofStates: [],
            });
            
            const txHash = typeof result === 'string' ? result : result.txHash;
            return txHash;
        }
    }

    disconnect(): void {
        if (this.state.ws) {
            this.state.ws.close();
            this.state.ws = null;
        }
        this.state.isAuthenticated = false;
    }
}
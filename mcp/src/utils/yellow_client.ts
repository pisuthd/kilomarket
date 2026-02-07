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
    TOKEN: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // ytest.usd
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
            walletClient: null
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
                resolve();
            });

            this.state.ws.on('error', (err: Error) => {
                console.error('WebSocket error:', err);
                reject(err);
            });
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

        // Wait for auth response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Authentication timeout')), 30000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Authentication failed'));
                    return;
                }

                if (response.res && response.res[1] === 'auth_challenge') {
                    // Handle auth challenge
                    const challenge = response.res[2].challenge_message;
                    const signer = createEIP712AuthMessageSigner(
                        this.state.walletClient,
                        authParams,
                        { name: 'KiloMarket MCP' }
                    );

                    createAuthVerifyMessageFromChallenge(signer, challenge)
                        .then((verifyMsg: string) => {
                            this.state.ws!.send(verifyMsg);
                        })
                        .catch(reject);
                }

                if (response.res && response.res[1] === 'auth_verify') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    this.state.isAuthenticated = true;
                    resolve();
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
    }

    async listChannels(): Promise<ChannelInfo[]> {

        await this.authenticate();

        // Send ledger balances request
        const ledgerMsg = await createGetLedgerBalancesMessage(
            this.state.sessionSigner,
            this.state.account.address,
            Date.now()
        );

        this.state.ws!.send(ledgerMsg);

        // Wait for channels response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('List channels timeout')), 30000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Failed to list channels'));
                    return;
                }

                if (response.res && response.res[1] === 'channels') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);

                    const channels = response.res[2].channels || [];
                    const channelInfos: ChannelInfo[] = channels.map((channel: any) => ({
                        channel_id: channel.channel_id,
                        status: channel.status,
                        token: channel.token,
                        amount: channel.amount,
                        balance: channel.balance,
                        created_at: channel.created_at
                    }));

                    this.state.channels = channelInfos;
                    resolve(channelInfos);
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
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

        this.state.ws!.send(closeMsg);

        // Wait for close response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Close channel timeout')), 60000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Failed to close channel'));
                    return;
                }

                if (response.res && response.res[1] === 'close_channel') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);

                    const { channel_id, state, server_signature } = response.res[2];

                    // Submit close to blockchain
                    this.state.client!.closeChannel({
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
                    }).then((txHash: string) => {
                        resolve(txHash);
                    }).catch(reject);
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
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

        this.state.ws!.send(createMsg);

        // Wait for create response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Create channel timeout')), 60000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Failed to create channel'));
                    return;
                }

                if (response.res && response.res[1] === 'create_channel') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);

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

                    this.state.client!.createChannel({
                        channel,
                        unsignedInitialState,
                        serverSignature: server_signature,
                    }).then((result: any) => {
                        const txHash = typeof result === 'string' ? result : result.txHash;
                        resolve(txHash);
                    }).catch(reject);
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
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

        this.state.ws!.send(transferMsg);

        // Wait for transfer confirmation
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Transfer timeout')), 30000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Transfer failed'));
                    return;
                }

                if (response.res && response.res[1] === 'transfer') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    resolve();
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
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

        this.state.ws!.send(ledgerMsg);

        // Wait for ledger balances response
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Get ledger balances timeout')), 10000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Failed to get ledger balances'));
                    return;
                }

                if (response.res && response.res[1] === 'get_ledger_balances') {

                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);

                    const balances = response.res[2].ledger_balances || [];
                    resolve(balances);
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
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

        this.state.ws!.send(resizeMsg);

        // Wait for resize confirmation
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Resize channel timeout')), 60000);

            const messageHandler = (data: any) => {
                const response = JSON.parse(data.toString());

                if (response.error) {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);
                    reject(new Error(response.error.message || 'Failed to resize channel'));
                    return;
                }

                if (response.res && response.res[1] === 'resize_channel') {
                    clearTimeout(timeout);
                    this.state.ws!.removeListener('message', messageHandler);

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
                    let proofStates: any[] = [];
                    this.state.client!.getChannelData(channel_id as `0x${string}`)
                        .then((onChainData: any) => {
                            if (onChainData.lastValidState) {
                                proofStates = [onChainData.lastValidState];
                            }
                            
                            // Submit resize to blockchain
                            return this.state.client!.resizeChannel({
                                resizeState,
                                proofStates: proofStates,
                            });
                        })
                        .then((result: any) => {
                            const txHash = typeof result === 'string' ? result : result.txHash;
                            resolve(txHash);
                        })
                        .catch((error: any) => {
                            // Try without proof states if it failed
                            return this.state.client!.resizeChannel({
                                resizeState,
                                proofStates: [],
                            });
                        })
                        .then((result: any) => {
                            const txHash = typeof result === 'string' ? result : result.txHash;
                            resolve(txHash);
                        })
                        .catch(reject);
                }
            };

            this.state.ws!.on('message', messageHandler);
        });
    }

    disconnect(): void {
        if (this.state.ws) {
            this.state.ws.close();
            this.state.ws = null;
        }
        this.state.isAuthenticated = false;
    }
}
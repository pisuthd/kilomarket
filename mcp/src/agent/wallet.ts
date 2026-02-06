import { publicClient, walletClient, account, networkInfo, TOKENS } from '../config';
import { formatEther, formatUnits, parseEther, parseUnits, Address } from 'viem';
import { WalletInfo, TokenBalance, TransactionResult, TokenInfo } from '../types';

export class EthereumWalletAgent {
    private account: any;
    private publicClient: any;
    private walletClient: any;
    private networkInfo: any;

    constructor(privateKey?: string) {
        this.account = account;
        this.publicClient = publicClient;
        this.walletClient = walletClient;
        this.networkInfo = networkInfo;
    }

    /**
     * Get comprehensive wallet information including address, network, and balances
     */
    async getWalletInfo(): Promise<WalletInfo> {
        try {
            // Get native ETH balance
            const nativeBalance = await this.publicClient.getBalance({
                address: this.account.address,
            });

            // Get token balances for known tokens
            const tokens: TokenBalance[] = [];
            const knownTokens = [
                { address: TOKENS.USDC, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
                { address: TOKENS.USDT, symbol: 'USDT', name: 'Tether USD', decimals: 6 }, 
                { address: TOKENS.WETH, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
                { address: TOKENS.YELLOW_USD, symbol: 'ytest.USD', name: 'Yellow Test USD', decimals: 6 },
            ];

            for (const token of knownTokens) {
                try {
                    const balance = await this.publicClient.readContract({
                        address: token.address,
                        abi: [
                            {
                                name: 'balanceOf',
                                type: 'function',
                                stateMutability: 'view',
                                inputs: [{ name: 'account', type: 'address' }],
                                outputs: [{ type: 'uint256' }],
                            },
                        ],
                        functionName: 'balanceOf',
                        args: [this.account.address],
                    });

                    const formattedBalance = formatUnits(balance as bigint, token.decimals);
                    
                    // Only include tokens with non-zero balance
                    if (parseFloat(formattedBalance) > 0) {
                        tokens.push({
                            address: token.address,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            balance: formattedBalance,
                        });
                    }
                } catch (error) {
                    // Skip tokens that don't exist or fail to read
                    continue;
                }
            }

            return {
                address: this.account.address,
                nativeBalance: formatEther(nativeBalance),
                tokens,
                network: {
                    chainId: this.networkInfo.chainId,
                    name: 'sepolia',
                },
            };
        } catch (error) {
            throw new Error(`Failed to get wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get native ETH balance
     */
    async getBalance(): Promise<string> {
        try {
            const balance = await this.publicClient.getBalance({
                address: this.account.address,
            });
            return formatEther(balance);
        } catch (error) {
            throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get token balance for a specific ERC20 token
     */
    async getTokenBalance(tokenAddress: Address): Promise<{ balance: string; decimals: number; symbol: string; name: string }> {
        try {
            // Get token decimals
            const decimals = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'decimals',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'uint8' }],
                    },
                ],
                functionName: 'decimals',
            });

            // Get token symbol
            const symbol = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'symbol',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'string' }],
                    },
                ],
                functionName: 'symbol',
            });

            // Get token name
            const name = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'name',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'string' }],
                    },
                ],
                functionName: 'name',
            });

            // Get token balance
            const balance = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'balanceOf',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [{ name: 'account', type: 'address' }],
                        outputs: [{ type: 'uint256' }],
                    },
                ],
                functionName: 'balanceOf',
                args: [this.account.address],
            });

            return {
                balance: formatUnits(balance as bigint, decimals as number),
                decimals: decimals as number,
                symbol: symbol as string,
                name: name as string,
            };
        } catch (error) {
            throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send native ETH to an address
     */
    async sendNativeToken(to: Address, amount: string): Promise<TransactionResult> {
        try {
            const amountInWei = parseEther(amount);
            
            const hash = await this.walletClient.sendTransaction({
                to,
                value: amountInWei,
            });

            // Wait for transaction receipt
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                status: receipt.status === 'success' ? 'success' : 'failed',
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed.toString(),
            };
        } catch (error) {
            throw new Error(`Failed to send native token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send ERC20 token to an address
     */
    async sendERC20Token(tokenAddress: Address, to: Address, amount: string): Promise<TransactionResult> {
        try {
            // Get token decimals
            const decimals = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'decimals',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'uint8' }],
                    },
                ],
                functionName: 'decimals',
            });

            // Parse amount with correct decimals
            const amountInWei = parseUnits(amount, decimals as number);

            const hash = await this.walletClient.writeContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'transfer',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'to', type: 'address' },
                            { name: 'amount', type: 'uint256' },
                        ],
                        outputs: [{ type: 'bool' }],
                    },
                ],
                functionName: 'transfer',
                args: [to, amountInWei],
            });

            // Wait for transaction receipt
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                status: receipt.status === 'success' ? 'success' : 'failed',
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed.toString(),
            };
        } catch (error) {
            throw new Error(`Failed to send ERC20 token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check token allowance for a spender
     */
    async checkAllowance(tokenAddress: Address, spender: Address): Promise<string> {
        try {
            // Get token decimals
            const decimals = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'decimals',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'uint8' }],
                    },
                ],
                functionName: 'decimals',
            });

            // Get allowance
            const allowance = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'allowance',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [
                            { name: 'owner', type: 'address' },
                            { name: 'spender', type: 'address' },
                        ],
                        outputs: [{ type: 'uint256' }],
                    },
                ],
                functionName: 'allowance',
                args: [this.account.address, spender],
            });

            return formatUnits(allowance as bigint, decimals as number);
        } catch (error) {
            throw new Error(`Failed to check allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Approve token spending for a spender
     */
    async approveToken(tokenAddress: Address, spender: Address, amount: string): Promise<TransactionResult> {
        try {
            // Get token decimals
            const decimals = await this.publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'decimals',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [],
                        outputs: [{ type: 'uint8' }],
                    },
                ],
                functionName: 'decimals',
            });

            // Parse amount with correct decimals
            const amountInWei = parseUnits(amount, decimals as number);

            const hash = await this.walletClient.writeContract({
                address: tokenAddress,
                abi: [
                    {
                        name: 'approve',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'spender', type: 'address' },
                            { name: 'amount', type: 'uint256' },
                        ],
                        outputs: [{ type: 'bool' }],
                    },
                ],
                functionName: 'approve',
                args: [spender, amountInWei],
            });

            // Wait for transaction receipt
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                status: receipt.status === 'success' ? 'success' : 'failed',
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed.toString(),
            };
        } catch (error) {
            throw new Error(`Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get the wallet address
     */
    getAddress(): Address {
        return this.account.address;
    }

    /**
     * Get network information
     */
    getNetworkInfo() {
        return this.networkInfo;
    }
}
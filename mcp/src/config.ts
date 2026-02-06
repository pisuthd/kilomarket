import { Chain, createPublicClient, createWalletClient, http, WalletClient, webSocket } from 'viem';
import { privateKeyToAccount, Address, Account, generatePrivateKey } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { z } from 'zod';

type NetworkType = 'sepolia'

interface NetworkConfig {
    rpcProviderUrl: string;
    wsProviderUrl: string;
    blockExplorer: string;
    chain: Chain;
    chainId: number;
    nativeCurrency: string;
}

// Ethereum Sepolia MCP Environment Configuration
export interface EthereumMCPEnvironment {
    sepoliaRpcUrl: string;
    sepoliaWsUrl: string;
    privateKey?: string;
}

// Validation schemas using zod
export const EthereumMCPEnvironmentSchema = z.object({
    privateKey: z.string().optional().describe("Wallet private key"),
    sepoliaRpcUrl: z.string().url().describe("Ethereum Sepolia RPC URL"),
    sepoliaWsUrl: z.string().url().describe("Ethereum Sepolia WebSocket URL")
});

export function getEnvironmentConfig(): EthereumMCPEnvironment {
    const config = {
        privateKey: process.env.ETHEREUM_PRIVATE_KEY || "",
        sepoliaRpcUrl: "https://eth-sepolia-testnet.api.pocket.network",
        sepoliaWsUrl: "wss://ethereum-sepolia-rpc.publicnode.com"
    };

    // Validate with zod schema
    const validatedConfig = EthereumMCPEnvironmentSchema.parse(config);

    return validatedConfig;
}

// Validate environment variables and log configuration
export function validateEnvironment(): void {
    try {
        const config = getEnvironmentConfig();
        const keyStatus = config.privateKey ? 'with private key' : 'without private key';
        console.error(`✅ ETHEREUM-MCP configured: transaction mode on sepolia network (${keyStatus})`);
    } catch (error) {
        console.error('❌ Invalid environment configuration:', error);
        throw error;
    }
}

// Network configurations - Ethereum Sepolia
const networkConfigs: Record<NetworkType, NetworkConfig> = {
    sepolia: {
        rpcProviderUrl: 'https://eth-sepolia-testnet.api.pocket.network',
        wsProviderUrl: 'wss://ethereum-sepolia-rpc.publicnode.com',
        blockExplorer: 'https://sepolia.etherscan.io',
        chain: sepolia,
        chainId: 11155111,
        nativeCurrency: 'ETH'
    }
} as const;

const getNetwork = (): NetworkType => {
    return 'sepolia';
};

const getAccount = (): Account => {
    const config = getEnvironmentConfig();
    const hasPrivateKey = !!(config?.privateKey);

    if (!hasPrivateKey) {
        const privateKey = generatePrivateKey();
        return privateKeyToAccount(privateKey);
    } else {
        const privateKey = config.privateKey!;
        const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        // Validate that the private key is a valid hex string
        if (!/^0x[0-9a-fA-F]{64}$/.test(formattedPrivateKey)) {
            throw new Error(`Invalid private key format. Expected 64 hex characters (32 bytes), got: ${formattedPrivateKey.length - 2} characters`);
        }

        return privateKeyToAccount(formattedPrivateKey as `0x${string}`);
    }
}

// Initialize client configuration
export const network = getNetwork();

export const networkInfo = {
    ...networkConfigs[network],
};

export const account: Account = getAccount()

const baseConfig = {
    chain: networkInfo.chain,
    transport: http(networkInfo.rpcProviderUrl),
} as const;

export const publicClient = createPublicClient(baseConfig);

export const walletClient = createWalletClient({
    ...baseConfig,
    account,
}) as WalletClient;

// WebSocket client for real-time updates
export const wsClient = createPublicClient({
    chain: networkInfo.chain,
    transport: webSocket(networkInfo.wsProviderUrl),
});

// Multi-chain client factory
export function createClientForNetwork(networkType: NetworkType) {
    const config = networkConfigs[networkType];
    const baseConfig = {
        chain: config.chain,
        transport: http(config.rpcProviderUrl),
    };

    return {
        publicClient: createPublicClient(baseConfig),
        walletClient: createWalletClient({
            ...baseConfig,
            account,
        }) as WalletClient,
        wsClient: createPublicClient({
            chain: config.chain,
            transport: webSocket(config.wsProviderUrl),
        }),
        networkInfo: config
    };
}

// Common tokens on Ethereum Sepolia
export const TOKENS = {
    // Native
    ETH: "0x0000000000000000000000000000000000000000" as Address,
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as Address,

    // Common testnet tokens
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Address,
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06' as Address,
    YELLOW_USD: "0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb" as Address
} as const;

// Default transaction settings
export const DEFAULT_SLIPPAGE = 50; // 0.5%
export const DEFAULT_DEADLINE = 20; // 20 minutes

// Gas settings for Sepolia
export const GAS_SETTINGS = {
    maxFeePerGas: '20000000000', // 20 gwei
    maxPriorityFeePerGas: '2000000000', // 2 gwei
} as const;
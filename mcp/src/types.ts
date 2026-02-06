

import { z } from 'zod';

export interface McpTool {
    name: string;
    description: string;
    schema: Record<string, any>;
    handler: (agent: any, input: Record<string, any>) => Promise<any>;
}

// Common schemas
export const AddressSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
    .describe("Ethereum address (0x...)");

export const NetworkSchema = z.enum(['sepolia', 'mainnet'])
    .describe("Ethereum network name");

// Token information for wallet operations
export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
}

export interface TokenBalance {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
}

export interface WalletInfo {
    address: string;
    nativeBalance: string;
    tokens: TokenBalance[];
    network: {
        chainId: number;
        name: string;
    };
}

// Transaction types
export interface TransactionResult {
    hash: string;
    status: 'success' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    error?: string;
}

// Send token parameters
export interface SendTokenParams {
    token: string;
    amount: string;
    to: string;
}

// Approve token parameters
export interface ApproveTokenParams {
    token: string;
    spender: string;
    amount: string;
}

// Wrap/Unwrap parameters
export interface WrapParams {
    amount: string;
}

// Swap parameters
export interface SwapParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippage?: number;
    recipient?: string;
    deadline?: number;
}

// Check allowance parameters
export interface CheckAllowanceParams {
    token: string;
    spender: string;
}

// Error types
export class EthereumMCPError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'EthereumMCPError';
    }
}

export class NetworkError extends EthereumMCPError {
    constructor(message: string, details?: any) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}

export class TransactionError extends EthereumMCPError {
    constructor(message: string, details?: any) {
        super(message, 'TRANSACTION_ERROR', details);
        this.name = 'TransactionError';
    }
}

export class InsufficientBalanceError extends EthereumMCPError {
    constructor(message: string) {
        super(message, 'INSUFFICIENT_BALANCE');
        this.name = 'InsufficientBalanceError';
    }
}

export class InsufficientAllowanceError extends EthereumMCPError {
    constructor(message: string) {
        super(message, 'INSUFFICIENT_ALLOWANCE');
        this.name = 'InsufficientAllowanceError';
    }
}

// Legacy interfaces for compatibility
export interface TransactionResponse {
    hash?: string;
    status: string;
    error?: string;
}

export interface SwapQuote {
    fromToken: string;
    toToken: string;
    inputAmount: number;
    estimatedOutput: number;
}

export interface FaucetParams {
    usdcGlobalId?: string;
    btcGlobalId?: string;
    packageId: string;
    amount: number;
    recipient: string;
}

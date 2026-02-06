import { WalletTools } from './wallet';

// Combine all Ethereum tools
export const EthereumTools = {
  // Basic wallet information and account management
  ...WalletTools,
};

// Export individual modules for direct access
export * from './wallet';
import { WalletTools } from './wallet';
import { YellowTools } from './yellow';

// Combine all Ethereum tools
export const EthereumTools = {
  // Basic wallet information and account management
  ...WalletTools,
  // Yellow Network payment channel tools
  ...YellowTools,
};

// Export individual modules for direct access
export * from './wallet';
export * from './yellow';

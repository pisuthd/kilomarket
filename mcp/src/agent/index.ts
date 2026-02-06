import { EthereumWalletAgent } from './wallet';
import { validateEnvironment, getEnvironmentConfig } from '../config';

export class Agent {
    private walletAgent: EthereumWalletAgent;

    constructor() {
        // Validate environment before proceeding
        validateEnvironment();
        const config = getEnvironmentConfig();
        
        // Create wallet agent instance with private key if available
        const privateKey = config.privateKey;
        this.walletAgent = new EthereumWalletAgent(privateKey);
    }

    getWallet(): EthereumWalletAgent {
        return this.walletAgent;
    }
}

// Re-export for convenience
export { EthereumWalletAgent } from './wallet';
import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const requestFaucetTool: McpTool = {
  name: "request_yellow_faucet",
  description: "Request test tokens (ytest.usd) from Yellow Network faucet to top up unified balance",
  schema: {
    user_address: z.string().optional().describe("User address to receive tokens (optional, defaults to configured wallet address)")
  },
  handler: async (agent: any, input: Record<string, any>) => {
    try {
      const config = getEnvironmentConfig();
      if (!config.privateKey) {
        return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
      }
      
      const walletPrivateKey = config.privateKey;
      const args = input;
      
      // Create client to get the wallet address
      const client = new YellowNetworkClient(walletPrivateKey);
      let userAddress = args.user_address;
      
      try {
        // If no user address provided, use the configured wallet address
        if (!userAddress) {
          // Create a wallet from the private key to get the address
          const wallet = new ethers.Wallet(walletPrivateKey);
          userAddress = wallet.address;
        }

        // Prepare faucet request
        const faucetUrl = 'https://clearnet-sandbox.yellow.com/faucet/requestTokens';
        const requestBody = {
          userAddress: userAddress
        };

        console.log('Requesting tokens from faucet:', requestBody);

        // Make the faucet request
        const response = await fetch(faucetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Faucet request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        const summary = `**Yellow Network Faucet Request** ✅

💧 **Faucet Request Successful**!
📍 **Result**: \`${result}\`

📝 **Next Steps**:
1. Wait a few moments for the transaction to process
2. Check your unified balance using: \`check_yellow_balance\`
3. The tokens will appear in your off-chain unified balance

⚠️ **Note**: Faucet tokens are added to your **off-chain unified balance**, not on-chain custody balance.`;

        return summary;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error requesting Yellow Network faucet tokens:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          return '❌ **Network Error**: Failed to connect to Yellow Network faucet. Please check your internet connection and try again.';
        }
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return '❌ **Rate Limit Error**: You may have reached the faucet rate limit. Please try again later.';
        }
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          return '❌ **Invalid Request**: The wallet address may be invalid or already has sufficient funds.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to request faucet tokens due to an unexpected error. Please try again later.';
    }
  }
};
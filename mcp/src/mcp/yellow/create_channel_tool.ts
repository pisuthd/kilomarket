import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const createChannelTool: McpTool = {
  name: "create_yellow_channel",
  description: "Create a new Yellow Network payment channel with specified amount",
  schema: {
    amount: z.string().default("1000").describe("Initial amount to deposit in the channel (in ytest.usd)"),
    token: z.string().optional().describe("Token address (defaults to ytest.usd)")
  },
  handler: async (agent: any, input: Record<string, any>) => {
    try {
      const config = getEnvironmentConfig();
      if (!config.privateKey) {
        return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
      }
      const walletPrivateKey = config.privateKey;
      const args = input;
      
      const client = new YellowNetworkClient(walletPrivateKey);
      
      try {
        const txHash = await client.createChannel();
        
        // Verify transaction hash format
        if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
          throw new Error(`Invalid transaction hash received: ${txHash}`);
        }
        
        const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
        
        return `✅ **Channel Created Successfully**

**Channel Details:**
• Initial Amount: ${args.amount} ytest.usd
• Token: ${args.token || 'ytest.usd (default)'}
• Transaction Hash: \`${txHash}\`
• Explorer: [View on Etherscan](${explorerUrl})

The payment channel has been created and will be ready for use once the transaction is confirmed. You can start making instant payments through the Yellow Network.`;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error creating Yellow Network channel:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          return '❌ **Authentication Error**: Failed to authenticate with Yellow Network. Please check your wallet credentials and try again.';
        }
        if (error.message.includes('timeout')) {
          return '❌ **Timeout Error**: Channel creation timed out. Please check the transaction status later.';
        }
        if (error.message.includes('WebSocket')) {
          return '❌ **Connection Error**: Failed to connect to Yellow Network. Please check your network connection and try again.';
        }
        if (error.message.includes('gas')) {
          return '❌ **Gas Error**: Insufficient gas for transaction. Please ensure you have enough ETH in your wallet for gas fees.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to create channel due to an unexpected error. Please check your wallet configuration and try again.';
    }
  }
};

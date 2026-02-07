import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const closeChannelTool: McpTool = {
  name: "close_yellow_channel",
  description: "Close Yellow Network payment channel(s). Funds will remain in custody and can be withdrawn separately using withdraw_from_custody",
  schema: {
    channel_id: z.string().optional().describe("Channel ID to close. If not provided, will close the first open channel"),
    force_close: z.boolean().optional().describe("Force close channel even if it has remaining balance. Default: false")
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
        // First list channels to get information
        const channels = await client.listChannels();
        
        if (channels.length === 0) {
          return '❌ **No Channels Found**: No payment channels found in your account.';
        }
        
        let targetChannelId = args.channel_id;
        let targetChannel = null;
        
        // Find the target channel
        if (targetChannelId) {
          targetChannel = channels.find(c => c.channel_id === targetChannelId);
          if (!targetChannel) {
            return `❌ **Channel Not Found**: No channel found with ID: ${targetChannelId}`;
          }
        } else {
          // Find first open channel
          targetChannel = channels.find(c => c.status === 'open');
          if (!targetChannel) {
            const closedChannels = channels.filter(c => c.status === 'closed');
            if (closedChannels.length > 0) {
              return 'ℹ️ **No Open Channels**: All channels are already closed. Use list_yellow_channels to see all channels.';
            }
            return '❌ **No Open Channels**: No open channels found to close.';
          }
          targetChannelId = targetChannel.channel_id;
        }
        
        // Check channel status
        if (targetChannel.status === 'closed') {
          return `ℹ️ **Already Closed**: Channel ${targetChannelId} is already closed.`;
        }
        
        // Check balance if not force closing
        if (!args.force_close && targetChannel.balance) {
          const balance = parseFloat(targetChannel.balance);
          if (balance > 0) {
            return `⚠️ **Channel Has Balance**: Channel ${targetChannelId} has ${balance} ytest.usd remaining. 
            
Use force_close: true to close this channel anyway, or transfer the remaining balance first.`;
          }
        }
        
        // Close the channel
        const txHash = await client.closeChannel(targetChannelId);
        
        // Verify transaction hash format
        if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
          throw new Error(`Invalid transaction hash received: ${txHash}`);
        }
        
        const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
        
        return `✅ **Channel Closed Successfully**

**Channel Details:**
• Channel ID: \`${targetChannelId}\`
• Final Balance: ${targetChannel.balance || '0'} ytest.usd
• Transaction Hash: \`${txHash}\`
• Explorer: [View on Etherscan](${explorerUrl})

The channel has been closed and settled on-chain. 

💡 **Next Steps**: The remaining funds (${targetChannel.balance || '0'} ytest.usd) are now available in your custody contract. Use the \`withdraw_from_custody\` tool to withdraw them to your wallet when needed.`;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error closing Yellow Network channel:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          return '❌ **Authentication Error**: Failed to authenticate with Yellow Network. Please check your wallet credentials and try again.';
        }
        if (error.message.includes('No open channels found')) {
          return '❌ **No Open Channels**: No open channels found to close. Use list_yellow_channels to see available channels.';
        }
        if (error.message.includes('timeout')) {
          return '❌ **Timeout Error**: Channel close operation timed out. This may take longer due to on-chain settlement. Please check the transaction status later.';
        }
        if (error.message.includes('WebSocket')) {
          return '❌ **Connection Error**: Failed to connect to Yellow Network. Please check your network connection and try again.';
        }
        if (error.message.includes('gas')) {
          return '❌ **Gas Error**: Insufficient gas for transaction. Please ensure you have enough ETH in your wallet for gas fees.';
        }
        if (error.message.includes('nonce')) {
          return '❌ **Nonce Error**: Transaction nonce issue. Please try again or check your wallet state.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to close channel due to an unexpected error. Please check your wallet configuration and try again.';
    }
  }
};

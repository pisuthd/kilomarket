import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const transferTool: McpTool = {
  name: "transfer_yellow_tokens",
  description: "Transfer ytest.usd tokens instantly through Yellow Network payment channels",
  schema: {
    destination: z.string().describe("Recipient address (0x...)"),
    amount: z.string().describe("Amount to transfer in ytest.usd"),
    channel_id: z.string().optional().describe("Specific channel ID to use. If not provided, will use first available open channel")
  },
  handler: async (agent: any, input: Record<string, any>) => {
    try {
      const config = getEnvironmentConfig();
      if (!config.privateKey) {
        return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
      }
      const walletPrivateKey = config.privateKey;
      const args = input;
      
      // Validate destination address
      if (!ethers.isAddress(args.destination)) {
        return '❌ **Invalid Address**: The destination address is not a valid Ethereum address.';
      }
      
      // Validate amount
      const amount = parseFloat(args.amount);
      if (isNaN(amount) || amount <= 0) {
        return '❌ **Invalid Amount**: Amount must be a positive number.';
      }
      
      const client = new YellowNetworkClient(walletPrivateKey);
      
      try {
        // First list channels to find available channel
        const channels = await client.listChannels();
        
        if (channels.length === 0) {
          return '❌ **No Channels Found**: No payment channels found. Please create a channel first using create_yellow_channel.';
        }
        
        let targetChannel = null;
        
        // Find the target channel
        if (args.channel_id) {
          targetChannel = channels.find(c => c.channel_id === args.channel_id);
          if (!targetChannel) {
            return `❌ **Channel Not Found**: No channel found with ID: ${args.channel_id}`;
          }
        } else {
          // Find first open channel
          targetChannel = channels.find(c => c.status === 'open');
          if (!targetChannel) {
            return '❌ **No Open Channels**: No open channels available for transfers. All channels are closed.';
          }
        }
        
        // Check channel status
        if (targetChannel.status !== 'open') {
          return `❌ **Channel Not Open**: Channel ${targetChannel.channel_id} is not open (status: ${targetChannel.status}).`;
        }
        
        // Check if channel has sufficient balance
        // const channelBalance = targetChannel.balance ? parseFloat(targetChannel.balance) : 0;
        // if (channelBalance < amount) {
        //   return `❌ **Insufficient Balance**: Channel ${targetChannel.channel_id} has only ${channelBalance} ytest.usd available, but ${amount} ytest.usd is required.`;
        // }
        
        // Perform the transfer
        await client.transfer(args.destination, args.amount);
        
         
        return `✅ **Transfer Successful**

**Transfer Details:**
• From Channel: \`${targetChannel.channel_id}\`
• To: \`${args.destination}\`
• Amount: ${amount} ytest.usd

The transfer was completed instantly through the Yellow Network. No blockchain confirmation needed for instant payment.
`;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error transferring Yellow Network tokens:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          return '❌ **Authentication Error**: Failed to authenticate with Yellow Network. Please check your wallet credentials and try again.';
        }
        if (error.message.includes('timeout')) {
          return '❌ **Timeout Error**: Transfer operation timed out. Please try again later.';
        }
        if (error.message.includes('WebSocket')) {
          return '❌ **Connection Error**: Failed to connect to Yellow Network. Please check your network connection and try again.';
        }
        if (error.message.includes('Insufficient')) {
          return '❌ **Insufficient Balance**: Not enough balance in the channel for this transfer.';
        }
        if (error.message.includes('Invalid destination')) {
          return '❌ **Invalid Recipient**: The destination address is invalid or not supported.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to transfer tokens due to an unexpected error. Please check your wallet configuration and try again.';
    }
  }
};

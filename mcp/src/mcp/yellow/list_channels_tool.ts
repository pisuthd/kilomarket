import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const listChannelsTool: McpTool = {
  name: "list_yellow_channels",
  description: "List all Yellow Network payment channels with their current status and balances",
  schema: {
    status: z.string().optional().describe("Filter by status: 'open', 'closed', or 'all' (default: 'all')"),
    limit: z.number().optional().describe("Maximum number of channels to return (default: 50)")
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
        const channels = await client.listChannels();
        
        // Filter channels by status if requested
        let filteredChannels = channels;
        if (args.status !== 'all') {
          filteredChannels = channels.filter(channel => channel.status === args.status);
        }
        
        if (filteredChannels.length === 0) {
          return `No channels found${args.status !== 'all' ? ` with status '${args.status}'` : ''}.`;
        }
        
        // Format channel information
        const channelList = filteredChannels.map((channel, index) => {
          const status = channel.status.toUpperCase();
          
          // Convert amount from raw units to human-readable (ytest.usd uses 6 decimals)
          const amountRaw = parseFloat(channel.amount || '0');
          const amountHuman = amountRaw / 1_000_000;
          
          
          let channelInfo = `**Channel ${index + 1}**
  • Channel ID: \`${channel.channel_id}\`
  • Status: ${status}
  • Token: ${channel.token}
  • Amount: ${amountHuman.toLocaleString(undefined, {maximumFractionDigits: 6})} ytest.usd`;
          
           
          
          if (channel.created_at && !isNaN(channel.created_at)) {
            const createdDate = new Date(channel.created_at * 1000);
            channelInfo += `\n  • Created: ${createdDate.toISOString()}`;
          }
          
          return channelInfo;
        }).join('\n\n');
        
        const summary = `
**Yellow Network Channels Summary:**
• Total channels: ${channels.length}
• Open channels: ${channels.filter(c => c.status === 'open').length}
• Closed channels: ${channels.filter(c => c.status === 'closed').length}
• Showing: ${filteredChannels.length} channels${args.status !== 'all' ? ` (filtered by status: ${args.status})` : ''}

${channelList}`;
        
        return summary;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error listing Yellow Network channels:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          return '❌ **Authentication Error**: Failed to authenticate with Yellow Network. Please check your wallet credentials and try again.';
        }
        if (error.message.includes('timeout')) {
          return '❌ **Timeout Error**: Request to Yellow Network timed out. Please try again later.';
        }
        if (error.message.includes('WebSocket')) {
          return '❌ **Connection Error**: Failed to connect to Yellow Network. Please check your network connection and try again.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to list channels due to an unexpected error. Please check your wallet configuration and try again.';
    }
  }
};

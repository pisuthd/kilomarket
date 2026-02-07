import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { getEnvironmentConfig } from '../../config';
import { type McpTool } from '../../types';

// Tool for resizing Yellow Network payment channels
export const resizeChannelTool: McpTool = {
    name: 'resize_yellow_channel',
    description: 'Resize a Yellow Network payment channel to allocate more funds from custody contract',
    
    schema: {
        channel_id: z.string().describe("Channel ID to resize"),
        allocate_amount: z.string().describe("Amount of ytest.usd tokens to allocate from custody to channel (e.g., '10' for 10 ytest.usd)")
    },

    handler: async (agent: any, input: any) => {
        try {
            const config = getEnvironmentConfig();
            if (!config.privateKey) {
                return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
            }
            
            const client = new YellowNetworkClient(config.privateKey);
            
        // Convert amount string to bigint (ytest.usd uses 6 decimals)
        const amountFloat = parseFloat(input.allocate_amount);
        const allocateAmountBigInt = BigInt(Math.floor(amountFloat * 1_000_000));
        
        const txHash = await client.resizeChannel(input.channel_id, allocateAmountBigInt);
            
            return `✅ **Channel Resize Successful**

Successfully resized channel ${input.channel_id} with ${input.allocate_amount} tokens.

**Transaction Details:**
• Transaction Hash: \`${txHash}\`
• Channel ID: ${input.channel_id}
• Allocated Amount: ${input.allocate_amount} tokens

The additional funds have been allocated to the channel and are now available for transfers.`;
            
        } catch (error) {
            console.error('Error resizing channel:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    return '❌ **Insufficient Balance**: You do not have enough tokens in the custody contract to allocate to this channel.';
                }
                if (error.message.includes('channel not found')) {
                    return '❌ **Channel Not Found**: The specified channel ID does not exist.';
                }
                if (error.message.includes('timeout')) {
                    return '❌ **Timeout Error**: Resize operation timed out. Please try again later.';
                }
                return `❌ **Resize Error**: ${error.message}`;
            }
            
            return '❌ **Unexpected Error**: Failed to resize channel. Please try again.';
        } finally {
            // Clean up connection
            try {
                const config = getEnvironmentConfig();
                if (config.privateKey) {
                    const client = new YellowNetworkClient(config.privateKey);
                    client.disconnect();
                }
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }
};

import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { getEnvironmentConfig } from '../../config';
import { type McpTool } from '../../types';

// Tool for depositing funds to Yellow Network custody contract
export const depositToCustodyTool: McpTool = {
    name: 'deposit_to_custody',
    description: 'Deposit tokens to Yellow Network custody contract for channel funding',
    
    schema: {
        amount: z.string().describe("Amount of ytest.usd tokens to deposit (e.g., '10' for 10 ytest.usd)"),
        token_address: z.string().optional().describe("Token contract address (optional, defaults to ytest.usd)")
    },

    handler: async (agent: any, input: any) => {
        try {
            const config = getEnvironmentConfig();
            if (!config.privateKey) {
                return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
            }
            
            const client = new YellowNetworkClient(config.privateKey);
            
            // Convert amount string to bigint (ytest.usd uses 6 decimals)
            const amountFloat = parseFloat(input.amount);
            const amountBigInt = BigInt(Math.floor(amountFloat * 1_000_000));
            
            // Get token address (optional, defaults to ytest.usd)
            const tokenAddress = input.token_address;
            
            const txHash = await client.depositToCustody(amountBigInt, tokenAddress);
            
            return `✅ **Deposit Successful**

Successfully deposited ${input.amount} tokens to custody contract.

**Transaction Details:**
• Transaction Hash: \`${txHash}\`
• Amount: ${input.amount} tokens
• Token Address: ${tokenAddress || '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb'}

The funds are now available in the custody contract and can be allocated to payment channels using the resize_channel tool.`;
            
        } catch (error) {
            console.error('Error depositing to custody:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    return '❌ **Insufficient Balance**: You do not have enough tokens to complete this deposit.';
                }
                if (error.message.includes('timeout')) {
                    return '❌ **Timeout Error**: Transaction timed out. Please try again later.';
                }
                return `❌ **Deposit Error**: ${error.message}`;
            }
            
            return '❌ **Unexpected Error**: Failed to deposit to custody contract. Please try again.';
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

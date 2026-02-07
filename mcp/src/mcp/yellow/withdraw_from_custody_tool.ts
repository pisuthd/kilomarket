import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { getEnvironmentConfig } from '../../config';
import { type McpTool } from '../../types';

// Tool for withdrawing funds from Yellow Network custody contract
export const withdrawFromCustodyTool: McpTool = {
    name: 'withdraw_from_custody',
    description: 'Withdraw tokens from Yellow Network custody contract back to wallet',
    
    schema: {
        amount: z.string().describe("Amount of ytest.usd tokens to withdraw (e.g., '10' for 10 ytest.usd)"),
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
            
            const txHash = await client.withdrawFromCustody(input.token_address, amountBigInt);
            
            return `✅ **Withdrawal Successful**

Successfully withdrew ${input.amount} tokens from custody contract.

**Transaction Details:**
• Transaction Hash: \`${txHash}\`
• Amount: ${input.amount} tokens
• Token Address: ${input.token_address}

The funds have been returned to your wallet.`;
            
        } catch (error) {
            console.error('Error withdrawing from custody:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    return '❌ **Insufficient Balance**: You do not have enough tokens in the custody contract to complete this withdrawal.';
                }
                if (error.message.includes('timeout')) {
                    return '❌ **Timeout Error**: Transaction timed out. Please try again later.';
                }
                return `❌ **Withdrawal Error**: ${error.message}`;
            }
            
            return '❌ **Unexpected Error**: Failed to withdraw from custody contract. Please try again.';
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

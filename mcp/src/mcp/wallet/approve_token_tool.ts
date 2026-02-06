import { z } from "zod";
import { EthereumWalletAgent } from "../../agent/wallet";
import { type McpTool, AddressSchema } from "../../types";

export const ApproveTokenTool: McpTool = {
    name: "ethereum_approve_token",
    description: "Approve a spender to spend a specific amount of tokens",
    schema: {
        token: AddressSchema.describe("ERC20 token contract address"),
        spender: AddressSchema.describe("Spender address to approve"),
        amount: z.string()
            .regex(/^\d*\.?\d+$/, "Amount must be a valid number")
            .describe("Amount of tokens to approve in human-readable units")
    },
    handler: async (agent: EthereumWalletAgent, input: Record<string, any>) => {
        try {
            const { token, spender, amount } = input;

            // Validate amount is positive
            const amountNum = parseFloat(amount);
            if (amountNum <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            // Get token info for the response
            const tokenInfo = await agent.getTokenBalance(token as `0x${string}`);

            // Send the approval transaction
            const result = await agent.approveToken(token as `0x${string}`, spender as `0x${string}`, amount);

            return {
                status: "success",
                message: `✅ ${tokenInfo.symbol} approved successfully`,
                details: {
                    transaction: {
                        hash: result.hash,
                        status: result.status,
                        blockNumber: result.blockNumber,
                        gasUsed: result.gasUsed,
                    },
                    approval: {
                        owner: agent.getAddress(),
                        spender: spender,
                        amount: amount,
                        symbol: tokenInfo.symbol,
                        tokenAddress: token,
                    },
                    token: {
                        address: token,
                        symbol: tokenInfo.symbol,
                        name: tokenInfo.name,
                        decimals: tokenInfo.decimals,
                    },
                    network_name: "sepolia"
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to approve token: ${error.message}`);
        }
    }
};
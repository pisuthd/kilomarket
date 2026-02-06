import { z } from "zod";
import { EthereumWalletAgent } from "../../agent/wallet";
import { type McpTool, AddressSchema } from "../../types";

export const SendERC20TokenTool: McpTool = {
    name: "ethereum_send_erc20_token",
    description: "Send ERC20 tokens to an address",
    schema: {
        token: AddressSchema.describe("ERC20 token contract address"),
        to: AddressSchema.describe("Recipient address"),
        amount: z.string()
            .regex(/^\d*\.?\d+$/, "Amount must be a valid number")
            .describe("Amount of tokens to send in human-readable units")
    },
    handler: async (agent: EthereumWalletAgent, input: Record<string, any>) => {
        try {
            const { token, to, amount } = input;

            // Validate amount is positive
            const amountNum = parseFloat(amount);
            if (amountNum <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            // Get token info for the response
            const tokenInfo = await agent.getTokenBalance(token as `0x${string}`);

            // Send the transaction
            const result = await agent.sendERC20Token(token as `0x${string}`, to as `0x${string}`, amount);

            return {
                status: "success",
                message: `✅ ${tokenInfo.symbol} sent successfully`,
                details: {
                    transaction: {
                        hash: result.hash,
                        status: result.status,
                        blockNumber: result.blockNumber,
                        gasUsed: result.gasUsed,
                    },
                    transfer: {
                        from: agent.getAddress(),
                        to: to,
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
            throw new Error(`Failed to send ERC20 token: ${error.message}`);
        }
    }
};
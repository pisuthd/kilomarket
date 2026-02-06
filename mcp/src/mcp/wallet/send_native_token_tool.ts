import { z } from "zod";
import { EthereumWalletAgent } from "../../agent/wallet";
import { type McpTool, AddressSchema } from "../../types";

export const SendNativeTokenTool: McpTool = {
    name: "ethereum_send_native_token",
    description: "Send native ETH tokens to an address",
    schema: {
        to: AddressSchema.describe("Recipient address"),
        amount: z.string()
            .regex(/^\d*\.?\d+$/, "Amount must be a valid number")
            .describe("Amount of ETH to send in ETH units")
    },
    handler: async (agent: EthereumWalletAgent, input: Record<string, any>) => {
        try {
            const { to, amount } = input;

            // Validate amount is positive
            const amountNum = parseFloat(amount);
            if (amountNum <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            // Send the transaction
            const result = await agent.sendNativeToken(to as `0x${string}`, amount);

            return {
                status: "success",
                message: "✅ ETH sent successfully",
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
                        symbol: "ETH",
                    },
                    network_name: "sepolia"
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to send ETH: ${error.message}`);
        }
    }
};
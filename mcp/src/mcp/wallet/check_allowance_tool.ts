import { z } from "zod";
import { EthereumWalletAgent } from "../../agent/wallet";
import { type McpTool, AddressSchema } from "../../types";

export const CheckAllowanceTool: McpTool = {
    name: "ethereum_check_allowance",
    description: "Check the allowance amount for a specific token and spender",
    schema: {
        token: AddressSchema.describe("ERC20 token contract address"),
        spender: AddressSchema.describe("Spender address to check allowance for")
    },
    handler: async (agent: EthereumWalletAgent, input: Record<string, any>) => {
        try {
            const { token, spender } = input;

            // Get token info for context
            const tokenInfo = await agent.getTokenBalance(token as `0x${string}`);

            // Check allowance
            const allowance = await agent.checkAllowance(token as `0x${string}`, spender as `0x${string}`);

            return {
                status: "success",
                message: "✅ Allowance retrieved successfully",
                details: {
                    allowance: {
                        amount: allowance,
                        formatted: `${allowance} ${tokenInfo.symbol}`,
                        spender: spender,
                        owner: agent.getAddress(),
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
            throw new Error(`Failed to check allowance: ${error.message}`);
        }
    }
};
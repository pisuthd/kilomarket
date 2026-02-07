import { z } from "zod";
import { EthereumWalletAgent } from "../../agent/wallet";
import { type McpTool } from "../../types";
import { networkInfo } from "../../config";

export const GetWalletInfoTool: McpTool = {
    name: "ethereum_get_wallet_info",
    description: "Get information about the current wallet including address, network details, and balances",
    schema: {
        include_tokens: z.boolean()
            .optional()
            .default(true)
            .describe("Include token balances for known tokens")
    },
    handler: async (agent: any, input: Record<string, any>) => {
        try {
            const { include_tokens = true } = input;

            // Create wallet agent instance
            const walletAgent = new EthereumWalletAgent();

            // Get wallet info using the agent method
            const walletInfo = await walletAgent.getWalletInfo();

            // If include_tokens is false, remove tokens from the response
            if (!include_tokens) {
                walletInfo.tokens = [];
            }

            return {
                status: "success",
                message: "✅ Wallet information retrieved successfully",
                details: {
                    address: walletInfo.address,
                    network: {
                        name: walletInfo.network.name,
                        chainId: walletInfo.network.chainId,
                        rpcUrls: [networkInfo.rpcProviderUrl],
                        blockExplorer: networkInfo.blockExplorer,
                        nativeCurrency: networkInfo.nativeCurrency,
                    },
                    balances: {
                        native: {
                            symbol: "ETH",
                            balance: walletInfo.nativeBalance,
                            decimals: 18,
                        },
                        tokens: include_tokens ? walletInfo.tokens : []
                    },
                    network_name: "sepolia"
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get wallet info: ${error.message}`);
        }
    }
};
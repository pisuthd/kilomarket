import { type McpTool } from "../../types";
import { GetWalletInfoTool } from './get_wallet_info_tool';
import { SendERC20TokenTool } from './send_erc20_token_tool';
import { SendNativeTokenTool } from './send_native_token_tool';
import { CheckAllowanceTool } from './check_allowance_tool';
import { ApproveTokenTool } from './approve_token_tool';

// Export all wallet tools using the zod-based format
export const WalletTools: Record<string, McpTool> = {
  "ethereum_get_wallet_info": GetWalletInfoTool,
  "ethereum_send_erc20_token": SendERC20TokenTool,
  "ethereum_send_native_token": SendNativeTokenTool,
  "ethereum_check_allowance": CheckAllowanceTool,
  "ethereum_approve_token": ApproveTokenTool,
};

// Re-export individual tools for direct access
export {
  GetWalletInfoTool,
  SendERC20TokenTool,
  SendNativeTokenTool,
  CheckAllowanceTool,
  ApproveTokenTool,
};
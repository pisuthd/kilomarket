import { type McpTool } from '../../types';
import { listChannelsTool } from './list_channels_tool';
import { closeChannelTool } from './close_channel_tool';
import { createChannelTool } from './create_channel_tool';
import { checkBalanceTool } from './check_balance_tool';
import { transferTool } from './transfer_tool';
// import { depositToCustodyTool } from './deposit_to_custody_tool';
// import { withdrawFromCustodyTool } from './withdraw_from_custody_tool';
import { resizeChannelTool } from './resize_channel_tool';
import { requestFaucetTool } from './request_faucet_tool';

// Export all Yellow Network tools using the correct McpTool format
export const YellowTools: Record<string, McpTool> = {
  "list_yellow_channels": listChannelsTool,
  "close_yellow_channel": closeChannelTool,
  "create_yellow_channel": createChannelTool,
  "check_yellow_balance": checkBalanceTool,
  "transfer_yellow_tokens": transferTool,
  // "deposit_to_custody": depositToCustodyTool,
  // "withdraw_from_custody": withdrawFromCustodyTool,
  "resize_yellow_channel": resizeChannelTool,
  "request_yellow_faucet": requestFaucetTool,
};

// Export individual tools for direct access
export {
  listChannelsTool,
  closeChannelTool,
  createChannelTool,
  checkBalanceTool,
  transferTool,
  requestFaucetTool,
};
import { type McpTool } from '../../types';
import { listChannelsTool } from './list_channels_tool';
import { closeChannelTool } from './close_channel_tool';
import { createChannelTool } from './create_channel_tool';
import { checkBalanceTool } from './check_balance_tool';
import { transferTool } from './transfer_tool';
import { depositToCustodyTool } from './deposit_to_custody_tool';
import { withdrawFromCustodyTool } from './withdraw_from_custody_tool';
import { resizeChannelTool } from './resize_channel_tool';
import { requestFaucetTool } from './request_faucet_tool';

// Export all Yellow Network tools using the correct McpTool format
export const YellowTools: Record<string, McpTool> = {
  "list_yellow_channels": listChannelsTool,
  "close_yellow_channel": closeChannelTool,
  "create_yellow_channel": createChannelTool,
  "check_yellow_balance": checkBalanceTool,
  "transfer_yellow_tokens": transferTool,
  "deposit_to_custody": depositToCustodyTool,
  "withdraw_from_custody": withdrawFromCustodyTool,
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

// Yellow Network tool descriptions
export const YellowToolDescriptions = {
  list_yellow_channels: "List Yellow Network payment channels with their status and details",
  close_yellow_channel: "Close a Yellow Network payment channel and settle on-chain",
  create_yellow_channel: "Create a new Yellow Network payment channel with specified amount",
  check_yellow_balance: "Check Yellow Network balances - supports both on-chain custody balance and off-chain unified balance",
  transfer_yellow_tokens: "Transfer ytest.usd tokens instantly through Yellow Network payment channels",
  request_yellow_faucet: "Request test tokens (ytest.usd) from Yellow Network faucet to top up unified balance",
  deposit_to_custody: "Deposit tokens to Yellow Network custody contract for channel funding",
  withdraw_from_custody: "Withdraw tokens from Yellow Network custody contract back to wallet",
  resize_yellow_channel: "Resize a Yellow Network payment channel to allocate more funds from custody contract",
};

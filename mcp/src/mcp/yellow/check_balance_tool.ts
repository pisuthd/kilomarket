import { z } from 'zod';
import { YellowNetworkClient } from '../../utils/yellow_client';
import { ethers } from 'ethers';
import { type McpTool } from '../../types';
import { getEnvironmentConfig } from '../../config';

export const checkBalanceTool: McpTool = {
  name: "check_yellow_balance",
  description: "Check Yellow Network balances - supports both on-chain custody balance and off-chain unified balance",
  schema: {
    token_address: z.string().optional().describe("Token address to check (optional, defaults to ytest.usd)"),
    include_custody_balance: z.boolean().default(true).describe("Include on-chain custody contract balance"),
    include_unified_balance: z.boolean().default(true).describe("Include off-chain unified balance"),
    decimals: z.number().default(6).describe("Number of decimal places for formatting (default: 6 for ytest.usd)")
  },
  handler: async (agent: any, input: Record<string, any>) => {
    try {
      const config = getEnvironmentConfig();
      if (!config.privateKey) {
        return '❌ **Configuration Error**: ETHEREUM_PRIVATE_KEY environment variable is required for Yellow Network operations.';
      }
      const walletPrivateKey = config.privateKey;
      const args = input;
      const decimals = args.decimals || 6;
      const tokenAddress = args.token_address || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
      
      const client = new YellowNetworkClient(walletPrivateKey);
      
      try {
        let summary = '**Yellow Network Balance Summary**\n\n';
        let custodyBalanceFormatted = '0';
        let unifiedBalanceFormatted = '0';

        // Get custody balance if requested
        if (args.include_custody_balance) {
          try {
            const custodyBalanceBigInt = await client.getCustodyBalance(tokenAddress);
            custodyBalanceFormatted = (Number(custodyBalanceBigInt) / Math.pow(10, decimals)).toFixed(decimals);
            summary += `🏦 **On-Chain Custody Balance**: ${custodyBalanceFormatted} ytest.usd\n`;
          } catch (custodyError) {
            console.warn('Failed to get custody balance:', custodyError);
            summary += `🏦 **On-Chain Custody Balance**: Error\n`;
          }
        }

        // Get unified balance if requested
        if (args.include_unified_balance) {
          try {
            const ledgerBalances = await client.getLedgerBalances();
            const ytestBalance = ledgerBalances.find((balance: any) => balance.asset === 'ytest.usd');
            unifiedBalanceFormatted = ytestBalance ? parseFloat(ytestBalance.amount).toFixed(decimals) : '0.000000';
            summary += `💳 **Off-Chain Unified Balance**: ${unifiedBalanceFormatted} ytest.usd\n`;
          } catch (ledgerError) {
            console.warn('Failed to get ledger balances:', ledgerError);
            summary += `💳 **Off-Chain Unified Balance**: Error\n`;
          }
        }

        // Calculate total if both are enabled
        if (args.include_custody_balance && args.include_unified_balance) {
          const totalBalance = parseFloat(custodyBalanceFormatted) + parseFloat(unifiedBalanceFormatted);
          summary += `\n📊 **Total Available Balance**: ${totalBalance.toFixed(decimals)} ytest.usd\n`;
        }

        summary += `\n📍 **Token Address**: ${tokenAddress} (ytest.usd)\n`;
        summary += `🔢 **Decimal Places**: ${decimals}`;
        
        return summary;
        
      } finally {
        client.disconnect();
      }
      
    } catch (error) {
      console.error('Error checking Yellow Network balance:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          return '❌ **Authentication Error**: Failed to authenticate with Yellow Network. Please check your wallet credentials and try again.';
        }
        if (error.message.includes('timeout')) {
          return '❌ **Timeout Error**: Balance check timed out. Please try again later.';
        }
        if (error.message.includes('WebSocket')) {
          return '❌ **Connection Error**: Failed to connect to Yellow Network. Please check your network connection and try again.';
        }
        return `❌ **Error**: ${error.message}`;
      }
      
      return '❌ **Unexpected Error**: Failed to check balance due to an unexpected error. Please check your wallet configuration and try again.';
    }
  }
};
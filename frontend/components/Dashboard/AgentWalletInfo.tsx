"use client"

import { useState } from 'react'
import { isWalletDeployed } from '@/lib/zerodev'

interface AgentWalletInfoProps {
  address: string
  balance: string
  isLoading: boolean
}

export default function AgentWalletInfo({ address, balance, isLoading }: AgentWalletInfoProps) {
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openExplorer = () => {
    window.open(`https://1301.testnet.thesuperscan.io/address/${address}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Agent Wallet</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isDeployed === null 
            ? 'bg-gray-700 text-gray-400' 
            : isDeployed 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {isDeployed === null ? 'Checking...' : isDeployed ? '✅ Deployed' : '⚠️ Not Deployed'}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Address:</span>
          <div className="flex items-center gap-2">
            <code className="font-mono text-white bg-black/30 px-3 py-1 rounded">
              {formatAddress(address)}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Copy address"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button
              onClick={openExplorer}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="View on block explorer"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Balance:</span>
          <span className="text-white font-semibold">
            {balance} ETH
          </span>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'

interface ViewSessionKeyModalProps {
  sessionKey: {
    id: string
    address: string
    passcode: string
    timeLimit: number
    ethLimit: string
    createdAt: Date
    expiresAt: Date
    status: 'active' | 'expired' | 'revoked'
    approval?: string
  }
  onClose: () => void
}

export default function ViewSessionKeyModal({ sessionKey, onClose }: ViewSessionKeyModalProps) {
  const [copied, setCopied] = useState<'address' | 'approval' | null>(null)

  const handleCopy = async (text: string, type: 'address' | 'approval') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTimeLimit = (days: number) => {
    return `${days} day${days > 1 ? 's' : ''}`
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Session Key Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">

          {/* Approval Data */}
          {sessionKey.approval && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Serialized Approval Data
              </label>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <code className="text-xs text-white font-mono break-all max-w-[calc(100%-80px)]">
                    {sessionKey.approval}
                  </code>
                  <button
                    onClick={() => handleCopy(sessionKey.approval!, 'approval')}
                    className="ml-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-xs whitespace-nowrap"
                  >
                    {copied === 'approval' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Session Key Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agent Wallet Address
            </label>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm text-white font-mono break-all">
                  {sessionKey.address}
                </code>
                <button
                  onClick={() => handleCopy(sessionKey.address, 'address')}
                  className="ml-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  {copied === 'address' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passcode
            </label>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <code className="text-sm text-white font-mono">
                {sessionKey.passcode}
              </code>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Limit
            </label>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <p className="text-sm text-white">{formatTimeLimit(sessionKey.timeLimit)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {formatDateTime(sessionKey.createdAt)}
              </p>
              <p className="text-xs text-gray-400">
                Expires: {formatDateTime(sessionKey.expiresAt)}
              </p>
            </div>
          </div>

          {/* ETH Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ETH Spending Limit
            </label>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <p className="text-sm text-white">{sessionKey.ethLimit} ETH</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                sessionKey.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : sessionKey.status === 'expired'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {sessionKey.status.charAt(0).toUpperCase() + sessionKey.status.slice(1)}
              </span>
            </div>
          </div>

          

          {/* Information Box */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Session Key Information</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Session keys allow automated spending within set limits</li>
              <li>• The passcode constructs the agent signer private key</li>
              <li>• Time and ETH limits enforce spending constraints</li>
              <li>• Approval data is used for on-chain session key deployment</li>
              <li>• Keys can be revoked at any time for security</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
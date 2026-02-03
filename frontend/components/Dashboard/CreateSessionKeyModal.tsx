"use client"

import { useState } from 'react'
import { useAccount, useConnectorClient } from 'wagmi'
import { SessionKeyManager } from '@/lib/sessionKeys'
import type { SessionKeyData } from '@/lib/sessionKeys'

interface CreateSessionKeyModalProps {
  agentWalletAddress: string
  eoaAddress: string
  passcode: string
  onClose: () => void
  onCreate: (sessionKey: SessionKeyData) => void
}

export default function CreateSessionKeyModal({ 
  agentWalletAddress, 
  eoaAddress, 
  passcode,
  onClose, 
  onCreate 
}: CreateSessionKeyModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [timeLimit, setTimeLimit] = useState(1) // in days
  const [ethLimit, setEthLimit] = useState('0.5')
  const [customTimeLimit, setCustomTimeLimit] = useState('')
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [error, setError] = useState('')

  const timeOptions = [
    { label: '1 Day', value: 1 },
    { label: '1 Week', value: 7 },
    { label: '1 Month', value: 30 },
    { label: 'Custom', value: 0 }
  ]

  const { connector } = useAccount()
  const { data: client } = useConnectorClient()

  const handleCreate = async () => {
    if (isCreating) return

    const finalTimeLimit = useCustomTime ? parseInt(customTimeLimit) : timeLimit
    
    if (useCustomTime && (!customTimeLimit || parseInt(customTimeLimit) <= 0)) {
      setError('Please enter a valid time limit')
      return
    }

    if (!ethLimit || parseFloat(ethLimit) <= 0) {
      setError('Please enter a valid ETH limit')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // Get the EOA signer from wagmi
      if (!connector || !client) {
        throw new Error('Wallet not connected')
      }
 
      // Create session key using SessionKeyManager
      const sessionKey = await SessionKeyManager.createSessionKey({
        eoaSigner: client,
        agentWalletAddress,
        timeLimit: finalTimeLimit,
        ethLimit,
        passcode
      })

      console.log('Session key created:', sessionKey)
      onCreate(sessionKey)
      onClose()
    } catch (err) {
      console.error('Error creating session key:', err)
      setError('Failed to create session key. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Create Session Key</h2>
        
        <div className="space-y-4">
          {/* Time Limit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Limit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value === 0) {
                      setUseCustomTime(true)
                    } else {
                      setTimeLimit(option.value)
                      setUseCustomTime(false)
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (!useCustomTime && timeLimit === option.value) || (option.value === 0 && useCustomTime)
                      ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {useCustomTime && (
              <div className="mt-2">
                <input
                  type="number"
                  value={customTimeLimit}
                  onChange={(e) => setCustomTimeLimit(e.target.value)}
                  placeholder="Enter days"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00ff88]"
                  min="1"
                />
              </div>
            )}
          </div>

          {/* ETH Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ETH Spending Limit
            </label>
            <div className="relative">
              <input
                type="number"
                value={ethLimit}
                onChange={(e) => setEthLimit(e.target.value)}
                placeholder="0.0"
                step="0.01"
                min="0.001"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00ff88]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ETH
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Information Box */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Session Key Details</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Allows automated spending from your agent wallet</li>
              <li>• Expires automatically after the time limit</li>
              <li>• Cannot exceed the ETH spending limit</li>
              <li>• Can be revoked at any time</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Session Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
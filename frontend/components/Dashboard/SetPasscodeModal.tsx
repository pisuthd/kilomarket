"use client"

import { useState, useEffect } from 'react'

interface SetPasscodeModalProps {
  onClose: () => void
  onSet: (passcode: string) => void
}

export default function SetPasscodeModal({ onClose, onSet }: SetPasscodeModalProps) {
  const [passcode, setPasscode] = useState('1234')
  const [isSetting, setIsSetting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const validatePasscode = (code: string): boolean => {
    // Validation - 4-8 digits only
    return /^\d{4,8}$/.test(code)
  }

  const handleSetPasscode = async () => {
    if (isSetting) return

    if (!passcode) {
      setError('Please enter a passcode')
      return
    }

    if (!validatePasscode(passcode)) {
      setError('Passcode must be 4-8 digits only')
      return
    }

    setIsSetting(true)
    setError('')

    try {
      onSet(passcode)
      onClose()
    } catch (err) {
      console.error('Error setting passcode:', err)
      setError('Failed to set passcode. Please try again.')
    } finally {
      setIsSetting(false)
    }
  }

  const handleResetToDefault = () => {
    setPasscode('1234')
    setError('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Set Passcode</h2>

        <div className="space-y-4">
          {/* Passcode Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passcode (4-8 digits)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
                  setPasscode(value)
                  setError('')
                }}
                placeholder="Enter digits"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-3 text-lg bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00ff88] transition-colors"
                maxLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Use Default
            </button>
            {/* <button
              type="button"
              onClick={() => {
                setPasscode('')
                setError('')
              }}
              className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>*/}
          </div>

          {/* Information Box */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Agent Signer Passcode
            </h3>

            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Deterministically derives an agent signer from the same passcode</li>
              <li>• Signer creates a session key with scoped permissions from the owner wallet</li>
              <li>• Agent Terminal re-derives the same signer using the same passcode</li>
              {/*<li>• Enables reuse of the session key without re-accessing the owner wallet</li>*/}
              <li>• Must be 4–8 digits (numbers only)</li>
            </ul>

            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
              <p className="text-xs text-red-400 font-medium">⚠️ Security Warning</p>
              <p className="text-xs text-red-300 mt-1">
                This passcode-based signer derivation is for development and testing only.
                Do NOT use in production environments.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSetting}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSetPasscode}
            disabled={isSetting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSetting ? 'Setting...' : 'Set Passcode'}
          </button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import AgentWalletInfo from './AgentWalletInfo'
import QuickActions from './QuickActions'
import SessionKeyTable from './SessionKeyTable'
import CreateSessionKeyModal from './CreateSessionKeyModal'
import SetPasscodeModal from './SetPasscodeModal'
import ViewSessionKeyModal from './ViewSessionKeyModal'
import { getWalletBalance } from '@/lib/zerodev'
import { SessionKeyManager, passcodeManager } from '@/lib/sessionKeys'
import type { SessionKeyData } from '@/lib/sessionKeys'

interface DashboardProps {
  agentWalletAddress: string | null
  eoaAddress: string
}

export default function Dashboard({ agentWalletAddress, eoaAddress }: DashboardProps) {
  const [walletBalance, setWalletBalance] = useState<string>('0')
  const [sessionKeys, setSessionKeys] = useState<SessionKeyData[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedSessionKey, setSelectedSessionKey] = useState<SessionKeyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPasscode, setCurrentPasscode] = useState<string>(passcodeManager.defaultPasscode)

  useEffect(() => {
    const loadWalletData = async () => {
      if (agentWalletAddress) {
        setIsLoading(true)
        try {
          const balance = await getWalletBalance(agentWalletAddress)
          setWalletBalance(balance)
          
          // Load and check session keys
          SessionKeyManager.checkExpiredKeys(eoaAddress)
          const keys = SessionKeyManager.getSessionKeys(eoaAddress)
          setSessionKeys(keys)
        } catch (error) {
          console.error('Error loading wallet data:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadWalletData()
  }, [agentWalletAddress, eoaAddress])

  const handleCreateSessionKey = (sessionKey: SessionKeyData) => {
    SessionKeyManager.saveSessionKey(sessionKey, eoaAddress)
    const keys = SessionKeyManager.getSessionKeys(eoaAddress)
    setSessionKeys(keys)
  }

  const handleRevokeSessionKey = async (keyId: string) => {
    try {
      // Note: This revokes all session keys due to ZeroDev plugin limitations
      // TODO: Implement individual session key revocation in the future
      
      // Update the status to revoked
      SessionKeyManager.updateSessionKeyStatus(keyId, 'revoked', eoaAddress)
      const keys = SessionKeyManager.getSessionKeys(eoaAddress)
      setSessionKeys(keys)
      
      console.log('Session key revoked successfully:', keyId)
    } catch (error) {
      console.error('Error revoking session key:', error)
    }
  }

  const handleViewSessionKey = (sessionKey: SessionKeyData) => {
    setSelectedSessionKey(sessionKey)
    setIsViewModalOpen(true)
  }

  const handleSetPasscode = (passcode: string) => {
    setCurrentPasscode(passcode)
  }

  if (!agentWalletAddress) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-red-400">Agent Wallet Not Found</h1>
          <p className="text-gray-300 mb-4">
            Unable to derive agent wallet from your EOA address
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Troubleshooting:</h3>
            <ul className="text-xs text-gray-400 space-y-1 text-left">
              <li>• Ensure your wallet is properly connected</li>
              <li>• Try refreshing the page</li>
              <li>• Check network connection</li>
              <li>• Contact support if issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-base text-gray-300 max-w-3xl mx-auto">
            Manage your agent wallet and create session keys for automated operations. 
            Set spending limits and time constraints to maintain full control over your agent's activities.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Agent Wallet Info */}
        <AgentWalletInfo 
          address={agentWalletAddress}
          balance={walletBalance}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        <QuickActions
          onCreateSessionKey={() => setIsCreateModalOpen(true)}
          onSetPasscode={() => setIsPasscodeModalOpen(true)}
        />

        {/* Session Keys Table */}
        <SessionKeyTable
          sessionKeys={sessionKeys}
          onRevoke={handleRevokeSessionKey}
          onView={handleViewSessionKey}
          isLoading={isLoading}
        />

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateSessionKeyModal
            agentWalletAddress={agentWalletAddress}
            eoaAddress={eoaAddress}
            passcode={currentPasscode}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateSessionKey}
          />
        )}

        {isPasscodeModalOpen && (
          <SetPasscodeModal
            onClose={() => setIsPasscodeModalOpen(false)}
            onSet={handleSetPasscode}
          />
        )}

        {isViewModalOpen && selectedSessionKey && (
          <ViewSessionKeyModal
            sessionKey={selectedSessionKey}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
        </div>
      </div>
    </div>
  )
}
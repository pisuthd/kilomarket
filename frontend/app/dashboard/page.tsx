"use client"

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { getWalletAddressFromEOA, getWalletBalance } from '@/lib/zerodev'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [agentWalletAddress, setAgentWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAgentWallet = async () => {
      if (address && isConnected) {
        setIsLoading(true)
        try { 
          const agentAddress = await getWalletAddressFromEOA(address) 
          setAgentWalletAddress(agentAddress)
        } catch (error) {
          console.error('Error fetching agent wallet:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setAgentWalletAddress(null)
        setIsLoading(false)
      }
    }

    fetchAgentWallet()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              Connect Your Wallet
            </h1>
            <p className="text-base text-gray-300 mb-6">
              Connect your wallet to access your agent dashboard and manage automated operations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your agent wallet...</p>
        </div>
      </div>
    )
  }

  return <Dashboard agentWalletAddress={agentWalletAddress} eoaAddress={address || ''} />
}
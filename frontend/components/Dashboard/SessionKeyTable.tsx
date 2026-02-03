"use client"

import { useState, useEffect } from 'react'

interface SessionKey {
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

interface SessionKeyTableProps {
  sessionKeys: SessionKey[]
  onRevoke: (keyId: string) => void
  onView: (key: SessionKey) => void
  isLoading: boolean
}

export default function SessionKeyTable({ sessionKeys, onRevoke, onView, isLoading }: SessionKeyTableProps) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const updateTimeLeft = () => {
      const newTimeLeft: { [key: string]: string } = {}
      
      sessionKeys.forEach(key => {
        if (key.status === 'active') {
          const now = new Date().getTime()
          const expiry = key.expiresAt.getTime()
          const diff = expiry - now

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            
            if (hours > 24) {
              const days = Math.floor(hours / 24)
              newTimeLeft[key.id] = `${days}d ${hours % 24}h`
            } else if (hours > 0) {
              newTimeLeft[key.id] = `${hours}h ${minutes}m`
            } else {
              newTimeLeft[key.id] = `${minutes}m`
            }
          } else {
            newTimeLeft[key.id] = 'Expired'
          }
        }
      })
      
      setTimeLeft(newTimeLeft)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [sessionKeys])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        label: 'Active'
      },
      expired: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        label: 'Expired'
      },
      revoked: {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        label: 'Revoked'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
        {config.label}
      </span>
    )
  }

  const formatTimeLimit = (days: number) => {
    return `${days} day${days > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Session Keys</h2>
      
      {sessionKeys.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Session Keys</h3>
          <p className="text-gray-400 text-sm mb-4">Create a session key to authorize automated spending from your agent wallet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Agent Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time Limit</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ETH Limit</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionKeys.map((key) => (
                <tr key={key.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <code className="font-mono text-sm text-white bg-black/30 px-2 py-1 rounded">
                      {formatAddress(key.address)}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm text-white">{formatTimeLimit(key.timeLimit)}</div>
                      {key.status === 'active' && timeLeft[key.id] && (
                        <div className="text-xs text-gray-400">{timeLeft[key.id]} left</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{key.ethLimit} ETH</span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(key.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(key)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        View
                      </button>
                      {key.status === 'active' && (
                        <button
                          onClick={() => onRevoke(key.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      {/*{key.status === 'revoked' && (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded text-sm">
                          Revoked
                        </span>
                      )}
                      {key.status === 'expired' && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm">
                          Expired
                        </span>
                      )}*/}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
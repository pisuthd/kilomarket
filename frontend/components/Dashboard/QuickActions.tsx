"use client"

import { useState, useEffect } from 'react'

interface QuickActionsProps {
  onCreateSessionKey: () => void
  onSetPasscode: () => void
}

export default function QuickActions({ onCreateSessionKey, onSetPasscode }: QuickActionsProps) {
    

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <button
          onClick={onSetPasscode}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-center gap-3"> 
            <div className="text-left">
              <div className="font-semibold">Set Passcode</div> 
            </div>
          </div>
        </button>

        <button
          onClick={onCreateSessionKey}
          className="group relative overflow-hidden bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg p-4 hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all duration-300"
        >
          <div className="flex items-center justify-center gap-3"> 
            <div className="text-left">
              <div className="font-semibold">Create Session Key</div> 
            </div>
          </div>
        </button>

        
      </div>

      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">How it works:</h3>
        <ol className="text-xs text-gray-400 space-y-1">
          <li>1. Your agent wallet is automatically created from your EOA</li>
          <li>2. You authorize automation by creating limited session keys</li>
          <li>3. Copy the approval data and use it in Agent Terminal</li>
        </ol>
      </div>
    </div>
  )
}
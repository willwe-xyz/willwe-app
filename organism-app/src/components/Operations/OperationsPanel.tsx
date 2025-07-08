import React, { useState } from 'react'
import { CelestialBody } from '../../types/solarSystem'
import { SignalPanel } from './SignalPanel'
import { MovementPanel } from './MovementPanel'
import { ChatPanel } from '../Chat/ChatPanel'
import { WalletConnection } from '../Wallet/WalletConnection'

interface OperationsPanelProps {
  selectedBody: CelestialBody | null
  onClose: () => void
  position: { x: number; y: number }
}

export const OperationsPanel: React.FC<OperationsPanelProps> = ({
  selectedBody,
  onClose,
  position
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'signals' | 'movements' | 'chat'>('info')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSuccess = (txHash: string) => {
    setNotification({ type: 'success', message: `Transaction submitted: ${txHash.slice(0, 10)}...` })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleError = (error: string) => {
    setNotification({ type: 'error', message: error })
    setTimeout(() => setNotification(null), 5000)
  }

  if (!selectedBody) return null

  const tabs = [
    { id: 'info', label: 'Info', icon: 'ℹ️' },
    { id: 'signals', label: 'Signals', icon: '📡' },
    { id: 'movements', label: 'Movements', icon: '🚀' },
    { id: 'chat', label: 'Chat', icon: '💬' }
  ] as const

  const getBodyTypeDescription = (type: string) => {
    switch (type) {
      case 'sun': return 'Central governance hub'
      case 'planet': return 'Primary governance node'
      case 'moon': return 'Secondary governance node'
      case 'station': return 'User endpoint'
      case 'satellite': return 'Execution endpoint'
      default: return 'Unknown celestial body'
    }
  }

  return (
    <div
      className="fixed bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 w-96 max-h-96 overflow-hidden"
      style={{
        left: Math.min(position.x, window.innerWidth - 400),
        top: Math.min(position.y, window.innerHeight - 400)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {selectedBody.type === 'sun' ? '☀️' : 
             selectedBody.type === 'planet' ? '🪐' : 
             selectedBody.type === 'moon' ? '🌙' : 
             selectedBody.type === 'station' ? '🛰️' : '📡'}
          </span>
          <div>
            <h3 className="text-white font-bold">
              {selectedBody.type.charAt(0).toUpperCase() + selectedBody.type.slice(1)}
            </h3>
            <p className="text-gray-400 text-sm">
              {getBodyTypeDescription(selectedBody.type)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`mx-4 mt-2 p-2 rounded text-sm ${
          notification.type === 'success' 
            ? 'bg-green-600/20 border border-green-400/40 text-green-300'
            : 'bg-red-600/20 border border-red-400/40 text-red-300'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Wallet Connection */}
      {(activeTab === 'signals' || activeTab === 'movements') && (
        <div className="mx-4 mt-4">
          <WalletConnection 
            onConnectionChange={setIsWalletConnected}
            className="mb-4"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Token Information */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <span>🪙</span>
                <span>Token Information</span>
              </h4>
              <div className="space-y-2 text-sm">
                {selectedBody.nodeData.tokenSymbol && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-white font-bold">{selectedBody.nodeData.tokenSymbol}</span>
                  </div>
                )}
                {selectedBody.nodeData.tokenName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedBody.nodeData.tokenName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[11].toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User Balance:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[9].toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract:</span>
                  <span className="text-white font-mono text-xs">
                    {selectedBody.nodeData.rootTokenAddress.slice(0, 6)}...{selectedBody.nodeData.rootTokenAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Membrane Information */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <span>📜</span>
                <span>Membrane Information</span>
              </h4>
              <div className="space-y-2 text-sm">
                {selectedBody.nodeData.membraneName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedBody.nodeData.membraneName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[6]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Eligibility Rate:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[7]}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Members:</span>
                  <span className="text-white">{selectedBody.nodeData.membersOfNode.length}</span>
                </div>
              </div>
            </div>

            {/* Economic Information */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <span>💰</span>
                <span>Economic Status</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Inflation Rate:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[1]}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reserve:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[2].toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[3].toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Root Value Budget:</span>
                  <span className="text-white">{selectedBody.nodeData.basicInfo[4].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Governance Hierarchy */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <span>🏛️</span>
                <span>Governance Structure</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hierarchy Depth:</span>
                  <span className="text-white">{selectedBody.nodeData.hierarchyDepth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Children Nodes:</span>
                  <span className="text-white">{selectedBody.nodeData.childrenNodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Signals:</span>
                  <span className="text-white">{selectedBody.nodeData.signals?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Node ID:</span>
                  <span className="text-white font-mono text-xs">
                    {selectedBody.nodeData.basicInfo[0].slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('signals')}
                  className="px-3 py-2 bg-blue-600/20 border border-blue-400/40 rounded text-blue-300 hover:bg-blue-600/30 transition-colors text-sm"
                >
                  📡 Submit Signal
                </button>
                <button
                  onClick={() => setActiveTab('movements')}
                  className="px-3 py-2 bg-green-600/20 border border-green-400/40 rounded text-green-300 hover:bg-green-600/30 transition-colors text-sm"
                >
                  🚀 Create Movement
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-3 py-2 bg-purple-600/20 border border-purple-400/40 rounded text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                >
                  💬 Join Chat
                </button>
                <button
                  className="px-3 py-2 bg-yellow-600/20 border border-yellow-400/40 rounded text-yellow-300 hover:bg-yellow-600/30 transition-colors text-sm"
                  title="View on block explorer"
                >
                  🔍 Explorer
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <SignalPanel
            selectedBody={selectedBody}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === 'movements' && (
          <MovementPanel
            selectedBody={selectedBody}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPanel
            selectedBody={selectedBody}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </div>
    </div>
  )
}

export default OperationsPanel
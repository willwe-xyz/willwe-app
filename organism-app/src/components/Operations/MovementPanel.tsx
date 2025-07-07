import React, { useState } from 'react'
import { CelestialBody } from '../../types/solarSystem'
import { useWillWeIntegration } from '../../hooks/useWillWeIntegration'

interface Movement {
  id: string
  nodeId: string
  description: string
  execution: string
  creator: string
  signatures: string[]
  executed: boolean
  created: number
}

interface MovementPanelProps {
  selectedBody: CelestialBody
  onSuccess: (txHash: string) => void
  onError: (error: string) => void
}

export const MovementPanel: React.FC<MovementPanelProps> = ({
  selectedBody,
  onSuccess,
  onError
}) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'details'>('list')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    execution: ''
  })

  // Mock movements data - in real implementation, this would come from contract events
  const [movements] = useState<Movement[]>([
    {
      id: '1',
      nodeId: selectedBody.nodeData.basicInfo[0],
      description: 'Increase inflation rate to 5% for economic stimulus',
      execution: '0x1234567890abcdef...',
      creator: '0xabc123...',
      signatures: ['0xabc123...', '0xdef456...'],
      executed: false,
      created: Date.now() - 86400000 // 1 day ago
    },
    {
      id: '2', 
      nodeId: selectedBody.nodeData.basicInfo[0],
      description: 'Update membrane requirements for new members',
      execution: '0x9876543210fedcba...',
      creator: '0xdef456...',
      signatures: ['0xdef456...'],
      executed: false,
      created: Date.now() - 172800000 // 2 days ago
    }
  ])

  const { createMovement, signMovement, executeMovement, canInteract, account } = useWillWeIntegration()

  const handleCreateMovement = async () => {
    if (!canInteract) return

    try {
      setIsSubmitting(true)
      const txHash = await createMovement(
        selectedBody.nodeData.basicInfo[0],
        formData.description,
        formData.execution
      )
      onSuccess(txHash)
      setActiveView('list')
      setFormData({ description: '', execution: '' })
    } catch (error: any) {
      onError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignMovement = async (movementId: string) => {
    if (!canInteract) return

    try {
      setIsSubmitting(true)
      const txHash = await signMovement(movementId)
      onSuccess(txHash)
    } catch (error: any) {
      onError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExecuteMovement = async (movementId: string) => {
    if (!canInteract) return

    try {
      setIsSubmitting(true)
      const txHash = await executeMovement(movementId)
      onSuccess(txHash)
    } catch (error: any) {
      onError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Recent'
  }

  const getSignatureProgress = (movement: Movement) => {
    const required = Math.ceil(selectedBody.nodeData.membersOfNode.length * 0.51) // 51% majority
    const current = movement.signatures.length
    return { current, required, percentage: (current / required) * 100 }
  }

  const canExecute = (movement: Movement) => {
    const { current, required } = getSignatureProgress(movement)
    return current >= required && !movement.executed
  }

  const hasUserSigned = (movement: Movement) => {
    return movement.signatures.includes(account || '')
  }

  if (!canInteract) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔒</div>
        <h4 className="text-white font-medium mb-2">Wallet Required</h4>
        <p className="text-gray-400 text-sm">
          Connect your wallet to participate in movements
        </p>
      </div>
    )
  }

  if (activeView === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">🚀 Create Movement</h4>
          <button
            onClick={() => setActiveView('list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
              placeholder="Describe the movement purpose..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Execution Data</label>
            <input
              type="text"
              value={formData.execution}
              onChange={(e) => setFormData(prev => ({ ...prev, execution: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
              placeholder="0x... (execution bytecode)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Smart contract bytecode to execute when movement passes
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-white/20">
          <button
            onClick={() => setActiveView('list')}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateMovement}
            disabled={isSubmitting || !formData.description || !formData.execution}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-800 transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Movement</span>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (activeView === 'details' && selectedMovement) {
    const progress = getSignatureProgress(selectedMovement)
    const userSigned = hasUserSigned(selectedMovement)
    const executable = canExecute(selectedMovement)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">📋 Movement Details</h4>
          <button
            onClick={() => setActiveView('list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h5 className="text-white font-medium mb-2">Description</h5>
            <p className="text-gray-300 text-sm bg-white/5 rounded p-3">
              {selectedMovement.description}
            </p>
          </div>

          <div>
            <h5 className="text-white font-medium mb-2">Signature Progress</h5>
            <div className="bg-white/5 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {progress.current} of {progress.required} signatures
                </span>
                <span className="text-sm text-white">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white font-medium mb-2">Status</h5>
            <div className="flex items-center space-x-2">
              {selectedMovement.executed ? (
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                  ✅ Executed
                </span>
              ) : executable ? (
                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                  ⚡ Ready to Execute
                </span>
              ) : (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                  📝 Collecting Signatures
                </span>
              )}
              <span className="text-xs text-gray-400">
                Created {formatTimeAgo(selectedMovement.created)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t border-white/20">
          {!selectedMovement.executed && !userSigned && (
            <button
              onClick={() => handleSignMovement(selectedMovement.id)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-yellow-800 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <span>✍️</span>
                  <span>Sign Movement</span>
                </>
              )}
            </button>
          )}

          {executable && (
            <button
              onClick={() => handleExecuteMovement(selectedMovement.id)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-800 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span>Execute</span>
                </>
              )}
            </button>
          )}

          {userSigned && !selectedMovement.executed && (
            <div className="flex-1 px-4 py-2 bg-green-600/20 border border-green-400/40 rounded text-green-300 text-center">
              ✓ You signed this movement
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">🚀 Movement Operations</h4>
        <button
          onClick={() => setActiveView('create')}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
        >
          + Create
        </button>
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <h5 className="text-white font-medium mb-2">No Active Movements</h5>
          <p className="text-gray-400 text-sm mb-4">
            Create the first movement for this {selectedBody.type}
          </p>
          <button
            onClick={() => setActiveView('create')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Create Movement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {movements.map(movement => {
            const progress = getSignatureProgress(movement)
            const userSigned = hasUserSigned(movement)
            const executable = canExecute(movement)

            return (
              <div
                key={movement.id}
                onClick={() => {
                  setSelectedMovement(movement)
                  setActiveView('details')
                }}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h6 className="text-white font-medium text-sm line-clamp-2">
                    {movement.description}
                  </h6>
                  <div className="flex items-center space-x-1 ml-2">
                    {movement.executed && <span className="text-green-400">✅</span>}
                    {executable && !movement.executed && <span className="text-yellow-400">⚡</span>}
                    {userSigned && <span className="text-blue-400">✍️</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {progress.current}/{progress.required} signatures ({Math.round(progress.percentage)}%)
                  </span>
                  <span className="text-gray-500">
                    {formatTimeAgo(movement.created)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all"
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MovementPanel
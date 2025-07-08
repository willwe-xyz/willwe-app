import React, { useState } from 'react'
import { CelestialBody } from '../../types/solarSystem'
import { useWillWeIntegration } from '../../hooks/useWillWeIntegration'

interface SignalPanelProps {
  selectedBody: CelestialBody
  onSuccess: (txHash: string) => void
  onError: (error: string) => void
}

export const SignalPanel: React.FC<SignalPanelProps> = ({
  selectedBody,
  onSuccess,
  onError
}) => {
  const [activeSignal, setActiveSignal] = useState<'membrane' | 'inflation' | 'redistribution' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    membraneId: '',
    inflationRate: '',
    redistributionTargets: [''],
    redistributionWeights: ['']
  })

  const { submitSignal, canInteract } = useWillWeIntegration()

  const handleSubmitSignal = async () => {
    if (!activeSignal || !canInteract) return

    try {
      setIsSubmitting(true)
      
      let value: any
      switch (activeSignal) {
        case 'membrane':
          value = parseInt(formData.membraneId)
          break
        case 'inflation':
          value = parseInt(formData.inflationRate)
          break
        case 'redistribution':
          value = {
            targets: formData.redistributionTargets.filter(Boolean),
            weights: formData.redistributionWeights.map(w => parseInt(w)).filter(Boolean)
          }
          break
      }

      const txHash = await submitSignal(selectedBody.nodeData.basicInfo[0], activeSignal, value)
      onSuccess(txHash)
      setActiveSignal(null)
      setFormData({
        membraneId: '',
        inflationRate: '',
        redistributionTargets: [''],
        redistributionWeights: ['']
      })
    } catch (error: any) {
      onError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRedistributionTarget = () => {
    setFormData(prev => ({
      ...prev,
      redistributionTargets: [...prev.redistributionTargets, ''],
      redistributionWeights: [...prev.redistributionWeights, '']
    }))
  }

  const updateRedistributionTarget = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      redistributionTargets: prev.redistributionTargets.map((target, i) => i === index ? value : target)
    }))
  }

  const updateRedistributionWeight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      redistributionWeights: prev.redistributionWeights.map((weight, i) => i === index ? value : weight)
    }))
  }

  const removeRedistributionTarget = (index: number) => {
    setFormData(prev => ({
      ...prev,
      redistributionTargets: prev.redistributionTargets.filter((_, i) => i !== index),
      redistributionWeights: prev.redistributionWeights.filter((_, i) => i !== index)
    }))
  }

  if (!canInteract) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔒</div>
        <h4 className="text-white font-medium mb-2">Wallet Required</h4>
        <p className="text-gray-400 text-sm">
          Connect your wallet to submit governance signals
        </p>
      </div>
    )
  }

  if (!activeSignal) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📡</div>
          <h4 className="text-white font-medium mb-2">Signal Operations</h4>
          <p className="text-gray-400 text-sm">
            Submit governance signals to influence {selectedBody.type} behavior
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => setActiveSignal('membrane')}
            className="w-full px-4 py-3 bg-pink-600/20 border border-pink-400/40 rounded-lg text-pink-300 hover:bg-pink-600/30 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏛️</span>
              <div>
                <div className="font-medium">Membrane Signal</div>
                <div className="text-xs text-pink-400 opacity-80">
                  Change membership requirements
                </div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveSignal('inflation')}
            className="w-full px-4 py-3 bg-teal-600/20 border border-teal-400/40 rounded-lg text-teal-300 hover:bg-teal-600/30 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">💰</span>
              <div>
                <div className="font-medium">Inflation Signal</div>
                <div className="text-xs text-teal-400 opacity-80">
                  Adjust token inflation rate
                </div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveSignal('redistribution')}
            className="w-full px-4 py-3 bg-blue-600/20 border border-blue-400/40 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🔄</span>
              <div>
                <div className="font-medium">Redistribution Signal</div>
                <div className="text-xs text-blue-400 opacity-80">
                  Allocate resources between nodes
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">
          {activeSignal === 'membrane' && '🏛️ Membrane Signal'}
          {activeSignal === 'inflation' && '💰 Inflation Signal'}
          {activeSignal === 'redistribution' && '🔄 Redistribution Signal'}
        </h4>
        <button
          onClick={() => setActiveSignal(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      {activeSignal === 'membrane' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Membrane ID</label>
            <input
              type="number"
              value={formData.membraneId}
              onChange={(e) => setFormData(prev => ({ ...prev, membraneId: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
              placeholder="Enter membrane ID..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {selectedBody.nodeData.basicInfo[6]}
            </p>
          </div>
        </div>
      )}

      {activeSignal === 'inflation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Inflation Rate (%)</label>
            <input
              type="number"
              value={formData.inflationRate}
              onChange={(e) => setFormData(prev => ({ ...prev, inflationRate: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
              placeholder="Enter inflation rate..."
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {selectedBody.nodeData.basicInfo[1]}%
            </p>
          </div>
        </div>
      )}

      {activeSignal === 'redistribution' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Redistribution Targets</label>
              <button
                onClick={addRedistributionTarget}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                + Add Target
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.redistributionTargets.map((target, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => updateRedistributionTarget(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Node ID..."
                  />
                  <input
                    type="number"
                    value={formData.redistributionWeights[index]}
                    onChange={(e) => updateRedistributionWeight(index, e.target.value)}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Weight"
                    min="0"
                  />
                  {formData.redistributionTargets.length > 1 && (
                    <button
                      onClick={() => removeRedistributionTarget(index)}
                      className="px-2 py-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4 border-t border-white/20">
        <button
          onClick={() => setActiveSignal(null)}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitSignal}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Signal</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default SignalPanel
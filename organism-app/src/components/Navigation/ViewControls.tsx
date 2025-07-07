import React from 'react'
import { ViewState } from '../../types/solarSystem'

interface ViewControlsProps {
  viewState: ViewState
  onViewChange: (newState: Partial<ViewState>) => void
  className?: string
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewState,
  onViewChange,
  className = ''
}) => {
  const viewModes = [
    { mode: 'galaxy', label: 'Galaxy', icon: '🌌', description: 'All solar systems' },
    { mode: 'system', label: 'System', icon: '⭐', description: 'Single system view' },
    { mode: 'planet', label: 'Planet', icon: '🪐', description: 'Detailed planet view' },
    { mode: 'detailed', label: 'Detail', icon: '🔍', description: 'Surface operations' }
  ] as const

  const zoomLevels = [
    { zoom: 0.5, label: 'Far', icon: '🔭' },
    { zoom: 1.0, label: 'Normal', icon: '👁️' },
    { zoom: 2.0, label: 'Close', icon: '🔍' },
    { zoom: 5.0, label: 'Macro', icon: '🧬' }
  ]

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* View Mode Selector */}
      <div className="bg-black/50 rounded-lg p-4 border border-white/20">
        <h3 className="text-white text-sm font-medium mb-3">View Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {viewModes.map(({ mode, label, icon, description }) => (
            <button
              key={mode}
              onClick={() => onViewChange({ mode })}
              className={`p-3 rounded-lg border transition-all ${
                viewState.mode === mode
                  ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
              }`}
              title={description}
            >
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-xs">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-black/50 rounded-lg p-4 border border-white/20">
        <h3 className="text-white text-sm font-medium mb-3">Zoom Level</h3>
        <div className="space-y-2">
          {zoomLevels.map(({ zoom, label, icon }) => (
            <button
              key={zoom}
              onClick={() => onViewChange({ zoom })}
              className={`w-full p-2 rounded-lg border transition-all flex items-center space-x-2 ${
                Math.abs(viewState.zoom - zoom) < 0.1
                  ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>{icon}</span>
              <span className="text-sm">{label}</span>
              <span className="text-xs text-gray-400 ml-auto">{zoom}x</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/50 rounded-lg p-4 border border-white/20">
        <h3 className="text-white text-sm font-medium mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => onViewChange({ 
              mode: 'galaxy',
              zoom: 1.0,
              target: null 
            })}
            className="w-full p-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center space-x-2"
          >
            <span>🏠</span>
            <span className="text-sm">Reset View</span>
          </button>
          
          <button
            onClick={() => onViewChange({ 
              mode: 'system',
              zoom: 1.5 
            })}
            className="w-full p-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center space-x-2"
          >
            <span>🎯</span>
            <span className="text-sm">Focus System</span>
          </button>
          
          <button
            onClick={() => onViewChange({ zoom: viewState.zoom * 1.5 })}
            className="w-full p-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center space-x-2"
          >
            <span>🔍</span>
            <span className="text-sm">Zoom In</span>
          </button>
          
          <button
            onClick={() => onViewChange({ zoom: viewState.zoom * 0.75 })}
            className="w-full p-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center space-x-2"
          >
            <span>🔭</span>
            <span className="text-sm">Zoom Out</span>
          </button>
        </div>
      </div>

      {/* Current Target Info */}
      {viewState.target && (
        <div className="bg-black/50 rounded-lg p-4 border border-white/20">
          <h3 className="text-white text-sm font-medium mb-2">Current Target</h3>
          <div className="text-gray-300 text-sm">
            <div>ID: {viewState.target.slice(0, 8)}...</div>
            <div>Mode: {viewState.mode}</div>
            <div>Zoom: {viewState.zoom.toFixed(1)}x</div>
          </div>
        </div>
      )}

      {/* Navigation Help */}
      <div className="bg-black/50 rounded-lg p-4 border border-white/20">
        <h3 className="text-white text-sm font-medium mb-2">Controls</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Click: Select object</div>
          <div>• Drag: Rotate view</div>
          <div>• Scroll: Zoom in/out</div>
          <div>• Right-drag: Pan view</div>
          <div>• ESC: Deselect</div>
        </div>
      </div>
    </div>
  )
}

export default ViewControls
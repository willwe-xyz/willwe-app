import React, { useState } from 'react'
import { SolarSystem, CelestialBody, ViewState, SearchResult } from '../../types/solarSystem'
import { SearchBar } from './SearchBar'
import { ViewControls } from './ViewControls'
import { MiniMap } from './MiniMap'
import { TokenStarBrowser } from './TokenStarBrowser'
import { WalletConnection } from '../Wallet/WalletConnection'

interface NavigationHeaderProps {
  solarSystems: SolarSystem[]
  selectedBody: CelestialBody | null
  viewState: ViewState
  onViewChange: (newState: Partial<ViewState>) => void
  onFocusBody: (body: CelestialBody) => void
  onNavigate: (position: { x: number; y: number; z: number }) => void
  isUsingOnchainData: boolean
  onDataSourceToggle: () => void
  onSelectToken?: (tokenAddress: string) => void
  className?: string
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  solarSystems,
  selectedBody,
  viewState,
  onViewChange,
  onFocusBody,
  onNavigate,
  isUsingOnchainData,
  onDataSourceToggle,
  onSelectToken,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePanel, setActivePanel] = useState<'search' | 'view' | 'map' | null>(null)

  const handleSearchResult = (result: SearchResult | null) => {
    if (result) {
      onViewChange({ 
        target: result.id,
        mode: result.type === 'sun' ? 'system' : 'detailed'
      })
    }
  }

  const togglePanel = (panel: 'search' | 'view' | 'map') => {
    if (activePanel === panel) {
      setActivePanel(null)
      setIsExpanded(false)
    } else {
      setActivePanel(panel)
      setIsExpanded(true)
    }
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Main Header Bar */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-white">
                🌌 WillWe Solar System
              </div>
              <div className="text-sm text-gray-400">
                {solarSystems.length} system{solarSystems.length !== 1 ? 's' : ''}
              </div>
              {/* Token/Star Browser */}
              <TokenStarBrowser
                solarSystems={solarSystems}
                selectedBody={selectedBody}
                onSelectToken={onSelectToken || (() => {})}
                onFocusBody={onFocusBody}
              />
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <SearchBar
                solarSystems={solarSystems}
                onSearchResult={handleSearchResult}
                onFocusBody={onFocusBody}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Wallet Connection */}
              <div className="hidden md:block">
                <WalletConnection />
              </div>
              {/* View Controls Toggle */}
              <button
                onClick={() => togglePanel('view')}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  activePanel === 'view'
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                }`}
                title="View Controls"
              >
                <span className="text-sm">🎛️</span>
              </button>

              {/* Mini Map Toggle */}
              <button
                onClick={() => togglePanel('map')}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  activePanel === 'map'
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                }`}
                title="Navigation Map"
              >
                <span className="text-sm">🗺️</span>
              </button>

              {/* Data Source Toggle */}
              <button
                onClick={onDataSourceToggle}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  isUsingOnchainData
                    ? 'bg-green-600/30 border-green-400 text-green-300'
                    : 'bg-gray-600/30 border-gray-400 text-gray-300'
                }`}
                title={isUsingOnchainData ? 'Using Onchain Data' : 'Using Mock Data'}
              >
                <span className="text-sm">{isUsingOnchainData ? '⛓️' : '🔬'}</span>
              </button>

              {/* Settings/Menu */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  isExpanded
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                }`}
                title="Menu"
              >
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {isExpanded && (
        <div className="bg-black/90 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Active Panel Content */}
              {activePanel === 'view' && (
                <div className="col-span-4">
                  <ViewControls
                    viewState={viewState}
                    onViewChange={onViewChange}
                  />
                </div>
              )}

              {activePanel === 'map' && (
                <div className="col-span-4">
                  <MiniMap
                    solarSystems={solarSystems}
                    selectedBody={selectedBody}
                    viewState={viewState}
                    onNavigate={onNavigate}
                  />
                </div>
              )}

              {/* Current Selection Info */}
              {selectedBody && (
                <div className="col-span-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-white/20">
                    <h3 className="text-white text-sm font-medium mb-3">Selected Object</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {selectedBody.type === 'sun' ? '☀️' : 
                           selectedBody.type === 'planet' ? '🪐' : '🌙'}
                        </span>
                        <span className="text-white font-medium">
                          {selectedBody.type.charAt(0).toUpperCase() + selectedBody.type.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div>ID: {selectedBody.nodeData.basicInfo[0].slice(0, 16)}...</div>
                        <div>Size: {selectedBody.size.toFixed(2)}</div>
                        <div>Members: {selectedBody.nodeData.membersOfNode.length}</div>
                        <div>Supply: {selectedBody.nodeData.basicInfo[11].toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Stats */}
              <div className="col-span-4">
                <div className="bg-black/50 rounded-lg p-4 border border-white/20">
                  <h3 className="text-white text-sm font-medium mb-3">System Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Total Systems</div>
                      <div className="text-white font-medium">{solarSystems.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Bodies</div>
                      <div className="text-white font-medium">
                        {solarSystems.reduce((sum, s) => 
                          sum + 1 + s.planets.length + s.planets.reduce((moonSum, p) => moonSum + p.moons.length, 0), 0
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">View Mode</div>
                      <div className="text-white font-medium capitalize">{viewState.mode}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Zoom Level</div>
                      <div className="text-white font-medium">{viewState.zoom.toFixed(1)}x</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavigationHeader
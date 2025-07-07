import React, { useState, useMemo } from 'react'
import { SolarSystem, CelestialBody } from '../../types/solarSystem'
import Fuse from 'fuse.js'

interface TokenStarBrowserProps {
  solarSystems: SolarSystem[]
  selectedBody: CelestialBody | null
  onSelectToken: (tokenAddress: string) => void
  onFocusBody: (body: CelestialBody) => void
  className?: string
}

interface TokenInfo {
  address: string
  symbol: string
  name: string
  membraneName: string
  totalSupply: number
  members: number
  type: 'sun' | 'planet' | 'moon'
  body: CelestialBody
  solarSystem: SolarSystem
}

export const TokenStarBrowser: React.FC<TokenStarBrowserProps> = ({
  solarSystems,
  selectedBody,
  onSelectToken,
  onFocusBody,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'suns' | 'planets' | 'moons'>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract all tokens/celestial bodies
  const allTokens = useMemo(() => {
    const tokens: TokenInfo[] = []
    
    solarSystems.forEach(system => {
      // Add sun (root token)
      tokens.push({
        address: system.sun.nodeData.rootTokenAddress,
        symbol: system.sun.nodeData.tokenSymbol || 'SUN',
        name: system.sun.nodeData.tokenName || 'Solar Token',
        membraneName: system.sun.nodeData.membraneName || 'Solar Membrane',
        totalSupply: system.sun.nodeData.basicInfo[11],
        members: system.sun.nodeData.membersOfNode.length,
        type: 'sun',
        body: system.sun,
        solarSystem: system
      })

      // Add planets
      system.planets.forEach(planet => {
        tokens.push({
          address: planet.nodeData.rootTokenAddress,
          symbol: planet.nodeData.tokenSymbol || 'PLT',
          name: planet.nodeData.tokenName || 'Planet Token',
          membraneName: planet.nodeData.membraneName || 'Planet Membrane',
          totalSupply: planet.nodeData.basicInfo[11],
          members: planet.nodeData.membersOfNode.length,
          type: 'planet',
          body: planet,
          solarSystem: system
        })

        // Add moons
        planet.moons.forEach(moon => {
          tokens.push({
            address: moon.nodeData.rootTokenAddress,
            symbol: moon.nodeData.tokenSymbol || 'MON',
            name: moon.nodeData.tokenName || 'Moon Token',
            membraneName: moon.nodeData.membraneName || 'Moon Membrane',
            totalSupply: moon.nodeData.basicInfo[11],
            members: moon.nodeData.membersOfNode.length,
            type: 'moon',
            body: moon,
            solarSystem: system
          })
        })
      })
    })
    
    return tokens
  }, [solarSystems])

  // Set up fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allTokens, {
      keys: [
        { name: 'symbol', weight: 0.3 },
        { name: 'name', weight: 0.3 },
        { name: 'membraneName', weight: 0.3 },
        { name: 'address', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true
    })
  }, [allTokens])

  // Filter and search tokens
  const filteredTokens = useMemo(() => {
    let tokens = allTokens

    // Apply type filter
    if (selectedFilter !== 'all') {
      const typeMap = { suns: 'sun', planets: 'planet', moons: 'moon' }
      tokens = tokens.filter(token => token.type === typeMap[selectedFilter])
    }

    // Apply search
    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery, { limit: 50 })
      const filteredResults = results
        .map(result => result.item)
        .filter(token => selectedFilter === 'all' || token.type === selectedFilter.slice(0, -1))
      return filteredResults
    }

    return tokens.slice(0, 50) // Limit results
  }, [allTokens, selectedFilter, searchQuery, fuse])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sun': return '☀️'
      case 'planet': return '🪐'
      case 'moon': return '🌙'
      default: return '⭐'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sun': return 'text-yellow-400 bg-yellow-600/20 border-yellow-400/40'
      case 'planet': return 'text-blue-400 bg-blue-600/20 border-blue-400/40'
      case 'moon': return 'text-gray-400 bg-gray-600/20 border-gray-400/40'
      default: return 'text-white bg-white/10 border-white/20'
    }
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(1)}B`
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(1)}M`
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(1)}K`
    return supply.toString()
  }

  return (
    <div className={`${className}`}>
      {/* Compact Header */}
      {!isExpanded && (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600/20 border border-purple-400/40 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            <span className="text-purple-400">🌟</span>
            <span className="text-purple-300 text-sm font-medium">Browse Stars</span>
            <span className="text-purple-400 text-xs">({allTokens.length})</span>
          </button>
          
          {selectedBody && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
              <span>{getTypeIcon(selectedBody.type)}</span>
              <span className="text-white text-sm font-medium">
                {selectedBody.nodeData.tokenSymbol || selectedBody.type.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expanded Browser */}
      {isExpanded && (
        <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 text-xl">🌟</span>
              <h3 className="text-white font-bold">Token & Star Browser</h3>
              <span className="text-gray-400 text-sm">({filteredTokens.length} results)</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by token, membrane name, or address..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'suns', 'planets', 'moons'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as any)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    selectedFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-400">No tokens found matching your criteria</p>
              </div>
            ) : (
              filteredTokens.map(token => (
                <div
                  key={`${token.address}-${token.type}`}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-purple-400/60 ${
                    selectedBody?.id === token.body.id
                      ? 'bg-purple-600/20 border-purple-400/60'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    onSelectToken(token.address)
                    onFocusBody(token.body)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(token.type)}</span>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold text-lg">{token.symbol}</span>
                          <span className={`px-2 py-1 text-xs rounded border ${getTypeColor(token.type)}`}>
                            {token.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-300">{token.name}</div>
                        
                        {token.membraneName && (
                          <div className="text-xs text-purple-400">
                            📜 {token.membraneName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <div className="text-white font-medium">
                        {formatSupply(token.totalSupply)} tokens
                      </div>
                      <div className="text-gray-400">
                        {token.members} members
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats Footer */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-yellow-400 font-bold">
                  {allTokens.filter(t => t.type === 'sun').length}
                </div>
                <div className="text-gray-400">Suns</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold">
                  {allTokens.filter(t => t.type === 'planet').length}
                </div>
                <div className="text-gray-400">Planets</div>
              </div>
              <div>
                <div className="text-gray-400 font-bold">
                  {allTokens.filter(t => t.type === 'moon').length}
                </div>
                <div className="text-gray-400">Moons</div>
              </div>
              <div>
                <div className="text-purple-400 font-bold">
                  {allTokens.reduce((sum, t) => sum + t.totalSupply, 0) > 1e9 
                    ? formatSupply(allTokens.reduce((sum, t) => sum + t.totalSupply, 0))
                    : allTokens.reduce((sum, t) => sum + t.totalSupply, 0).toLocaleString()
                  }
                </div>
                <div className="text-gray-400">Total Supply</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenStarBrowser
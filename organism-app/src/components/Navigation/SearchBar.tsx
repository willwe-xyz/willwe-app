import React, { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { SearchResult, SolarSystem, CelestialBody } from '../../types/solarSystem'

interface SearchBarProps {
  solarSystems: SolarSystem[]
  onSearchResult: (result: SearchResult | null) => void
  onFocusBody: (body: CelestialBody) => void
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  solarSystems,
  onSearchResult,
  onFocusBody,
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Create searchable data from solar systems
  const searchData = useMemo(() => {
    const data: SearchResult[] = []

    solarSystems.forEach(system => {
      // Add sun
      data.push({
        id: system.sun.id,
        name: system.rootTokenSymbol || system.rootTokenName,
        type: 'sun',
        nodeId: system.sun.nodeData.basicInfo[0],
        position: system.sun.position,
        relevance: 1.0,
        system: system.id
      })

      // Add planets
      system.planets.forEach(planet => {
        data.push({
          id: planet.id,
          name: `Planet ${planet.nodeData.basicInfo[0].slice(0, 8)}`,
          type: 'planet',
          nodeId: planet.nodeData.basicInfo[0],
          position: planet.position,
          relevance: 0.8,
          system: system.id
        })

        // Add moons
        planet.moons.forEach(moon => {
          data.push({
            id: moon.id,
            name: `Moon ${moon.nodeData.basicInfo[0].slice(0, 8)}`,
            type: 'moon',
            nodeId: moon.nodeData.basicInfo[0],
            position: moon.position,
            relevance: 0.6,
            system: system.id
          })
        })
      })
    })

    return data
  }, [solarSystems])

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: ['name', 'nodeId', 'type'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    })
  }, [searchData])

  // Perform search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const searchResults = fuse.search(query)
    const formattedResults = searchResults
      .slice(0, 8) // Limit to 8 results
      .map(result => ({
        ...result.item,
        relevance: 1 - (result.score || 0)
      }))

    setResults(formattedResults)
    setSelectedIndex(0)
    setIsOpen(formattedResults.length > 0)
  }, [query, fuse])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          selectResult(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        break
    }
  }

  const selectResult = (result: SearchResult) => {
    // Find the corresponding celestial body
    const system = solarSystems.find(s => s.id === result.system)
    if (!system) return

    let body: CelestialBody | null = null

    if (result.type === 'sun') {
      body = system.sun
    } else if (result.type === 'planet') {
      body = system.planets.find(p => p.id === result.id) || null
    } else if (result.type === 'moon') {
      for (const planet of system.planets) {
        const moon = planet.moons.find(m => m.id === result.id)
        if (moon) {
          body = moon
          break
        }
      }
    }

    if (body) {
      onFocusBody(body)
      onSearchResult(result)
    }

    setIsOpen(false)
    setQuery('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sun': return '☀️'
      case 'planet': return '🪐'
      case 'moon': return '🌙'
      case 'station': return '🛰️'
      case 'satellite': return '📡'
      default: return '⭐'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sun': return 'text-yellow-400'
      case 'planet': return 'text-blue-400'
      case 'moon': return 'text-gray-300'
      case 'station': return 'text-green-400'
      case 'satellite': return 'text-purple-400'
      default: return 'text-white'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search celestial bodies..."
          className="w-full px-4 py-2 pl-10 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>

        {/* Loading/Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg backdrop-blur-sm z-50 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => selectResult(result)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-600/30 border-l-2 border-blue-400'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getTypeIcon(result.type)}</span>
                  <div>
                    <div className="text-white font-medium">{result.name}</div>
                    <div className="text-xs text-gray-400">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)} • {result.nodeId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(result.relevance * 100)}% match
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg backdrop-blur-sm z-50">
          <div className="px-4 py-3 text-gray-400 text-center">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
import React, { useMemo } from 'react'
import { SolarSystem, CelestialBody, ViewState } from '../../types/solarSystem'

interface MiniMapProps {
  solarSystems: SolarSystem[]
  selectedBody: CelestialBody | null
  viewState: ViewState
  onNavigate: (position: { x: number; y: number; z: number }) => void
  className?: string
}

export const MiniMap: React.FC<MiniMapProps> = ({
  solarSystems,
  selectedBody,
  viewState,
  onNavigate,
  className = ''
}) => {
  // Calculate map bounds
  const mapBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    solarSystems.forEach(system => {
      // Sun position
      minX = Math.min(minX, system.sun.position.x)
      maxX = Math.max(maxX, system.sun.position.x)
      minZ = Math.min(minZ, system.sun.position.z)
      maxZ = Math.max(maxZ, system.sun.position.z)

      // Planet positions
      system.planets.forEach(planet => {
        const maxOrbit = planet.orbitRadius + planet.size
        minX = Math.min(minX, system.sun.position.x - maxOrbit)
        maxX = Math.max(maxX, system.sun.position.x + maxOrbit)
        minZ = Math.min(minZ, system.sun.position.z - maxOrbit)
        maxZ = Math.max(maxZ, system.sun.position.z + maxOrbit)
      })
    })

    const padding = 2
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding,
      width: maxX - minX + padding * 2,
      height: maxZ - minZ + padding * 2
    }
  }, [solarSystems])

  // Convert 3D position to 2D map coordinates
  const to2D = (position: { x: number; z: number }) => {
    const mapSize = 120 // pixels
    const x = ((position.x - mapBounds.minX) / mapBounds.width) * mapSize
    const y = ((position.z - mapBounds.minZ) / mapBounds.height) * mapSize
    return { x, y }
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const mapSize = 120
    const clickX = ((event.clientX - rect.left) / mapSize) * mapBounds.width + mapBounds.minX
    const clickZ = ((event.clientY - rect.top) / mapSize) * mapBounds.height + mapBounds.minZ
    
    onNavigate({ x: clickX, y: 0, z: clickZ })
  }

  return (
    <div className={`bg-black/50 rounded-lg p-4 border border-white/20 ${className}`}>
      <h3 className="text-white text-sm font-medium mb-3">Navigation Map</h3>
      
      {/* Mini Map */}
      <div
        className="relative bg-black/30 rounded border border-white/10 cursor-crosshair"
        style={{ width: 120, height: 120 }}
        onClick={handleMapClick}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[20, 40, 60, 80, 100].map(pos => (
            <React.Fragment key={pos}>
              <div
                className="absolute border-l border-white/20"
                style={{ left: pos, top: 0, bottom: 0, width: 1 }}
              />
              <div
                className="absolute border-t border-white/20"
                style={{ top: pos, left: 0, right: 0, height: 1 }}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Solar Systems */}
        {solarSystems.map(system => {
          const sunPos = to2D({ x: system.sun.position.x, z: system.sun.position.z })
          
          return (
            <React.Fragment key={system.id}>
              {/* Orbital paths */}
              {system.planets.map(planet => {
                const orbitRadius = (planet.orbitRadius / mapBounds.width) * 120
                return (
                  <div
                    key={`orbit-${planet.id}`}
                    className="absolute border border-white/10 rounded-full pointer-events-none"
                    style={{
                      left: sunPos.x - orbitRadius,
                      top: sunPos.y - orbitRadius,
                      width: orbitRadius * 2,
                      height: orbitRadius * 2
                    }}
                  />
                )
              })}

              {/* Sun */}
              <div
                className={`absolute w-2 h-2 rounded-full transform -translate-x-1 -translate-y-1 ${
                  selectedBody?.id === system.sun.id ? 'bg-yellow-300 ring-2 ring-white' : 'bg-yellow-400'
                }`}
                style={{ left: sunPos.x, top: sunPos.y }}
                title={system.rootTokenSymbol || system.rootTokenName}
              />

              {/* Planets */}
              {system.planets.map(planet => {
                const planetPos = to2D({ x: planet.position.x, z: planet.position.z })
                return (
                  <div
                    key={planet.id}
                    className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-0.5 -translate-y-0.5 ${
                      selectedBody?.id === planet.id ? 'bg-blue-300 ring-1 ring-white' : 'bg-blue-400'
                    }`}
                    style={{ left: planetPos.x, top: planetPos.y }}
                    title={`Planet ${planet.id.slice(0, 8)}`}
                  />
                )
              })}

              {/* Moons */}
              {system.planets.flatMap(planet => 
                planet.moons.map(moon => {
                  const moonPos = to2D({ x: moon.position.x, z: moon.position.z })
                  return (
                    <div
                      key={moon.id}
                      className={`absolute w-1 h-1 rounded-full transform -translate-x-0.5 -translate-y-0.5 ${
                        selectedBody?.id === moon.id ? 'bg-gray-200 ring-1 ring-white' : 'bg-gray-300'
                      }`}
                      style={{ left: moonPos.x, top: moonPos.y }}
                      title={`Moon ${moon.id.slice(0, 8)}`}
                    />
                  )
                })
              )}
            </React.Fragment>
          )
        })}

        {/* View indicator */}
        {viewState.target && (
          <div
            className="absolute w-4 h-4 border-2 border-green-400 rounded transform -translate-x-2 -translate-y-2 animate-pulse"
            style={{
              left: viewState.cameraTarget.x ? 
                ((viewState.cameraTarget.x - mapBounds.minX) / mapBounds.width) * 120 : 60,
              top: viewState.cameraTarget.z ? 
                ((viewState.cameraTarget.z - mapBounds.minZ) / mapBounds.height) * 120 : 60
            }}
          />
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Suns</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <span>Planets</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <span>Moons</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 border border-green-400 rounded"></div>
          <span>Camera</span>
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-3 text-xs text-gray-500">
        <div>Systems: {solarSystems.length}</div>
        <div>Bodies: {solarSystems.reduce((sum, s) => 
          sum + 1 + s.planets.length + s.planets.reduce((moonSum, p) => moonSum + p.moons.length, 0), 0
        )}</div>
        <div>Click to navigate</div>
      </div>
    </div>
  )
}

export default MiniMap
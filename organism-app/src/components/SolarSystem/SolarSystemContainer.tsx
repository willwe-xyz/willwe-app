import React, { useMemo, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { SolarSystem as SolarSystemType, CelestialBody } from '../../types/solarSystem'
import { SimpleSun as Sun } from './SimpleSun'
import { SimplePlanet as Planet } from './SimplePlanet'
import { Moon } from './Moon'
import { TokenFlowParticles, SolarWind, SignalWaves, AsteroidBelt } from '../Effects'

interface SolarSystemContainerProps {
  solarSystem: SolarSystemType
  onBodyClick: (body: CelestialBody, event?: React.MouseEvent) => void
  selectedBody: CelestialBody | null
  levelOfDetail: number
  timeSpeed: number
  flows?: any[]
}

export const SolarSystemContainer: React.FC<SolarSystemContainerProps> = ({
  solarSystem,
  onBodyClick,
  selectedBody,
  levelOfDetail,
  timeSpeed = 1.0,
  flows = []
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const orbitTime = useRef(0)
  const { camera } = useThree()

  // Calculate system bounds for camera positioning
  const systemBounds = useMemo(() => {
    const maxOrbitRadius = Math.max(...solarSystem.planets.map(p => p.orbitRadius))
    const padding = 2
    return {
      radius: maxOrbitRadius + padding,
      center: new Vector3(0, 0, 0)
    }
  }, [solarSystem.planets])

  // Update orbital time
  useFrame((state, delta) => {
    orbitTime.current += delta * timeSpeed
  })

  // Handle clicks on celestial bodies
  const handleSunClick = useCallback((sunData: any, event?: React.MouseEvent) => {
    onBodyClick(sunData, event)
  }, [onBodyClick])

  const handlePlanetClick = useCallback((planetData: any, event?: React.MouseEvent) => {
    onBodyClick(planetData, event)
  }, [onBodyClick])

  const handleMoonClick = useCallback((moonData: any, event?: React.MouseEvent) => {
    onBodyClick(moonData, event)
  }, [onBodyClick])

  // Calculate current planet positions for moons
  const planetPositions = useMemo(() => {
    const positions = new Map<string, Vector3>()
    solarSystem.planets.forEach(planet => {
      const currentAngle = planet.orbitAngle + (orbitTime.current * planet.orbitSpeed)
      const position = new Vector3(
        Math.cos(currentAngle) * planet.orbitRadius,
        0,
        Math.sin(currentAngle) * planet.orbitRadius
      )
      positions.set(planet.id, position)
    })
    return positions
  }, [solarSystem.planets, orbitTime.current])
  
  // Calculate node positions for effects
  const nodePositions = useMemo(() => {
    const positions = new Map<string, Vector3>()
    
    // Add sun
    positions.set(solarSystem.sun.nodeData.basicInfo[0], solarSystem.sun.position)
    
    // Add planets
    planetPositions.forEach((position, planetId) => {
      const planet = solarSystem.planets.find(p => p.id === planetId)
      if (planet) {
        positions.set(planet.nodeData.basicInfo[0], position)
      }
    })
    
    // Add moons
    solarSystem.planets.forEach(planet => {
      const planetPos = planetPositions.get(planet.id)
      if (planetPos) {
        planet.moons.forEach(moon => {
          const moonAngle = moon.orbitAngle + (orbitTime.current * moon.orbitSpeed)
          const moonPosition = new Vector3(
            planetPos.x + Math.cos(moonAngle) * moon.orbitRadius,
            planetPos.y,
            planetPos.z + Math.sin(moonAngle) * moon.orbitRadius
          )
          positions.set(moon.nodeData.basicInfo[0], moonPosition)
        })
      }
    })
    
    return positions
  }, [solarSystem, planetPositions, orbitTime.current])
  
  // Collect all celestial bodies for signal waves
  const allBodies = useMemo(() => {
    const bodies: CelestialBody[] = [solarSystem.sun]
    solarSystem.planets.forEach(planet => {
      bodies.push(planet)
      bodies.push(...planet.moons)
    })
    return bodies
  }, [solarSystem])
  
  // Extract signals from all nodes
  const allSignals = useMemo(() => {
    return allBodies.flatMap(body => body.nodeData.signals || [])
  }, [allBodies])

  // Calculate distance-based LOD for the entire system
  const systemLOD = useMemo(() => {
    const distanceToCenter = camera.position.distanceTo(systemBounds.center)
    const lodFactor = Math.max(0.1, Math.min(1, systemBounds.radius * 2 / distanceToCenter))
    return levelOfDetail * lodFactor
  }, [camera.position, systemBounds, levelOfDetail])

  return (
    <group ref={groupRef}>
      {/* Orbital paths visualization */}
      {systemLOD > 0.3 && (
        <group>
          {solarSystem.planets.map(planet => (
            <mesh
              key={`orbit-${planet.id}`}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 64]} />
              <meshBasicMaterial 
                color={planet.color} 
                transparent 
                opacity={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Central Sun */}
      <Sun
        sunData={solarSystem.sun}
        onClick={handleSunClick}
        isSelected={selectedBody?.id === solarSystem.sun.id}
        levelOfDetail={systemLOD}
      />

      {/* Planets */}
      {solarSystem.planets.map(planet => (
        <Planet
          key={planet.id}
          planetData={planet}
          onClick={handlePlanetClick}
          isSelected={selectedBody?.id === planet.id}
          levelOfDetail={systemLOD}
          orbitTime={orbitTime.current}
        />
      ))}

      {/* Moons */}
      {solarSystem.planets.map(planet => 
        planet.moons.map(moon => {
          const planetPos = planetPositions.get(planet.id)
          if (!planetPos) return null

          return (
            <Moon
              key={moon.id}
              moonData={moon}
              planetPosition={planetPos}
              onClick={handleMoonClick}
              isSelected={selectedBody?.id === moon.id}
              levelOfDetail={systemLOD}
              orbitTime={orbitTime.current}
            />
          )
        })
      )}

      {/* Token Flow Effects */}
      {flows.length > 0 && (
        <TokenFlowParticles
          flows={flows}
          nodePositions={nodePositions}
          levelOfDetail={systemLOD}
        />
      )}

      {/* Solar Wind Effect */}
      <SolarWind
        sun={solarSystem.sun}
        intensity={solarSystem.sun.luminosity}
        levelOfDetail={systemLOD}
      />

      {/* Signal Waves */}
      {allSignals.length > 0 && (
        <SignalWaves
          signals={allSignals}
          bodies={allBodies}
          levelOfDetail={systemLOD}
        />
      )}

      {/* Asteroid Belt Effect */}
      {solarSystem.planets.length > 0 && (
        <AsteroidBelt
          sunPosition={solarSystem.sun.position}
          orbitRadius={solarSystem.planets[0].orbitRadius * 1.5}
          planetPositions={Array.from(planetPositions.values())}
          flows={flows}
          levelOfDetail={systemLOD}
        />
      )}

      {/* System boundary indicator for debug */}
      {systemLOD > 0.8 && process.env.NODE_ENV === 'development' && (
        <mesh>
          <sphereGeometry args={[systemBounds.radius, 16, 12]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.05}
            wireframe
          />
        </mesh>
      )}

      {/* System information display */}
      {systemLOD > 0.7 && (
        <group position={[0, systemBounds.radius + 1, 0]}>
          <mesh>
            <planeGeometry args={[4, 0.5]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          {/* System name and stats would go here */}
        </group>
      )}
    </group>
  )
}

export default SolarSystemContainer
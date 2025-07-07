import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { PlanetProperties, AnimationState } from '../../types/solarSystem'

interface PlanetProps {
  planetData: PlanetProperties
  onClick: (planetData: PlanetProperties, event?: React.MouseEvent) => void
  isSelected: boolean
  levelOfDetail: number
  animationState?: AnimationState
  orbitTime: number
}

export const Planet: React.FC<PlanetProps> = ({ 
  planetData, 
  onClick, 
  isSelected, 
  levelOfDetail,
  animationState,
  orbitTime = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  // Calculate current orbital position
  const currentOrbitAngle = useMemo(() => {
    return planetData.orbitAngle + (orbitTime * planetData.orbitSpeed)
  }, [planetData.orbitAngle, planetData.orbitSpeed, orbitTime])

  const currentPosition = useMemo(() => {
    return new THREE.Vector3(
      Math.cos(currentOrbitAngle) * planetData.orbitRadius,
      0,
      Math.sin(currentOrbitAngle) * planetData.orbitRadius
    )
  }, [currentOrbitAngle, planetData.orbitRadius])

  // Calculate distance-based LOD
  const distanceToCamera = useMemo(() => {
    return camera.position.distanceTo(currentPosition)
  }, [camera.position, currentPosition])

  const effectiveLOD = useMemo(() => {
    const distanceFactor = Math.max(0.1, Math.min(1, 15 / distanceToCamera))
    return levelOfDetail * distanceFactor
  }, [levelOfDetail, distanceToCamera])

  // Planet material based on surface type
  const planetMaterial = useMemo(() => {
    let baseColor = planetData.color
    let roughness = 0.8
    let metalness = 0.1

    switch (planetData.surface) {
      case 'icy':
        baseColor = new THREE.Color(planetData.color).lerp(new THREE.Color('#e6f3ff'), 0.3).getHexString()
        roughness = 0.2
        metalness = 0.0
        break
      case 'gaseous':
        baseColor = new THREE.Color(planetData.color).lerp(new THREE.Color('#ffd700'), 0.2).getHexString()
        roughness = 0.9
        metalness = 0.0
        break
      case 'rocky':
        baseColor = new THREE.Color(planetData.color).lerp(new THREE.Color('#8b4513'), 0.1).getHexString()
        roughness = 0.8
        metalness = 0.2
        break
    }

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness,
      metalness,
      transparent: planetData.surface === 'gaseous',
      opacity: planetData.surface === 'gaseous' ? 0.8 : 1.0
    })
  }, [planetData.color, planetData.surface])

  // Atmosphere material - simplified to avoid shader issues
  const atmosphereMaterial = useMemo(() => {
    if (!planetData.atmosphere || effectiveLOD < 0.4) return null

    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(planetData.color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    })
  }, [planetData.atmosphere, planetData.color, effectiveLOD])

  // Ring material for planets with moons
  const ringMaterial = useMemo(() => {
    if (!planetData.rings || effectiveLOD < 0.3) return null

    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(planetData.color).multiplyScalar(0.7),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    })
  }, [planetData.rings, planetData.color, effectiveLOD])

  // Update orbital position
  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.position.set(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z
      )
    }

    if (meshRef.current) {
      // Planet rotation on its axis
      meshRef.current.rotation.y += 0.01
      
      // Apply tilt
      meshRef.current.rotation.z = planetData.tilt
    }

    // Animate atmosphere opacity
    if (atmosphereRef.current && atmosphereMaterial) {
      const waveFactor = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
      atmosphereMaterial.opacity = 0.3 * waveFactor
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    onClick(planetData, event)
  }

  // Geometry based on LOD
  const sphereArgs = useMemo(() => {
    if (effectiveLOD < 0.3) return [planetData.size, 8, 6] // Low poly
    if (effectiveLOD < 0.7) return [planetData.size, 16, 12] // Medium poly
    return [planetData.size, 32, 24] // High poly
  }, [effectiveLOD, planetData.size])

  return (
    <group ref={orbitRef}>
      {/* Planet body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        material={planetMaterial}
      >
        <sphereGeometry args={sphereArgs} />
      </mesh>

      {/* Atmosphere */}
      {atmosphereMaterial && (
        <mesh
          ref={atmosphereRef}
          material={atmosphereMaterial}
          scale={[1.05, 1.05, 1.05]}
        >
          <sphereGeometry args={[planetData.size * 1.02, 16, 12]} />
        </mesh>
      )}

      {/* Rings */}
      {ringMaterial && effectiveLOD > 0.3 && (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={ringMaterial}>
            <ringGeometry args={[planetData.size * 1.5, planetData.size * 2.0, 32]} />
          </mesh>
        </group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planetData.size * 1.2, planetData.size * 1.3, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Surface features for high LOD */}
      {effectiveLOD > 0.8 && planetData.surface === 'rocky' && (
        <group>
          {/* Craters or surface features */}
          {Array.from({ length: 3 }).map((_, i) => {
            const angle = (i / 3) * Math.PI * 2
            const height = 0.9
            return (
              <mesh
                key={`crater-${i}`}
                position={[
                  Math.cos(angle) * planetData.size * height,
                  Math.sin(angle * 0.5) * planetData.size * 0.3,
                  Math.sin(angle) * planetData.size * height
                ]}
              >
                <sphereGeometry args={[planetData.size * 0.1, 8, 6]} />
                <meshStandardMaterial 
                  color={new THREE.Color(planetData.color).multiplyScalar(0.5)}
                />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Cloud layers for gaseous planets */}
      {effectiveLOD > 0.6 && planetData.surface === 'gaseous' && (
        <group>
          {Array.from({ length: 2 }).map((_, i) => (
            <mesh
              key={`cloud-${i}`}
              scale={[1.01 + i * 0.02, 1.01 + i * 0.02, 1.01 + i * 0.02]}
            >
              <sphereGeometry args={[planetData.size, 16, 12]} />
              <meshBasicMaterial 
                color={new THREE.Color(planetData.color).lerp(new THREE.Color('#ffffff'), 0.5)}
                transparent
                opacity={0.2 - i * 0.05}
                side={THREE.BackSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Information label for close viewing */}
      {effectiveLOD > 0.8 && distanceToCamera < 8 && (
        <group position={[0, planetData.size + 0.3, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.2]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          {/* Text would go here - requires additional setup */}
        </group>
      )}
    </group>
  )
}

export default Planet
import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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

export const SimplePlanet: React.FC<PlanetProps> = ({ 
  planetData, 
  onClick, 
  isSelected, 
  levelOfDetail,
  animationState,
  orbitTime = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Group>(null)
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

  // Simple planet material
  const planetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: planetData.color,
      roughness: 0.8,
      metalness: 0.1,
      transparent: false
    })
  }, [planetData.color])

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

      {/* Simple atmosphere */}
      {planetData.atmosphere && effectiveLOD > 0.4 && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[planetData.size * 1.02, 16, 12]} />
          <meshBasicMaterial 
            color={new THREE.Color(planetData.color).multiplyScalar(0.5)}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
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
        </group>
      )}
    </group>
  )
}

export default SimplePlanet
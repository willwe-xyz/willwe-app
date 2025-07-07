import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MoonProperties, AnimationState } from '../../types/solarSystem'

interface MoonProps {
  moonData: MoonProperties
  planetPosition: THREE.Vector3
  onClick: (moonData: MoonProperties, event?: React.MouseEvent) => void
  isSelected: boolean
  levelOfDetail: number
  animationState?: AnimationState
  orbitTime: number
}

export const Moon: React.FC<MoonProps> = ({ 
  moonData, 
  planetPosition,
  onClick, 
  isSelected, 
  levelOfDetail,
  animationState,
  orbitTime = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // Calculate current orbital position around parent planet
  const currentOrbitAngle = useMemo(() => {
    return moonData.orbitAngle + (orbitTime * moonData.orbitSpeed)
  }, [moonData.orbitAngle, moonData.orbitSpeed, orbitTime])

  const currentPosition = useMemo(() => {
    const localPos = new THREE.Vector3(
      Math.cos(currentOrbitAngle) * moonData.orbitRadius,
      Math.sin(currentOrbitAngle * 0.3) * moonData.orbitRadius * 0.1, // Slight vertical variation
      Math.sin(currentOrbitAngle) * moonData.orbitRadius
    )
    return localPos.add(planetPosition)
  }, [currentOrbitAngle, moonData.orbitRadius, planetPosition])

  // Calculate distance-based LOD
  const distanceToCamera = useMemo(() => {
    return camera.position.distanceTo(currentPosition)
  }, [camera.position, currentPosition])

  const effectiveLOD = useMemo(() => {
    const distanceFactor = Math.max(0.1, Math.min(1, 10 / distanceToCamera))
    return levelOfDetail * distanceFactor
  }, [levelOfDetail, distanceToCamera])

  // Moon material based on properties
  const moonMaterial = useMemo(() => {
    let baseColor = moonData.color
    let roughness = 0.9
    let metalness = 0.0

    // Darker and more cratered appearance
    baseColor = new THREE.Color(moonData.color).multiplyScalar(0.7).getHexString()

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness,
      metalness,
      transparent: false
    })
  }, [moonData.color])

  // Crater material for detailed view
  const craterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(moonData.color).multiplyScalar(0.4),
      roughness: 0.95,
      metalness: 0.0
    })
  }, [moonData.color])

  // Update orbital position
  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.position.copy(currentPosition)
    }

    if (meshRef.current) {
      // Moon rotation - tidal locking simulation
      if (moonData.tideLocked) {
        meshRef.current.rotation.y = -currentOrbitAngle
      } else {
        meshRef.current.rotation.y += 0.02
      }
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    onClick(moonData, event)
  }

  // Geometry based on LOD
  const sphereArgs = useMemo(() => {
    if (effectiveLOD < 0.3) return [moonData.size, 6, 4] // Low poly
    if (effectiveLOD < 0.7) return [moonData.size, 12, 8] // Medium poly
    return [moonData.size, 24, 16] // High poly
  }, [effectiveLOD, moonData.size])

  // Don't render if too small or far away
  if (effectiveLOD < 0.1 || moonData.size < 0.05) {
    return null
  }

  return (
    <group ref={orbitRef}>
      {/* Moon body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        material={moonMaterial}
      >
        <sphereGeometry args={sphereArgs} />
      </mesh>

      {/* Craters for detailed view */}
      {moonData.craters && effectiveLOD > 0.6 && (
        <group>
          {Array.from({ length: Math.min(5, Math.floor(moonData.size * 10)) }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2 + Math.PI * 0.3
            const radius = 0.7 + (i % 2) * 0.2
            const craterSize = moonData.size * (0.05 + (i % 3) * 0.02)
            
            return (
              <mesh
                key={`crater-${i}`}
                position={[
                  Math.cos(angle) * moonData.size * radius,
                  Math.sin(angle * 1.3) * moonData.size * 0.5,
                  Math.sin(angle) * moonData.size * radius
                ]}
                material={craterMaterial}
              >
                <sphereGeometry args={[craterSize, 8, 6]} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[moonData.size * 1.1, moonData.size * 1.2, 16]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Phase visualization for high LOD */}
      {effectiveLOD > 0.7 && (
        <group>
          {/* Shadow side */}
          <mesh
            position={[moonData.size * 0.001, 0, 0]}
            rotation={[0, moonData.phase, 0]}
          >
            <sphereGeometry args={[moonData.size * 0.999, 16, 12, 0, Math.PI]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* Orbital trail for close viewing */}
      {effectiveLOD > 0.8 && distanceToCamera < 6 && (
        <group position={planetPosition.clone().multiplyScalar(-1)}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[moonData.orbitRadius - 0.02, moonData.orbitRadius + 0.02, 32]} />
            <meshBasicMaterial 
              color={moonData.color} 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Information label for very close viewing */}
      {effectiveLOD > 0.9 && distanceToCamera < 3 && (
        <group position={[0, moonData.size + 0.1, 0]}>
          <mesh>
            <planeGeometry args={[0.8, 0.1]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          {/* Text would go here - requires additional setup */}
        </group>
      )}

      {/* Subtle glow for selected moon */}
      {isSelected && effectiveLOD > 0.5 && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[moonData.size, 16, 12]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}

export default Moon
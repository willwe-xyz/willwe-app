import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SunProperties, AnimationState } from '../../types/solarSystem'

interface SunProps {
  sunData: SunProperties
  onClick: (sunData: SunProperties, event?: React.MouseEvent) => void
  isSelected: boolean
  levelOfDetail: number
  animationState?: AnimationState
}

export const SimpleSun: React.FC<SunProps> = ({ 
  sunData, 
  onClick, 
  isSelected, 
  levelOfDetail,
  animationState 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  // Calculate distance-based LOD
  const distanceToCamera = useMemo(() => {
    return camera.position.distanceTo(sunData.position)
  }, [camera.position, sunData.position])

  const effectiveLOD = useMemo(() => {
    const distanceFactor = Math.max(0.1, Math.min(1, 20 / distanceToCamera))
    return levelOfDetail * distanceFactor
  }, [levelOfDetail, distanceToCamera])

  // Simple sun material
  const sunMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: sunData.color,
      transparent: false
    })
  }, [sunData.color])

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.005 * sunData.luminosity
      
      // Pulsing effect for high activity
      if (sunData.luminosity > 0.7) {
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
        meshRef.current.scale.setScalar(pulseScale)
      }
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    onClick(sunData, event)
  }

  // Geometry based on LOD
  const sphereArgs = useMemo(() => {
    if (effectiveLOD < 0.3) return [sunData.size, 8, 6] // Low poly
    if (effectiveLOD < 0.7) return [sunData.size, 16, 12] // Medium poly
    return [sunData.size, 32, 24] // High poly
  }, [effectiveLOD, sunData.size])

  return (
    <group position={sunData.position}>
      {/* Main sun body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        material={sunMaterial}
      >
        <sphereGeometry args={sphereArgs} />
      </mesh>

      {/* Simple glow effect */}
      {effectiveLOD > 0.7 && (
        <mesh scale={[sunData.size * 1.3, sunData.size * 1.3, sunData.size * 1.3]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial 
            color={sunData.color} 
            transparent 
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[sunData.size * 1.5, sunData.size * 1.6, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Information label for close viewing */}
      {effectiveLOD > 0.8 && distanceToCamera < 10 && (
        <group position={[0, sunData.size + 0.5, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.3]} />
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

export default SimpleSun
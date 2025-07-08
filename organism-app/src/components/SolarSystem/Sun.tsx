import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { SunProperties, AnimationState } from '../../types/solarSystem'

interface SunProps {
  sunData: SunProperties
  onClick: (sunData: SunProperties, event?: React.MouseEvent) => void
  isSelected: boolean
  levelOfDetail: number
  animationState?: AnimationState
}

export const Sun: React.FC<SunProps> = ({ 
  sunData, 
  onClick, 
  isSelected, 
  levelOfDetail,
  animationState 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  // Calculate distance-based LOD
  const distanceToCamera = useMemo(() => {
    return camera.position.distanceTo(sunData.position)
  }, [camera.position, sunData.position])

  const effectiveLOD = useMemo(() => {
    const distanceFactor = Math.max(0.1, Math.min(1, 20 / distanceToCamera))
    return levelOfDetail * distanceFactor
  }, [levelOfDetail, distanceToCamera])

  // Dynamic sun material based on properties
  const sunMaterial = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      color: sunData.color,
      transparent: true,
      opacity: 0.9
    })

    // Add emission for glow effect
    if (effectiveLOD > 0.5) {
      material.emissive = new THREE.Color(sunData.color)
      material.emissiveIntensity = sunData.luminosity * 0.3
    }

    return material
  }, [sunData.color, sunData.luminosity, effectiveLOD])

  // Corona effect material - simplified to avoid shader issues
  const coronaMaterial = useMemo(() => {
    if (!sunData.coronaEffect || effectiveLOD < 0.3) return null

    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(sunData.color).multiplyScalar(0.7),
      transparent: true,
      opacity: sunData.luminosity * 0.3,
      side: THREE.BackSide
    })
  }, [sunData.coronaEffect, sunData.color, sunData.luminosity, effectiveLOD])

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

    // Animate corona opacity
    if (coronaRef.current && coronaMaterial) {
      const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      coronaMaterial.opacity = sunData.luminosity * 0.3 * pulseFactor
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

      {/* Corona effect */}
      {coronaMaterial && effectiveLOD > 0.3 && (
        <mesh
          ref={coronaRef}
          material={coronaMaterial}
          scale={[1.2, 1.2, 1.2]}
        >
          <sphereGeometry args={[sunData.size * 1.1, 16, 12]} />
        </mesh>
      )}

      {/* Glow effect for high LOD - using basic mesh */}
      {effectiveLOD > 0.7 && (
        <mesh scale={[sunData.size * 1.5, sunData.size * 1.5, sunData.size * 1.5]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial 
            color={sunData.color} 
            transparent 
            opacity={sunData.luminosity * 0.2}
            side={THREE.BackSide}
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

      {/* Solar flare effects */}
      {sunData.solarFlares.length > 0 && effectiveLOD > 0.5 && (
        <group>
          {sunData.solarFlares.slice(0, 3).map((flare, index) => (
            <mesh
              key={`flare-${index}`}
              position={[
                Math.cos(index * Math.PI * 2 / 3) * sunData.size * 1.2,
                0,
                Math.sin(index * Math.PI * 2 / 3) * sunData.size * 1.2
              ]}
            >
              <coneGeometry args={[0.1, 0.5, 8]} />
              <meshBasicMaterial 
                color={sunData.color} 
                transparent 
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
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
          {/* Text would go here - requires additional setup */}
        </group>
      )}
    </group>
  )
}

export default Sun
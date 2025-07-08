import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NodeData } from '../types/nodeData'
import { SpeciesCharacteristics } from '../utils/speciesGenerator'

interface MembraneProps {
  nodeData: NodeData
  species: SpeciesCharacteristics
  size: number
}

export const Membrane: React.FC<MembraneProps> = ({ nodeData, species, size }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  const membraneComplexity = nodeData.basicInfo[6]
  const memberActivity = nodeData.membersOfNode.length
  
  const thickness = useMemo(() => {
    return Math.max(0.02, membraneComplexity * 0.01)
  }, [membraneComplexity])
  
  const permeability = useMemo(() => {
    return Math.max(0.1, 1 - (memberActivity * 0.05))
  }, [memberActivity])
  
  const geometry = useMemo(() => {
    const sphere = new THREE.SphereGeometry(size, 32, 32)
    const positions = sphere.attributes.position.array as Float32Array
    
    // Add membrane pores based on activity
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      const noise = Math.sin(vertex.x * 10) * Math.cos(vertex.y * 10) * Math.sin(vertex.z * 10)
      const poreSize = memberActivity * 0.001
      vertex.normalize().multiplyScalar(size + noise * poreSize)
      
      positions[i] = vertex.x
      positions[i + 1] = vertex.y
      positions[i + 2] = vertex.z
    }
    
    sphere.attributes.position.needsUpdate = true
    return sphere
  }, [size, memberActivity])
  
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Breathing animation
      const breathingRate = species.metabolicRate * 0.5
      const scale = 1 + Math.sin(time * breathingRate) * 0.05
      meshRef.current.scale.setScalar(scale)
      
      // Membrane activity shimmer
      const shimmer = 0.5 + Math.sin(time * 2) * 0.2
      materialRef.current.opacity = permeability * shimmer
      
      // Color pulsing based on activity
      const activityPulse = 0.8 + Math.sin(time * memberActivity * 0.1) * 0.2
      materialRef.current.color.copy(species.membraneColor).multiplyScalar(activityPulse)
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        ref={materialRef}
        color={species.membraneColor}
        transparent
        opacity={permeability}
        side={THREE.DoubleSide}
        emissive={species.membraneColor}
        emissiveIntensity={species.emissiveIntensity * 0.3}
      />
    </mesh>
  )
}
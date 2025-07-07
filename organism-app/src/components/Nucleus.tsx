import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NodeData } from '../types/nodeData'
import { SpeciesCharacteristics } from '../utils/speciesGenerator'

interface NucleusProps {
  nodeData: NodeData
  species: SpeciesCharacteristics
  size: number
}

export const Nucleus: React.FC<NucleusProps> = ({ nodeData, species, size }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const chromatinRef = useRef<THREE.Group>(null)
  
  const totalSupply = nodeData.basicInfo[11]
  const inflationRate = nodeData.basicInfo[1]
  const childConnections = nodeData.childrenNodes.length
  
  const nucleusSize = useMemo(() => {
    return Math.max(0.1, Math.min(0.4, (totalSupply / 1000000) * size))
  }, [totalSupply, size])
  
  const pulseRate = useMemo(() => {
    return Math.max(0.1, inflationRate * 0.01)
  }, [inflationRate])
  
  const chromatinStrands = useMemo(() => {
    const strands = []
    for (let i = 0; i < childConnections; i++) {
      const angle = (i / childConnections) * Math.PI * 2
      const radius = nucleusSize * 0.7
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      strands.push({ x, y: 0, z })
    }
    return strands
  }, [childConnections, nucleusSize])
  
  const NucleusGeometry = useMemo(() => {
    switch (species.nucleusType) {
      case 'fractal':
        return new THREE.DodecahedronGeometry(nucleusSize, 1)
      case 'stable':
        return new THREE.SphereGeometry(nucleusSize, 16, 16)
      default:
        return new THREE.SphereGeometry(nucleusSize, 20, 20)
    }
  }, [species.nucleusType, nucleusSize])
  
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const time = state.clock.getElapsedTime()
      
      if (species.nucleusType === 'pulsing') {
        const pulse = 1 + Math.sin(time * pulseRate) * 0.3
        meshRef.current.scale.setScalar(pulse)
        
        const brightness = 0.5 + Math.sin(time * pulseRate) * 0.5
        materialRef.current.emissiveIntensity = species.emissiveIntensity * brightness
      }
      
      if (species.nucleusType === 'fractal') {
        meshRef.current.rotation.x = time * 0.2
        meshRef.current.rotation.y = time * 0.3
      }
      
      // Chromatin animation
      if (chromatinRef.current) {
        chromatinRef.current.rotation.y = time * 0.1
      }
    }
  })
  
  return (
    <group>
      <mesh ref={meshRef} geometry={NucleusGeometry}>
        <meshStandardMaterial
          ref={materialRef}
          color={species.membraneColor}
          emissive={species.membraneColor}
          emissiveIntensity={species.emissiveIntensity}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Chromatin strands representing child connections */}
      <group ref={chromatinRef}>
        {chromatinStrands.map((strand, index) => (
          <mesh key={index} position={[strand.x, strand.y, strand.z]}>
            <cylinderGeometry args={[0.005, 0.005, nucleusSize * 0.5]} />
            <meshStandardMaterial
              color={species.membraneColor}
              emissive={species.membraneColor}
              emissiveIntensity={species.emissiveIntensity * 0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
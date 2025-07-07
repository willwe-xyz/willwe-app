import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NodeData } from '../types/nodeData'
import { SpeciesCharacteristics } from '../utils/speciesGenerator'

interface OrganellesProps {
  nodeData: NodeData
  species: SpeciesCharacteristics
  size: number
}

export const Organelles: React.FC<OrganellesProps> = ({ nodeData, species, size }) => {
  const mitochondriaRef = useRef<THREE.Group>(null)
  const ribosomesRef = useRef<THREE.Group>(null)
  const erRef = useRef<THREE.Group>(null)
  const vacuolesRef = useRef<THREE.Group>(null)
  const vesiclesRef = useRef<THREE.Group>(null)
  
  const inflationRate = nodeData.basicInfo[1]
  const memberCount = nodeData.membersOfNode.length
  const budgetBalance = nodeData.basicInfo[3]
  const reserveBalance = nodeData.basicInfo[2]
  
  const mitochondriaCount = useMemo(() => {
    return Math.max(2, Math.floor(inflationRate * 0.1))
  }, [inflationRate])
  
  const ribosomeCount = useMemo(() => {
    return Math.max(species.organellePreferences.ribosomeCount, memberCount)
  }, [species.organellePreferences.ribosomeCount, memberCount])
  
  const vacuoleSize = useMemo(() => {
    const totalValue = budgetBalance + reserveBalance
    return Math.max(0.05, Math.min(0.2, totalValue * 0.000001 * species.organellePreferences.vacuoleSize))
  }, [budgetBalance, reserveBalance, species.organellePreferences.vacuoleSize])
  
  const mitochondriaPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < mitochondriaCount; i++) {
      const angle = (i / mitochondriaCount) * Math.PI * 2
      const radius = size * 0.6
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * size * 0.4
      positions.push({ x, y, z })
    }
    return positions
  }, [mitochondriaCount, size])
  
  const ribosomePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < ribosomeCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * size * 0.5 + size * 0.3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * size * 0.6
      positions.push({ x, y, z })
    }
    return positions
  }, [ribosomeCount, size])
  
  const erNetwork = useMemo(() => {
    const network = []
    const complexity = species.organellePreferences.erComplexity
    const segmentCount = Math.floor(complexity * 20)
    
    for (let i = 0; i < segmentCount; i++) {
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = Math.random() * Math.PI * 2
      const radius = size * 0.4
      
      const start = {
        x: Math.cos(angle1) * radius,
        y: (Math.random() - 0.5) * size * 0.3,
        z: Math.sin(angle1) * radius
      }
      
      const end = {
        x: Math.cos(angle2) * radius,
        y: (Math.random() - 0.5) * size * 0.3,
        z: Math.sin(angle2) * radius
      }
      
      network.push({ start, end })
    }
    return network
  }, [species.organellePreferences.erComplexity, size])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Mitochondria energy production animation
    if (mitochondriaRef.current) {
      mitochondriaRef.current.children.forEach((child, index) => {
        const energyPulse = 1 + Math.sin(time * 3 + index) * 0.2
        child.scale.setScalar(energyPulse)
      })
    }
    
    // Ribosome activity
    if (ribosomesRef.current) {
      ribosomesRef.current.children.forEach((child, index) => {
        const activity = Math.sin(time * 2 + index * 0.5) * 0.1
        child.position.y += activity
      })
    }
    
    // Vesicle movement
    if (vesiclesRef.current) {
      vesiclesRef.current.children.forEach((child, index) => {
        const speed = 0.5 + Math.sin(time + index) * 0.3
        child.rotation.y += speed * 0.02
      })
    }
  })
  
  return (
    <group>
      {/* Mitochondria */}
      <group ref={mitochondriaRef}>
        {mitochondriaPositions.map((pos, index) => (
          <mesh key={`mito-${index}`} position={[pos.x, pos.y, pos.z]}>
            <capsuleGeometry args={[0.02, 0.08]} />
            <meshStandardMaterial
              color="#ff4444"
              emissive="#ff2222"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Ribosomes */}
      <group ref={ribosomesRef}>
        {ribosomePositions.map((pos, index) => (
          <mesh key={`ribo-${index}`} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial
              color="#4444ff"
              emissive="#2222ff"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>
      
      {/* Endoplasmic Reticulum */}
      <group ref={erRef}>
        {erNetwork.map((segment, index) => {
          const direction = new THREE.Vector3(
            segment.end.x - segment.start.x,
            segment.end.y - segment.start.y,
            segment.end.z - segment.start.z
          )
          const length = direction.length()
          const center = new THREE.Vector3(
            (segment.start.x + segment.end.x) / 2,
            (segment.start.y + segment.end.y) / 2,
            (segment.start.z + segment.end.z) / 2
          )
          
          return (
            <mesh key={`er-${index}`} position={[center.x, center.y, center.z]}>
              <cylinderGeometry args={[0.003, 0.003, length]} />
              <meshStandardMaterial
                color="#44ff44"
                emissive="#22ff22"
                emissiveIntensity={0.1}
              />
            </mesh>
          )
        })}
      </group>
      
      {/* Vacuoles */}
      <group ref={vacuolesRef}>
        <mesh position={[size * 0.3, 0, 0]}>
          <sphereGeometry args={[vacuoleSize, 12, 12]} />
          <meshStandardMaterial
            color="#ffff44"
            emissive="#ffff22"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
        {reserveBalance > budgetBalance && (
          <mesh position={[-size * 0.3, 0, 0]}>
            <sphereGeometry args={[vacuoleSize * 0.7, 12, 12]} />
            <meshStandardMaterial
              color="#ff44ff"
              emissive="#ff22ff"
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>
      
      {/* Vesicles */}
      <group ref={vesiclesRef}>
        {nodeData.childrenNodes.slice(0, 3).map((childId, index) => {
          const angle = (index / 3) * Math.PI * 2
          const radius = size * 0.7
          return (
            <mesh key={`vesicle-${index}`} position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * 0.1,
              Math.sin(angle) * radius
            ]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color="#ff8844"
                emissive="#ff6622"
                emissiveIntensity={0.4}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
import React, { useMemo } from 'react'
import * as THREE from 'three'
import { NodeData } from '../types/nodeData'
import { SpeciesGenerator, SpeciesCharacteristics } from '../utils/speciesGenerator'
import { Membrane } from './Membrane'
import { Nucleus } from './Nucleus'
import { Organelles } from './Organelles'

interface OrganismProps {
  nodeData: NodeData
  onClick?: (nodeData: NodeData) => void
  isSelected?: boolean
  levelOfDetail?: number
}

export const Organism: React.FC<OrganismProps> = ({ 
  nodeData, 
  onClick, 
  isSelected = false,
  levelOfDetail = 1
}) => {
  const species = useMemo(() => {
    const baseSpecies = SpeciesGenerator.generateSpecies(nodeData.rootTokenAddress)
    return SpeciesGenerator.generateIndividualVariation(baseSpecies, nodeData.basicInfo[0])
  }, [nodeData.rootTokenAddress, nodeData.basicInfo[0]])
  
  const hierarchyDepth = nodeData.hierarchyDepth || 0
  const isRoot = hierarchyDepth === 0
  
  const organismSize = useMemo(() => {
    const baseSize = isRoot ? 1.5 : 0.5
    const sizeModifier = species.baseSize
    const depthModifier = Math.max(0.3, 1 - hierarchyDepth * 0.2)
    return baseSize * sizeModifier * depthModifier
  }, [isRoot, species.baseSize, hierarchyDepth])
  
  const position = nodeData.position || { x: 0, y: 0, z: 0 }
  
  const handleClick = (event: THREE.Event) => {
    event.stopPropagation()
    onClick?.(nodeData)
  }
  
  const shouldShowDetails = levelOfDetail > 0.5
  const shouldShowOrganelles = levelOfDetail > 0.8
  
  return (
    <group 
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[organismSize * 1.2, 32, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            wireframe 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
      
      {/* Membrane */}
      <Membrane 
        nodeData={nodeData}
        species={species}
        size={organismSize}
      />
      
      {/* Nucleus - always visible */}
      <Nucleus 
        nodeData={nodeData}
        species={species}
        size={organismSize}
      />
      
      {/* Organelles - only show at high detail */}
      {shouldShowOrganelles && (
        <Organelles 
          nodeData={nodeData}
          species={species}
          size={organismSize}
        />
      )}
      
      {/* Connections to child nodes */}
      {shouldShowDetails && nodeData.childrenNodes.length > 0 && (
        <group>
          {nodeData.childrenNodes.slice(0, 5).map((childId, index) => {
            const angle = (index / Math.min(5, nodeData.childrenNodes.length)) * Math.PI * 2
            const connectionLength = organismSize * 1.5
            const endX = Math.cos(angle) * connectionLength
            const endZ = Math.sin(angle) * connectionLength
            
            return (
              <mesh key={`connection-${childId}`}>
                <cylinderGeometry 
                  args={[0.005, 0.005, connectionLength]}
                  rotateZ={-angle}
                />
                <meshStandardMaterial
                  color={species.membraneColor}
                  emissive={species.membraneColor}
                  emissiveIntensity={species.emissiveIntensity * 0.3}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}
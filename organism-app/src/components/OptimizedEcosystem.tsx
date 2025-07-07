import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { NodeData } from '../types/nodeData'
import { performanceManager } from '../utils/performance'
import { Organism } from './Organism'

interface OptimizedEcosystemProps {
  nodes: NodeData[]
  onNodeClick: (node: NodeData) => void
  selectedNode: NodeData | null
}

export const OptimizedEcosystem: React.FC<OptimizedEcosystemProps> = ({ 
  nodes, 
  onNodeClick, 
  selectedNode 
}) => {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const lastCameraPosition = useRef(new THREE.Vector3())
  const lastUpdateTime = useRef(0)
  
  // Performance tracking
  const frameCount = useRef(0)
  const lastFpsUpdate = useRef(0)
  const fps = useRef(60)
  
  // Set camera reference for performance manager
  React.useEffect(() => {
    performanceManager.setCamera(camera)
  }, [camera])
  
  // Memoized node grouping
  const nodeGroups = useMemo(() => {
    const cameraPos = camera.position.clone()
    return performanceManager.groupNodesByDistance(nodes, cameraPos)
  }, [nodes, camera.position])
  
  // Dynamic LOD calculation
  const calculateNodeLOD = useCallback((node: NodeData): number => {
    if (!node.position) return 0
    
    const nodePos = new THREE.Vector3(node.position.x, node.position.y, node.position.z)
    const cameraPos = camera.position
    
    // Higher LOD for selected node
    if (selectedNode && selectedNode.basicInfo[0] === node.basicInfo[0]) {
      return 1.0
    }
    
    // Adaptive LOD based on performance
    const baseLOD = performanceManager.calculateLOD(nodePos, cameraPos, 25)
    const performanceMultiplier = Math.max(0.3, fps.current / 60)
    
    return baseLOD * performanceMultiplier
  }, [camera.position, selectedNode, fps])
  
  // Update loop with performance monitoring
  useFrame((state) => {
    const now = Date.now()
    frameCount.current++
    
    // Update FPS tracking
    if (now - lastFpsUpdate.current > 1000) {
      fps.current = frameCount.current
      frameCount.current = 0
      lastFpsUpdate.current = now
    }
    
    // Only update expensive calculations periodically
    const cameraPos = camera.position
    const cameraMoved = lastCameraPosition.current.distanceTo(cameraPos) > 0.1
    const timeSinceLastUpdate = now - lastUpdateTime.current
    
    if (cameraMoved || timeSinceLastUpdate > 200) {
      lastCameraPosition.current.copy(cameraPos)
      lastUpdateTime.current = now
      
      // Update node groups if needed
      // This would trigger a re-render with new LOD calculations
    }
  })
  
  // Render nodes with appropriate LOD
  const renderNodes = useCallback((nodeList: NodeData[], lodMultiplier: number = 1.0) => {
    return nodeList.map(node => {
      const lod = calculateNodeLOD(node) * lodMultiplier
      
      if (lod < 0.1) return null // Cull very low LOD
      
      return (
        <Organism
          key={node.basicInfo[0]}
          nodeData={node}
          onClick={onNodeClick}
          isSelected={selectedNode?.basicInfo[0] === node.basicInfo[0]}
          levelOfDetail={lod}
        />
      )
    }).filter(Boolean)
  }, [calculateNodeLOD, onNodeClick, selectedNode])
  
  return (
    <group ref={groupRef}>
      {/* High detail - near nodes */}
      {renderNodes(nodeGroups.near, 1.0)}
      
      {/* Medium detail - medium distance nodes */}
      {renderNodes(nodeGroups.medium, 0.7)}
      
      {/* Low detail - far nodes */}
      {renderNodes(nodeGroups.far, 0.4)}
      
      {/* Performance indicator */}
      {fps.current < 30 && (
        <mesh position={[0, 10, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  )
}

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [stats, setStats] = React.useState({
    fps: 60,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0
  })
  
  React.useEffect(() => {
    const updateStats = () => {
      const performance = (window as any).performance
      if (performance && performance.memory) {
        setStats(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024 // MB
        }))
      }
    }
    
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return stats
}
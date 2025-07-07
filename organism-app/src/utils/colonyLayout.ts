import * as THREE from 'three'
import { NodeData } from '../types/nodeData'

export interface LayoutNode {
  nodeData: NodeData
  position: THREE.Vector3
  radius: number
  hierarchyDepth: number
}

export class ColonyLayout {
  private nodePositions = new Map<string, THREE.Vector3>()
  private hierarchyLevels = new Map<number, LayoutNode[]>()
  
  calculateLayout(nodes: NodeData[]): Map<string, THREE.Vector3> {
    this.nodePositions.clear()
    this.hierarchyLevels.clear()
    
    // Build hierarchy tree
    const nodeMap = new Map<string, NodeData>()
    const rootNodes: NodeData[] = []
    
    nodes.forEach(node => {
      node.hierarchyDepth = node.rootPath.length
      nodeMap.set(node.basicInfo[0], node)
      
      if (node.hierarchyDepth === 0) {
        rootNodes.push(node)
      }
    })
    
    // Layout root nodes first
    this.layoutRootNodes(rootNodes)
    
    // Layout each hierarchy level
    for (let depth = 1; depth <= this.getMaxDepth(nodes); depth++) {
      this.layoutHierarchyLevel(nodes, depth, nodeMap)
    }
    
    return this.nodePositions
  }
  
  private layoutRootNodes(rootNodes: NodeData[]): void {
    const rootRadius = 8
    const angleStep = (Math.PI * 2) / Math.max(1, rootNodes.length)
    
    rootNodes.forEach((node, index) => {
      const angle = index * angleStep
      const x = Math.cos(angle) * rootRadius
      const z = Math.sin(angle) * rootRadius
      const y = 0
      
      const position = new THREE.Vector3(x, y, z)
      this.nodePositions.set(node.basicInfo[0], position)
      
      node.position = { x, y, z }
    })
  }
  
  private layoutHierarchyLevel(
    allNodes: NodeData[], 
    depth: number, 
    nodeMap: Map<string, NodeData>
  ): void {
    const levelNodes = allNodes.filter(node => node.hierarchyDepth === depth)
    
    levelNodes.forEach(node => {
      const parentId = node.rootPath[depth - 1]
      const parentNode = nodeMap.get(parentId)
      
      if (parentNode && parentNode.position) {
        const parentPos = new THREE.Vector3(
          parentNode.position.x,
          parentNode.position.y,
          parentNode.position.z
        )
        
        // Get siblings at same level from same parent
        const siblings = parentNode.childrenNodes
          .map(childId => nodeMap.get(childId))
          .filter(child => child && child.hierarchyDepth === depth) as NodeData[]
        
        const siblingIndex = siblings.findIndex(s => s.basicInfo[0] === node.basicInfo[0])
        const angleStep = (Math.PI * 2) / Math.max(1, siblings.length)
        const angle = siblingIndex * angleStep
        
        // Distance based on hierarchy depth
        const distance = 3 + depth * 1.5
        
        // Add some random variation to avoid perfect circles
        const variation = (Math.random() - 0.5) * 0.5
        const finalDistance = distance + variation
        
        const x = parentPos.x + Math.cos(angle) * finalDistance
        const z = parentPos.z + Math.sin(angle) * finalDistance
        const y = parentPos.y + (Math.random() - 0.5) * 0.5
        
        const position = new THREE.Vector3(x, y, z)
        this.nodePositions.set(node.basicInfo[0], position)
        
        node.position = { x, y, z }
      }
    })
  }
  
  private getMaxDepth(nodes: NodeData[]): number {
    return Math.max(...nodes.map(node => node.hierarchyDepth || 0))
  }
  
  // Calculate level of detail based on camera distance
  calculateLevelOfDetail(
    nodePosition: THREE.Vector3,
    cameraPosition: THREE.Vector3,
    maxDistance: number = 20
  ): number {
    const distance = nodePosition.distanceTo(cameraPosition)
    return Math.max(0, Math.min(1, (maxDistance - distance) / maxDistance))
  }
  
  // Get nodes within a certain distance for frustum culling
  getNodesInRange(
    centerPosition: THREE.Vector3,
    range: number,
    nodes: NodeData[]
  ): NodeData[] {
    return nodes.filter(node => {
      if (!node.position) return false
      
      const nodePos = new THREE.Vector3(node.position.x, node.position.y, node.position.z)
      return nodePos.distanceTo(centerPosition) <= range
    })
  }
}
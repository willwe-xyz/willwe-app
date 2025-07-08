import * as THREE from 'three'
import { NodeData } from '../types/nodeData'

export class PerformanceManager {
  private frustum = new THREE.Frustum()
  private camera: THREE.Camera | null = null
  private lastCameraUpdate = 0
  private readonly updateInterval = 100 // ms
  
  setCamera(camera: THREE.Camera) {
    this.camera = camera
  }
  
  // Calculate level of detail based on distance and screen size
  calculateLOD(
    objectPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3,
    maxDistance: number = 30
  ): number {
    const distance = objectPosition.distanceTo(cameraPosition)
    const lod = Math.max(0, Math.min(1, (maxDistance - distance) / maxDistance))
    
    // Quantize LOD to reduce shader switching
    if (lod > 0.8) return 1.0      // High detail
    if (lod > 0.4) return 0.6      // Medium detail
    if (lod > 0.1) return 0.3      // Low detail
    return 0.0                     // No detail (cull)
  }
  
  // Frustum culling
  isInFrustum(position: THREE.Vector3, radius: number): boolean {
    if (!this.camera) return true
    
    const now = Date.now()
    if (now - this.lastCameraUpdate > this.updateInterval) {
      const matrix = new THREE.Matrix4()
      matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
      this.frustum.setFromProjectionMatrix(matrix)
      this.lastCameraUpdate = now
    }
    
    const sphere = new THREE.Sphere(position, radius)
    return this.frustum.intersectsSphere(sphere)
  }
  
  // Group nodes by distance for batched rendering
  groupNodesByDistance(
    nodes: NodeData[],
    cameraPosition: THREE.Vector3
  ): {
    near: NodeData[]
    medium: NodeData[]
    far: NodeData[]
    culled: NodeData[]
  } {
    const groups = {
      near: [] as NodeData[],
      medium: [] as NodeData[],
      far: [] as NodeData[],
      culled: [] as NodeData[]
    }
    
    nodes.forEach(node => {
      if (!node.position) {
        groups.culled.push(node)
        return
      }
      
      const nodePos = new THREE.Vector3(node.position.x, node.position.y, node.position.z)
      const distance = nodePos.distanceTo(cameraPosition)
      
      if (distance < 8) {
        groups.near.push(node)
      } else if (distance < 20) {
        groups.medium.push(node)
      } else if (distance < 40) {
        groups.far.push(node)
      } else {
        groups.culled.push(node)
      }
    })
    
    return groups
  }
  
  // Memory pool for particle systems
  createParticlePool(maxSize: number) {
    const positions = new Float32Array(maxSize * 3)
    const colors = new Float32Array(maxSize * 3)
    const sizes = new Float32Array(maxSize)
    const lifetimes = new Float32Array(maxSize)
    
    return {
      positions,
      colors,
      sizes,
      lifetimes,
      count: 0,
      
      getParticle(): number | null {
        if (this.count >= maxSize) return null
        return this.count++
      },
      
      releaseParticle(index: number) {
        if (index < this.count - 1) {
          // Swap with last particle
          const lastIndex = this.count - 1
          
          // Swap positions
          positions[index * 3] = positions[lastIndex * 3]
          positions[index * 3 + 1] = positions[lastIndex * 3 + 1]
          positions[index * 3 + 2] = positions[lastIndex * 3 + 2]
          
          // Swap colors
          colors[index * 3] = colors[lastIndex * 3]
          colors[index * 3 + 1] = colors[lastIndex * 3 + 1]
          colors[index * 3 + 2] = colors[lastIndex * 3 + 2]
          
          // Swap sizes and lifetimes
          sizes[index] = sizes[lastIndex]
          lifetimes[index] = lifetimes[lastIndex]
        }
        
        this.count--
      }
    }
  }
}

export const performanceManager = new PerformanceManager()
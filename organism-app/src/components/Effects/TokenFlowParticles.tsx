import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TokenFlow } from '../../types/solarSystem'

interface Particle {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  color: THREE.Color
  flow: TokenFlow
  progress: number
}

interface TokenFlowParticlesProps {
  flows: TokenFlow[]
  nodePositions: Map<string, THREE.Vector3>
  levelOfDetail: number
}

export const TokenFlowParticles: React.FC<TokenFlowParticlesProps> = ({
  flows,
  nodePositions,
  levelOfDetail
}) => {
  const particlesRef = useRef<THREE.Points>(null)
  const particles = useRef<Particle[]>([])
  const geometry = useRef(new THREE.BufferGeometry())
  const material = useRef(new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  }))

  const maxParticles = useMemo(() => {
    return Math.min(1000, flows.length * 50) * levelOfDetail
  }, [flows.length, levelOfDetail])

  // Create particles for each flow
  useEffect(() => {
    const newParticles: Particle[] = []
    
    flows.forEach((flow, flowIndex) => {
      const fromPos = nodePositions.get(flow.from)
      const toPos = nodePositions.get(flow.to)
      
      if (!fromPos || !toPos) return

      const particleCount = Math.min(20, Math.max(5, Math.floor(flow.amount / 1000)))
      
      for (let i = 0; i < particleCount; i++) {
        const delay = (i / particleCount) * 2000 // Stagger particles
        const life = 3000 + Math.random() * 2000 // 3-5 seconds
        
        newParticles.push({
          id: `${flow.id || flowIndex}-${i}`,
          position: fromPos.clone(),
          velocity: new THREE.Vector3(),
          life: life,
          maxLife: life,
          size: getParticleSize(flow.type, flow.amount),
          color: getParticleColor(flow.type),
          flow,
          progress: -delay / life // Start with negative progress for delay
        })
      }
    })

    particles.current = newParticles.slice(0, maxParticles)
    updateGeometry()
  }, [flows, nodePositions, maxParticles])

  const getParticleSize = (type: string, amount: number): number => {
    const baseSize = {
      'minting': 0.15,
      'burning': 0.12,
      'redistribution': 0.10,
      'inflation': 0.08
    }[type] || 0.10
    
    const sizeMultiplier = Math.min(3, Math.max(0.5, Math.log10(amount + 1) / 3))
    return baseSize * sizeMultiplier
  }

  const getParticleColor = (type: string): THREE.Color => {
    const colors = {
      'minting': new THREE.Color('#00ff88'),      // Green - creation
      'burning': new THREE.Color('#ff4444'),      // Red - destruction
      'redistribution': new THREE.Color('#4488ff'), // Blue - transfer
      'inflation': new THREE.Color('#ffaa00')     // Orange - expansion
    }
    return colors[type] || new THREE.Color('#ffffff')
  }

  const updateGeometry = () => {
    const positions = new Float32Array(particles.current.length * 3)
    const colors = new Float32Array(particles.current.length * 3)
    const sizes = new Float32Array(particles.current.length)

    particles.current.forEach((particle, i) => {
      const i3 = i * 3
      
      positions[i3] = particle.position.x
      positions[i3 + 1] = particle.position.y
      positions[i3 + 2] = particle.position.z
      
      colors[i3] = particle.color.r
      colors[i3 + 1] = particle.color.g
      colors[i3 + 2] = particle.color.b
      
      sizes[i] = particle.size
    })

    geometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  }

  useFrame((state, delta) => {
    const deltaMs = delta * 1000
    let needsUpdate = false

    particles.current.forEach(particle => {
      // Update life and progress
      particle.life -= deltaMs
      particle.progress += deltaMs / particle.maxLife

      if (particle.life <= 0 || particle.progress > 1) {
        // Reset particle for continuous flow
        const fromPos = nodePositions.get(particle.flow.from)
        const toPos = nodePositions.get(particle.flow.to)
        
        if (fromPos && toPos) {
          particle.position.copy(fromPos)
          particle.life = particle.maxLife
          particle.progress = 0
          needsUpdate = true
        }
        return
      }

      if (particle.progress > 0) {
        const fromPos = nodePositions.get(particle.flow.from)
        const toPos = nodePositions.get(particle.flow.to)
        
        if (fromPos && toPos) {
          // Calculate trajectory
          const trajectory = calculateTrajectory(
            fromPos, 
            toPos, 
            particle.progress, 
            particle.flow.type
          )
          
          particle.position.copy(trajectory)
          needsUpdate = true
        }
      }
    })

    if (needsUpdate) {
      updateGeometry()
      if (geometry.current.attributes.position) {
        geometry.current.attributes.position.needsUpdate = true
        geometry.current.attributes.color.needsUpdate = true
        geometry.current.attributes.size.needsUpdate = true
      }
    }
  })

  const calculateTrajectory = (
    from: THREE.Vector3, 
    to: THREE.Vector3, 
    progress: number, 
    type: string
  ): THREE.Vector3 => {
    const easeProgress = easeInOutCubic(Math.max(0, Math.min(1, progress)))
    
    switch (type) {
      case 'minting':
        // Expanding spiral from sun
        return calculateSpiralTrajectory(from, to, easeProgress, 1.5)
      
      case 'burning':
        // Contracting spiral to sun
        return calculateSpiralTrajectory(from, to, easeProgress, -1.2)
      
      case 'redistribution':
        // Smooth arc between nodes
        return calculateArcTrajectory(from, to, easeProgress, 0.8)
      
      case 'inflation':
        // Radiating outward from sun
        return calculateRadialTrajectory(from, to, easeProgress)
      
      default:
        // Simple linear interpolation
        return from.clone().lerp(to, easeProgress)
    }
  }

  const calculateSpiralTrajectory = (
    from: THREE.Vector3, 
    to: THREE.Vector3, 
    progress: number, 
    spiralIntensity: number
  ): THREE.Vector3 => {
    const baseTrajectory = from.clone().lerp(to, progress)
    const distance = from.distanceTo(to)
    const spiralRadius = (distance * 0.3) * (1 - progress) * Math.abs(spiralIntensity)
    const spiralAngle = progress * Math.PI * 4 * Math.sign(spiralIntensity)
    
    const perpendicular = new THREE.Vector3()
      .subVectors(to, from)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize()
    
    const spiralOffset = perpendicular
      .multiplyScalar(Math.sin(spiralAngle) * spiralRadius)
    
    const verticalOffset = new THREE.Vector3(0, Math.cos(spiralAngle) * spiralRadius * 0.5, 0)
    
    return baseTrajectory.add(spiralOffset).add(verticalOffset)
  }

  const calculateArcTrajectory = (
    from: THREE.Vector3, 
    to: THREE.Vector3, 
    progress: number, 
    arcHeight: number
  ): THREE.Vector3 => {
    const baseTrajectory = from.clone().lerp(to, progress)
    const midpoint = from.clone().add(to).multiplyScalar(0.5)
    const distance = from.distanceTo(to)
    
    // Create arc above the midpoint
    const arcOffset = Math.sin(progress * Math.PI) * distance * arcHeight
    baseTrajectory.y += arcOffset
    
    return baseTrajectory
  }

  const calculateRadialTrajectory = (
    from: THREE.Vector3, 
    to: THREE.Vector3, 
    progress: number
  ): THREE.Vector3 => {
    const direction = to.clone().sub(from).normalize()
    const distance = from.distanceTo(to)
    
    // Accelerating expansion
    const acceleratedProgress = progress * progress
    const currentDistance = distance * acceleratedProgress
    
    return from.clone().add(direction.multiplyScalar(currentDistance))
  }

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  if (!flows.length || levelOfDetail < 0.3) {
    return null
  }

  return (
    <points
      ref={particlesRef}
      geometry={geometry.current}
      material={material.current}
    />
  )
}

export default TokenFlowParticles
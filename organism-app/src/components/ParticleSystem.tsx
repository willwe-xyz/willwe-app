import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TokenFlow } from '../types/nodeData'

interface ParticleSystemProps {
  flows: TokenFlow[]
  nodePositions: Map<string, THREE.Vector3>
}

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  life: number
  maxLife: number
  size: number
  flow: TokenFlow
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ flows, nodePositions }) => {
  const particlesRef = useRef<THREE.Points>(null)
  const particlesData = useRef<Particle[]>([])
  
  const maxParticles = 1000
  const particleGeometry = useMemo(() => new THREE.BufferGeometry(), [])
  
  const positions = useMemo(() => new Float32Array(maxParticles * 3), [])
  const colors = useMemo(() => new Float32Array(maxParticles * 3), [])
  const sizes = useMemo(() => new Float32Array(maxParticles), [])
  
  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
  }, [])
  
  // Initialize particle geometry
  useMemo(() => {
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  }, [particleGeometry, positions, colors, sizes])
  
  const createParticle = (flow: TokenFlow): Particle | null => {
    const fromPos = nodePositions.get(flow.from)
    const toPos = nodePositions.get(flow.to)
    
    if (!fromPos || !toPos) return null
    
    const direction = toPos.clone().sub(fromPos).normalize()
    const distance = fromPos.distanceTo(toPos)
    
    const color = new THREE.Color(flow.particleColor)
    const speed = 0.01 + (flow.amount / 1000000) * 0.02
    
    return {
      position: fromPos.clone(),
      velocity: direction.multiplyScalar(speed),
      color,
      life: 0,
      maxLife: distance / speed,
      size: Math.max(0.005, Math.min(0.02, flow.amount / 100000)),
      flow
    }
  }
  
  const updateParticles = () => {
    let activeParticles = 0
    
    for (let i = 0; i < particlesData.current.length; i++) {
      const particle = particlesData.current[i]
      
      if (particle.life < particle.maxLife) {
        // Update position
        particle.position.add(particle.velocity)
        particle.life += 1
        
        // Update geometry buffers
        const i3 = activeParticles * 3
        positions[i3] = particle.position.x
        positions[i3 + 1] = particle.position.y
        positions[i3 + 2] = particle.position.z
        
        colors[i3] = particle.color.r
        colors[i3 + 1] = particle.color.g
        colors[i3 + 2] = particle.color.b
        
        sizes[activeParticles] = particle.size
        
        activeParticles++
      }
    }
    
    // Remove expired particles
    particlesData.current = particlesData.current.filter(p => p.life < p.maxLife)
    
    // Add new particles from flows
    flows.forEach(flow => {
      if (Math.random() < 0.1 && particlesData.current.length < maxParticles) {
        const particle = createParticle(flow)
        if (particle) {
          particlesData.current.push(particle)
        }
      }
    })
    
    // Update geometry
    if (particlesRef.current) {
      particleGeometry.attributes.position.needsUpdate = true
      particleGeometry.attributes.color.needsUpdate = true
      particleGeometry.attributes.size.needsUpdate = true
      particleGeometry.setDrawRange(0, activeParticles)
    }
  }
  
  useFrame(() => {
    updateParticles()
  })
  
  return (
    <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
  )
}

export const FlowGenerator = {
  generateMintingFlow: (fromNode: string, toNode: string, amount: number): TokenFlow => ({
    type: 'minting',
    from: fromNode,
    to: toNode,
    amount,
    timestamp: Date.now(),
    particleColor: '#00ff00'
  }),
  
  generateBurningFlow: (fromNode: string, toNode: string, amount: number): TokenFlow => ({
    type: 'burning',
    from: fromNode,
    to: toNode,
    amount,
    timestamp: Date.now(),
    particleColor: '#ff0000'
  }),
  
  generateRedistributionFlow: (fromNode: string, toNode: string, amount: number): TokenFlow => ({
    type: 'redistribution',
    from: fromNode,
    to: toNode,
    amount,
    timestamp: Date.now(),
    particleColor: '#0088ff'
  }),
  
  generateInflationFlow: (fromNode: string, amount: number): TokenFlow => ({
    type: 'inflation',
    from: fromNode,
    to: 'environment',
    amount,
    timestamp: Date.now(),
    particleColor: '#ffff00'
  })
}
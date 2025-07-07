import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SunProperties } from '../../types/solarSystem'

interface SolarWindProps {
  sun: SunProperties
  intensity: number
  levelOfDetail: number
}

export const SolarWind: React.FC<SolarWindProps> = ({
  sun,
  intensity,
  levelOfDetail
}) => {
  const particlesRef = useRef<THREE.Points>(null)
  const geometry = useRef(new THREE.BufferGeometry())
  const material = useRef(new THREE.PointsMaterial({
    size: 0.05,
    transparent: true,
    opacity: 0.6,
    color: sun.color,
    blending: THREE.AdditiveBlending
  }))

  const particleCount = useMemo(() => {
    return Math.floor(200 * intensity * levelOfDetail)
  }, [intensity, levelOfDetail])

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const lives = new Float32Array(particleCount)
    const maxLives = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Start particles at sun surface
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = sun.size * 1.1
      
      positions[i3] = sun.position.x + Math.sin(phi) * Math.cos(theta) * radius
      positions[i3 + 1] = sun.position.y + Math.cos(phi) * radius
      positions[i3 + 2] = sun.position.z + Math.sin(phi) * Math.sin(theta) * radius
      
      // Radial velocity outward from sun
      const speed = 0.5 + Math.random() * 1.0
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i3 + 1] = Math.cos(phi) * speed * 0.5 // Less vertical spread
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
      
      // Random lifetime
      const life = 2000 + Math.random() * 3000
      lives[i] = life
      maxLives[i] = life
    }

    geometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.current.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.current.setAttribute('life', new THREE.BufferAttribute(lives, 1))
    geometry.current.setAttribute('maxLife', new THREE.BufferAttribute(maxLives, 1))

    return { positions, velocities, lives, maxLives }
  }, [particleCount, sun])

  useFrame((state, delta) => {
    if (!geometry.current.attributes.position) return

    const positions = geometry.current.attributes.position.array as Float32Array
    const velocities = geometry.current.attributes.velocity.array as Float32Array
    const lives = geometry.current.attributes.life.array as Float32Array
    const maxLives = geometry.current.attributes.maxLife.array as Float32Array
    
    const deltaMs = delta * 1000

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Update life
      lives[i] -= deltaMs
      
      if (lives[i] <= 0) {
        // Respawn particle at sun surface
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const radius = sun.size * 1.1
        
        positions[i3] = sun.position.x + Math.sin(phi) * Math.cos(theta) * radius
        positions[i3 + 1] = sun.position.y + Math.cos(phi) * radius
        positions[i3 + 2] = sun.position.z + Math.sin(phi) * Math.sin(theta) * radius
        
        // Reset velocity
        const speed = 0.5 + Math.random() * 1.0
        velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed
        velocities[i3 + 1] = Math.cos(phi) * speed * 0.5
        velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
        
        // Reset life
        lives[i] = maxLives[i]
      } else {
        // Update position
        positions[i3] += velocities[i3] * delta
        positions[i3 + 1] += velocities[i3 + 1] * delta
        positions[i3 + 2] += velocities[i3 + 2] * delta
        
        // Apply solar wind acceleration (decreasing with distance)
        const distance = Math.sqrt(
          Math.pow(positions[i3] - sun.position.x, 2) +
          Math.pow(positions[i3 + 1] - sun.position.y, 2) +
          Math.pow(positions[i3 + 2] - sun.position.z, 2)
        )
        
        const acceleration = Math.max(0.1, 2.0 / (distance + 1))
        velocities[i3] *= 1 + acceleration * delta
        velocities[i3 + 1] *= 1 + acceleration * delta * 0.5
        velocities[i3 + 2] *= 1 + acceleration * delta
      }
    }

    geometry.current.attributes.position.needsUpdate = true
    geometry.current.attributes.velocity.needsUpdate = true
    geometry.current.attributes.life.needsUpdate = true
  })

  if (levelOfDetail < 0.4 || intensity < 0.1) {
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

export default SolarWind
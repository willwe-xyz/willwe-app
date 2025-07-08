import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Signal, CelestialBody } from '../../types/solarSystem'

interface SignalWave {
  id: string
  origin: THREE.Vector3
  radius: number
  maxRadius: number
  intensity: number
  color: THREE.Color
  life: number
  maxLife: number
  signal: Signal
}

interface SignalWavesProps {
  signals: Signal[]
  bodies: CelestialBody[]
  levelOfDetail: number
}

export const SignalWaves: React.FC<SignalWavesProps> = ({
  signals,
  bodies,
  levelOfDetail
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const waves = useRef<SignalWave[]>([])
  const meshRefs = useRef<THREE.Mesh[]>([])

  // Create waves for new signals
  useEffect(() => {
    const newWaves: SignalWave[] = []
    
    signals.forEach((signal, index) => {
      const body = bodies.find(b => b.nodeData.basicInfo[0] === signal.nodeId)
      if (!body) return

      const waveColor = getSignalColor(signal.type)
      const maxRadius = getSignalRange(signal.type, signal.weight)
      
      newWaves.push({
        id: signal.id || `signal-${index}`,
        origin: body.position.clone(),
        radius: 0,
        maxRadius,
        intensity: Math.min(1, signal.weight / 1000),
        color: waveColor,
        life: 3000, // 3 seconds
        maxLife: 3000,
        signal
      })
    })

    // Add new waves to existing ones
    waves.current = [...waves.current, ...newWaves].slice(-20) // Keep max 20 waves
  }, [signals, bodies])

  const getSignalColor = (type: string): THREE.Color => {
    const colors = {
      'membrane': new THREE.Color('#ff6b9d'),     // Pink - governance
      'inflation': new THREE.Color('#4ecdc4'),    // Teal - monetary
      'redistribution': new THREE.Color('#45b7d1') // Blue - allocation
    }
    return colors[type] || new THREE.Color('#ffffff')
  }

  const getSignalRange = (type: string, weight: number): number => {
    const baseRange = {
      'membrane': 8,        // Wide governance influence
      'inflation': 12,      // System-wide monetary effect
      'redistribution': 6   // Local allocation effect
    }[type] || 5

    return baseRange * (1 + Math.log10(weight + 1) / 4)
  }

  const createWaveGeometry = (radius: number): THREE.RingGeometry => {
    return new THREE.RingGeometry(radius * 0.95, radius * 1.05, 32)
  }

  const createWaveMaterial = (color: THREE.Color, opacity: number): THREE.MeshBasicMaterial => {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: opacity * 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  }

  useFrame((state, delta) => {
    const deltaMs = delta * 1000
    
    waves.current = waves.current.filter(wave => {
      wave.life -= deltaMs
      wave.radius += (wave.maxRadius / wave.maxLife) * deltaMs
      
      return wave.life > 0 && wave.radius < wave.maxRadius * 1.2
    })

    // Update mesh visibility and properties
    if (groupRef.current) {
      // Remove excess meshes
      while (meshRefs.current.length > waves.current.length) {
        const mesh = meshRefs.current.pop()
        if (mesh && groupRef.current) {
          groupRef.current.remove(mesh)
        }
      }

      // Update or create meshes for each wave
      waves.current.forEach((wave, index) => {
        const lifeProgress = 1 - (wave.life / wave.maxLife)
        const radiusProgress = wave.radius / wave.maxRadius
        
        // Calculate opacity based on life and radius
        const opacity = wave.intensity * 
          Math.sin(lifeProgress * Math.PI) * 
          (1 - radiusProgress * 0.7)

        if (opacity <= 0.01) return

        let mesh = meshRefs.current[index]
        
        if (!mesh) {
          // Create new mesh
          const geometry = createWaveGeometry(wave.radius)
          const material = createWaveMaterial(wave.color, opacity)
          mesh = new THREE.Mesh(geometry, material)
          mesh.position.copy(wave.origin)
          mesh.lookAt(mesh.position.x, mesh.position.y + 1, mesh.position.z)
          
          meshRefs.current[index] = mesh
          groupRef.current?.add(mesh)
        } else {
          // Update existing mesh
          const geometry = createWaveGeometry(wave.radius)
          mesh.geometry.dispose()
          mesh.geometry = geometry
          
          const material = mesh.material as THREE.MeshBasicMaterial
          material.opacity = opacity * 0.3
          material.color.copy(wave.color)
        }
      })
    }
  })

  if (levelOfDetail < 0.5) {
    return null
  }

  return <group ref={groupRef} />
}

export default SignalWaves
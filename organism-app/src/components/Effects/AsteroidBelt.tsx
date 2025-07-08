import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TokenFlow } from '../../types/solarSystem'

interface AsteroidBeltProps {
  sunPosition: THREE.Vector3
  orbitRadius: number
  planetPositions: THREE.Vector3[]
  flows: TokenFlow[]
  levelOfDetail: number
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  sunPosition,
  orbitRadius,
  planetPositions,
  flows,
  levelOfDetail
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => new THREE.SphereGeometry(0.02, 6, 4), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#666666',
    transparent: true,
    opacity: 0.6
  }), [])

  const asteroidCount = useMemo(() => {
    return Math.floor(100 * levelOfDetail)
  }, [levelOfDetail])

  const asteroids = useMemo(() => {
    const data = []
    
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2
      const radiusVariation = orbitRadius + (Math.random() - 0.5) * 2
      const heightVariation = (Math.random() - 0.5) * 0.5
      
      data.push({
        angle,
        radius: radiusVariation,
        height: heightVariation,
        speed: 0.001 + Math.random() * 0.002,
        size: 0.8 + Math.random() * 0.4
      })
    }
    
    return data
  }, [asteroidCount, orbitRadius])

  useFrame((state) => {
    if (!instancedMeshRef.current) return

    const matrix = new THREE.Matrix4()
    const redistributionFlow = flows.find(f => f.type === 'redistribution')
    const flowIntensity = redistributionFlow ? Math.min(1, redistributionFlow.amount / 10000) : 0

    asteroids.forEach((asteroid, i) => {
      // Update asteroid angle
      asteroid.angle += asteroid.speed
      
      // Calculate position
      const x = sunPosition.x + Math.cos(asteroid.angle) * asteroid.radius
      const y = sunPosition.y + asteroid.height + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1
      const z = sunPosition.z + Math.sin(asteroid.angle) * asteroid.radius
      
      // Add some perturbation based on nearby planets
      let perturbationX = 0
      let perturbationZ = 0
      
      planetPositions.forEach(planetPos => {
        const distance = Math.sqrt(
          Math.pow(x - planetPos.x, 2) + 
          Math.pow(z - planetPos.z, 2)
        )
        
        if (distance < 3) {
          const influence = (3 - distance) / 3
          perturbationX += (planetPos.x - x) * influence * 0.1
          perturbationZ += (planetPos.z - z) * influence * 0.1
        }
      })
      
      // Apply flow-based disturbance
      const flowDisturbance = flowIntensity * Math.sin(state.clock.elapsedTime * 3 + i) * 0.2
      
      // Create transformation matrix
      matrix.makeTranslation(
        x + perturbationX + flowDisturbance,
        y,
        z + perturbationZ
      )
      
      const scale = asteroid.size * (1 + flowIntensity * 0.5)
      matrix.scale(new THREE.Vector3(scale, scale, scale))
      
      instancedMeshRef.current!.setMatrixAt(i, matrix)
    })
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    
    // Update material color based on flow activity
    if (flowIntensity > 0.1) {
      material.color.setHex(0x888844) // Yellowish during redistribution
      material.opacity = 0.8
    } else {
      material.color.setHex(0x666666) // Normal gray
      material.opacity = 0.6
    }
  })

  if (levelOfDetail < 0.4) {
    return null
  }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, asteroidCount]}
    />
  )
}

export default AsteroidBelt
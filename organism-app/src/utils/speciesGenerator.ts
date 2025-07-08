import * as THREE from 'three'

// Simple hash function for deterministic species generation
function simpleHash(str: string): number[] {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to array of bytes for consistent access
  const bytes = []
  const absHash = Math.abs(hash)
  for (let i = 0; i < 4; i++) {
    bytes.push((absHash >> (i * 8)) & 0xff)
  }
  return bytes
}

export interface SpeciesCharacteristics {
  membraneColor: THREE.Color
  nucleusType: 'pulsing' | 'stable' | 'fractal'
  organellePreferences: {
    mitochondriaSize: number
    ribosomeCount: number
    erComplexity: number
    vacuoleSize: number
  }
  metabolicRate: number
  baseSize: number
  emissiveIntensity: number
}

export class SpeciesGenerator {
  private static cache = new Map<string, SpeciesCharacteristics>()

  static generateSpecies(rootTokenAddress: string): SpeciesCharacteristics {
    if (this.cache.has(rootTokenAddress)) {
      return this.cache.get(rootTokenAddress)!
    }

    const bytes = simpleHash(rootTokenAddress)
    const species = this.generateFromBytes(bytes)
    this.cache.set(rootTokenAddress, species)
    return species
  }

  private static generateFromBytes(bytes: number[]): SpeciesCharacteristics {
    // Generate membrane color using first 3 bytes (cycling if needed)
    const r = bytes[0 % bytes.length] / 255
    const g = bytes[1 % bytes.length] / 255
    const b = bytes[2 % bytes.length] / 255
    const membraneColor = new THREE.Color(r, g, b)
    
    // Nucleus type from byte 3
    const nucleusTypes: ('pulsing' | 'stable' | 'fractal')[] = ['pulsing', 'stable', 'fractal']
    const nucleusType = nucleusTypes[bytes[3 % bytes.length] % 3]
    
    // Organelle preferences from remaining bytes
    const organellePreferences = {
      mitochondriaSize: 0.5 + (bytes[0 % bytes.length] / 255) * 0.5,
      ribosomeCount: Math.floor(5 + (bytes[1 % bytes.length] / 255) * 15),
      erComplexity: 0.3 + (bytes[2 % bytes.length] / 255) * 0.7,
      vacuoleSize: 0.1 + (bytes[3 % bytes.length] / 255) * 0.4
    }
    
    // Metabolic rate
    const metabolicRate = 0.5 + (bytes[0 % bytes.length] / 255) * 1.5
    
    // Base size
    const baseSize = 0.8 + (bytes[1 % bytes.length] / 255) * 0.7
    
    // Emissive intensity
    const emissiveIntensity = 0.1 + (bytes[2 % bytes.length] / 255) * 0.4
    
    return {
      membraneColor,
      nucleusType,
      organellePreferences,
      metabolicRate,
      baseSize,
      emissiveIntensity
    }
  }
  
  static generateIndividualVariation(
    baseSpecies: SpeciesCharacteristics,
    nodeId: string,
    variationFactor: number = 0.2
  ): SpeciesCharacteristics {
    const bytes = simpleHash(nodeId)
    
    const variation = (bytes[0] / 255 - 0.5) * variationFactor
    
    return {
      ...baseSpecies,
      baseSize: Math.max(0.2, baseSpecies.baseSize + variation),
      metabolicRate: Math.max(0.1, baseSpecies.metabolicRate + variation * 0.5),
      emissiveIntensity: Math.max(0.05, baseSpecies.emissiveIntensity + variation * 0.3)
    }
  }
}
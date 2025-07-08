import { Vector3 } from 'three'
import { WillWeNodeData, SolarSystem, SunProperties, PlanetProperties, MoonProperties, ColorScheme } from '../types/solarSystem'

/**
 * Transform WillWe node data into solar system representation
 */
export class SolarSystemTransform {
  private static readonly ORBIT_SCALING = 5
  private static readonly SIZE_SCALING = 0.5
  private static readonly MIN_PLANET_SIZE = 0.3
  private static readonly MAX_PLANET_SIZE = 2.0
  private static readonly MIN_MOON_SIZE = 0.1
  private static readonly MAX_MOON_SIZE = 0.5

  /**
   * Convert array of WillWe nodes to solar system
   */
  static transformToSolarSystem(nodes: WillWeNodeData[]): SolarSystem {
    const rootNode = nodes.find(node => node.hierarchyDepth === 0)
    if (!rootNode) {
      throw new Error('No root node found')
    }

    const sun = this.createSun(rootNode)
    const planets = this.createPlanets(nodes.filter(node => node.hierarchyDepth === 1), rootNode)
    const moons = this.createMoons(nodes.filter(node => node.hierarchyDepth > 1), planets)

    // Assign moons to planets
    planets.forEach(planet => {
      planet.moons = moons.filter(moon => moon.parentPlanet === planet.id)
    })

    return {
      id: rootNode.rootTokenAddress,
      rootTokenAddress: rootNode.rootTokenAddress,
      rootTokenSymbol: this.extractTokenSymbol(rootNode.rootTokenAddress),
      rootTokenName: this.extractTokenName(rootNode.rootTokenAddress),
      sun,
      planets,
      totalValue: this.calculateTotalValue(nodes),
      totalNodes: nodes.length,
      activityLevel: this.calculateActivityLevel(nodes),
      boundingBox: this.calculateBoundingBox(sun, planets)
    }
  }

  /**
   * Create sun from root node
   */
  private static createSun(rootNode: WillWeNodeData): SunProperties {
    const totalSupply = rootNode.basicInfo[11]
    const inflationRate = rootNode.basicInfo[1]
    const memberCount = rootNode.membersOfNode.length

    return {
      id: rootNode.basicInfo[0],
      type: 'sun',
      position: new Vector3(0, 0, 0),
      size: this.calculateSunSize(totalSupply, memberCount),
      color: this.generateSunColor(rootNode.rootTokenAddress),
      nodeData: rootNode,
      luminosity: this.calculateLuminosity(inflationRate, memberCount),
      temperature: this.calculateTemperature(inflationRate),
      coronaEffect: memberCount > 50,
      solarFlares: [],
      planets: []
    }
  }

  /**
   * Create planets from first-level nodes
   */
  private static createPlanets(planetNodes: WillWeNodeData[], rootNode: WillWeNodeData): PlanetProperties[] {
    return planetNodes.map((node, index) => {
      const totalSupply = node.basicInfo[11]
      const memberCount = node.membersOfNode.length
      const hasChildren = node.childrenNodes.length > 0

      const orbitRadius = this.calculateOrbitRadius(index, planetNodes.length)
      const orbitAngle = (index / planetNodes.length) * Math.PI * 2

      return {
        id: node.basicInfo[0],
        type: 'planet',
        position: new Vector3(
          Math.cos(orbitAngle) * orbitRadius,
          0,
          Math.sin(orbitAngle) * orbitRadius
        ),
        size: this.calculatePlanetSize(totalSupply, memberCount),
        color: this.generatePlanetColor(rootNode.rootTokenAddress, index),
        nodeData: node,
        orbitRadius,
        orbitSpeed: this.calculateOrbitSpeed(orbitRadius),
        orbitAngle,
        atmosphere: node.basicInfo[6] > 0, // has membrane
        rings: hasChildren,
        surface: this.determineSurfaceType(node),
        tilt: this.calculateTilt(node.basicInfo[1]), // based on inflation
        moons: [],
        parentSun: rootNode.basicInfo[0]
      }
    })
  }

  /**
   * Create moons from sub-nodes
   */
  private static createMoons(moonNodes: WillWeNodeData[], planets: PlanetProperties[]): MoonProperties[] {
    const moons: MoonProperties[] = []

    moonNodes.forEach(node => {
      const parentPlanet = planets.find(p => 
        node.rootPath.includes(p.id) || 
        p.nodeData.childrenNodes.includes(node.basicInfo[0])
      )

      if (parentPlanet) {
        const existingMoons = moons.filter(m => m.parentPlanet === parentPlanet.id)
        const moonIndex = existingMoons.length

        const orbitRadius = this.calculateMoonOrbitRadius(parentPlanet.size, moonIndex)
        const orbitAngle = (moonIndex / (existingMoons.length + 1)) * Math.PI * 2

        const moonPosition = new Vector3(
          parentPlanet.position.x + Math.cos(orbitAngle) * orbitRadius,
          parentPlanet.position.y,
          parentPlanet.position.z + Math.sin(orbitAngle) * orbitRadius
        )

        moons.push({
          id: node.basicInfo[0],
          type: 'moon',
          position: moonPosition,
          size: this.calculateMoonSize(node.basicInfo[11], node.membersOfNode.length),
          color: this.generateMoonColor(parentPlanet.color),
          nodeData: node,
          orbitRadius,
          orbitSpeed: this.calculateMoonOrbitSpeed(orbitRadius),
          orbitAngle,
          phase: Math.random() * Math.PI * 2,
          craters: node.basicInfo[8] > 0, // has redistribution history
          tideLocked: node.hierarchyDepth > 2,
          parentPlanet: parentPlanet.id
        })
      }
    })

    return moons
  }

  /**
   * Calculate sun size based on total supply and member count
   */
  private static calculateSunSize(totalSupply: number, memberCount: number): number {
    const baseSize = Math.log10(totalSupply + 1) * 0.2
    const memberBonus = Math.log10(memberCount + 1) * 0.1
    return Math.max(1.0, Math.min(3.0, baseSize + memberBonus))
  }

  /**
   * Calculate planet size
   */
  private static calculatePlanetSize(totalSupply: number, memberCount: number): number {
    const baseSize = Math.log10(totalSupply + 1) * 0.1
    const memberBonus = Math.log10(memberCount + 1) * 0.05
    return Math.max(this.MIN_PLANET_SIZE, Math.min(this.MAX_PLANET_SIZE, baseSize + memberBonus))
  }

  /**
   * Calculate moon size
   */
  private static calculateMoonSize(totalSupply: number, memberCount: number): number {
    const baseSize = Math.log10(totalSupply + 1) * 0.05
    const memberBonus = Math.log10(memberCount + 1) * 0.02
    return Math.max(this.MIN_MOON_SIZE, Math.min(this.MAX_MOON_SIZE, baseSize + memberBonus))
  }

  /**
   * Calculate orbit radius for planets
   */
  private static calculateOrbitRadius(index: number, totalPlanets: number): number {
    const baseRadius = 3 + (index * 2)
    const spacing = Math.max(1.5, 10 / totalPlanets)
    return baseRadius + (index * spacing)
  }

  /**
   * Calculate orbit radius for moons
   */
  private static calculateMoonOrbitRadius(planetSize: number, moonIndex: number): number {
    return planetSize * 1.5 + (moonIndex * 0.8)
  }

  /**
   * Calculate orbit speed (inverse of radius for realistic motion)
   */
  private static calculateOrbitSpeed(radius: number): number {
    return Math.max(0.001, 0.02 / Math.sqrt(radius))
  }

  /**
   * Calculate moon orbit speed
   */
  private static calculateMoonOrbitSpeed(radius: number): number {
    return Math.max(0.005, 0.1 / Math.sqrt(radius))
  }

  /**
   * Generate sun color from token address
   */
  private static generateSunColor(tokenAddress: string): string {
    const hash = this.hashString(tokenAddress)
    const hue = hash % 360
    const saturation = 70 + (hash % 30)
    const lightness = 60 + (hash % 20)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  /**
   * Generate planet color based on sun color and index
   */
  private static generatePlanetColor(sunAddress: string, index: number): string {
    const baseHash = this.hashString(sunAddress)
    const planetHash = baseHash + index * 137 // Prime number for distribution
    const hue = (planetHash % 360)
    const saturation = 50 + (planetHash % 40)
    const lightness = 40 + (planetHash % 30)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  /**
   * Generate moon color based on parent planet
   */
  private static generateMoonColor(planetColor: string): string {
    // Extract HSL values and adjust
    const hslMatch = planetColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (hslMatch) {
      const hue = parseInt(hslMatch[1])
      const saturation = Math.max(20, parseInt(hslMatch[2]) - 20)
      const lightness = Math.max(20, parseInt(hslMatch[3]) - 20)
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
    return planetColor
  }

  /**
   * Calculate luminosity based on inflation and member count
   */
  private static calculateLuminosity(inflationRate: number, memberCount: number): number {
    const baseL = Math.min(1.0, inflationRate / 100)
    const memberBonus = Math.min(0.5, memberCount / 200)
    return baseL + memberBonus
  }

  /**
   * Calculate temperature based on inflation rate
   */
  private static calculateTemperature(inflationRate: number): number {
    return 3000 + (inflationRate * 50) // Kelvin
  }

  /**
   * Determine surface type based on node characteristics
   */
  private static determineSurfaceType(node: WillWeNodeData): 'rocky' | 'gaseous' | 'icy' {
    const totalSupply = node.basicInfo[11]
    const memberCount = node.membersOfNode.length
    
    if (totalSupply > 1000000) return 'gaseous'
    if (memberCount < 10) return 'icy'
    return 'rocky'
  }

  /**
   * Calculate tilt based on inflation rate
   */
  private static calculateTilt(inflationRate: number): number {
    return (inflationRate / 100) * Math.PI / 6 // Max 30 degrees
  }

  /**
   * Calculate total system value
   */
  private static calculateTotalValue(nodes: WillWeNodeData[]): number {
    return nodes.reduce((total, node) => total + node.basicInfo[11], 0)
  }

  /**
   * Calculate activity level based on recent activity
   */
  private static calculateActivityLevel(nodes: WillWeNodeData[]): 'low' | 'medium' | 'high' {
    const totalMembers = nodes.reduce((sum, node) => sum + node.membersOfNode.length, 0)
    const avgInflation = nodes.reduce((sum, node) => sum + node.basicInfo[1], 0) / nodes.length

    if (totalMembers > 100 && avgInflation > 50) return 'high'
    if (totalMembers > 20 && avgInflation > 10) return 'medium'
    return 'low'
  }

  /**
   * Calculate bounding box for the system
   */
  private static calculateBoundingBox(sun: SunProperties, planets: PlanetProperties[]) {
    const maxRadius = Math.max(...planets.map(p => p.orbitRadius + p.size))
    const padding = 2

    return {
      min: new Vector3(-maxRadius - padding, -maxRadius - padding, -maxRadius - padding),
      max: new Vector3(maxRadius + padding, maxRadius + padding, maxRadius + padding)
    }
  }

  /**
   * Extract token symbol from address (placeholder)
   */
  private static extractTokenSymbol(address: string): string {
    return address.slice(2, 6).toUpperCase()
  }

  /**
   * Extract token name from address (placeholder)
   */
  private static extractTokenName(address: string): string {
    return `Token ${address.slice(2, 8)}`
  }

  /**
   * Simple hash function for consistent color generation
   */
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
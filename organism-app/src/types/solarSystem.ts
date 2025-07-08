import { Vector3 } from 'three'

// Core WillWe data structures
export interface WillWeNodeData {
  basicInfo: [
    string,    // 0: node ID
    number,    // 1: inflation rate
    number,    // 2: reserve
    number,    // 3: budget
    number,    // 4: root val budget
    number,    // 5: root val reserve
    number,    // 6: membrane complexity
    number,    // 7: eligibility rate
    number,    // 8: last redist
    number,    // 9: user balance
    string,    // 10: user endpoint
    number     // 11: total supply
  ]
  membersOfNode: string[]
  childrenNodes: string[]
  rootPath: string[]
  signals: Signal[]
  rootTokenAddress: string
  hierarchyDepth: number
  position?: Vector3
  membraneName?: string  // Human-readable membrane name
  tokenSymbol?: string   // Token symbol for this node
  tokenName?: string     // Full token name
}

export interface Signal {
  id: string
  nodeId: string
  type: 'membrane' | 'inflation' | 'redistribution'
  value: number
  weight: number
  timestamp: number
  signer: string
}

export interface TokenFlow {
  id: string
  fromNode: string
  toNode: string
  amount: number
  type: 'minting' | 'burning' | 'redistribution' | 'inflation'
  timestamp: number
}

// Solar System specific types
export interface CelestialBody {
  id: string
  type: 'sun' | 'planet' | 'moon' | 'station' | 'satellite'
  position: Vector3
  size: number
  color: string
  nodeData: WillWeNodeData
}

export interface SunProperties extends CelestialBody {
  type: 'sun'
  luminosity: number
  temperature: number
  coronaEffect: boolean
  solarFlares: TokenFlow[]
  planets: PlanetProperties[]
}

export interface PlanetProperties extends CelestialBody {
  type: 'planet'
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  atmosphere: boolean
  rings: boolean
  surface: 'rocky' | 'gaseous' | 'icy'
  tilt: number
  moons: MoonProperties[]
  parentSun: string
}

export interface MoonProperties extends CelestialBody {
  type: 'moon'
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  phase: number
  craters: boolean
  tideLocked: boolean
  parentPlanet: string
}

export interface SpaceStationProperties extends CelestialBody {
  type: 'station'
  design: 'minimal' | 'industrial' | 'research'
  dockingPorts: number
  solarPanels: boolean
  orbitHeight: number
  beaconLight: boolean
  parentBody: string
}

export interface SatelliteProperties extends CelestialBody {
  type: 'satellite'
  antennas: number
  shape: 'cube' | 'sphere' | 'probe'
  trajectory: 'stable' | 'elliptical' | 'polar'
  signalStrength: number
  status: 'active' | 'dormant' | 'malfunction'
  parentBody: string
}

// Solar System container
export interface SolarSystem {
  id: string
  rootTokenAddress: string
  rootTokenSymbol: string
  rootTokenName: string
  sun: SunProperties
  planets: PlanetProperties[]
  totalValue: number
  totalNodes: number
  activityLevel: 'low' | 'medium' | 'high'
  boundingBox: {
    min: Vector3
    max: Vector3
  }
}

// Navigation and search
export interface SearchResult {
  id: string
  name: string
  type: 'sun' | 'planet' | 'moon' | 'station' | 'satellite'
  nodeId: string
  position: Vector3
  relevance: number
  system: string
}

export interface ViewState {
  mode: 'galaxy' | 'system' | 'planet' | 'detailed'
  target: string | null
  cameraPosition: Vector3
  cameraTarget: Vector3
  zoom: number
}

export interface NavigationFilters {
  nodeType: ('sun' | 'planet' | 'moon' | 'station' | 'satellite')[]
  activityLevel: ('low' | 'medium' | 'high')[]
  tokenRange: [number, number]
  userOwned: boolean
  hasChildren: boolean
}

// Orbital mechanics
export interface OrbitalParameters {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  longitudeOfAscendingNode: number
  argumentOfPeriapsis: number
  meanAnomaly: number
  period: number
}

export interface GravitationalField {
  center: Vector3
  mass: number
  radius: number
  influence: number
}

// Animation and effects
export interface AnimationState {
  type: 'idle' | 'orbiting' | 'signaling' | 'flowing' | 'executing'
  progress: number
  duration: number
  startTime: number
}

export interface ParticleEffect {
  id: string
  type: 'solar_wind' | 'token_flow' | 'signal_wave' | 'explosion'
  position: Vector3
  velocity: Vector3
  life: number
  maxLife: number
  color: string
  size: number
}

// User interactions
export interface SelectionState {
  selectedBody: CelestialBody | null
  hoveredBody: CelestialBody | null
  detailLevel: 'overview' | 'detailed' | 'operations'
  panelPosition: { x: number; y: number }
}

export interface OperationContext {
  type: 'signal' | 'movement' | 'spawn' | 'chat'
  targetNode: string
  userAddress: string
  availableActions: string[]
  requirements: {
    tokens: { address: string; amount: number }[]
    memberships: string[]
    permissions: string[]
  }
}

// Performance optimization
export interface LODConfig {
  maxDistance: number
  levels: {
    distance: number
    detail: number
    visible: boolean
  }[]
}

export interface RenderStats {
  fps: number
  memoryUsage: number
  drawCalls: number
  triangles: number
  visibleBodies: number
  culledBodies: number
}

// Color system
export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  glow: string
}

// Utility types
export type NodeHierarchy = {
  [nodeId: string]: {
    parent: string | null
    children: string[]
    depth: number
  }
}

export type SystemMetrics = {
  totalSupply: number
  totalMembers: number
  activityScore: number
  governanceHealth: number
  tokenVelocity: number
}
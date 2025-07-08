import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { NodeData, TokenFlow } from './types/nodeData'
import { WillWeNodeData, SolarSystem, CelestialBody, ViewState } from './types/solarSystem'
import { SolarSystemTransform } from './utils/solarSystemTransform'
import { SolarSystemContainer } from './components/SolarSystem'
import { NodeInfoOverlay } from './components/NodeInfoOverlay'
import { NavigationHeader } from './components/Navigation/NavigationHeader'
import { OperationsPanel } from './components/Operations/OperationsPanel'
import { createOnchainDataFetcher } from './utils/onchainData'

// Transform NodeData to WillWeNodeData
const transformNodeData = (nodeData: NodeData): WillWeNodeData => {
  return {
    ...nodeData,
    hierarchyDepth: nodeData.hierarchyDepth || 0,
    position: nodeData.position ? 
      new THREE.Vector3(nodeData.position.x, nodeData.position.y, nodeData.position.z) : 
      undefined
  }
}

// Mock data for demonstration
const generateMockData = (): WillWeNodeData[] => {
  const mockNodes: WillWeNodeData[] = []
  
  // Root node
  const rootNode: WillWeNodeData = {
    basicInfo: [
      '0x1234567890abcdef',
      100, // inflation rate
      1000000, // reserve
      500000, // budget
      2000000, // root val budget
      1500000, // root val reserve
      5, // membrane complexity
      50, // eligibility rate
      Date.now(), // last redist
      10000, // user balance
      '0xuser123', // user endpoint
      5000000 // total supply
    ],
    membersOfNode: new Array(25).fill(0).map((_, i) => `0xmember${i}`),
    childrenNodes: ['0xchild1', '0xchild2', '0xchild3'],
    rootPath: [],
    signals: [],
    rootTokenAddress: '0xroot123456789abcdef',
    hierarchyDepth: 0,
    membraneName: 'WillWe Genesis',
    tokenSymbol: 'WILL',
    tokenName: 'WillWe Token'
  }
  mockNodes.push(rootNode)
  
  // Child nodes
  const childMembranes = ['DeFi Colony', 'Gaming Nexus', 'Creator Collective']
  const childTokens = [
    { symbol: 'DEFI', name: 'DeFi Colony Token' },
    { symbol: 'GAME', name: 'Gaming Nexus Token' },
    { symbol: 'CRTR', name: 'Creator Token' }
  ]
  
  for (let i = 1; i <= 3; i++) {
    const childNode: WillWeNodeData = {
      basicInfo: [
        `0xchild${i}`,
        50 + i * 10, // inflation rate
        300000 + i * 50000, // reserve
        200000 + i * 30000, // budget
        500000 + i * 100000, // root val budget
        400000 + i * 80000, // root val reserve
        3 + i, // membrane complexity
        20 + i * 5, // eligibility rate
        Date.now() - i * 1000, // last redist
        5000 + i * 1000, // user balance
        `0xuser${i}`, // user endpoint
        1000000 + i * 200000 // total supply
      ],
      membersOfNode: new Array(10 + i * 3).fill(0).map((_, j) => `0xmember${i}_${j}`),
      childrenNodes: i === 1 ? ['0xgrandchild1', '0xgrandchild2'] : [],
      rootPath: ['0x1234567890abcdef'],
      signals: [],
      rootTokenAddress: '0xroot123456789abcdef',
      hierarchyDepth: 1,
      membraneName: childMembranes[i - 1],
      tokenSymbol: childTokens[i - 1].symbol,
      tokenName: childTokens[i - 1].name
    }
    mockNodes.push(childNode)
  }
  
  // Grandchild nodes
  const grandchildMembranes = ['Yield Farmers', 'Liquidity Providers']
  const grandchildTokens = [
    { symbol: 'YIELD', name: 'Yield Farm Token' },
    { symbol: 'LQTY', name: 'Liquidity Token' }
  ]
  
  for (let i = 1; i <= 2; i++) {
    const grandchildNode: WillWeNodeData = {
      basicInfo: [
        `0xgrandchild${i}`,
        30 + i * 5, // inflation rate
        100000 + i * 20000, // reserve
        80000 + i * 15000, // budget
        200000 + i * 40000, // root val budget
        150000 + i * 30000, // root val reserve
        2 + i, // membrane complexity
        10 + i * 3, // eligibility rate
        Date.now() - i * 2000, // last redist
        2000 + i * 500, // user balance
        `0xuser_gc${i}`, // user endpoint
        300000 + i * 100000 // total supply
      ],
      membersOfNode: new Array(5 + i * 2).fill(0).map((_, j) => `0xmember_gc${i}_${j}`),
      childrenNodes: [],
      rootPath: ['0x1234567890abcdef', '0xchild1'],
      signals: [],
      rootTokenAddress: '0xroot123456789abcdef',
      hierarchyDepth: 2,
      membraneName: grandchildMembranes[i - 1],
      tokenSymbol: grandchildTokens[i - 1].symbol,
      tokenName: grandchildTokens[i - 1].name
    }
    mockNodes.push(grandchildNode)
  }
  
  return mockNodes
}

const generateMockFlows = (nodes: WillWeNodeData[]): TokenFlow[] => {
  const flows: TokenFlow[] = []
  
  // Generate some sample flows
  flows.push(
    {
      type: 'minting',
      from: '0x1234567890abcdef',
      to: '0xchild1',
      amount: 1000,
      timestamp: Date.now(),
      particleColor: '#00ff88'
    },
    {
      type: 'burning',
      from: '0xchild2',
      to: '0x1234567890abcdef',
      amount: 500,
      timestamp: Date.now(),
      particleColor: '#ff4444'
    },
    {
      type: 'redistribution',
      from: '0xchild1',
      to: '0xchild2',
      amount: 300,
      timestamp: Date.now(),
      particleColor: '#4488ff'
    },
    {
      type: 'inflation',
      from: '0x1234567890abcdef',
      to: '0xchild1',
      amount: 200,
      timestamp: Date.now(),
      particleColor: '#ffaa00'
    }
  )
  
  return flows
}

const CameraController = ({ selectedBody }: { selectedBody: CelestialBody | null }) => {
  const { camera } = useThree()
  
  React.useEffect(() => {
    if (selectedBody) {
      const targetPosition = new THREE.Vector3(
        selectedBody.position.x,
        selectedBody.position.y + 2,
        selectedBody.position.z + 3
      )
      
      // Smooth camera movement
      const startPosition = camera.position.clone()
      const startTime = Date.now()
      const duration = 1000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress)
        camera.lookAt(selectedBody.position.x, selectedBody.position.y, selectedBody.position.z)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
  }, [selectedBody, camera])
  
  return null
}

export default function App() {
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [nodes, setNodes] = useState<WillWeNodeData[]>([])
  const [isUsingOnchainData, setIsUsingOnchainData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // View state for navigation
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'system',
    target: null,
    cameraPosition: new THREE.Vector3(0, 5, 10),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    zoom: 1.0
  })
  
  // Initialize with mock data
  const mockNodes = useMemo(() => generateMockData(), [])
  const flows = useMemo(() => generateMockFlows(nodes.length > 0 ? nodes : mockNodes), [nodes, mockNodes])
  
  // Transform nodes to solar systems (array for navigation)
  const solarSystems = useMemo(() => {
    const activeNodes = nodes.length > 0 ? nodes : mockNodes
    try {
      const system = SolarSystemTransform.transformToSolarSystem(activeNodes)
      return system ? [system] : []
    } catch (error) {
      console.error('Failed to transform to solar system:', error)
      return []
    }
  }, [nodes, mockNodes])
  
  // Main solar system for rendering
  const solarSystem = solarSystems[0] || null
  
  // Set initial nodes to mock data
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(mockNodes)
    }
  }, [mockNodes, nodes.length])
  
  const handleBodyClick = useCallback(async (body: CelestialBody, event?: React.MouseEvent) => {
    setSelectedBody(body)
    if (event) {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
    
    // If using onchain data, fetch updated node information
    if (isUsingOnchainData) {
      try {
        const dataFetcher = createOnchainDataFetcher()
        const updatedNodeData = await dataFetcher.fetchNodeData(body.nodeData.basicInfo[0])
        // Update the selected body with new data
        setSelectedBody({
          ...body,
          nodeData: transformNodeData(updatedNodeData)
        })
      } catch (err) {
        console.error('Failed to fetch updated node data:', err)
      }
    }
  }, [isUsingOnchainData])
  
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only close if clicking on canvas background
    const target = event.target as HTMLElement
    if (target.tagName === 'CANVAS') {
      setSelectedBody(null)
    }
  }, [])
  
  const handleUserAddressChange = useCallback((address: string) => {
    setUserAddress(address)
    setIsUsingOnchainData(true)
  }, [])
  
  const handleAreaSelected = useCallback((areaNodes: WillWeNodeData[]) => {
    if (areaNodes.length > 0) {
      setNodes(areaNodes)
      setSelectedBody(null)
      setError(null)
    }
  }, [])
  
  const switchToMockData = useCallback(() => {
    setNodes(mockNodes)
    setIsUsingOnchainData(false)
    setUserAddress(null)
    setSelectedBody(null)
    setError(null)
  }, [mockNodes])
  
  // Navigation handlers
  const handleViewChange = useCallback((newState: Partial<ViewState>) => {
    setViewState(prev => ({ ...prev, ...newState }))
  }, [])
  
  const handleFocusBody = useCallback((body: CelestialBody) => {
    setSelectedBody(body)
    setViewState(prev => ({
      ...prev,
      target: body.id,
      cameraTarget: body.position
    }))
  }, [])
  
  const handleNavigate = useCallback((position: { x: number; y: number; z: number }) => {
    setViewState(prev => ({
      ...prev,
      cameraTarget: new THREE.Vector3(position.x, position.y, position.z)
    }))
  }, [])
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0e1a' }}>
      {/* Navigation Header */}
      <NavigationHeader
        solarSystems={solarSystems}
        selectedBody={selectedBody}
        viewState={viewState}
        onViewChange={handleViewChange}
        onFocusBody={handleFocusBody}
        onNavigate={handleNavigate}
        isUsingOnchainData={isUsingOnchainData}
        onDataSourceToggle={switchToMockData}
      />
      
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        onClick={handleCanvasClick}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4444ff" />
        
        {/* Environment */}
        <Stars 
          radius={300} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        {/* Ground plane for reference */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#111122" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Solar System */}
        {solarSystem && (
          <SolarSystemContainer
            solarSystem={solarSystem}
            onBodyClick={handleBodyClick}
            selectedBody={selectedBody}
            levelOfDetail={1} // For now, show all details
            timeSpeed={1.0}
            flows={flows}
          />
        )}
        
        {/* Camera Controller */}
        <CameraController selectedBody={selectedBody} />
        
        {/* Orbit Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={50}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {/* Operations Panel */}
      <OperationsPanel
        selectedBody={selectedBody}
        onClose={() => setSelectedBody(null)}
        position={mousePosition}
      />
      
      
      
      {/* Error Display */}
      {error && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          Error: {error}
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff88',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          Loading onchain data...
        </div>
      )}
    </div>
  )
}
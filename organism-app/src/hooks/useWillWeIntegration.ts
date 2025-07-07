import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { WillWeNodeData, Signal } from '../types/solarSystem'

// WillWe Contract ABI (simplified for demonstration)
const WILLWE_ABI = [
  "function getBasicInfo(uint256 nodeId) external view returns (uint256[12] memory)",
  "function getMembers(uint256 nodeId) external view returns (address[] memory)",
  "function getChildren(uint256 nodeId) external view returns (uint256[] memory)",
  "function signalMembrane(uint256 nodeId, uint256 newMembraneId) external",
  "function signalInflation(uint256 nodeId, uint256 newRate) external",
  "function signalRedistribution(uint256 nodeId, uint256[] calldata targets, uint256[] calldata weights) external",
  "function createMovement(uint256 nodeId, string calldata description, bytes calldata execution) external returns (uint256)",
  "function signMovement(uint256 movementId) external",
  "function executeMovement(uint256 movementId) external",
  "event SignalSubmitted(uint256 indexed nodeId, address indexed signer, uint256 signalType, uint256 value)",
  "event MovementCreated(uint256 indexed movementId, uint256 indexed nodeId, address indexed creator)",
  "event MovementSigned(uint256 indexed movementId, address indexed signer)",
  "event MovementExecuted(uint256 indexed movementId)"
]

interface WillWeHookConfig {
  contractAddress?: string
  rpcUrl?: string
  chainId?: number
}

interface WillWeState {
  isConnected: boolean
  account: string | null
  provider: ethers.Provider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  chainId: number | null
  isLoading: boolean
  error: string | null
}

export const useWillWeIntegration = (config: WillWeHookConfig = {}) => {
  const [state, setState] = useState<WillWeState>({
    isConnected: false,
    account: null,
    provider: null,
    signer: null,
    contract: null,
    chainId: null,
    isLoading: false,
    error: null
  })

  // Initialize connection
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      if (!window.ethereum) {
        throw new Error('No Web3 wallet found. Please install MetaMask.')
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const account = await signer.getAddress()
      const network = await provider.getNetwork()

      // Create contract instance if address provided
      let contract = null
      if (config.contractAddress) {
        contract = new ethers.Contract(config.contractAddress, WILLWE_ABI, signer)
      }

      setState({
        isConnected: true,
        account,
        provider,
        signer,
        contract,
        chainId: Number(network.chainId),
        isLoading: false,
        error: null
      })

      // Set up event listeners
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet'
      }))
    }
  }, [config.contractAddress])

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      provider: null,
      signer: null,
      contract: null,
      chainId: null,
      isLoading: false,
      error: null
    })

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      // Reconnect with new account
      connect()
    }
  }, [connect, disconnect])

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    // Reconnect to update chain info
    connect()
  }, [connect])

  // Fetch node data from contract
  const fetchNodeData = useCallback(async (nodeId: string): Promise<WillWeNodeData | null> => {
    if (!state.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const [basicInfo, members, children] = await Promise.all([
        state.contract.getBasicInfo(nodeId),
        state.contract.getMembers(nodeId),
        state.contract.getChildren(nodeId)
      ])

      // Convert to WillWeNodeData format
      const nodeData: WillWeNodeData = {
        basicInfo: basicInfo.map((val: any) => Number(val)),
        membersOfNode: members,
        childrenNodes: children.map((id: any) => id.toString()),
        rootPath: [], // Would need additional contract call to get this
        signals: [], // Would need to fetch from events
        rootTokenAddress: '', // Would need additional contract call
        hierarchyDepth: 0 // Would need to calculate
      }

      return nodeData
    } catch (error: any) {
      console.error('Failed to fetch node data:', error)
      throw new Error(`Failed to fetch node data: ${error.message}`)
    }
  }, [state.contract])

  // Submit signal
  const submitSignal = useCallback(async (
    nodeId: string,
    signalType: 'membrane' | 'inflation' | 'redistribution',
    value: any
  ): Promise<string> => {
    if (!state.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      let tx
      switch (signalType) {
        case 'membrane':
          tx = await state.contract.signalMembrane(nodeId, value)
          break
        case 'inflation':
          tx = await state.contract.signalInflation(nodeId, value)
          break
        case 'redistribution':
          tx = await state.contract.signalRedistribution(nodeId, value.targets, value.weights)
          break
        default:
          throw new Error(`Unknown signal type: ${signalType}`)
      }

      return tx.hash
    } catch (error: any) {
      console.error('Failed to submit signal:', error)
      throw new Error(`Failed to submit signal: ${error.message}`)
    }
  }, [state.contract])

  // Create movement
  const createMovement = useCallback(async (
    nodeId: string,
    description: string,
    execution: string
  ): Promise<string> => {
    if (!state.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await state.contract.createMovement(nodeId, description, execution)
      return tx.hash
    } catch (error: any) {
      console.error('Failed to create movement:', error)
      throw new Error(`Failed to create movement: ${error.message}`)
    }
  }, [state.contract])

  // Sign movement
  const signMovement = useCallback(async (movementId: string): Promise<string> => {
    if (!state.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await state.contract.signMovement(movementId)
      return tx.hash
    } catch (error: any) {
      console.error('Failed to sign movement:', error)
      throw new Error(`Failed to sign movement: ${error.message}`)
    }
  }, [state.contract])

  // Execute movement
  const executeMovement = useCallback(async (movementId: string): Promise<string> => {
    if (!state.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await state.contract.executeMovement(movementId)
      return tx.hash
    } catch (error: any) {
      console.error('Failed to execute movement:', error)
      throw new Error(`Failed to execute movement: ${error.message}`)
    }
  }, [state.contract])

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet found')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Network not added to wallet')
      }
      throw new Error(`Failed to switch network: ${error.message}`)
    }
  }, [])

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            await connect()
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error)
        }
      }
    }

    checkConnection()
  }, [connect])

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    
    // Contract interactions
    fetchNodeData,
    submitSignal,
    createMovement,
    signMovement,
    executeMovement,
    
    // Utilities
    isWalletInstalled: !!window.ethereum,
    canInteract: state.isConnected && state.contract,
  }
}

// Global type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

export default useWillWeIntegration
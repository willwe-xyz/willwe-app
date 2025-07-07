import React from 'react'
import { useWillWeIntegration } from '../../hooks/useWillWeIntegration'

interface WalletConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void
  className?: string
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnectionChange,
  className = ''
}) => {
  const {
    isConnected,
    account,
    chainId,
    isLoading,
    error,
    connect,
    disconnect,
    switchNetwork,
    isWalletInstalled
  } = useWillWeIntegration({
    contractAddress: '0x...', // WillWe contract address would go here
    chainId: 1 // Ethereum mainnet
  })

  React.useEffect(() => {
    onConnectionChange?.(isConnected)
  }, [isConnected, onConnectionChange])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(1) // Switch to Ethereum mainnet
    } catch (error) {
      console.error('Network switch failed:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 5: return 'Goerli'
      case 11155111: return 'Sepolia'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      default: return `Chain ${chainId}`
    }
  }

  if (!isWalletInstalled) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <h3 className="text-red-300 font-medium">Wallet Required</h3>
              <p className="text-red-400 text-sm">Please install MetaMask or another Web3 wallet</p>
            </div>
          </div>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-red-400 text-xl">❌</span>
              <div>
                <h3 className="text-red-300 font-medium">Connection Error</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={handleConnect}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center space-x-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>🔗</span>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="bg-green-600/20 border border-green-400/40 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-green-400 text-xl">✅</span>
            <div>
              <h3 className="text-green-300 font-medium">Wallet Connected</h3>
              <div className="text-green-400 text-sm space-y-1">
                <div>Address: {formatAddress(account!)}</div>
                <div>Network: {getNetworkName(chainId)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {chainId !== 1 && (
              <button
                onClick={handleSwitchNetwork}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                title="Switch to Ethereum mainnet"
              >
                Switch Network
              </button>
            )}
            
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletConnection
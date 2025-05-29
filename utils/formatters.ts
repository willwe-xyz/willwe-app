import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';

/**
 * Helper function to check if a string is a valid hex string
 */
const isHexString = (value: string): boolean => {
  return /^0x[0-9a-fA-F]*$/.test(value);
};

/**
 * Converts a node ID to its proper address format
 * Handles different input formats: hex string, number, or bigint
 */
export const nodeIdToAddress = (nodeId: string | number | bigint): string => {
  try {
    // If already a hex address of correct length, return as is
    if (typeof nodeId === 'string' && isHexString(nodeId) && nodeId.length === 42) {
      return nodeId.toLowerCase();
    }

    // Convert to BigInt first to handle large numbers
    let bigIntValue: bigint;
    if (typeof nodeId === 'string') {
      // Remove '0x' prefix if present for numeric conversion
      const cleanNodeId = nodeId.startsWith('0x') ? nodeId.slice(2) : nodeId;
      bigIntValue = BigInt(cleanNodeId);
    } else {
      bigIntValue = BigInt(nodeId);
    }

    // Convert to hex and pad to 20 bytes (40 hex chars)
    let hexString = bigIntValue.toString(16);
    hexString = hexString.padStart(40, '0');
    
    // Add 0x prefix
    return ethers.getAddress('0x' + hexString);
  } catch (error) {
    console.error('Error converting node ID to address:', error);
    throw new Error('Invalid node ID format');
  }
};

/**
 * Converts an address to a node ID number
 */
export const addressToNodeId = (address: string): string => {
  try {
    if (!address || address === ethers.ZeroAddress) {
      throw new Error('Empty or zero address');
    }
    if (!isHexString(address)) {
      throw new Error('Invalid address format');
    }
    // Remove '0x' prefix and convert to decimal string
    const nodeId = BigInt(address).toString();
    return nodeId;
  } catch (error) {
    console.error('Error converting address to node ID:', error);
    throw error; // Propagate the specific error
  }
};

/**
 * Formats a balance value for display
 */
export const formatBalance = (value: string | bigint | undefined | null): string => {
  if (!value) return '0';
  try {
    const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
    return ethers.formatUnits(bigIntValue, 18);
  } catch {
    return '0';
  }
};

/**
 * Formats a percentage value with 2 decimal places
 */
export const formatPercentage = (value: number): string => {
  return (Math.round(value * 100) / 100).toFixed(2) + '%';
};

export const isEndpoint = (nodeId: string, parentNodeId: string): boolean => {
  // Check if first 10 digits of nodeId are different from parentNodeId
  return nodeId.slice(0, 10) !== parentNodeId.slice(0, 10);
};

// Array of random emojis for WillWe-owned endpoints
const ENDPOINT_EMOJIS = ['🚀', '🌟', '💫', '✨', '⚡', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠'];

export const getEndpointDisplayName = async (
  nodeId: string,
  parentNodeId: string,
  provider: ethers.Provider,
  chainId: string
): Promise<string> => {
  // If not an endpoint, return empty string
  if (!isEndpoint(nodeId, parentNodeId)) {
    return '';
  }

  try {
    // Get the endpoint address
    const endpointAddress = nodeIdToAddress(nodeId);

    // Get the WillWe contract address for this chain
    const willweAddress = deployments.WillWe[chainId];

    // Call owner() on the endpoint (PowerProxy) contract
    const powerProxy = new ethers.Contract(
      endpointAddress,
      ['function owner() view returns (address)'],
      provider
    );
    const ownerAddress = await powerProxy.owner();

    // If owner is Execution contract, it's an execution endpoint
    const executionAddress = deployments.Execution[chainId];
    if (ownerAddress.toLowerCase() === executionAddress.toLowerCase()) {
      // Execution endpoint: random emoji
      try {
        // Get all endpoints for this parent node
        const willweContract = new ethers.Contract(
          willweAddress,
          ABIs.WillWe,
          provider
        );
        const nodeData = await willweContract.getNodeData(parentNodeId, ethers.ZeroAddress);
        const endpoints = nodeData.movementEndpoints || [];
        const index = endpoints.findIndex((ep: string) => ep.toLowerCase() === endpointAddress.toLowerCase());
        const emojiIndex = index % ENDPOINT_EMOJIS.length;
        return ENDPOINT_EMOJIS[emojiIndex];
      } catch (error) {
        const addressHash = ethers.keccak256(ethers.toUtf8Bytes(endpointAddress));
        const emojiIndex = Number(addressHash.slice(0, 8)) % ENDPOINT_EMOJIS.length;
        return ENDPOINT_EMOJIS[emojiIndex];
      }
    }

    // User endpoint: door emoji + ENS or address
    try {
      // Use our internal API endpoint to get token metadata
      let baseUrl = '';
      if (typeof window !== 'undefined') {
        // Client-side
        baseUrl = window.location.origin;
      } else {
        // Server-side
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      }
      const response = await fetch(`${baseUrl}/api/tokens/metadata?address=${ownerAddress}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token metadata');
      }
      const data = await response.json();
      if (data.metadata?.name) {
        return `🚪 ${data.metadata.name}`;
      }
    } catch (error) {
      console.warn('Error looking up token metadata:', error);
    }
    return `🚪 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;
  } catch (error) {
    console.error('Error getting endpoint display name:', error);
    const endpointAddress = nodeIdToAddress(nodeId);
    return `🚪 ${endpointAddress.slice(0, 6)}...${endpointAddress.slice(-4)}`;
  }
};
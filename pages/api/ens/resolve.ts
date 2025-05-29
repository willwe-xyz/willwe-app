import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { createPublicClient, http, keccak256, type Address } from 'viem';
import { base } from 'viem/chains';

// Base L2 Reverse Registrar contract address
const BASE_REVERSE_REGISTRAR = '0x79ea96012eea67a83431f1701b3dff7e37f9e282';

// Base L2 Resolver contract address
const BASE_RESOLVER = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

// RPC client for Base network
const baseRpcClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL|| 'https://mainnet.base.org'),
});

// ABI for the reverse registrar's node function
const REVERSE_REGISTRAR_ABI = [
  {
    inputs: [{ type: 'address', name: 'addr' }],
    name: 'node',
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  }
];

// ABI for the resolver's name function
const RESOLVER_ABI = [
  {
    inputs: [{ type: 'bytes32', name: 'node' }],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  }
];

// Global cache with TTL (Time To Live)
interface CacheEntry {
  value: string;
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const addressResolutionCache = new Map<string, CacheEntry>();

// Function to check if cache entry is still valid
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

// Function to get from cache with TTL check
const getFromCache = (address: string): string | null => {
  const lowerAddress = address.toLowerCase();
  const entry = addressResolutionCache.get(lowerAddress);
  
  if (entry && isCacheValid(entry)) {
    return entry.value;
  }
  
  return null;
};

// Function to set cache with timestamp
const setCache = (address: string, value: string) => {
  const lowerAddress = address.toLowerCase();
  addressResolutionCache.set(lowerAddress, {
    value,
    timestamp: Date.now()
  });
};

/**
 * Calculate the reverse resolution node for an address on Base
 */
function calculateReverseNode(address: Address): `0x${string}` {
  const cleanAddress = address.toLowerCase().substring(2);
  const addrHash = keccak256(`0x${cleanAddress}` as Address);
  const baseReverseNamespace = '8000014A.reverse';
  const baseReverseNode = calculateNameHash(baseReverseNamespace);
  return keccak256(`0x${baseReverseNode.substring(2)}${addrHash.substring(2)}` as `0x${string}`);
}

/**
 * Calculate ENS namehash for a name
 */
function calculateNameHash(name: string): `0x${string}` {
  let node: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (!name) return node;
  const labels = name.split('.');
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = keccak256(`0x${Buffer.from(labels[i]).toString('hex')}` as `0x${string}`);
    node = keccak256(`0x${node.substring(2)}${labelHash.substring(2)}` as `0x${string}`);
  }
  return node;
}

/**
 * Lookup the Base ENS name for an Ethereum address
 */
async function lookupBaseENS(address: Address): Promise<string | undefined> {
  try {
    // First get the node for the address from ReverseRegistrar
    const node = await baseRpcClient.readContract({
      address: BASE_REVERSE_REGISTRAR,
      abi: REVERSE_REGISTRAR_ABI,
      functionName: 'node',
      args: [address],
    });
    
    // Then get the name for that node from the Resolver
    const result = await baseRpcClient.readContract({
      address: BASE_RESOLVER,
      abi: RESOLVER_ABI,
      functionName: 'name',
      args: [node],
    });
    
    if (result && typeof result === 'string' && result.endsWith('.base.eth')) {
      return result;
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Resolves an Ethereum address to its Base ENS name first, then regular ENS name if available, otherwise returns a truncated address
 */
async function resolveENS(address: string): Promise<string> {
  if (!address || !ethers.isAddress(address)) {
    return address;
  }

  const lowerAddress = address.toLowerCase();
  
  // Check cache first
  const cachedResolution = getFromCache(lowerAddress);
  if (cachedResolution) {
    return cachedResolution;
  }

  try {
    // First try to resolve Base ENS
    const baseENSName = await lookupBaseENS(address as Address);
    if (baseENSName) {
      setCache(lowerAddress, baseENSName);
      return baseENSName;
    }

    // If no Base ENS, try regular ENS
    const mainnetProvider = new ethers.JsonRpcProvider(process.env.RPC_URL_MAINNET);
    const ensName = await mainnetProvider.lookupAddress(address);
    
    if (ensName) {
      setCache(lowerAddress, ensName);
      return ensName;
    }
  } catch (error) {
    // Error handling without console.log
  }

  // Fallback to truncated address
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  setCache(lowerAddress, truncatedAddress);
  return truncatedAddress;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid address parameter' });
  }

  try {
    const resolvedName = await resolveENS(address);
    res.status(200).json({ name: resolvedName });
  } catch (error) {
    console.error('Error resolving ENS:', error);
    res.status(500).json({ error: 'Failed to resolve ENS name' });
  }
} 
import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';
import { createPublicClient, http, keccak256, type Address } from 'viem';
import { base } from 'viem/chains';

/**
 * Type definition for Base ENS names (always ending with .base.eth)
 */
export type BaseENSName = `${string}.base.eth`;

/**
 * Base L2 Reverse Registrar contract address
 */
const BASE_REVERSE_REGISTRAR = '0x79ea96012eea67a83431f1701b3dff7e37f9e282';

/**
 * Base L2 Resolver contract address
 */
const BASE_RESOLVER = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

/**
 * RPC client for Base network
 */
const baseRpcClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org'),
});

/**
 * ABI for the reverse registrar's node function
 */
const REVERSE_REGISTRAR_ABI = [
  {
    inputs: [{ type: 'address', name: 'addr' }],
    name: 'node',
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  }
];

/**
 * ABI for the resolver's name function
 */
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

// Debug function to log cache state
const logCacheState = (address: string, action: string) => {
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`Cache ${action} for ${address}:`, {
  //     cacheSize: addressResolutionCache.size,
  //     hasEntry: addressResolutionCache.has(address.toLowerCase()),
  //     entry: addressResolutionCache.get(address.toLowerCase())
  //   });
  // }
};

// Function to check if cache entry is still valid
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

// Function to get from cache with TTL check
const getFromCache = (address: string): string | null => {
  const lowerAddress = address.toLowerCase();
  const entry = addressResolutionCache.get(lowerAddress);
  
  if (entry && isCacheValid(entry)) {
    logCacheState(lowerAddress, 'HIT');
    return entry.value;
  }
  
  if (entry) {
    logCacheState(lowerAddress, 'EXPIRED');
  } else {
    logCacheState(lowerAddress, 'MISS');
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
  logCacheState(lowerAddress, 'SET');
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
async function lookupBaseENS(address: Address): Promise<BaseENSName | undefined> {
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
      return result as BaseENSName;
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Resolves an Ethereum address to its Base ENS name first, then regular ENS name if available, otherwise returns a truncated address
 */
export async function resolveENS(address: string): Promise<string> {
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
    // First try Base ENS resolution
    const baseENSName = await lookupBaseENS(address as Address);
    if (baseENSName) {
      setCache(lowerAddress, baseENSName);
      return baseENSName;
    }

    // If Base ENS fails, try regular ENS resolution
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const ensName = await provider.lookupAddress(address);
    
    if (ensName) {
      setCache(lowerAddress, ensName);
      return ensName;
    }

    // If both ENS resolutions fail, return truncated address
    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    setCache(lowerAddress, truncatedAddress);
    return truncatedAddress;
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    // Fallback to truncated address
    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    setCache(lowerAddress, truncatedAddress);
    return truncatedAddress;
  }
}

/**
 * Batch resolves multiple addresses to their ENS names
 * This is more efficient than resolving one by one
 */
export async function resolveMultipleENS(addresses: string[]): Promise<Record<string, string>> {
  const uniqueAddresses = Array.from(new Set(addresses.map(addr => addr.toLowerCase())));
  const results: Record<string, string> = {};
  
  // First check cache for all addresses
  const addressesToResolve: string[] = [];
  
  for (const address of uniqueAddresses) {
    const cached = getFromCache(address);
    if (cached) {
      results[address] = cached;
    } else {
      addressesToResolve.push(address);
    }
  }

  // If all addresses were cached, return early
  if (addressesToResolve.length === 0) {
    return results;
  }

  // Resolve remaining addresses in parallel
  const resolutionPromises = addressesToResolve.map(async (address) => {
    const resolved = await resolveENS(address);
    results[address] = resolved;
    return { address, resolved };
  });

  await Promise.all(resolutionPromises);
  return results;
} 
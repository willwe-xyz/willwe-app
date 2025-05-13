import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';

// Cache for storing resolved ENS names
const ensCache: { [address: string]: { name: string; timestamp: number } } = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Resolves an Ethereum address to its ENS name if available, otherwise returns a truncated address
 * @param address The Ethereum address to resolve
 * @returns A promise that resolves to the ENS name or truncated address
 */
export async function resolveENS(address: string): Promise<string> {
  if (!address || !ethers.isAddress(address)) {
    return address;
  }

  // Check cache first
  const cached = ensCache[address];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.name;
  }

  try {
    // Use the same provider configuration as NodeInfo.tsx
    const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));
    const ensName = await mainnetProvider.lookupAddress(address);
    
    if (ensName) {
      // Cache the result
      ensCache[address] = {
        name: ensName,
        timestamp: Date.now()
      };
      return ensName;
    }
  } catch (error) {
    console.error(`Error resolving ENS for ${address}:`, error);
    // If we hit a rate limit, return the cached value even if expired
    if (cached) {
      return cached.name;
    }
  }

  // Fallback to truncated address
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  // Cache the truncated address to prevent repeated API calls for the same address
  ensCache[address] = {
    name: truncatedAddress,
    timestamp: Date.now()
  };
  
  return truncatedAddress;
}

/**
 * Resolves multiple Ethereum addresses to their ENS names in parallel
 * @param addresses Array of Ethereum addresses to resolve
 * @returns A promise that resolves to an array of resolved names/addresses
 */
export async function resolveMultipleENS(addresses: string[]): Promise<string[]> {
  // Filter out duplicates and addresses already in cache
  const uniqueAddresses = Array.from(new Set(addresses));
  const addressesToResolve = uniqueAddresses.filter(addr => {
    const cached = ensCache[addr];
    return !cached || Date.now() - cached.timestamp >= CACHE_DURATION;
  });

  // Resolve only the addresses that need updating
  if (addressesToResolve.length > 0) {
    try {
      const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));
      const results = await Promise.all(
        addressesToResolve.map(addr => mainnetProvider.lookupAddress(addr))
      );

      // Update cache with new results
      addressesToResolve.forEach((addr, index) => {
        const resolvedName = results[index] || `${addr.slice(0, 6)}...${addr.slice(-4)}`;
        ensCache[addr] = {
          name: resolvedName,
          timestamp: Date.now()
        };
      });
    } catch (error) {
      console.error('Error resolving multiple ENS names:', error);
    }
  }

  // Return results from cache
  return uniqueAddresses.map(addr => {
    const cached = ensCache[addr];
    return cached ? cached.name : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  });
} 
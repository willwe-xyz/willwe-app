import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';

/**
 * Resolves an Ethereum address to its ENS name if available, otherwise returns a truncated address
 * @param address The Ethereum address to resolve
 * @returns A promise that resolves to the ENS name or truncated address
 */
export async function resolveENS(address: string): Promise<string> {
  if (!address || !ethers.isAddress(address)) {
    return address;
  }

  try {
    // Use the same provider configuration as NodeInfo.tsx
    const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));
    const ensName = await mainnetProvider.lookupAddress(address);
    
    if (ensName) {
      return ensName;
    }
  } catch (error) {
    console.error(`Error resolving ENS for ${address}:`, error);
  }

  // Fallback to truncated address
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Resolves multiple Ethereum addresses to their ENS names in parallel
 * @param addresses Array of Ethereum addresses to resolve
 * @returns A promise that resolves to an array of resolved names/addresses
 */
export async function resolveMultipleENS(addresses: string[]): Promise<string[]> {
  return Promise.all(addresses.map(addr => resolveENS(addr)));
} 
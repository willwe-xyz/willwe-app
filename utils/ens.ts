import { ethers } from 'ethers';

// Cache for ENS names to reduce RPC calls
const ensCache: Record<string, string> = {};

// Provider for mainnet (ENS is on mainnet)
const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com'
);

/**
 * Check if a string is a valid Ethereum address
 * @param address The string to check
 * @returns boolean indicating if the string is a valid address
 */
function isAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Resolve an Ethereum address to an ENS name
 * @param address The Ethereum address to resolve
 * @returns The ENS name if found, otherwise the original address
 */
export async function resolveENS(address: string): Promise<string> {
  if (!address || !isAddress(address)) {
    return address; // Return as is if not a valid address
  }
  
  const normalizedAddress = address.toLowerCase();
  
  // Check cache first
  if (ensCache[normalizedAddress]) {
    return ensCache[normalizedAddress];
  }
  
  try {
    // Check if the address is a valid ENS name already
    if (typeof address === 'string' && address.endsWith('.eth')) {
      // Validate the ENS name
      const resolvedAddress = await provider.resolveName(address);
      if (resolvedAddress && resolvedAddress.toLowerCase() === normalizedAddress) {
        ensCache[normalizedAddress] = address;
        return address;
      }
      return normalizedAddress;
    }
    
    // Resolve address to ENS name
    const ensName = await provider.lookupAddress(normalizedAddress);
    
    if (ensName) {
      // Verify the ENS name resolves back to the original address
      const verifiedAddress = await provider.resolveName(ensName);
      if (verifiedAddress && verifiedAddress.toLowerCase() === normalizedAddress) {
        ensCache[normalizedAddress] = ensName;
        return ensName;
      }
    }
    
    // If no ENS name found or verification failed, return the address
    return normalizedAddress;
    
  } catch (error) {
    console.error(`Error resolving ENS for ${normalizedAddress}:`, error);
    return normalizedAddress; // Return original address on error
  }
}

/**
 * Format an address or ENS name for display
 * @param address The address or ENS name to format
 * @returns Formatted string (shortened address or ENS name)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // If it's an ENS name, return as is
  if (typeof address === 'string' && address.endsWith('.eth')) {
    return address;
  }
  
  // If it's a valid address, shorten it
  if (isAddress(address)) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }
  
  // Otherwise return as is
  return address;
}

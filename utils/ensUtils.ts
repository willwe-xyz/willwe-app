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
 * @param address The Ethereum address to resolve
 * @returns A promise that resolves to the Base ENS name, regular ENS name, or truncated address
 */
export async function resolveENS(address: string): Promise<string> {
  if (!address || !ethers.isAddress(address)) {
    return address;
  }

  try {
    // First try to resolve Base ENS
    const baseENSName = await lookupBaseENS(address as Address);
    if (baseENSName) {
      return baseENSName;
    }

    // If no Base ENS, try regular ENS
    const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));
    const ensName = await mainnetProvider.lookupAddress(address);
    
    if (ensName) {
      return ensName;
    }
  } catch (error) {
    // Error handling without console.log
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
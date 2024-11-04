import { deployments, ABIs, getChainById } from './deployments';
import { ethers } from 'ethers';

export { deployments, ABIs, getChainById };

export const getRPCUrl = (chainId: string): string => {
  let url;
  const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
  switch (cleanChainId) {
    case '84532': // Base Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
      break;
    case '11155420': // Optimism Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM_SEPOLIA;
      break;
    case '167009': // Taiko Hekla
      url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO_HEKLA;
      break;
    case '167000': // Taiko
      url = process.env.NEXT_PUBLIC_RPC_URL_TAIKO;
      break;
    case '534351': // Scroll Testnet
      url = process.env.NEXT_PUBLIC_RPC_URL_SCROLL_TESTNET;
      break;
    default:
      url = process.env[`NEXT_PUBLIC_RPC_URL_${cleanChainId}`]; /// use getChainByID or set some defaults via viem
  }
  
  if (!url) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }
  return url;
};

export const getExplorerLink = (chainId: string, hash: string, type: 'tx' | 'address' = 'tx'): string => {
  try {
    const chain = getChainById(chainId);
    const explorerUrl = chain.blockExplorers?.default?.url;
    if (!explorerUrl) throw new Error('No explorer URL found for chain');
    return `${explorerUrl}/${type}/${hash}`;
  } catch (error) {
    console.warn('Failed to get explorer URL:', error);
    return '#';
  }
};

export const getMembraneContract = async (
  chainId: string,
  provider: ethers.Provider
): Promise<ethers.Contract> => {
  // Remove 'eip155:' prefix if present
  const cleanChainId = chainId.replace('eip155:', '');
  
  // Get the contract address for this chain
  const address = deployments["Membrane"][cleanChainId];
  if (!address) {
    throw new Error(`No Membrane contract deployed on chain ${chainId}`);
  }

  // Create and return the contract instance
  return new ethers.Contract(
    address,
    ABIs.Membrane,
    provider
  );
};
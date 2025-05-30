import { deployments, ABIs, getChainById } from './deployments';
import { ethers } from 'ethers';

export { deployments, ABIs, getChainById };

export const getRPCUrl = (chainId: string): string => {
  let url;
  const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
  switch (cleanChainId) {
    case '1': // Mainnet
      url = process.env.RPC_URL_MAINNET;
      break;
    case '84532': // Base Sepolia
      url = process.env.RPC_URL_BASE_SEPOLIA;
      break;
    case '11155420': // Optimism Sepolia
      url = process.env.RPC_URL_OPTIMISM_SEPOLIA;
      break;
    case '167009': // Taiko Hekla
      url = process.env.RPC_URL_TAIKO_HEKLA;
      break;
    case '167000': // Taiko
      url = process.env.RPC_URL_TAIKO;
      break;
    case '534351': // Scroll Testnet
      url = process.env.RPC_URL_SCROLL_TESTNET;
      break;
    case '8453': // Base
      url = process.env.BASE_RPC_URL || 'https://base.llamarpc.com';
      break;
    default:
      url = process.env[`RPC_URL_${cleanChainId}`]; /// use getChainByID or set some defaults via viem
  }
  
  if (!url) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }
  return url;
};

export const getExplorerLink = (
  address: string,
  chainId: string,
  type: 'tx' | 'address' = 'address'
): string => {
  try {
    // Ensure we're using the chainId, not an address
    if (!chainId) {
      throw new Error('Invalid chain ID format');
    }
    
    // Clean chainId format
    const cleanChainId = chainId.replace('eip155:', '');
    
    // Fallback explorer URLs for common networks
    const fallbackExplorers: Record<string, string> = {
      '1': 'https://etherscan.io',
      '5': 'https://goerli.etherscan.io',
      '11155111': 'https://sepolia.etherscan.io',
      '137': 'https://polygonscan.com',
      '80001': 'https://mumbai.polygonscan.com',
      '42161': 'https://arbiscan.io',
      '421613': 'https://goerli.arbiscan.io',
      '10': 'https://optimistic.etherscan.io',
      '420': 'https://goerli-optimism.etherscan.io',
      '56': 'https://bscscan.com',
      '97': 'https://testnet.bscscan.com',
      '84532': 'https://sepolia.basescan.org',
      '11155420': 'https://sepolia-optimism.etherscan.io',
      '167009': 'https://explorer.katla.taiko.xyz',
      '167000': 'https://explorer.taiko.xyz',
      '534351': 'https://sepolia-blockscout.scroll.io',
    };
    
    let explorerUrl: string | undefined;
    
    try {
      // Try to get chain info from viem
      const chain = getChainById(cleanChainId);
      explorerUrl = chain.blockExplorers?.default?.url;
    } catch (error) {
      console.warn('Error getting chain by ID:', error);
      // If viem lookup fails, try the fallback
      explorerUrl = fallbackExplorers[cleanChainId];
    }
    
    if (!explorerUrl) {
      console.warn(`No explorer URL found for chain ID: ${chainId}`);
      return '#';
    }
    
    // Remove trailing slash if present
    explorerUrl = explorerUrl.endsWith('/') ? explorerUrl.slice(0, -1) : explorerUrl;

    // Validate address format for address type
    if (type === 'address' && !ethers.isAddress(address)) {
      console.warn('Invalid address format:', address);
      return '#';
    }

    return `${explorerUrl}/${type}/${address}`;
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
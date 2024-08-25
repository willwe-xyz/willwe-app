import { deployments, ABIs, getChainById } from './deployments';

export { deployments, ABIs, getChainById };

export const getRPCUrl = (chainId: string): string => {
  let url;
  switch (chainId) {
    case '84532': // Base Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
      break;
    case '11155420': // Optimism Sepolia
      url = process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM_SEPOLIA;
      break;
    case '534351': // Scroll Testnet
      url = process.env.NEXT_PUBLIC_RPC_URL_SCROLL_TESTNET;
      break;
    default:
      url = process.env[`NEXT_PUBLIC_RPC_URL_${chainId}`];
  }
  
  if (!url) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }
  return url;
};
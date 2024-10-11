import { deployments, ABIs, getChainById } from './deployments';



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
import { getChainById } from '../config/contracts';

export function getChainName(chainId: string): string {
  try {
    const chain = getChainById(chainId);
    return chain.name;
  } catch (error) {
    console.error('Error getting chain name:', error);
    return 'Unknown Chain';
  }
}

/// add other util fx here
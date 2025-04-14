import { useMemo } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

export const useContract = (chainId: string) => {
  const contract = useMemo(() => {
    if (!chainId) return null;
    
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];
    
    if (!contractAddress) {
      console.error(`No contract deployment found for chain ${cleanChainId}`);
      return null;
    }

    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    return new ethers.Contract(contractAddress, ABIs.WillWe, provider);
  }, [chainId]);

  return { contract };
}; 
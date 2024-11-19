import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';
import { getRPCUrl } from '../config/contracts';

interface WillWeContract extends ethers.Contract {
  totalSupply(nodeId: string): Promise<bigint>;
}

export const useWillWeContract = (chainId: string) => {
  const [contract, setContract] = useState<WillWeContract | null>(null);
  console.log('chainId', chainId);
  useEffect(() => {
    const initContract = async () => {
      try {
        const rpcUrl = getRPCUrl(chainId);
        if (!rpcUrl) throw new Error(`No RPC URL found for chain ${chainId}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const willWeAddress = deployments.WillWe[chainId];

        if (!willWeAddress) {
          throw new Error(`No WillWe contract found for chain ${chainId}`);
        }

        const willWeContract = new ethers.Contract(
          willWeAddress,
          ABIs.WillWe,
          provider
        ) as WillWeContract;

        if (typeof willWeContract.totalSupply !== 'function') {
          console.error('totalSupply function not found in contract ABI:', ABIs.WillWe);
          throw new Error('Contract missing required function: totalSupply');
        }

        setContract(willWeContract);
      } catch (error) {
        console.error('Error initializing WillWe contract:', error);
        setContract(null);
      }
    };

    initContract();
  }, [chainId]);

  return contract;
}

export default useWillWeContract;
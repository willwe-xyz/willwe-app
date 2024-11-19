import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs } from '../config/contracts';

interface WillWeContract extends ethers.Contract {
  totalSupply(nodeId: string): Promise<bigint>;
}

export const useWillWeContract = () => {
  const { getEthersProvider } = usePrivy();
  const [contract, setContract] = useState<WillWeContract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const provider = await getEthersProvider();
        if (!provider) throw new Error('Provider not available');

        const signer = await provider.getSigner();
        const cleanChainId = (await signer.getChainId()).toString();
        const willWeAddress = deployments.WillWe[cleanChainId];

        if (!willWeAddress) {
          throw new Error(`No WillWe contract found for chain ${cleanChainId}`);
        }

        const willWeContract = new ethers.Contract(
          willWeAddress,
          ABIs.WillWe,
          signer
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
  }, [getEthersProvider]);

  return contract;
}

export default useWillWeContract;
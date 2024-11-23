import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs } from '../config/contracts';

export function useContract(
  contractName: keyof typeof deployments,
  chainId?: string
) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { getEthersProvider } = usePrivy();

  const cleanChainId = useMemo(() => {
    if (!chainId) return null;
    return chainId.replace('eip155:', '');
  }, [chainId]);

  useEffect(() => {
    const initContract = async () => {
      if (!cleanChainId) return;

      try {
        const provider = await getEthersProvider();
        if (!provider) throw new Error('Provider not available');

        const address = deployments[contractName][cleanChainId];
        if (!address) throw new Error(`No contract found for chain ${chainId}`);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          address,
          ABIs[contractName],
          signer as unknown as ethers.ContractRunner
        );

        setContract(contract);
        setError(null);

      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize contract'));
        setContract(null);
      }
    };

    initContract();
  }, [contractName, cleanChainId, getEthersProvider]);

  return { contract, error };
}

export default useContract;
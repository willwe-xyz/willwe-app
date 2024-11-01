import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useContractOperation } from './useContractOperation';
import { usePrivy } from '@privy-io/react-auth';

export function useMembraneOperations(chainId: string) {
  const { authenticated, ready } = usePrivy();
  
  const executeOperation = useContractOperation({
    contractName: 'Membrane',
    successMessage: 'Membrane operation completed successfully'
  });

  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedBalances = balances.map(b => ethers.parseUnits(b, 18));
      return executeOperation(
        chainId,
        'createMembrane',
        [tokens, parsedBalances, metadataCid],
        { gasLimit: 500000 }
      );
    } catch (error) {
      throw new Error('Invalid balance format');
    }
  }, [chainId, executeOperation, authenticated, ready]);

  return {
    createMembrane
  };
}

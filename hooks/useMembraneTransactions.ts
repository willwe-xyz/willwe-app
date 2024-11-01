import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useContractOperation } from './useContractOperation';

export function useMembraneTransactions(chainId: string) {
  const executeOperation = useContractOperation({
    contractName: 'Membrane',
    successMessage: 'Membrane operation completed successfully'
  });

  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    const parsedBalances = balances.map(b => ethers.parseUnits(b, 18));
    return executeOperation(
      chainId,
      'createMembrane',
      [tokens, parsedBalances, metadataCid]
    );
  }, [chainId, executeOperation]);

  const checkMembrane = useCallback(async (
    address: string,
    membraneId: string
  ) => {
    return executeOperation(
      chainId, 
      'gCheck',
      [address, membraneId]
    );
  }, [chainId, executeOperation]);

  return {
    createMembrane,
    checkMembrane
  };
}
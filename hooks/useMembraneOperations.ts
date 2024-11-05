import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useContractOperation } from './useContractOperation';
import { TransactionLog, usePrivy } from '@privy-io/react-auth';

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
      const result = await executeOperation(
        chainId,
        'createMembrane',
        [tokens, parsedBalances, metadataCid],
        { gasLimit: 500000 }
      );
      
      if (!result) {
        throw new Error('Operation failed');
      }
      
      const { receipt } = result;
      
      // Find MembraneCreated event
      const membraneCreatedLog = receipt.logs.find((log: any) => {
        try {
          return log.topics[0] === ethers.id("MembraneCreated(uint256,string)");
        } catch {
          return false;
        }
      });
      
      if (!membraneCreatedLog) {
        throw new Error('Failed to find MembraneCreated event in transaction logs');
      }

      // Decode the event data - the membrane ID is the first indexed parameter
      const membraneId = ethers.toBigInt(membraneCreatedLog.topics[1]).toString();

      return {
        receipt,
        membraneId
      };
      
    } catch (error) {
      console.error('Create membrane error:', error);
      throw error;
    }
  }, [chainId, executeOperation, authenticated, ready]);

  return {
    createMembrane
  };
}

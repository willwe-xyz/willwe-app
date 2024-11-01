import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useContractOperation } from './useContractOperation';

export function useNodeTransactions(chainId: string) {
  const executeOperation = useContractOperation({
    contractName: 'WillWe',
    successMessage: 'Node operation completed successfully'
  });

  // Node spawning
  const spawnNode = useCallback(async (parentId: string) => {
    return executeOperation(chainId, 'spawnBranch', [parentId]);
  }, [chainId, executeOperation]);

  const spawnWithMembrane = useCallback(async (
    parentId: string, 
    membraneId: string
  ) => {
    return executeOperation(
      chainId,
      'spawnBranchWithMembrane',
      [parentId, membraneId]
    );
  }, [chainId, executeOperation]);

  // Value operations
  const mint = useCallback(async (
    nodeId: string, 
    amount: string
  ) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return executeOperation(chainId, 'mint', [nodeId, parsedAmount]);
  }, [chainId, executeOperation]);

  const burn = useCallback(async (
    nodeId: string, 
    amount: string
  ) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return executeOperation(chainId, 'burn', [nodeId, parsedAmount]);
  }, [chainId, executeOperation]);

  const mintPath = useCallback(async (
    targetId: string,
    amount: string
  ) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return executeOperation(chainId, 'mintPath', [targetId, parsedAmount]);
  }, [chainId, executeOperation]);

  const burnPath = useCallback(async (
    targetId: string,
    amount: string
  ) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return executeOperation(chainId, 'burnPath', [targetId, parsedAmount]);
  }, [chainId, executeOperation]);

  // Membership operations
  const mintMembership = useCallback(async (nodeId: string) => {
    return executeOperation(chainId, 'mintMembership', [nodeId]);
  }, [chainId, executeOperation]);

  // Signal and distribution operations
  const signal = useCallback(async (
    nodeId: string,
    signals: number[]
  ) => {
    return executeOperation(chainId, 'sendSignal', [nodeId, signals]);
  }, [chainId, executeOperation]);

  const redistribute = useCallback(async (nodeId: string) => {
    return executeOperation(chainId, 'redistributePath', [nodeId]);
  }, [chainId, executeOperation]);

  return {
    spawnNode,
    spawnWithMembrane,
    mint,
    burn,
    mintPath,
    burnPath,
    mintMembership,
    signal,
    redistribute
  };
}

// File: hooks/useNodeTransactions.ts
import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useContractOperation } from './useContractOperation';
import { usePrivy } from '@privy-io/react-auth';

export function useNodeTransactions(chainId: string) {
  const { authenticated, ready } = usePrivy();
  
  const executeOperation = useContractOperation({
    contractName: 'WillWe',
    successMessage: 'Node operation completed successfully'
  });

  // Node spawning operations
  const spawnNode = useCallback(async (tokenAddress: string) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    // Convert token address to uint if needed
    let tokenId;
    try {
      tokenId = ethers.toBigInt(tokenAddress);
    } catch {
      tokenId = tokenAddress;
    }

    return executeOperation(
      chainId,
      'spawnRootBranch',
      [tokenId],
      { gasLimit: 500000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const spawnBranch = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'spawnBranch',
      [nodeId],
      { gasLimit: 400000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const spawnBranchWithMembrane = useCallback(async (
    nodeId: string,
    membraneId: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'spawnBranchWithMembrane',
      [nodeId, membraneId],
      { gasLimit: 600000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  // Value operations
  const mint = useCallback(async (
    nodeId: string,
    amount: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      return executeOperation(
        chainId,
        'mint',
        [nodeId, parsedAmount],
        { gasLimit: 300000 }
      );
    } catch (error) {
      throw new Error('Invalid amount format');
    }
  }, [chainId, executeOperation, authenticated, ready]);

  const mintPath = useCallback(async (
    targetId: string,
    amount: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      return executeOperation(
        chainId,
        'mintPath',
        [targetId, parsedAmount],
        { gasLimit: 400000 }
      );
    } catch (error) {
      throw new Error('Invalid amount format');
    }
  }, [chainId, executeOperation, authenticated, ready]);

  const burn = useCallback(async (
    nodeId: string,
    amount: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      return executeOperation(
        chainId,
        'burn',
        [nodeId, parsedAmount],
        { gasLimit: 300000 }
      );
    } catch (error) {
      throw new Error('Invalid amount format');
    }
  }, [chainId, executeOperation, authenticated, ready]);

  const burnPath = useCallback(async (
    targetId: string,
    amount: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);
      return executeOperation(
        chainId,
        'burnPath',
        [targetId, parsedAmount],
        { gasLimit: 400000 }
      );
    } catch (error) {
      throw new Error('Invalid amount format');
    }
  }, [chainId, executeOperation, authenticated, ready]);

  // Membership operations
  const mintMembership = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'mintMembership',
      [nodeId],
      { gasLimit: 200000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const membershipEnforce = useCallback(async (
    targetAddress: string,
    nodeId: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'membershipEnforce',
      [targetAddress, nodeId],
      { gasLimit: 200000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  // Distribution and signal operations
  const redistribute = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'redistributePath',
      [nodeId],
      { gasLimit: 500000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const redistributeNode = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'redistribute',
      [nodeId],
      { gasLimit: 400000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const signal = useCallback(async (
    nodeId: string,
    signals: number[] = []
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'sendSignal',
      [nodeId, signals],
      { gasLimit: 300000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  const resignal = useCallback(async (
    targetNodeId: string,
    signals: number[],
    originatorAddress: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'resignal',
      [targetNodeId, signals, originatorAddress],
      { gasLimit: 400000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  // Value helpers
  const calculateUserTargetedPreferenceAmount = useCallback(async (
    childId: string,
    parentId: string,
    signal: number,
    userAddress: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    return executeOperation(
      chainId,
      'calculateUserTargetedPreferenceAmount',
      [childId, parentId, signal, userAddress],
      { gasLimit: 100000 }
    );
  }, [chainId, executeOperation, authenticated, ready]);

  // Membrane operations
  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const parsedBalances = balances.map(balance => 
        ethers.parseUnits(balance, 18)
      );

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
    // Node spawning
    spawnNode,
    spawnBranch,
    spawnBranchWithMembrane,

    // Value operations
    mint,
    mintPath,
    burn,
    burnPath,

    // Membership operations
    mintMembership,
    membershipEnforce,

    // Distribution operations
    redistribute,
    redistributeNode,

    // Signal operations
    signal,
    resignal,

    // Value helpers
    calculateUserTargetedPreferenceAmount,

    // Membrane operations
    createMembrane
  };
}
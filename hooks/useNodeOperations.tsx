import { useCallback, useMemo } from 'react';
import { useTransaction } from '../contexts/TransactionContext';
import { NodeState } from '../types/chainData';
import { ethers } from 'ethers';

interface NodePermissions {
  canMint: boolean;
  canBurn: boolean;
  canSignal: boolean;
  canRedistribute: boolean;
  canSpawn: boolean;
  isMember: boolean;
}

interface NodeOperationsResult {
  permissions: NodePermissions;
  transactions: {
    mint: (amount: string) => Promise<void>;
    burn: (amount: string) => Promise<void>;
    signal: (signals: number[]) => Promise<void>;
    redistribute: () => Promise<void>;
    spawn: () => Promise<void>;
    mintMembership: () => Promise<void>;
  };
  isProcessing: boolean;
  error: Error | null;
}

export function useNodeOperations(
  chainId: string,
  node: NodeState,
  userAddress?: string
): NodeOperationsResult {
  const { executeTransaction, isTransacting, error } = useTransaction();

  // Calculate permissions
  const permissions = useMemo((): NodePermissions => {
    if (!userAddress) return {
      canMint: false,
      canBurn: false,
      canSignal: false,
      canRedistribute: false,
      canSpawn: false,
      isMember: false
    };

    const isMember = node.membersOfNode.includes(userAddress.toLowerCase());
    
    return {
      canMint: isMember,
      canBurn: isMember,
      canSignal: isMember,
      canRedistribute: isMember,
      canSpawn: isMember,
      isMember
    };
  }, [node.membersOfNode, userAddress]);

  // Transaction handlers
  const mint = useCallback(async (amount: string) => {
    if (!permissions.canMint) throw new Error('No permission to mint');

    await executeTransaction(
      chainId,
      async (contract) => {
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.mint(node.basicInfo[0], parsedAmount);
      },
      {
        successMessage: 'Tokens minted successfully',
      }
    );
  }, [chainId, node.basicInfo, permissions.canMint, executeTransaction]);

  const burn = useCallback(async (amount: string) => {
    if (!permissions.canBurn) throw new Error('No permission to burn');

    await executeTransaction(
      chainId,
      async (contract) => {
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.burn(node.basicInfo[0], parsedAmount);
      },
      {
        successMessage: 'Tokens burned successfully',
      }
    );
  }, [chainId, node.basicInfo, permissions.canBurn, executeTransaction]);

  const signal = useCallback(async (signals: number[]) => {
    if (!permissions.canSignal) throw new Error('No permission to signal');

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.sendSignal(node.basicInfo[0], signals);
      },
      {
        successMessage: 'Signal sent successfully',
      }
    );
  }, [chainId, node.basicInfo, permissions.canSignal, executeTransaction]);

  const redistribute = useCallback(async () => {
    if (!permissions.canRedistribute) throw new Error('No permission to redistribute');

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.redistributePath(node.basicInfo[0]);
      },
      {
        successMessage: 'Redistribution completed successfully',
      }
    );
  }, [chainId, node.basicInfo, permissions.canRedistribute, executeTransaction]);

  const spawn = useCallback(async () => {
    if (!permissions.canSpawn) throw new Error('No permission to spawn');

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.spawnBranch(node.basicInfo[0]);
      },
      {
        successMessage: 'Node spawned successfully',
      }
    );
  }, [chainId, node.basicInfo, permissions.canSpawn, executeTransaction]);

  const mintMembership = useCallback(async () => {
    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.mintMembership(node.basicInfo[0]);
      },
      {
        successMessage: 'Membership minted successfully',
      }
    );
  }, [chainId, node.basicInfo, executeTransaction]);

  return {
    permissions,
    transactions: {
      mint,
      burn,
      signal,
      redistribute,
      spawn,
      mintMembership
    },
    isProcessing: isTransacting,
    error
  };
}
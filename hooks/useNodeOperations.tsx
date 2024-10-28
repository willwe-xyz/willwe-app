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

const defaultPermissions: NodePermissions = {
  canMint: false,
  canBurn: false,
  canSignal: false,
  canRedistribute: false,
  canSpawn: true, // Allow spawn by default
  isMember: false
};

export function useNodeOperations(
  chainId: string,
  node: NodeState | null | undefined,
  userAddress?: string
) {
  const { executeTransaction, isTransacting, error } = useTransaction();

  // Calculate permissions
  const permissions = useMemo((): NodePermissions => {
    if (!userAddress) return defaultPermissions;
    if (!node) return { ...defaultPermissions, canSpawn: true }; // Allow spawn when no node exists

    const isMember = node.membersOfNode.includes(userAddress.toLowerCase());
    
    return {
      canMint: isMember,
      canBurn: isMember,
      canSignal: isMember,
      canRedistribute: isMember,
      canSpawn: true, // Always allow spawn
      isMember
    };
  }, [node?.membersOfNode, userAddress]);

  const spawn = useCallback(async () => {
    if (!chainId) throw new Error('Chain ID is required');

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.spawnBranch(node?.basicInfo[0] || '0');
      },
      {
        successMessage: 'Node spawned successfully',
      }
    );
  }, [chainId, node, executeTransaction]);

  const mintMembership = useCallback(async () => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');

    await executeTransaction(
      chainId,
      async (contract) => {
        return contract.mintMembership(node.basicInfo[0]);
      },
      {
        successMessage: 'Membership minted successfully',
      }
    );
  }, [chainId, node, executeTransaction]);

  const redistribute = useCallback(async () => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
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
  }, [chainId, node, permissions.canRedistribute, executeTransaction]);

  const signal = useCallback(async (signals: number[]) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
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
  }, [chainId, node, permissions.canSignal, executeTransaction]);

  const mint = useCallback(async (amount: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
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
  }, [chainId, node, permissions.canMint, executeTransaction]);

  const burn = useCallback(async (amount: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
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
  }, [chainId, node, permissions.canBurn, executeTransaction]);

  return {
    permissions,
    transactions: {
      spawn,
      mintMembership,
      redistribute,
      signal,
      mint,
      burn
    },
    isProcessing: isTransacting,
    error
  };
}
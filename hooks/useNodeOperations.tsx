import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';

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
  canSpawn: true,
  isMember: false
};

export function useNodeOperations(
  chainId: string | undefined,
  node: NodeState | null | undefined,
  userAddress?: string
) {
  const { getEthersProvider } = usePrivy();
  const { executeTransaction, isTransacting } = useTransaction();

  // Get contract instance
  const getContract = useCallback(async () => {
    if (!chainId) throw new Error('Chain ID is required');
    
    const cleanChainId = chainId.replace('eip155:', '');
    const address = deployments.WillWe[cleanChainId];
    if (!address) throw new Error(`No contract deployment found for chain ${chainId}`);

    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(address, ABIs.WillWe, signer);
  }, [chainId, getEthersProvider]);

  // Calculate permissions
  const permissions = useMemo((): NodePermissions => {
    if (!userAddress || !node?.membersOfNode) return defaultPermissions;
    
    const isMember = node.membersOfNode.some(
      member => member.toLowerCase() === userAddress.toLowerCase()
    );

    return {
      canMint: isMember,
      canBurn: isMember,
      canSignal: isMember,
      canRedistribute: isMember,
      canSpawn: true,
      isMember
    };
  }, [node?.membersOfNode, userAddress]);

  // Root Node Operations
  const spawnRootBranch = useCallback(async (fungibleTokenAddress: string) => {
    if (!chainId) throw new Error('Chain ID is required');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.spawnRootBranch(fungibleTokenAddress);
      },
      { successMessage: 'Root branch spawned successfully' }
    );
  }, [chainId, executeTransaction, getContract]);

  // Spawn Operations
  const spawn = useCallback(async () => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranch(node.basicInfo[0]);
      },
      { successMessage: 'Node spawned successfully' }
    );
  }, [chainId, node, executeTransaction, getContract]);

  const spawnBranchWithMembrane = useCallback(async (membraneId: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranchWithMembrane(node.basicInfo[0], membraneId);
      },
      { successMessage: 'Branch spawned with membrane successfully' }
    );
  }, [chainId, node, executeTransaction, getContract]);

  // Membership Operations
  const mintMembership = useCallback(async () => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.mintMembership(node.basicInfo[0]);
      },
      { successMessage: 'Membership minted successfully' }
    );
  }, [chainId, node, executeTransaction, getContract]);

  const membershipEnforce = useCallback(async (targetAddress: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.membershipEnforce(targetAddress, node.basicInfo[0]);
      },
      { successMessage: 'Membership enforced successfully' }
    );
  }, [chainId, node, executeTransaction, getContract]);

  // Value Operations
  const mint = useCallback(async (amount: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    if (!permissions.canMint) throw new Error('No permission to mint');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.mint(node.basicInfo[0], parsedAmount);
      },
      { successMessage: 'Tokens minted successfully' }
    );
  }, [chainId, node, permissions.canMint, executeTransaction, getContract]);

  const mintPath = useCallback(async (targetNodeId: string, amount: string) => {
    if (!chainId) throw new Error('Chain ID is required');
    if (!permissions.canMint) throw new Error('No permission to mint');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.mintPath(targetNodeId, parsedAmount);
      },
      { successMessage: 'Tokens minted along path successfully' }
    );
  }, [chainId, permissions.canMint, executeTransaction, getContract]);

  const burn = useCallback(async (amount: string) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    if (!permissions.canBurn) throw new Error('No permission to burn');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.burn(node.basicInfo[0], parsedAmount);
      },
      { successMessage: 'Tokens burned successfully' }
    );
  }, [chainId, node, permissions.canBurn, executeTransaction, getContract]);

  const burnPath = useCallback(async (targetNodeId: string, amount: string) => {
    if (!chainId) throw new Error('Chain ID is required');
    if (!permissions.canBurn) throw new Error('No permission to burn');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.burnPath(targetNodeId, parsedAmount);
      },
      { successMessage: 'Tokens burned along path successfully' }
    );
  }, [chainId, permissions.canBurn, executeTransaction, getContract]);

  // Distribution Operations
  const redistribute = useCallback(async () => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    if (!permissions.canRedistribute) throw new Error('No permission to redistribute');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.redistributePath(node.basicInfo[0]);
      },
      { successMessage: 'Redistribution completed successfully' }
    );
  }, [chainId, node, permissions.canRedistribute, executeTransaction, getContract]);

  // Signal Operations
  const signal = useCallback(async (signals: number[]) => {
    if (!chainId || !node) throw new Error('Chain ID and node are required');
    if (!permissions.canSignal) throw new Error('No permission to signal');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.sendSignal(node.basicInfo[0], signals);
      },
      { successMessage: 'Signal sent successfully' }
    );
  }, [chainId, node, permissions.canSignal, executeTransaction, getContract]);

  const resignal = useCallback(async (
    targetNodeId: string,
    signals: number[],
    originatorAddress: string
  ) => {
    if (!chainId) throw new Error('Chain ID is required');
    if (!permissions.canSignal) throw new Error('No permission to resignal');
    const cleanChainId = chainId.replace('eip155:', '');

    return executeTransaction(
      cleanChainId,
      async () => {
        const contract = await getContract();
        return contract.resignal(targetNodeId, signals, originatorAddress);
      },
      { successMessage: 'Signal resent successfully' }
    );
  }, [chainId, permissions.canSignal, executeTransaction, getContract]);

  return {
    permissions,
    transactions: {
      // Root Operations
      spawnRootBranch,

      // Spawn Operations
      spawn,
      spawnBranchWithMembrane,

      // Membership Operations
      mintMembership,
      membershipEnforce,

      // Value Operations
      mint,
      mintPath,
      burn,
      burnPath,

      // Distribution Operations
      redistribute,

      // Signal Operations
      signal,
      resignal
    },
    isProcessing: isTransacting
  };
}

export default useNodeOperations;
import { useCallback, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
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
  canMintMembership: boolean;
}

interface NodeTransactions {
  spawn: (nodeId: string) => Promise<any>;
  spawnBaseNode: (tokenAddress: string) => Promise<any>;
  spawnBranchWithMembrane: (nodeId: string, membraneId: string) => Promise<any>;
  mint: (nodeId: string, amount: string) => Promise<any>;
  mintPath: (targetNodeId: string, amount: string) => Promise<any>;
  burn: (nodeId: string, amount: string) => Promise<any>;
  burnPath: (targetNodeId: string, amount: string) => Promise<any>;
  mintMembership: (nodeId: string) => Promise<any>;
  redistribute: (nodeId: string) => Promise<any>;
  signal: (nodeId: string, signals: number[]) => Promise<any>;
}

export function useNodeOperations(
  chainId: string,
  node: NodeState | null,
  userAddress?: string
) {
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const { executeTransaction, isTransacting } = useTransaction();
  const [permissions, setPermissions] = useState<NodePermissions>({
    canMint: true, // Always true as per spec
    canBurn: true, // Always true as per spec
    canSignal: false,
    canRedistribute: false,
    canSpawn: false,
    isMember: false,
    canMintMembership: false
  });

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

  // Check permissions
  const checkPermissions = useCallback(async () => {
    if (!userAddress || !node?.basicInfo?.[0]) return;

    try {
      const contract = await getContract();
      
      // Check membership
      const isMember = await contract.isMember(userAddress, node.basicInfo[0]);

      // Check membrane requirements
      const membraneId = node.basicInfo[5];
      const membraneContract = new ethers.Contract(
        deployments.Membrane[chainId.replace('eip155:', '')],
        ABIs.Membrane,
        await getEthersProvider()
      );
      const canMintMembership = await membraneContract.gCheck(userAddress, membraneId);

      setPermissions({
        canMint: true,
        canBurn: true,
        canSignal: isMember,
        canRedistribute: isMember,
        canSpawn: isMember,
        isMember,
        canMintMembership
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [userAddress, node, chainId, getContract, getEthersProvider]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Find base node (where parentOf(x) == x)
  const findBaseNode = useCallback(async (tokenAddress: string) => {
    try {
      const contract = await getContract();
      let currentNode = await contract.toID(tokenAddress);
      let parentNode = await contract.getParentOf(currentNode);
      
      // Find the base node where parentOf(x) == x
      while (parentNode.toString() !== currentNode.toString()) {
        currentNode = parentNode;
        parentNode = await contract.getParentOf(currentNode);
      }
      
      return currentNode;
    } catch (error) {
      console.error('Error finding base node:', error);
      throw error;
    }
  }, [getContract]);

  // Node spawning operations
  const spawn = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');
    if (!permissions.canSpawn) throw new Error('No permission to spawn nodes');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      return contract.spawnBranch(nodeId, { gasLimit: 400000 });
    }, { successMessage: 'Node spawned successfully' });
  }, [chainId, authenticated, ready, permissions.canSpawn, getContract, executeTransaction]);

  const spawnBaseNode = useCallback(async (tokenAddress: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      const baseNode = await findBaseNode(tokenAddress);
      return contract.spawnBranch(baseNode, { gasLimit: 400000 });
    }, { successMessage: 'Base node spawned successfully' });
  }, [chainId, authenticated, ready, getContract, findBaseNode, executeTransaction]);

  const spawnBranchWithMembrane = useCallback(async (nodeId: string, membraneId: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');
    if (!permissions.canSpawn) throw new Error('No permission to spawn nodes');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
    }, { successMessage: 'Branch spawned with membrane successfully' });
  }, [chainId, authenticated, ready, permissions.canSpawn, getContract, executeTransaction]);

  // Value operations
  const mint = useCallback(async (nodeId: string, amount: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      const parsedAmount = ethers.parseUnits(amount, 18);
      return contract.mint(nodeId, parsedAmount, { gasLimit: 300000 });
    }, { successMessage: 'Tokens minted successfully' });
  }, [chainId, authenticated, ready, getContract, executeTransaction]);

  const mintPath = useCallback(async (targetNodeId: string, amount: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      const parsedAmount = ethers.parseUnits(amount, 18);
      return contract.mintPath(targetNodeId, parsedAmount, { gasLimit: 400000 });
    }, { successMessage: 'Tokens minted along path successfully' });
  }, [chainId, authenticated, ready, getContract, executeTransaction]);

  const burn = useCallback(async (nodeId: string, amount: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      const parsedAmount = ethers.parseUnits(amount, 18);
      return contract.burn(nodeId, parsedAmount, { gasLimit: 300000 });
    }, { successMessage: 'Tokens burned successfully' });
  }, [chainId, authenticated, ready, getContract, executeTransaction]);

  const burnPath = useCallback(async (targetNodeId: string, amount: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      const parsedAmount = ethers.parseUnits(amount, 18);
      return contract.burnPath(targetNodeId, parsedAmount, { gasLimit: 400000 });
    }, { successMessage: 'Tokens burned along path successfully' });
  }, [chainId, authenticated, ready, getContract, executeTransaction]);

  // Membership operations
  const mintMembership = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');
    if (!permissions.canMintMembership) throw new Error('Cannot mint membership');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      return contract.mintMembership(nodeId, { gasLimit: 200000 });
    }, { successMessage: 'Membership minted successfully' });
  }, [chainId, authenticated, ready, permissions.canMintMembership, getContract, executeTransaction]);

  // Distribution operations
  const redistribute = useCallback(async (nodeId: string) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');
    if (!permissions.canRedistribute) throw new Error('No permission to redistribute');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      return contract.redistributePath(nodeId, { gasLimit: 500000 });
    }, { successMessage: 'Value redistributed successfully' });
  }, [chainId, authenticated, ready, permissions.canRedistribute, getContract, executeTransaction]);

  // Signal operations
  const signal = useCallback(async (nodeId: string, signals: number[] = []) => {
    if (!authenticated || !ready) throw new Error('Please connect your wallet first');
    if (!permissions.canSignal) throw new Error('No permission to signal');

    return executeTransaction(chainId, async () => {
      const contract = await getContract();
      return contract.sendSignal(nodeId, signals, { gasLimit: 300000 });
    }, { successMessage: 'Signal sent successfully' });
  }, [chainId, authenticated, ready, permissions.canSignal, getContract, executeTransaction]);

  return {
    permissions,
    transactions: {
      spawn,
      spawnBaseNode,
      spawnBranchWithMembrane,
      mint,
      mintPath,
      burn,
      burnPath,
      mintMembership,
      redistribute,
      signal,
    } as NodeTransactions,
    isProcessing: isTransacting,
    checkPermissions
  };
}

export default useNodeOperations;
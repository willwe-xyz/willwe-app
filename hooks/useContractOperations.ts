import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { useTransactionContext } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';

export function useContractOperations(chainId: string) {
  const { ready, authenticated, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransactionContext();

  // Helper to get contract instance
  const getContract = useCallback(async (contractName: keyof typeof deployments) => {
    if (!ready || !authenticated) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('Provider not available');

      const signer = await provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      const address = deployments[contractName][cleanChainId];

      if (!address) {
        throw new Error(`No ${contractName} contract found for chain ${chainId}`);
      }

      return new ethers.Contract(address, ABIs[contractName], signer);
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw error;
    }
  }, [chainId, getEthersProvider, ready, authenticated]);

  // Node Operations
  const spawnRootBranch = useCallback(async (tokenAddress: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.spawnRootBranch(tokenAddress, { gasLimit: 500000 });
      },
      {
        successMessage: 'Root node created successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const spawnBranch = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.spawnBranch(nodeId, { gasLimit: 400000 });
      },
      {
        successMessage: 'Branch node created successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const spawnBranchWithMembrane = useCallback(async (nodeId: string, membraneId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
      },
      {
        successMessage: 'Branch node with membrane created successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Token Operations
  const mint = useCallback(async (nodeId: string, amount: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.mint(nodeId, parsedAmount, { gasLimit: 300000 });
      },
      {
        successMessage: 'Tokens minted successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const mintPath = useCallback(async (targetId: string, amount: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        const parsedAmount = ethers.parseUnits(amount, 18);
        return contract.mintPath(targetId, parsedAmount, { gasLimit: 400000 });
      },
      {
        successMessage: 'Path tokens minted successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Membrane Operations
  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('Membrane');
        return contract.createMembrane(tokens, balances, metadataCid, { gasLimit: 500000 });
      },
      {
        successMessage: 'Membrane created successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Membership Operations
  const mintMembership = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.mintMembership(nodeId, { gasLimit: 200000 });
      },
      {
        successMessage: 'Membership minted successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Value Distribution
  const redistribute = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.redistributePath(nodeId, { gasLimit: 500000 });
      },
      {
        successMessage: 'Value redistributed successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Signal Operations
  const signal = useCallback(async (nodeId: string, signals: number[] = []) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe');
        return contract.sendSignal(nodeId, signals, { gasLimit: 300000 });
      },
      {
        successMessage: 'Signal sent successfully'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Read Operations (no transaction needed)
  const getNodeData = useCallback(async (nodeId: string): Promise<NodeState> => {
    const contract = await getContract('WillWe');
    return contract.getNodeData(nodeId);
  }, [getContract]);

  const getMembraneData = useCallback(async (membraneId: string) => {
    const contract = await getContract('Membrane');
    return contract.getMembraneById(membraneId);
  }, [getContract]);

  const getAllNodesForRoot = useCallback(async (
    rootAddress: string,
    userAddress: string
  ): Promise<NodeState[]> => {
    const contract = await getContract('WillWe');
    return contract.getAllNodesForRoot(rootAddress, userAddress);
  }, [getContract]);

  return {
    spawnRootBranch,
    spawnBranch,
    spawnBranchWithMembrane,
    mint,
    mintPath,
    createMembrane,
    mintMembership,
    redistribute,
    signal,
    getNodeData,
    getMembraneData,
    getAllNodesForRoot,
    isReady: ready && authenticated
  };
}
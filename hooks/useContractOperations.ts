// File: hooks/useContractOperations.ts

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { NodeState, MembraneState } from '../types/chainData';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

interface MembraneData {
  tokens: string[];
  balances: string[];
  metadata: string;
}

export function useContractOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider } = usePrivy();

  // Helper to get contract instance
  const getContract = useCallback(async (
    contractName: keyof typeof deployments,
    requireSigner: boolean = false
  ) => {
    const cleanChainId = chainId.replace('eip155:', '');
    const address = deployments[contractName][cleanChainId];
    
    if (!address) {
      throw new Error(`No ${contractName} contract found for chain ${chainId}`);
    }

    const provider = await getEthersProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }

    if (requireSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(address, ABIs[contractName], signer);
    }
    
    return new ethers.Contract(address, ABIs[contractName], provider);
  }, [chainId, getEthersProvider]);

  // Token Operations
  const getTokenInfo = useCallback(async (tokenAddress: string): Promise<TokenInfo> => {
    try {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('Provider not available');

      const tokenContract = new ethers.Contract(tokenAddress, ABIs.IERC20, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: totalSupply.toString()
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw new Error(`Failed to fetch token info: ${error.message}`);
    }
  }, [getEthersProvider]);

  // Node Operations
  const spawnRootNode = useCallback(async (tokenAddress: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.spawnRootBranch(tokenAddress, { gasLimit: 500000 });
      },
      {
        successMessage: 'Root node created successfully',
        errorMessage: 'Failed to create root node'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const spawnChildNode = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.spawnBranch(nodeId, { gasLimit: 400000 });
      },
      {
        successMessage: 'Child node created successfully',
        errorMessage: 'Failed to create child node'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const spawnNodeWithMembrane = useCallback(async (
    nodeId: string,
    membraneId: string
  ) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
      },
      {
        successMessage: 'Node created with membrane successfully',
        errorMessage: 'Failed to create node with membrane'
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
        const contract = await getContract('Membrane', true);
        return contract.createMembrane(tokens, balances, metadataCid, { gasLimit: 500000 });
      },
      {
        successMessage: 'Membrane created successfully',
        errorMessage: 'Failed to create membrane'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const getMembraneData = useCallback(async (membraneId: string): Promise<MembraneData> => {
    try {
      const contract = await getContract('Membrane', false);
      const data = await contract.getMembraneById(membraneId);
      return {
        tokens: data.tokens,
        balances: data.balances.map((b: bigint) => b.toString()),
        metadata: data.meta
      };
    } catch (error) {
      console.error('Error fetching membrane data:', error);
      throw new Error(`Failed to fetch membrane data: ${error.message}`);
    }
  }, [getContract]);

  // Value Operations
  const mint = useCallback(async (nodeId: string, amount: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.mint(nodeId, amount, { gasLimit: 300000 });
      },
      {
        successMessage: 'Tokens minted successfully',
        errorMessage: 'Failed to mint tokens'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  const burn = useCallback(async (nodeId: string, amount: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.burn(nodeId, amount, { gasLimit: 300000 });
      },
      {
        successMessage: 'Tokens burned successfully',
        errorMessage: 'Failed to burn tokens'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Membership Operations
  const mintMembership = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.mintMembership(nodeId, { gasLimit: 200000 });
      },
      {
        successMessage: 'Membership minted successfully',
        errorMessage: 'Failed to mint membership'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Signal Operations
  const sendSignal = useCallback(async (nodeId: string, signals: number[] = []) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.sendSignal(nodeId, signals, { gasLimit: 300000 });
      },
      {
        successMessage: 'Signal sent successfully',
        errorMessage: 'Failed to send signal'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  // Data Fetching Operations
  const getNodeData = useCallback(async (nodeId: string): Promise<NodeState> => {
    try {
      const contract = await getContract('WillWe', false);
      return await contract.getNodeData(nodeId);
    } catch (error) {
      console.error('Error fetching node data:', error);
      throw new Error(`Failed to fetch node data: ${error.message}`);
    }
  }, [getContract]);

  const getAllNodesForRoot = useCallback(async (
    rootAddress: string,
    userAddress: string
  ): Promise<NodeState[]> => {
    try {
      const contract = await getContract('WillWe', false);
      return await contract.getAllNodesForRoot(rootAddress, userAddress);
    } catch (error) {
      console.error('Error fetching root nodes:', error);
      throw new Error(`Failed to fetch root nodes: ${error.message}`);
    }
  }, [getContract]);

  // Distribution Operations
  const redistribute = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract('WillWe', true);
        return contract.redistributePath(nodeId, { gasLimit: 500000 });
      },
      {
        successMessage: 'Value redistributed successfully',
        errorMessage: 'Failed to redistribute value'
      }
    );
  }, [chainId, executeTransaction, getContract]);

  return {
    // Token Operations
    getTokenInfo,
    
    // Node Operations
    spawnRootNode,
    spawnChildNode,
    spawnNodeWithMembrane,
    getNodeData,
    getAllNodesForRoot,
    
    // Membrane Operations
    createMembrane,
    getMembraneData,
    
    // Value Operations
    mint,
    burn,
    
    // Membership Operations
    mintMembership,
    
    // Signal Operations
    sendSignal,
    
    // Distribution Operations
    redistribute
  };
}

export default useContractOperations;
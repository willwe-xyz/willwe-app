import { useCallback } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';

export function useNodeOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { getEthersProvider } = usePrivy();

  // Helper function to get contract instance
  const getContract = useCallback(async () => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const address = deployments.WillWe[cleanChainId];
      
      if (!address) {
        throw new Error(`No contract deployment found for chain ${chainId}`);
      }
      // @ts-ignore
      return new ethers.Contract(address, ABIs.WillWe, signer);
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw error;
    }
  }, [chainId, getEthersProvider]);

  const spawnNode = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranch(nodeId, { gasLimit: 400000 });
      },
      {
        successMessage: 'Node spawned successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const mintMembership = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.mintMembership(nodeId, { gasLimit: 200000 });
      },
      {
        successMessage: 'Membership minted successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const redistribute = useCallback(async (nodeId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.redistributePath(nodeId, { gasLimit: 500000 });
      },
      {
        successMessage: 'Value redistributed successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const signal = useCallback(async (nodeId: string, signals: number[]) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        const gasEstimate = await contract.sendSignal.estimateGas(nodeId, signals);
        return contract.sendSignal(nodeId, signals, { gasLimit: gasEstimate });
      },
      {
        successMessage: 'Signal sent successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  const spawnBranchWithMembrane = useCallback(async (nodeId: string, membraneId: string) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.spawnBranchWithMembrane(nodeId, membraneId, { gasLimit: 600000 });
      },
      {
        successMessage: 'Branch with membrane spawned successfully',
      }
    );
  }, [chainId, getContract, executeTransaction]);

  return {
    spawnNode,
    mintMembership,
    redistribute,
    signal,
    spawnBranchWithMembrane
  };
}

export default useNodeOperations;
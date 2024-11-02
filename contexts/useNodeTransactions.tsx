import { useCallback, useState } from 'react';
import { ethers, ContractTransactionResponse } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';

interface NodeTransactionResult {
  spawnBranch: (tokenId: string) => Promise<ContractTransactionResponse>;
  spawnBranchWithMembrane: (tokenId: string, membraneId: string) => Promise<ContractTransactionResponse>;
  mint: (nodeId: string, amount: string) => Promise<ContractTransactionResponse>;
  mintPath: (targetNodeId: string, amount: string) => Promise<ContractTransactionResponse>;
  burn: (nodeId: string, amount: string) => Promise<ContractTransactionResponse>;
  burnPath: (targetNodeId: string, amount: string) => Promise<ContractTransactionResponse>;
  mintMembership: (nodeId: string) => Promise<ContractTransactionResponse>;
  redistribute: (nodeId: string) => Promise<ContractTransactionResponse>;
  signal: (nodeId: string, signals: number[]) => Promise<ContractTransactionResponse>;
  error: Error | null;
}

export function useNodeTransactions(chainId: string): NodeTransactionResult {
  const { authenticated, ready, getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const [error, setError] = useState<Error | null>(null);

  const getContract = useCallback(async () => {
    if (!chainId) throw new Error('Chain ID is required');
    
    const cleanChainId = chainId.replace('eip155:', '');
    const address = deployments.WillWe[cleanChainId];
    if (!address) throw new Error(`No contract deployment found for chain ${chainId}`);

    const provider = await getEthersProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(address, ABIs.WillWe, signer);
  }, [chainId, getEthersProvider]);

  const handleTransaction = useCallback(async <T extends any[]>(
    methodName: string,
    args: T,
    errorMessage: string = 'Transaction failed'
  ): Promise<ContractTransactionResponse> => {
    if (!authenticated || !ready) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      return await executeTransaction(chainId, async () => {
        const contract = await getContract();
        
        // Estimate gas with a buffer
        const gasEstimate = await contract[methodName].estimateGas(...args);
        const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

        // Send transaction with gas limit
        const tx = await contract[methodName](...args, {
          gasLimit
        });

        return tx;
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      throw error;
    }
  }, [chainId, authenticated, ready, executeTransaction, getContract]);

  const spawnBranch = useCallback(async (tokenId: string) => {
    return handleTransaction('spawnBranch', [tokenId], 'Failed to spawn branch');
  }, [handleTransaction]);

  const spawnBranchWithMembrane = useCallback(async (tokenId: string, membraneId: string) => {
    return handleTransaction(
      'spawnBranchWithMembrane',
      [tokenId, membraneId],
      'Failed to spawn branch with membrane'
    );
  }, [handleTransaction]);

  const mint = useCallback(async (nodeId: string, amount: string) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return handleTransaction(
      'mint',
      [nodeId, parsedAmount],
      'Failed to mint tokens'
    );
  }, [handleTransaction]);

  const mintPath = useCallback(async (targetNodeId: string, amount: string) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return handleTransaction(
      'mintPath',
      [targetNodeId, parsedAmount],
      'Failed to mint tokens along path'
    );
  }, [handleTransaction]);

  const burn = useCallback(async (nodeId: string, amount: string) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return handleTransaction(
      'burn',
      [nodeId, parsedAmount],
      'Failed to burn tokens'
    );
  }, [handleTransaction]);

  const burnPath = useCallback(async (targetNodeId: string, amount: string) => {
    const parsedAmount = ethers.parseUnits(amount, 18);
    return handleTransaction(
      'burnPath',
      [targetNodeId, parsedAmount],
      'Failed to burn tokens along path'
    );
  }, [handleTransaction]);

  const mintMembership = useCallback(async (nodeId: string) => {
    return handleTransaction(
      'mintMembership',
      [nodeId],
      'Failed to mint membership'
    );
  }, [handleTransaction]);

  const redistribute = useCallback(async (nodeId: string) => {
    return handleTransaction(
      'redistribute',
      [nodeId],
      'Failed to redistribute value'
    );
  }, [handleTransaction]);

  const signal = useCallback(async (nodeId: string, signals: number[]) => {
    return handleTransaction(
      'sendSignal',
      [nodeId, signals],
      'Failed to send signal'
    );
  }, [handleTransaction]);

  return {
    spawnBranch,
    spawnBranchWithMembrane,
    mint,
    mintPath,
    burn,
    burnPath,
    mintMembership,
    redistribute,
    signal,
    error
  };
}

export default useNodeTransactions;
// File: ./hooks/useMembraneOperations.ts

import { useCallback } from 'react';
import { useAppKit } from './useAppKit';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';
import { useWalletClient, usePublicClient } from 'wagmi';
import type { Abi } from 'viem';

export function useMembraneOperations(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const createMembrane = useCallback(async (
    tokens: string[],
    balances: string[],
    metadataCid: string
  ) => {
    if (!walletClient || !publicClient) throw new Error('Wallet not connected');
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.Membrane[cleanChainId];
      if (!contractAddress) {
        throw new Error(`No contract found for chain ${chainId}`);
      }
      // Parse balances to proper format
      const parsedBalances = balances.map(b => BigInt(b));
      return await executeTransaction(async () => {
        const { request } = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: ABIs.Membrane as Abi,
          functionName: 'createMembrane',
          args: [tokens, parsedBalances, metadataCid],
          account: walletClient.account,
        });
        const hash = await walletClient.writeContract(request);
        return {
          hash,
          wait: async () => await publicClient.waitForTransactionReceipt({ hash }),
        };
      });
    } catch (error) {
      console.error('Error creating membrane:', error);
      throw error;
    }
  }, [chainId, executeTransaction, walletClient, publicClient]);

  const checkMembrane = useCallback(async (
    address: string,
    membraneId: string
  ) => {
    if (!publicClient) throw new Error('No public client');
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.Membrane[cleanChainId];
    if (!contractAddress) {
      throw new Error(`No Membrane contract found for chain ${chainId}`);
    }
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: ABIs.Membrane as Abi,
      functionName: 'gCheck',
      args: [address, membraneId],
    });
  }, [chainId, publicClient]);

  const getMembraneById = useCallback(async (membraneId: string) => {
    if (!publicClient) throw new Error('No public client');
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.Membrane[cleanChainId];
    if (!contractAddress) {
      throw new Error(`No Membrane contract found for chain ${chainId}`);
    }
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: ABIs.Membrane as Abi,
      functionName: 'getMembraneById',
      args: [membraneId],
    });
  }, [chainId, publicClient]);

  return {
    createMembrane,
    checkMembrane,
    getMembraneById
  };
}

export default useMembraneOperations;
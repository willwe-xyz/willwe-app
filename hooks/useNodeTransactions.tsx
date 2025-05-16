import { useCallback } from 'react';
import { useTransaction } from '../contexts/TransactionContext';
import { deployments, ABIs } from '../config/contracts';
import { useWalletClient, usePublicClient } from 'wagmi';
import type { Abi } from 'viem';

export function useNodeTransactions(chainId: string) {
  const { executeTransaction } = useTransaction();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const signal = useCallback(async (nodeId: string, signals: string[], onSuccess?: () => void) => {
    if (!walletClient || !publicClient) throw new Error('Wallet not connected');
    const cleanChainId = chainId.replace('eip155:', '');
    const contractAddress = deployments.WillWe[cleanChainId];
    if (!contractAddress) {
      throw new Error(`No contract deployment found for chain ${cleanChainId}`);
    }
    return executeTransaction(async () => {
      const { request } = await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: ABIs.WillWe as Abi,
        functionName: 'sendSignal',
        args: [nodeId, signals],
        account: walletClient.account,
      });
      const hash = await walletClient.writeContract(request);
      onSuccess?.();
      return {
        hash,
        wait: async () => await publicClient.waitForTransactionReceipt({ hash }),
      };
    });
  }, [chainId, executeTransaction, walletClient, publicClient]);

  return {
    signal
  };
}
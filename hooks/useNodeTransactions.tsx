import { useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { useToast } from '@chakra-ui/react';

export function useNodeTransactions(chainId: string) {
  const { getEthersProvider } = usePrivy();
  const toast = useToast();

  const getContract = useCallback(async () => {
    const provider = await getEthersProvider();
    const cleanChainId = chainId.replace('eip155:', '');
    return new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider.getSigner()
    );
  }, [chainId, getEthersProvider]);

  const executeTransaction = useCallback(async (
    chainId: string,
    transactionFn: () => Promise<ethers.ContractTransaction>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: () => void;
    } = {}
  ) => {
    try {
      const tx = await transactionFn();
      toast({
        title: 'Transaction Submitted',
        description: 'Please wait for confirmation...',
        status: 'info',
      });

      await tx.wait(1); // Wait for 1 confirmation

      toast({
        title: 'Transaction Confirmed',
        description: options.successMessage || 'Transaction completed successfully',
        status: 'success',
      });

      if (options.onSuccess) {
        options.onSuccess();
      }

      return tx;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast({
        title: 'Transaction Failed',
        description: options.errorMessage || error.message,
        status: 'error',
      });
      throw error;
    }
  }, [toast]);

  const signal = useCallback(async (nodeId: string, signals: number[], onSuccess?: () => void) => {
    return executeTransaction(
      chainId,
      async () => {
        const contract = await getContract();
        return contract.sendSignal(nodeId, signals, { gasLimit: 300000 });
      },
      {
        successMessage: 'Signals submitted successfully',
        errorMessage: 'Failed to submit signals',
        onSuccess
      }
    );
  }, [chainId, executeTransaction, getContract]);

  return {
    signal,
    getContract,
    executeTransaction
  };
}
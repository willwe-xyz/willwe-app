// File: ./hooks/useTransactionHandler.ts

import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { getExplorerLink } from '../config/contracts';

interface TransactionResult {
  txHash: string;
  contractAddress: string;
}

export const useTransactionHandler = () => {
  const toast = useToast();

  const executeTransaction = useCallback(async (
    deploymentPromise: Promise<any>,
    chainId: string
  ): Promise<TransactionResult> => {
    const pendingToastId = toast({
      title: 'Confirm Transaction',
      description: 'Please confirm the transaction in your wallet',
      status: 'info',
      duration: null,
      isClosable: false,
    });

    try {
      // Deploy contract
      const contract = await deploymentPromise;
      const tx = contract.deploymentTransaction();
      if (!tx) throw new Error('No deployment transaction found');
      
      // Close the confirmation toast
      toast.close(pendingToastId);
      
      // Show transaction hash toast with explorer link
      toast({
        title: 'Transaction Submitted',
        description: `Transaction Hash: ${tx.hash}\n View on explorer: ${getExplorerLink(tx.hash, chainId, 'tx')}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Get the contract address directly from the deployment
      const deployedAddress = await contract.getAddress();

      return {
        txHash: tx.hash,
        contractAddress: deployedAddress
      };

    } catch (error: any) {
      // Close any pending toasts
      toast.close(pendingToastId);

      // Handle user rejection 
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('Transaction was rejected by user');
      }

      // Handle replacement transaction errors
      if (error.code === 'TRANSACTION_REPLACED') {
        if (error.reason === 'repriced') {
          throw new Error('Transaction was replaced (speeded up)');
        }
        throw new Error('Transaction was replaced');
      }

      throw error;
    }
  }, [toast]);

  return { executeTransaction };
};

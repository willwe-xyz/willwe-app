// File: ./hooks/useTransactionHandler.ts

import { useCallback } from 'react';
import { useToast, UseToastOptions, Box, Text, Link } from '@chakra-ui/react';
import { ContractTransactionResponse, EventLog, Log } from 'ethers';
import { getChainById } from '../config/contracts';
import { ExternalLink } from 'lucide-react';

interface TransactionHandlerOptions {
  pendingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (receipt: any) => void;
  onError?: (error: Error) => void;
}

export function useTransactionHandler() {
  const toast = useToast();

  const handleTransaction = useCallback(async <T extends ContractTransactionResponse>(
    transaction: Promise<T>,
    options: TransactionHandlerOptions = {}
  ) => {
    const {
      pendingMessage = 'Transaction Pending',
      successMessage = 'Transaction Successful',
      errorMessage = 'Transaction Failed',
      onSuccess,
      onError
    } = options;

    let tx: T;
    const toastId = 'transaction-toast';

    try {
      // Show pending toast
      toast({
        id: toastId,
        title: 'Confirming Transaction',
        description: pendingMessage,
        status: 'info',
        duration: null,
        isClosable: false,
      });

      // Wait for transaction
      tx = await transaction;

      // Update toast to show transaction hash
      toast.update(toastId, {
        title: 'Transaction Submitted',
        description: `Transaction submitted. Waiting for confirmation...
          View on Explorer: ${getChainById(tx.chainId.toString()).blockExplorers?.default.url}/tx/${tx.hash}`,
        duration: null,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Clear pending toast
      toast.close(toastId);

      if (receipt.status === 1) {
        // Success
        toast({
          title: 'Success',
          description: successMessage,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (onSuccess) {
          onSuccess(receipt);
        }

        return {
          transaction: tx,
          receipt,
          events: parseReceiptEvents(receipt)
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      // Clear pending toast
      toast.close(toastId);

      // Show error toast
      toast({
        title: 'Error',
        description: error.message || errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [toast]);

  const parseReceiptEvents = (receipt: any) => {
    const events: (EventLog | Log)[] = [];
    if (receipt.logs) {
      events.push(...receipt.logs);
    }
    return events;
  };

  return { handleTransaction };
}

// Helper hook for common transaction patterns
export function useTransactionPatterns() {
  const { handleTransaction } = useTransactionHandler();

  const handleNodeOperation = useCallback(async (
    operation: () => Promise<ContractTransactionResponse>,
    options: TransactionHandlerOptions = {}
  ) => {
    return handleTransaction(operation(), {
      pendingMessage: 'Processing node operation...',
      successMessage: 'Node operation completed successfully',
      errorMessage: 'Node operation failed',
      ...options
    });
  }, [handleTransaction]);

  const handleMembraneOperation = useCallback(async (
    operation: () => Promise<ContractTransactionResponse>,
    options: TransactionHandlerOptions = {}
  ) => {
    return handleTransaction(operation(), {
      pendingMessage: 'Processing membrane operation...',
      successMessage: 'Membrane operation completed successfully',
      errorMessage: 'Membrane operation failed',
      ...options
    });
  }, [handleTransaction]);

  const handleTokenOperation = useCallback(async (
    operation: () => Promise<ContractTransactionResponse>,
    options: TransactionHandlerOptions = {}
  ) => {
    return handleTransaction(operation(), {
      pendingMessage: 'Processing token operation...',
      successMessage: 'Token operation completed successfully',
      errorMessage: 'Token operation failed',
      ...options
    });
  }, [handleTransaction]);

  return {
    handleNodeOperation,
    handleMembraneOperation,
    handleTokenOperation
  };
}

export default useTransactionHandler;

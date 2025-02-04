import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContractTransaction, ethers } from 'ethers';
import { TransactionReceipt, usePrivy } from '@privy-io/react-auth';
import { useToast } from '@chakra-ui/react';

interface TransactionContextType {
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
  executeTransaction: (
    chainId: string,
    transactionFn: () => Promise<ethers.ContractTransaction>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: () => void;
    }
  ) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { login, authenticated, getEthersProvider, ready, user } = usePrivy();
  const toast = useToast();

  const executeTransaction = useCallback(
    async (
      chainId: string,
      transactionFn: () => Promise<ethers.ContractTransaction>,
      options?: TransactionOptions
    ) => {
      if (!authenticated) {
        await login();
        return;
      }

      if (!ready || !user?.wallet) {
        throw new Error('Wallet not ready');
      }

      setIsTransacting(true);
      setCurrentHash(null);
      setError(null);

      let toastId: string | number | undefined;

      try {
        const provider = await getEthersProvider();
        if (!provider) {
          throw new Error('Provider not available');
        }

        // Show pending toast
        toastId = toast({
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Execute transaction
        const tx = await transactionFn();
        setCurrentHash(tx.hash);

        // Update toast to processing
        if (toastId) {
          toast.update(toastId, {
            title: 'Processing',
            description: 'Transaction is being processed',
            status: 'loading',
          });
        }

        // Wait for confirmation
        const receipt = await provider.waitForTransaction(tx.hash, 1);

        // Close pending toast
        if (toastId) {
          toast.close(toastId);
        }

        if (receipt && receipt.status === 1) {
          // Success
          if (options?.successMessage) {
            toast({
              title: 'Success',
              description: options.successMessage,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }

          if (options?.onSuccess) {
            await options.onSuccess();
          }
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        // Close pending toast if exists
        if (toastId) {
          toast.close(toastId);
        }

        console.error('Transaction error:', error);
        let errorMessage = 'Transaction failed';
        
        if (error instanceof Error) {
          if (error.message.includes('rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else if (error.message.includes('gas required exceeds allowance')) {
            errorMessage = 'Transaction would exceed gas limit';
          } else {
            errorMessage = error.message;
          }
        }

        setError(error instanceof Error ? error : new Error(errorMessage));
        
        toast({
          title: 'Error',
          description: options?.errorMessage || errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsTransacting(false);
        setCurrentHash(null);
      }
    },
    [authenticated, login, getEthersProvider, ready, user, toast]
  );

  const value = {
    isTransacting,
    currentHash,
    error,
    executeTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
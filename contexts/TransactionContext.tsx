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
      handleError?: (error: any) => string;
    }
  ) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  handleError?: (error: any) => string;
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
        throw new Error('User not authenticated');
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

        toastId = toast({
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Execute transaction with gas estimate
        const tx = await transactionFn();
        
        // Get hash property from transaction, using type assertion for ethers v6 compatibility
        const txHash = (tx as any).hash;
        setCurrentHash(txHash);

        if (toastId) {
          toast.update(toastId, {
            title: 'Processing',
            description: 'Transaction is being processed',
            status: 'loading',
          });
        }

        // Wait for confirmation with more blocks
        const receipt = await provider.waitForTransaction(txHash, 2);

        if (toastId) {
          toast.close(toastId);
        }

        if (receipt && receipt.status === 1) {
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
      } catch (error: any) {
        if (toastId) {
          toast.close(toastId);
        }

        console.error('Transaction error:', error);
        let errorMessage = options?.errorMessage || 'Transaction failed';
        
        if (error?.message?.includes('user rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (options?.handleError) {
          errorMessage = options.handleError(error);
        }

        setError(error instanceof Error ? error : new Error(errorMessage));
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });

        throw error;
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
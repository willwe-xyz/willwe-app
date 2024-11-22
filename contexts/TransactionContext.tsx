import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
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
      onSuccess?: () => void;
    }
  ) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

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
      options?: {
        successMessage?: string;
        onSuccess?: () => void;
      }
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
      try {
        const provider = await getEthersProvider();
        if (!provider) {
          throw new Error('Provider not available');
        }

        // Get network after provider is ready
        const network = await provider.getNetwork();
        const targetChainId = parseInt(chainId.replace('eip155:', ''));
        
        // Execute the transaction
        const tx = await transactionFn();
        
        // Wait for transaction with ethers v6 syntax
        const receipt = await provider.waitForTransaction(tx.hash);

        if (receipt && receipt.status === 1) {
          toast({
            title: 'Success',
            description: options?.successMessage || 'Transaction successful',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          if (options?.onSuccess) {
            options.onSuccess();
          }
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Transaction error:', error);
        let errorMessage = 'Transaction failed';
        
        if (error instanceof Error) {
          if (error.message.includes('rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsTransacting(false);
        setCurrentHash(null);
        setError(null);
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
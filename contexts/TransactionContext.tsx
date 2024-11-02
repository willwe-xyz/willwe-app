import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContractTransactionResponse } from 'ethers';
import { UseToastOptions } from '@chakra-ui/react';

interface TransactionContextType {
  executeTransaction: <T extends ContractTransactionResponse>(
    chainId: string,
    transactionFn: () => Promise<T>,
    options?: TransactionOptions
  ) => Promise<T>;
  isTransacting: boolean;
  currentTransaction: string | null;
}

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  pendingMessage?: string;
}

interface TransactionProviderProps {
  children: React.ReactNode;
  toast: (options: UseToastOptions) => string | number;
}

const TransactionContext = createContext<TransactionContextType>({
  executeTransaction: async () => {
    throw new Error('TransactionContext not initialized');
  },
  isTransacting: false,
  currentTransaction: null,
});

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ 
  children, 
  toast 
}) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);

  const executeTransaction = useCallback(async <T extends ContractTransactionResponse>(
    chainId: string,
    transactionFn: () => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> => {
    const {
      successMessage = 'Transaction successful',
      errorMessage = 'Transaction failed',
      pendingMessage = 'Transaction pending'
    } = options;

    setIsTransacting(true);
    const toastId = 'transaction-status';

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

      // Execute transaction
      const tx = await transactionFn();
      setCurrentTransaction(tx.hash);

      // Update toast for confirmation
      toast.update(toastId, {
        title: 'Waiting for Confirmation',
        description: `Transaction submitted. Waiting for confirmation...`,
        status: 'info',
        duration: null,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Close pending toast
      toast.close(toastId);

      // Check transaction status
      if (receipt && receipt.status === 1) {
        // Success toast
        toast({
          title: 'Success',
          description: successMessage,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Optional: Show transaction hash
        if (receipt.hash) {
          toast({
            title: 'Transaction Details',
            description: (
              <React.Fragment>
                View on Explorer:{' '}
                <a
                  href={`https://explorer.testnet.mantle.xyz/tx/${receipt.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#553C9A',
                    textDecoration: 'underline'
                  }}
                >
                  {receipt.hash.slice(0, 6)}...{receipt.hash.slice(-4)}
                </a>
              </React.Fragment>
            ),
            status: 'info',
            duration: 8000,
            isClosable: true,
          });
        }

        return tx;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      // Close pending toast
      toast.close(toastId);

      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      throw error;
    } finally {
      setIsTransacting(false);
      setCurrentTransaction(null);
    }
  }, [toast]);

  const value = {
    executeTransaction,
    isTransacting,
    currentTransaction,
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

// Helper type for transaction status
export type TransactionStatus = 'pending' | 'mining' | 'success' | 'error';

// Custom error type for transaction failures
export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly receipt?: any
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

// Helper function to format transaction errors
export const formatTransactionError = (error: any): string => {
  if (error instanceof TransactionError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Handle common error messages
    if (error.message.includes('user rejected transaction')) {
      return 'Transaction was rejected by the user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds to complete the transaction';
    }
    if (error.message.includes('gas required exceeds allowance')) {
      return 'Transaction would exceed gas limit';
    }
    return error.message;
  }

  return 'An unknown error occurred';
};

// Utility function to get explorer URL based on chainId
export const getExplorerUrl = (chainId: string, hash: string): string => {
  const cleanChainId = chainId.replace('eip155:', '');
  
  // Add more explorers as needed
  const explorers: Record<string, string> = {
    '167009': 'https://explorer.testnet.mantle.xyz',
    '84532': 'https://base-sepolia.blockscout.com',
    '11155420': 'https://sepolia-optimism.etherscan.io',
  };

  const baseUrl = explorers[cleanChainId] || explorers['167009']; // Default to Taiko testnet
  return `${baseUrl}/tx/${hash}`;
};

export default TransactionContext;
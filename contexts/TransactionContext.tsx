import React, { createContext, useContext, useCallback } from 'react';
import { UseToastOptions, useToast } from '@chakra-ui/react';

interface TransactionContextValue {
  executeTransaction: (
    chainId: string,
    transactionFn: () => Promise<any>,
    toastConfig?: {
      successMessage?: string;
      errorMessage?: string;
    }
  ) => Promise<void>;
  isTransacting: boolean;
  error: Error | null;
}

const TransactionContext = createContext<TransactionContextValue>({
  executeTransaction: async () => {},
  isTransacting: false,
  error: null,
});

interface TransactionProviderProps {
  children: React.ReactNode;
  toast: ReturnType<typeof useToast>;
}

export function TransactionProvider({ children, toast }: TransactionProviderProps) {
  const [isTransacting, setIsTransacting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const waitForTransaction = async (tx: any): Promise<any> => {
    try {
      // v6 transaction receipt handling
      const receipt = await tx.provider.waitForTransaction(tx.hash);
      return receipt;
    } catch (err) {
      console.error('Error waiting for transaction:', err);
      throw err;
    }
  };

  const executeTransaction = useCallback(
    async (
      chainId: string,
      transactionFn: () => Promise<any>,
      toastConfig?: {
        successMessage?: string;
        errorMessage?: string;
      }
    ) => {
      setIsTransacting(true);
      setError(null);

      try {
        const tx = await transactionFn();
        
        // Show pending toast
        const pendingToastId = toast({
          title: 'Transaction Pending',
          description: 'Please wait while your transaction is being processed...',
          status: 'info',
          duration: null,
          isClosable: true,
          position: 'top-right'
        });

        try {
          // Wait for transaction confirmation
          const receipt = await waitForTransaction(tx);

          // Close pending toast
          toast.close(pendingToastId);

          if (receipt.status === 1) {
            toast({
              title: 'Transaction Successful',
              description: toastConfig?.successMessage || 'Transaction completed successfully',
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right'
            });
          } else {
            throw new Error('Transaction failed');
          }

          return receipt;
        } catch (error) {
          // Close pending toast
          toast.close(pendingToastId);
          throw error;
        }
      } catch (error) {
        console.error('Transaction error:', error);
        setError(error as Error);
        
        toast({
          title: 'Transaction Failed',
          description: toastConfig?.errorMessage || error.message || 'Transaction failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        
        throw error;
      } finally {
        setIsTransacting(false);
      }
    },
    [toast]
  );

  return (
    <TransactionContext.Provider value={{ executeTransaction, isTransacting, error }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}

export default TransactionContext;
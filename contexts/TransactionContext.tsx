// File: ./contexts/TransactionContext.tsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FunctionComponent,
} from 'react';
import { ethers, ContractTransactionResponse } from 'ethers';
import { UseToastOptions } from '@chakra-ui/react';
import { Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { getChainById } from '../config/contracts';

// Define types
interface TransactionState {
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
}

interface TransactionReceipt {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  hash: string;
  status: number;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionIndex: number;
    logIndex: number;
  }>;
}

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  gasLimitMultiplier?: number;
}

interface TransactionContextValue {
  executeTransaction: <T extends ContractTransactionResponse>(
    chainId: string,
    transactionFn: () => Promise<T>,
    options?: TransactionOptions
  ) => Promise<{ tx: T; receipt: TransactionReceipt } | null>;
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
}

interface TransactionProviderProps {
  children: ReactNode;
  toast: (options: UseToastOptions) => void | string | number;
}

// Create context with default value
const TransactionContext = createContext<TransactionContextValue>({
  executeTransaction: async () => null,
  isTransacting: false,
  currentHash: null,
  error: null,
});

// Export hook with proper type checking
export const useTransaction = (): TransactionContextValue => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

// Provider component
export const TransactionProvider: FunctionComponent<TransactionProviderProps> = ({
  children,
  toast,
}) => {
  const [state, setState] = useState<TransactionState>({
    isTransacting: false,
    currentHash: null,
    error: null,
  });

  const executeTransaction = useCallback(
    async <T extends ContractTransactionResponse>(
      chainId: string,
      transactionFn: () => Promise<T>,
      options: TransactionOptions = {}
    ): Promise<{ tx: T; receipt: TransactionReceipt } | null> => {
      setState({
        isTransacting: true,
        currentHash: null,
        error: null,
      });

      const toastId = 'transaction-status';

      try {
        // Show initial toast
        toast({
          id: toastId,
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Send transaction
        const tx = await transactionFn();
        const hash = tx.hash;
        
        setState(prev => ({ ...prev, currentHash: hash }));

        // Update toast to pending state
        toast.update(toastId, {
          title: 'Transaction Pending',
          description: (
            <div>
              <p>Waiting for confirmation...</p>
              <a
                href={`${getChainById(chainId).blockExplorers?.default.url}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'blue.500',
                  marginTop: '8px',
                }}
              >
                View on Explorer <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </a>
            </div>
          ),
          status: 'loading',
          duration: null,
        });

        // Wait for transaction confirmation
        try {
          const receipt = await tx.wait();
          
          if (!receipt) {
            throw new Error('Failed to get transaction receipt');
          }

          // Close pending toast
          toast.close(toastId);

          if (receipt.status === 1) {
            // Transaction successful
            toast({
              title: 'Transaction Confirmed',
              description: options.successMessage || 'Transaction successful',
              status: 'success',
              duration: 5000,
              icon: <Check size={16} />,
            });

            if (options.onSuccess) {
              options.onSuccess();
            }

            const formattedReceipt: TransactionReceipt = {
              blockNumber: receipt.blockNumber,
              blockHash: receipt.blockHash,
              transactionIndex: receipt.transactionIndex,
              hash: receipt.hash,
              status: receipt.status,
              logs: receipt.logs.map(log => ({
                address: log.address,
                topics: log.topics,
                data: log.data,
                blockNumber: log.blockNumber,
                transactionIndex: log.transactionIndex,
                logIndex: log.logIndex,
              })),
            };

            return { tx, receipt: formattedReceipt };
          } else {
            throw new Error('Transaction failed');
          }
        } catch (error: any) {
          // Handle specific error cases
          if (error.code === 'TRANSACTION_REPLACED') {
            if (error.reason === 'repriced') {
              // Transaction was repriced/speeded up
              if (error.receipt.status === 1) {
                toast({
                  title: 'Transaction Confirmed',
                  description: options.successMessage || 'Transaction successful (speed up)',
                  status: 'success',
                  duration: 5000,
                });
                if (options.onSuccess) {
                  options.onSuccess();
                }
                return {
                  tx,
                  receipt: error.receipt as TransactionReceipt
                };
              }
            } else if (error.reason === 'cancelled') {
              throw new Error('Transaction was cancelled');
            }
          }
          throw error;
        }
      } catch (error: any) {
        console.error('Transaction error:', error);
        toast.close(toastId);

        // Handle user rejection separately
        if (
          error.code === 'ACTION_REJECTED' ||
          error.code === 4001 ||
          error.message?.toLowerCase().includes('user rejected') ||
          error.message?.toLowerCase().includes('user denied')
        ) {
          toast({
            title: 'Transaction Cancelled',
            description: 'You rejected the transaction',
            status: 'warning',
            duration: 5000,
            icon: <AlertTriangle size={16} />,
          });
          return null;
        }

        const errorMessage = formatTransactionError(error);
        setState(prev => ({ ...prev, error: new Error(errorMessage) }));

        toast({
          title: 'Transaction Failed',
          description: options.errorMessage || errorMessage,
          status: 'error',
          duration: 5000,
          icon: <AlertTriangle size={16} />,
        });

        return null;
      } finally {
        setState(prev => ({
          ...prev,
          isTransacting: false,
          currentHash: null,
        }));
      }
    },
    [toast]
  );

  return (
    <TransactionContext.Provider
      value={{
        executeTransaction,
        isTransacting: state.isTransacting,
        currentHash: state.currentHash,
        error: state.error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// Helper function to format transaction errors
const formatTransactionError = (error: any): string => {
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    return 'Transaction was rejected';
  }

  // Standard error codes
  switch (error.code) {
    case 'INSUFFICIENT_FUNDS':
      return 'Insufficient funds to complete the transaction';
    case 'UNPREDICTABLE_GAS_LIMIT':
      return 'Unable to estimate gas limit. The transaction may fail';
    case 'CALL_EXCEPTION':
      return 'Transaction would fail. Please check your inputs';
    default:
      break;
  }

  // Message pattern matching
  const message = error.message?.toLowerCase() || '';
  if (message.includes('gas required exceeds allowance')) {
    return 'Transaction would exceed gas limit';
  }
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds to complete the transaction';
  }
  if (message.includes('nonce too low')) {
    return 'Please wait for your previous transaction to complete';
  }
  if (message.includes('replacement fee too low')) {
    return 'Gas price too low. Please try again with a higher gas price';
  }

  return error.message || 'An error occurred while processing the transaction';
};

export { TransactionContext };
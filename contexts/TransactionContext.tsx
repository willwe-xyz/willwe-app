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

interface TransactionContextType {
  executeTransaction: <T extends ContractTransactionResponse>(
    chainId: string,
    transactionFn: () => Promise<T>,
    options?: TransactionOptions
  ) => Promise<{ tx: T; receipt: TransactionReceipt } | null>;
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
}

interface TransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  gasLimitMultiplier?: number;
}

interface TransactionProviderProps {
  children: ReactNode;
  toast: (options: UseToastOptions) => void | string | number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

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

        try {
          // Wait for the transaction receipt using provider's waitForTransaction
          const provider = tx.provider;
          
          // First wait for initial confirmation
          let receipt = await provider.waitForTransaction(tx.hash, 1, 60000); // 60 second timeout

          if (!receipt) {
            throw new Error('Failed to get transaction receipt');
          }

          // Then wait for additional confirmations if needed
          try {
            receipt = await provider.waitForTransaction(tx.hash, 2, 120000); // 2 minute timeout for full confirmation
          } catch (confirmError) {
            console.warn('Additional confirmation timeout, proceeding with single confirmation');
          }

          // Close pending toast
          toast.close(toastId);

          if (receipt.status === 1) {
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
              transactionIndex: receipt.index || 0,
              hash: receipt.hash,
              status: receipt.status,
              logs: receipt.logs.map(log => ({
                address: log.address,
                topics: log.topics,
                data: log.data,
                blockNumber: log.blockNumber,
                transactionIndex: log.index || 0,
                logIndex: log.logIndex || 0,
              })),
            };

            return { tx, receipt: formattedReceipt };
          } else {
            throw new Error('Transaction failed');
          }
        } catch (error: any) {
          // Handle timeout specifically
          if (error.code === 'TIMEOUT') {
            console.warn('Transaction confirmation timeout - checking final status');
            try {
              // One final attempt to get transaction status
              const finalReceipt = await tx.provider.getTransactionReceipt(tx.hash);
              if (finalReceipt && finalReceipt.status === 1) {
                // Transaction actually succeeded despite timeout
                toast({
                  title: 'Transaction Confirmed',
                  description: options.successMessage || 'Transaction successful (confirmed late)',
                  status: 'success',
                  duration: 5000,
                  icon: <Check size={16} />,
                });
                
                if (options.onSuccess) {
                  options.onSuccess();
                }

                const formattedReceipt: TransactionReceipt = {
                  blockNumber: finalReceipt.blockNumber,
                  blockHash: finalReceipt.blockHash,
                  transactionIndex: finalReceipt.index || 0,
                  hash: finalReceipt.hash,
                  status: finalReceipt.status,
                  logs: finalReceipt.logs.map(log => ({
                    address: log.address,
                    topics: log.topics,
                    data: log.data,
                    blockNumber: log.blockNumber,
                    transactionIndex: log.index || 0,
                    logIndex: log.logIndex || 0,
                  })),
                };

                return { tx, receipt: formattedReceipt };
              }
            } catch (finalCheckError) {
              console.error('Final status check failed:', finalCheckError);
            }
          }

          if (error.code === 'TRANSACTION_REPLACED') {
            if (error.reason === 'repriced') {
              const replacementReceipt = error.receipt;
              if (replacementReceipt.status === 1) {
                toast({
                  title: 'Transaction Confirmed',
                  description: options.successMessage || 'Transaction successful (speed up)',
                  status: 'success',
                  duration: 5000,
                });
                if (options.onSuccess) {
                  options.onSuccess();
                }
                const formattedReceipt: TransactionReceipt = {
                  blockNumber: replacementReceipt.blockNumber,
                  blockHash: replacementReceipt.blockHash,
                  transactionIndex: replacementReceipt.index || 0,
                  hash: replacementReceipt.hash,
                  status: replacementReceipt.status,
                  logs: replacementReceipt.logs.map(log => ({
                    address: log.address,
                    topics: log.topics,
                    data: log.data,
                    blockNumber: log.blockNumber,
                    transactionIndex: log.index || 0,
                    logIndex: log.logIndex || 0,
                  })),
                };
                return { tx, receipt: formattedReceipt };
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

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

const formatTransactionError = (error: any): string => {
  if (
    error?.code === 'ACTION_REJECTED' ||
    error?.code === 4001 ||
    error?.message?.toLowerCase().includes('user rejected') ||
    error?.message?.toLowerCase().includes('user denied')
  ) {
    return 'Transaction was rejected';
  }

  switch (error?.code) {
    case 'INSUFFICIENT_FUNDS':
      return 'Insufficient funds to complete the transaction';
    case 'UNPREDICTABLE_GAS_LIMIT':
      return 'Unable to estimate gas limit. The transaction may fail';
    case 'CALL_EXCEPTION':
      return 'Transaction would fail. Please check your inputs';
    case 'TIMEOUT':
      return 'Transaction confirmation timed out. Check explorer for status.';
    default:
      break;
  }

  const message = error?.message?.toLowerCase() || '';
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

  return error?.message || 'An error occurred while processing the transaction';
};

export { TransactionContext };
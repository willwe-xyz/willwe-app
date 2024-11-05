// TransactionContext.tsx
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
import { deployments, ABIs } from '../config/contracts';
import { getChainById } from '../config/deployments';
import { usePrivy } from '@privy-io/react-auth';

// Transaction state and types
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
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionIndex: number;
    logIndex: number;
  }>;
  status: number;
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
  gasLimit?: number;
}

interface TransactionProviderProps {
  children: ReactNode;
  toast: (options: UseToastOptions) => void | string | number;
}

// Creating the Transaction Context
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
        toast({
          id: toastId,
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        const tx = await transactionFn();
        const hash = tx.hash;
        setState((prev) => ({ ...prev, currentHash: hash }));

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

        const transaction = await tx.getTransaction()
        const receipt = await transaction?.wait(1);

        toast.close(toastId);

        if (receipt && receipt.status === 1) {
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
            logs: receipt.logs.map((log) => ({
              address: log.address,
              topics: log.topics,
              data: log.data,
              blockNumber: log.blockNumber,
              transactionIndex: log.transactionIndex,
              logIndex: log.logIndex,
            })),
            status: receipt.status,
          };

          return { tx, receipt: formattedReceipt };
        } else {
          throw new Error('Transaction failed');
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
        setState((prev) => ({ ...prev, error: new Error(errorMessage) }));

        toast({
          title: 'Transaction Failed',
          description: options.errorMessage || errorMessage,
          status: 'error',
          duration: 5000,
          icon: <AlertTriangle size={16} />,
        });

        return null;
      } finally {
        setState((prev) => ({
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

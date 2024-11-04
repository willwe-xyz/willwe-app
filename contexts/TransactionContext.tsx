import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ethers, ContractTransactionResponse } from 'ethers';
import { UseToastOptions } from '@chakra-ui/react';
import { Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { deployments, ABIs } from '../config/contracts';
import { getChainById } from '../config/deployments';
import { usePrivy } from '@privy-io/react-auth';

interface TransactionState {
  isTransacting: boolean;
  currentHash: string | null;
  error: Error | null;
}

interface TransactionContextType {
  executeTransaction: <T extends ContractTransactionResponse>(
    chainId: string,
    transactionFn: () => Promise<T>,
    options?: TransactionOptions
  ) => Promise<T | null>;
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

const TransactionContext = createContext<TransactionContextType>({
  executeTransaction: async () => null,
  isTransacting: false,
  currentHash: null,
  error: null
});

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
  toast
}) => {
  const [state, setState] = useState<TransactionState>({
    isTransacting: false,
    currentHash: null,
    error: null
  });

  const executeTransaction = useCallback(
    async <T extends ContractTransactionResponse>(
      chainId: string,
      transactionFn: () => Promise<T>,
      options: TransactionOptions = {}
    ): Promise<T | null> => {
      setState({
        isTransacting: true,
        currentHash: null,
        error: null
      });

      const toastId = 'transaction-status';

      try {
        // Initial toast for transaction submission
        toast({
          id: toastId,
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Execute transaction
        const response = await transactionFn();
        const hash = response.hash;
        
        // Update state with transaction hash
        setState(prev => ({ ...prev, currentHash: hash }));

        // Update toast to show pending status
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
                  marginTop: '8px'
                }}
              >
                View on Explorer <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </a>
            </div>
          ),
          status: 'loading',
          duration: null,
        });

        // Get transaction object and wait for receipt
        const tx = await response.getTransaction();
        const receipt = await tx.wait(1);

        // Close the pending toast
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
          return response;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        console.error('Transaction error:', error);
        
        // Close pending toast if it exists
        toast.close(toastId);

        // Handle user rejection specifically
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
          currentHash: null
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
        error: state.error
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useContractOperation = (contractName: keyof typeof deployments) => {
  const { getEthersProvider } = usePrivy();
  const context = useContext(TransactionContext);

  return useCallback(
    async (
      chainId: string,
      methodName: string,
      args: any[],
      options?: TransactionOptions
    ) => {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments[contractName][cleanChainId];

      if (!contractAddress) {
        console.error(`No ${contractName} contract found for chain ${chainId}`);
        return null;
      }

      return context.executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs[contractName],
            signer
          );

          // Prepare transaction options
          let txOptions = {};
          if (options?.gasLimit) {
            txOptions = { gasLimit: options.gasLimit };
          } else {
            try {
              const estimatedGas = await contract[methodName].estimateGas(...args);
              const multiplier = options?.gasLimitMultiplier || 1.2;
              txOptions = {
                gasLimit: Math.floor(Number(estimatedGas) * multiplier)
              };
            } catch (error) {
              console.warn('Gas estimation failed, using default gas limit');
              txOptions = { gasLimit: 500000 }; // Default fallback
            }
          }

          return await contract[methodName](...args, txOptions);
        },
        options
      );
    },
    [contractName, getEthersProvider]
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
  // Handle user rejection cases
  if (
    error?.code === 'ACTION_REJECTED' || 
    error?.code === 4001 ||
    error?.message?.toLowerCase().includes('user rejected') ||
    error?.message?.toLowerCase().includes('user denied')
  ) {
    return 'Transaction was rejected';
  }

  // Handle specific error codes
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

  // Handle common error messages
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

const getExplorerLink = (chainId: string, hash: string): string => {
  const chain = getChainById(chainId);
  return `${chain.blockExplorers?.default.url}/tx/${hash}`;
};

export {
  TransactionContext,
  formatTransactionError,
  getExplorerLink
};
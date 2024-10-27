import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ethers, ContractTransactionResponse, BrowserProvider } from 'ethers';
import { UseToastOptions } from '@chakra-ui/react';
import { deployments, ABIs } from '../config/deployments';

// Types
export interface TransactionState {
  isTransacting: boolean;
  currentTransaction: string | null;
  error: Error | null;
}

export interface TransactionContextType extends TransactionState {
  executeTransaction: (
    chainId: string,
    transactionFn: (contract: ethers.Contract) => Promise<ContractTransactionResponse>,
    options: {
      successMessage: string;
      onSuccess?: () => void;
    }
  ) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: TransactionState = {
  isTransacting: false,
  currentTransaction: null,
  error: null,
};

// Action types
type TransactionAction =
  | { type: 'START_TRANSACTION'; payload: string }
  | { type: 'END_TRANSACTION' }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'CLEAR_ERROR' };

// Reducer
function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'START_TRANSACTION':
      return {
        ...state,
        isTransacting: true,
        currentTransaction: action.payload,
        error: null,
      };
    case 'END_TRANSACTION':
      return {
        ...state,
        isTransacting: false,
        currentTransaction: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isTransacting: false,
        currentTransaction: null,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const getWillWeContract = async (chainId: string, provider: BrowserProvider): Promise<ethers.Contract> => {
  const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    deployments.WillWe[cleanChainId],
    ABIs.WillWe,
    signer
  );
};

// Context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Provider component
export function TransactionProvider({ 
  children,
  toast
}: { 
  children: React.ReactNode;
  toast: (options: UseToastOptions) => void;
}) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const executeTransaction = useCallback(async (
    chainId: string,
    transactionFn: (contract: ethers.Contract) => Promise<ContractTransactionResponse>,
    options: {
      successMessage: string;
      onSuccess?: () => void;
    }
  ) => {
    try {
      dispatch({ type: 'START_TRANSACTION', payload: 'Executing transaction...' });

      // Get provider from window.ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getWillWeContract(chainId, provider);
      
      const tx = await transactionFn(contract);
      await tx.wait();
      
      toast({
        title: 'Success',
        description: options.successMessage,
        status: 'success',
        duration: 5000,
      });

      if (options.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      const errorMessage = error.message || 'Transaction failed';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
      
      dispatch({ type: 'SET_ERROR', payload: error });
    } finally {
      dispatch({ type: 'END_TRANSACTION' });
    }
  }, [toast]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        ...state,
        executeTransaction,
        clearError,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

// Custom hook
export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}
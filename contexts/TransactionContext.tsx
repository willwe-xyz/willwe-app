import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppKitContext } from '@/components/AppKitProvider';
import { toast } from 'react-hot-toast';

// Support both ethers and wagmi-style transaction responses
export type TransactionLike = {
  hash: string;
  wait: () => Promise<any>;
};

interface TransactionContextType {
  executeTransaction: (transaction: () => Promise<TransactionLike>) => Promise<void>;
  currentHash: string | null;
  error: string | null;
  isPending: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [isPending, setIsPending] = useState(false);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const appKit = useAppKitContext();

  const executeTransaction = useCallback(async (transaction: () => Promise<TransactionLike>) => {
    if (!appKit?.user?.isAuthenticated) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsPending(true);
      setError(null);
      const tx = await transaction();
      if (tx.hash) {
        setCurrentHash(tx.hash);
        const receipt = await tx.wait();
        if (receipt) {
          setCurrentHash(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setCurrentHash(null);
    } finally {
      setIsPending(false);
    }
  }, [appKit]);

  return (
    <TransactionContext.Provider value={{ executeTransaction, currentHash, error, isPending }}>
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
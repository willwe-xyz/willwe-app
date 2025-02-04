import { useState } from 'react';
import { Contract } from 'ethers';

interface TransactionParams {
  contract: Contract;
  method: string;
  args: any[];
  onSuccess?: () => void;
}

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);

  const executeTransaction = async ({ 
    contract, 
    method, 
    args, 
    onSuccess 
  }: TransactionParams) => {
    setIsLoading(true);
    try {
      const tx = await contract[method](...args);
      await tx.wait();
      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeTransaction, isLoading };
};
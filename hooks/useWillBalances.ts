import { useState, useEffect } from 'react';
import { AlchemyTokenBalance } from './useAlchemyBalances';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/alchemy/balances?address=${deployments.WillWe[chainId]}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }
      const data = await response.json();
      setWillBalanceItems(data.balances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching balances'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWillBalances();
  }, [chainId]);

  return { 
    willBalanceItems, 
    isLoading, 
    error,
    refetch: fetchWillBalances 
  };
}
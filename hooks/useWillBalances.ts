import { useState, useEffect, useCallback } from 'react';
import { AlchemyTokenBalance } from './useAlchemyBalances';
import { deployments } from '../config/deployments';

export const useWillBalances = (chainId: string | undefined) => {
  const [willBalanceItems, setWillBalanceItems] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = useCallback(async () => {
    if (!chainId) {
      setWillBalanceItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const willWeAddress = deployments.WillWe[chainId];
      if (!willWeAddress) {
        throw new Error(`No WillWe contract found for chain ${chainId}`);
      }

      // Use our internal API endpoint
      const response = await fetch(`/api/alchemy/balances?address=${willWeAddress}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error(`Error fetching Will balances: ${response.statusText}`);
      }

      const data = await response.json();
      setWillBalanceItems(data.balances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setWillBalanceItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  useEffect(() => {
    fetchWillBalances();
  }, [fetchWillBalances]);

  return {
    willBalanceItems,
    isLoading,
    error,
    refetch: fetchWillBalances
  };
};

export default useWillBalances;
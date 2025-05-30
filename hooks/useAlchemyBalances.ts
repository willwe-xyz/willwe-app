import { useState, useEffect, useCallback } from 'react';

// New type to replace the Covalent BalanceItem
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string | null;
  formattedBalance: string;
}

export interface UseAlchemyBalancesResult {
  balances: AlchemyTokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache for storing balance results
const balanceCache = new Map<string, {
  balances: AlchemyTokenBalance[];
  timestamp: number;
}>();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export const useAlchemyBalances = (
  address: string | undefined,
  chainId: string | undefined
): UseAlchemyBalancesResult => {
  const [balances, setBalances] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address || !chainId) {
      setBalances([]);
      return;
    }

    // Check cache first
    const cacheKey = `${address}-${chainId}`;
    const cachedData = balanceCache.get(cacheKey);
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION) {
      setBalances(cachedData.balances);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use our internal API endpoint
      const response = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error(`Error fetching balances: ${response.statusText}`);
      }

      const data = await response.json();
      // Update cache
      balanceCache.set(cacheKey, {
        balances: data.balances,
        timestamp: now
      });
      setBalances(data.balances);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
};

export default useAlchemyBalances;
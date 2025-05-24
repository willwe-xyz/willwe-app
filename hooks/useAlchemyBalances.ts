import { useState, useEffect, useRef } from 'react';

// New type to replace the Covalent BalanceItem
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string | null;
  // Metadata fields
  name: string;
  symbol: string;
  decimals: number | null;
  logo?: string | null;
  // Formatted balance in human readable form
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchBalances = async () => {
    if (!address || !chainId) {
      setBalances([]);
      setIsLoading(false);
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
      const response = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }
      const data = await response.json();

      // Update cache
      balanceCache.set(cacheKey, {
        balances: data.balances,
        timestamp: now
      });

      setBalances(data.balances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchBalances();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [address, chainId]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
};

export default useAlchemyBalances;
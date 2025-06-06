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
// Maximum number of cache entries
const MAX_CACHE_ENTRIES = 100;

// Helper function to clean up old cache entries
function cleanupCache() {
  const now = Date.now();
  Array.from(balanceCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      balanceCache.delete(key);
    }
  });
  
  // If still over limit, remove oldest entries
  if (balanceCache.size > MAX_CACHE_ENTRIES) {
    const entries = Array.from(balanceCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const entriesToRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
    entriesToRemove.forEach(([key]) => balanceCache.delete(key));
  }
}

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
      // For Base networks, try Routescan first
      let data;
      if (chainId === '8453' || chainId === '84532') {
        try {
          const routescanResponse = await fetch(`/api/routescan/balances?address=${address}&chainId=${chainId}`);
          if (routescanResponse.ok) {
            data = await routescanResponse.json();
            // If Routescan returns empty balances, fall back to Alchemy
            if (data.balances && data.balances.length > 0) {
            } else {
              const alchemyResponse = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
              if (!alchemyResponse.ok) {
                throw new Error(`Error fetching Alchemy balances: ${alchemyResponse.statusText}`);
              }
              data = await alchemyResponse.json();
            }
          } else {
            const alchemyResponse = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
            if (!alchemyResponse.ok) {
              throw new Error(`Error fetching Alchemy balances: ${alchemyResponse.statusText}`);
            }
            data = await alchemyResponse.json();
          }
        } catch (routescanError) {
          const alchemyResponse = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
          if (!alchemyResponse.ok) {
            throw new Error(`Error fetching Alchemy balances: ${alchemyResponse.statusText}`);
          }
          data = await alchemyResponse.json();
        }
      } else {
        // For non-Base networks, use Alchemy directly
        const alchemyResponse = await fetch(`/api/alchemy/balances?address=${address}&chainId=${chainId}`);
        if (!alchemyResponse.ok) {
          throw new Error(`Error fetching Alchemy balances: ${alchemyResponse.statusText}`);
        }
        data = await alchemyResponse.json();
      }
      
      // Clean up cache before adding new entry
      cleanupCache();
      
      // Update cache
      balanceCache.set(cacheKey, {
        balances: data.balances,
        timestamp: now
      });
      
      setBalances(data.balances);
    } catch (err) {
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
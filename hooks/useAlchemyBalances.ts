import { useState, useEffect, useRef } from 'react';
import { Alchemy, TokenBalanceType } from "alchemy-sdk";
import { getAlchemyNetwork } from '../config/deployments';

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

const alchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
};

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
      const alchemy = new Alchemy({
        ...alchemyConfig,
        network: getAlchemyNetwork(chainId)
      });
      // Get token balances
      const response = await alchemy.core.getTokenBalances(address);

      // Filter out zero balances and suspicious tokens
      const nonZeroBalances = response.tokenBalances.filter(
        token => token.tokenBalance !== "0"
      );

      // Fetch metadata and format balances
      const formattedBalances = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );

          // Skip tokens with suspicious characteristics
          if (
            !metadata.name || // Missing name
            !metadata.symbol || // Missing symbol
            metadata.symbol === '???' || // Unknown symbol
            metadata.name === 'Unknown Token' || // Unknown name
            metadata.name.toLowerCase().includes('!') || 
            metadata.name.toLowerCase().includes('$') ||
            metadata.name.toLowerCase().includes('Visit') ||
            metadata.symbol.toLowerCase().includes('Visit') ||
            metadata.symbol.toLowerCase().includes('Claim') ||
            metadata.symbol.toLowerCase().includes(':') ||
            metadata.symbol.toLowerCase().includes('!') ||
            metadata.symbol.toLowerCase().includes('$') ||
            metadata.symbol.toLowerCase().includes('spam')
          ) {
            return null;
          }

          // Calculate human readable balance
          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
          const formattedBalance = balance.toFixed(2);

          const balanceItem: AlchemyTokenBalance = {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            logo: metadata.logo || null,
            formattedBalance
          };

          return balanceItem;
        })
      );

      // Filter out null values from suspicious tokens
      const filteredBalances = formattedBalances.filter((balance): balance is AlchemyTokenBalance => balance !== null);

      // Sort balances by value, pushing zero balances to the end
      const sortedBalances = filteredBalances.sort((a, b) => {
        const balanceA = Number(a.formattedBalance);
        const balanceB = Number(b.formattedBalance);
        
        // If either balance is 0, push it to the end
        if (balanceA === 0 && balanceB !== 0) return 1;
        if (balanceA !== 0 && balanceB === 0) return -1;
        if (balanceA === 0 && balanceB === 0) return 0;
        
        // Otherwise sort by value in descending order
        return balanceB - balanceA;
      });

      // Update cache
      balanceCache.set(cacheKey, {
        balances: sortedBalances,
        timestamp: now
      });

      setBalances(sortedBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a new timeout to debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchBalances();
    }, 300); // 300ms debounce

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
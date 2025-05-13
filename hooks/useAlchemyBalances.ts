import { useState, useEffect, useRef } from 'react';
import { Alchemy } from "alchemy-sdk";
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
  // Price information
  price?: {
    value: string;
    currency: string;
    lastUpdatedAt: string;
  };
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

// Get exclusion list from environment variable
const TOKEN_BALANCE_EXCLUDEIF = (process.env.NEXT_PUBLIC_TOKEN_BALANCE_EXCLUDEIF || '')
  .split(',')
  .map(item => item.trim().toLowerCase())
  .filter(item => item.length > 0);

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
      const network = getAlchemyNetwork(chainId);
      
      // Try Routescan first
      try {
        const routescanUrl = `https://api.routescan.io/v2/network/mainnet/evm/${chainId}/etherscan/api?module=account&action=addresstokenbalance&address=${address}&apikey=${alchemyConfig.apiKey}`;


        const routescanResponse = await fetch(routescanUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (routescanResponse.ok) {
          const data = await routescanResponse.json();
          
          // Transform the response into our format
          const formattedBalances = data.result.map((token: any) => {
            const balance = Number(token.TokenQuantity) / Math.pow(10, Number(token.TokenDivisor));
            
            return {
              contractAddress: token.TokenAddress,
              tokenBalance: token.TokenQuantity,
              name: token.TokenName || 'Unknown Token',
              symbol: token.TokenSymbol || '???',
              decimals: Number(token.TokenDivisor),
              logo: undefined,
              formattedBalance: balance.toFixed(2),
              price: undefined
            };
          });

          // Enhanced filtering for suspicious tokens
          const filteredBalances = formattedBalances.filter((token: AlchemyTokenBalance) => {
            const symbol = token.symbol.toLowerCase();
            const name = token.name.toLowerCase();
            
            // Check for invalid characters and patterns
            const hasInvalidSymbol = /[\[\]!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(token.symbol) || 
              /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(token.symbol);
            const hasInvalidName = /^[^a-zA-Z]/.test(token.name);
            
            // Check if token contains any excluded keywords
            const hasExcludedKeyword = TOKEN_BALANCE_EXCLUDEIF.some(keyword => 
              symbol.includes(keyword) || name.includes(keyword)
            );

            return !(
              !token.name || // Missing name
              !token.symbol || // Missing symbol
              token.symbol === '???' || // Unknown symbol
              token.name === 'Unknown Token' || // Unknown name
              hasInvalidSymbol || // Contains invalid characters in symbol
              hasInvalidName || // Name starts with non-letter
              hasExcludedKeyword // Contains excluded keywords
            );
          });

          // Sort balances by value
          const sortedBalances = filteredBalances.sort((a: AlchemyTokenBalance, b: AlchemyTokenBalance) => {
            const balanceA = Number(a.formattedBalance);
            const balanceB = Number(b.formattedBalance);
            
            if (balanceA === 0 && balanceB !== 0) return 1;
            if (balanceA !== 0 && balanceB === 0) return -1;
            if (balanceA === 0 && balanceB === 0) return 0;
            
            return balanceB - balanceA;
          });

          // Update cache
          balanceCache.set(cacheKey, {
            balances: sortedBalances,
            timestamp: now
          });

          setBalances(sortedBalances);
          return;
        }
      } catch (error) {
        console.warn('Routescan API failed, falling back to Alchemy:', error);
      }

      // Fallback to Alchemy
      try {
        const alchemyUrl = `https://${network}.g.alchemy.com/v2/${alchemyConfig.apiKey}`;
        
        const requestBody = {
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address, "erc20"]
        };

        const alchemyResponse = await fetch(alchemyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!alchemyResponse.ok) {
          throw new Error(`Alchemy API failed: ${alchemyResponse.statusText}`);
        }

        const data = await alchemyResponse.json();
        
        // Get token balances from the response
        const tokenBalances = data.result.tokenBalances;
        
        // Filter out zero balances
        const nonZeroBalances = tokenBalances.filter((token: any) => 
          BigInt(token.tokenBalance) > BigInt(0)
        );

        // Fetch metadata for each token
        const formattedBalances = await Promise.all(nonZeroBalances.map(async (token: any) => {
          const metadataResponse = await fetch(alchemyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: 1,
              jsonrpc: "2.0",
              method: "alchemy_getTokenMetadata",
              params: [token.contractAddress]
            })
          });

          const metadataData = await metadataResponse.json();
          const metadata = metadataData.result || {};
          
          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
          
          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: metadata.decimals,
            logo: metadata.logo,
            formattedBalance: balance.toFixed(2),
            price: undefined
          };
        }));

        // Apply the same filtering as Routescan
        const filteredBalances = formattedBalances.filter((token: AlchemyTokenBalance) => {
          const symbol = token.symbol.toLowerCase();
          const name = token.name.toLowerCase();
          
          const hasInvalidSymbol = /[\[\]!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(token.symbol) || 
            /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(token.symbol);
          const hasInvalidName = /^[^a-zA-Z]/.test(token.name);
          
          // Check if token contains any excluded keywords
          const hasExcludedKeyword = TOKEN_BALANCE_EXCLUDEIF.some(keyword => 
            symbol.includes(keyword) || name.includes(keyword)
          );

          return !(
            !token.name ||
            !token.symbol ||
            token.symbol === '???' ||
            token.name === 'Unknown Token' ||
            hasInvalidSymbol ||
            hasInvalidName ||
            hasExcludedKeyword
          );
        });

        const sortedBalances = filteredBalances.sort((a: AlchemyTokenBalance, b: AlchemyTokenBalance) => {
          const balanceA = Number(a.formattedBalance);
          const balanceB = Number(b.formattedBalance);
          
          if (balanceA === 0 && balanceB !== 0) return 1;
          if (balanceA !== 0 && balanceB === 0) return -1;
          if (balanceA === 0 && balanceB === 0) return 0;
          
          return balanceB - balanceA;
        });

        balanceCache.set(cacheKey, {
          balances: sortedBalances,
          timestamp: now
        });

        setBalances(sortedBalances);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch balances'));
        console.error('Error fetching balances:', error);
      }
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
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

const routescanConfig = {
  apiKey: process.env.NEXT_PUBLIC_ROUTESCAN_API_KEY || '',
};

// Get excluded token strings from environment variable
const getExcludedTokenStrings = (): string[] => {
  const excludedStrings = process.env.NEXT_PUBLIC_TOKEN_BALANCE_EXCLUDEIF || '';
  const defaultExcludedStrings = [
    'claim', 'CLAIM',
    'rdrop', 'RDROP',
    'visit', 'VISIT',
    'http', 'HTTP',
    'www', 'WWW',
    'swap', 'SWAP',
    'rewards', 'REWARDS',
    'promo', 'PROMO',
    'verify', 'VERIFY',
    'eligible', 'ELIGIBLE',
    'drop', 'DROP',
    '!', '!',
    't.ly', 'T.LY',
    'discord', 'DISCORD',
    'twitter', 'TWITTER',
    'join', 'JOIN',
    'presale', 'PRESALE',
    'giveaway', 'GIVEAWAY',
    '✅', '💰'
  ];
  
  const envExcludedStrings = excludedStrings.split(',')
    .map(str => str.toLowerCase().trim())
    .filter(str => str !== '')
    .flatMap(str => [str, str.toUpperCase()]);
    
  return defaultExcludedStrings.concat(envExcludedStrings);
};

// Cache for storing balance results
const balanceCache = new Map<string, {
  balances: AlchemyTokenBalance[];
  timestamp: number;
}>();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

const getRoutescanEndpoint = (chainId: string) => {
  const baseUrl = 'https://api.routescan.io/v2/network/mainnet/evm';
  return `${baseUrl}/${chainId}/etherscan/api`;
};

const fetchRoutescanBalances = async (address: string, chainId: string): Promise<AlchemyTokenBalance[]> => {
  const endpoint = getRoutescanEndpoint(chainId);
  const url = `${endpoint}?module=account&action=addresstokenbalance&address=${address}&page=1&offset=100&apikey=${routescanConfig.apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== '1') {
    throw new Error(data.message || 'Failed to fetch balances from Routescan');
  }

  const excludedStrings = getExcludedTokenStrings();
  return data.result
    .filter((token: any) => {
      const tokenName = token.TokenName.toLowerCase();
      const tokenSymbol = token.TokenSymbol.toLowerCase();
      return !excludedStrings.some(str => tokenName.includes(str) || tokenSymbol.includes(str));
    })
    .map((token: any) => ({
      contractAddress: token.TokenAddress,
      tokenBalance: token.TokenQuantity,
      name: token.TokenName,
      symbol: token.TokenSymbol,
      decimals: parseInt(token.TokenDivisor),
      formattedBalance: (Number(token.TokenQuantity) / Math.pow(10, parseInt(token.TokenDivisor))).toFixed(2)
    }));
};

const fetchAlchemyBalances = async (address: string, chainId: string): Promise<AlchemyTokenBalance[]> => {
  const alchemy = new Alchemy({
    ...alchemyConfig,
    network: getAlchemyNetwork(chainId)
  });

  const response = await alchemy.core.getTokenBalances(address);
  const excludedStrings = getExcludedTokenStrings();
  const nonZeroBalances = response.tokenBalances.filter(
    token => token.tokenBalance !== "0"
  );

  const balances = await Promise.all(
    nonZeroBalances.map(async (token) => {
      const metadata = await alchemy.core.getTokenMetadata(
        token.contractAddress
      );

      const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
      const formattedBalance = balance.toFixed(2);

      return {
        contractAddress: token.contractAddress,
        tokenBalance: token.tokenBalance,
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || '???',
        decimals: metadata.decimals,
        logo: metadata.logo,
        formattedBalance
      };
    })
  );

  // Filter out tokens based on name or symbol
  return balances.filter(token => {
    const tokenName = token.name.toLowerCase();
    const tokenSymbol = token.symbol.toLowerCase();
    return !excludedStrings.some(str => tokenName.includes(str) || tokenSymbol.includes(str));
  });
};

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
      // Try Routescan first
      let balances;
      try {
        balances = await fetchRoutescanBalances(address, chainId);
      } catch (routescanError) {
        console.warn('Routescan fetch failed, falling back to Alchemy:', routescanError);
        balances = await fetchAlchemyBalances(address, chainId);
      }

      // Update cache
      balanceCache.set(cacheKey, {
        balances,
        timestamp: now
      });

      setBalances(balances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
      console.error('Error fetching balances:', err);
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
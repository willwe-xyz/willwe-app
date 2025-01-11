import { useState, useEffect } from 'react';
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

export const useAlchemyBalances = (
  address: string | undefined,
  chainId: string | undefined
): UseAlchemyBalancesResult => {
  const [balances, setBalances] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = async () => {
    if (!address || !chainId) {
      setBalances([]);
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

      // Filter out zero balances
      const nonZeroBalances = response.tokenBalances.filter(
        token => token.tokenBalance !== "0"
      );

      // Fetch metadata and format balances
      const formattedBalances = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );

          // Calculate human readable balance
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

      setBalances(formattedBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address, chainId]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances
  };
};

export default useAlchemyBalances;
import { useState, useEffect } from 'react';
import { Alchemy } from 'alchemy-sdk';
import { AlchemyTokenBalance } from './useAlchemyBalances';
import { getAlchemyNetwork } from '../config/deployments';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
        network: getAlchemyNetwork(chainId)
      });

      const response = await alchemy.core.getTokenBalances(deployments.WillWe[chainId]);
      const nonZeroBalances = response.tokenBalances.filter(
        token => token.tokenBalance !== "0"
      );

      const formattedBalances = await Promise.all(
        nonZeroBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
          
          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: metadata.decimals,
            logo: metadata.logo,
            formattedBalance: balance.toFixed(2)
          };
        })
      );

      setWillBalanceItems(formattedBalances);
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
import { useState, useEffect } from 'react';
import { CovalentClient, ChainID, BalanceItem } from '@covalenthq/client-sdk';
import { getCovalentApiKey } from '../config/apiKeys';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new CovalentClient(getCovalentApiKey());
      const response = await client.BalanceService.getTokenBalancesForWalletAddress(parseInt(chainId.replace('eip155:', '')) as ChainID, deployments.WillWe[chainId] as string);
      console.log(response);
      if (response.data && response.data.items) {
        setWillBalanceItems(response.data.items);
      } else {
        throw new Error('No balance data received');
      }
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
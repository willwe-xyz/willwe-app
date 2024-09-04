import { useState, useEffect } from 'react';
import { CovalentClient, ChainID, BalanceItem } from '@covalenthq/client-sdk';
import { getCovalentApiKey } from '../config/apiKeys';
import { deployments } from '../config/deployments';

export function useWillBalances(chainId: string) {
  const [willBalanceItems, setWillBalanceItems] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deployments.WillWe || !chainId) {
      setError(new Error('No deployments or chainId provided'));
      setIsLoading(false);
      return;
    }

    const cleanChainId = chainId.replace('eip155:', '') as string;
    const WILLWE_CONTRACT_ADDRESS = deployments.WillWe[cleanChainId] as string;

    const fetchWillBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const client = new CovalentClient(getCovalentApiKey());
        const response = await client.BalanceService.getTokenBalancesForWalletAddress(parseInt(cleanChainId) as ChainID, WILLWE_CONTRACT_ADDRESS);
        
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

    fetchWillBalances();
  }, [chainId]);

  return { willBalanceItems, isLoading, error };
}
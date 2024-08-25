import { useState, useEffect, useCallback } from 'react';
import { BalanceItem, ChainID, CovalentClient } from "@covalenthq/client-sdk";
import { getCovalentApiKey } from '../config/apiKeys';

export const useCovalentBalances = (address: string, chainId: string) => {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address || !chainId) {
      setError(new Error('Missing address or chainId'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const apiKey = getCovalentApiKey();
      const covalentClient = new CovalentClient(apiKey);

      const cleanChainId = chainId.replace('eip155:', '') as ChainID;

      const response = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address);
      
      if (response.data && response.data.items) {
        setBalances(response.data.items);
        setError(null);
      } else {
        throw new Error('Invalid response from Covalent API');
      }
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, isLoading, error, refetch: fetchBalances };
};
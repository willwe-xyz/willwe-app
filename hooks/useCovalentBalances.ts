import { useState, useEffect } from 'react';
import { BalanceItem, ChainID, CovalentClient } from "@covalenthq/client-sdk";
import { getCovalentApiKey } from '../config/apiKeys';

const fetchBalances = async (address: string, chainId: string): Promise<BalanceItem[]> => {
  if (!address || !chainId) return [];

  const apiKey = getCovalentApiKey();
  const covalentClient = new CovalentClient(apiKey);
  const cleanChainId = chainId.replace('eip155:', '') as ChainID;

  const response = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address);
  
  if (response.data && response.data.items) {
    return response.data.items;
  }
  throw new Error('Invalid response from Covalent API');
};

export const useCovalentBalances = (address: string, chainId: string) => {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadBalances = async () => {
      try {
        const data = await fetchBalances(address, chainId);
        setBalances(data);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadBalances();
  }, [address, chainId]);

  console.log("data in useCovalentBalances", balances);
  return { balances, isLoading, error };
};
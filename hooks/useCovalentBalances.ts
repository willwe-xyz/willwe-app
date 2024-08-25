import useSWR from 'swr';
import { BalanceItem, ChainID, CovalentClient } from "@covalenthq/client-sdk";
import { getCovalentApiKey } from '../config/apiKeys';

const fetchBalances = async ([address, chainId]: [string, string]): Promise<BalanceItem[]> => {
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
  const { data, error } = useSWR([address, chainId], fetchBalances, {
    suspense: true,
    revalidateOnFocus: false,
  });

  return {
    balances: data || [],
    isLoading: !error && !data,
    error: error
  };
};
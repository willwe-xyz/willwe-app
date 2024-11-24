import { useState, useEffect } from 'react';
import { BalanceItem, ChainID, CovalentClient } from "@covalenthq/client-sdk";
import { getCovalentApiKey } from '../config/apiKeys';

const fetchBalances = async (address: string, chainId: string): Promise<{balances: BalanceItem[], protocolBalances: BalanceItem[]}> => {
  if (!address || !chainId) return { balances: [], protocolBalances: [] };

  const apiKey = getCovalentApiKey();
  const covalentClient = new CovalentClient(apiKey);
  const cleanChainId = chainId.replace('eip155:', '') as unknown as ChainID;

  // Get regular balances
  const balanceResponse = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address);
  const balances = balanceResponse.data?.items || [];

  // Get protocol balances
  const protocolResponse = await covalentClient.BalanceService.getTokenBalancesForWalletAddress(cleanChainId, address, {
    nft: false,
    noSpam: true,
    quoteCurrency: 'USD'
  });
  const protocolBalances = protocolResponse.data?.items || [];

  return { balances, protocolBalances };
};

export const useCovalentBalances = (address: string, chainId: string) => {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [protocolBalances, setProtocolBalances] = useState<BalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      const { balances, protocolBalances } = await fetchBalances(address, chainId);
      setBalances(balances);
      setProtocolBalances(protocolBalances);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [address, chainId]);

  return { balances, protocolBalances, isLoading, error, refetch: loadBalances };
};
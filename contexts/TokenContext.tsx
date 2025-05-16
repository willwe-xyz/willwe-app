// File: ./contexts/TokenContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppKit } from '../hooks/useAppKit';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { deployments, ABIs } from '../config/contracts';
import type { Abi } from 'viem';

interface TokenContextType {
  selectedToken: string | null;
  selectToken: (address: string) => void;
  tokenData: any | null;
  isLoading: boolean;
  error: Error | null;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

interface TokenProviderProps {
  children: React.ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', selectedToken],
    queryFn: async () => {
      if (!selectedToken || !publicClient) return null;

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        publicClient.readContract({
          address: selectedToken as `0x${string}`,
          abi: ABIs.IERC20 as Abi,
          functionName: 'name'
        }),
        publicClient.readContract({
          address: selectedToken as `0x${string}`,
          abi: ABIs.IERC20 as Abi,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: selectedToken as `0x${string}`,
          abi: ABIs.IERC20 as Abi,
          functionName: 'decimals'
        }),
        publicClient.readContract({
          address: selectedToken as `0x${string}`,
          abi: ABIs.IERC20 as Abi,
          functionName: 'totalSupply'
        })
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: formatUnits(totalSupply as bigint, decimals as number)
      };
    },
    enabled: !!selectedToken && !!publicClient,
    staleTime: 30000
  });

  const selectToken = useCallback((address: string) => {
    setSelectedToken(address);
  }, []);

  const value = {
    selectedToken,
    selectToken,
    tokenData,
    isLoading,
    error: error as Error | null
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}
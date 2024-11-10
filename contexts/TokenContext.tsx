// File: ./contexts/TokenContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../config/contracts';

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

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const { getEthersProvider } = usePrivy();

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', selectedToken],
    queryFn: async () => {
      if (!selectedToken) return null;

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(selectedToken, ABIs.IERC20, provider);

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    },
    enabled: !!selectedToken,
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
};
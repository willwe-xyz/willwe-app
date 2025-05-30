import { useAlchemyBalances, AlchemyTokenBalance } from './useAlchemyBalances';
import { useWillBalances } from './useWillBalances';
import { useCallback, useEffect, useState } from 'react';

// Extend the AlchemyTokenBalance interface to include protocol balance
interface ExtendedTokenBalance extends AlchemyTokenBalance {
  protocolBalance?: AlchemyTokenBalance;
}

export interface UseBalancesResult {
  balances: ExtendedTokenBalance[];
  protocolBalances: AlchemyTokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useBalances = (
  userAddress: string | undefined,
  chainId: string | undefined
): UseBalancesResult => {
  const alchemyBalancesResult = useAlchemyBalances(userAddress, chainId);
  const balances = alchemyBalancesResult.balances;
  const isBalancesLoading = alchemyBalancesResult.isLoading;
  const balancesError = alchemyBalancesResult.error;

  const willBalancesResult = useWillBalances(chainId);
  const protocolBalances = willBalancesResult.willBalanceItems;
  const isProtocolLoading = willBalancesResult.isLoading;
  const protocolError = willBalancesResult.error;

  const [mergedBalances, setMergedBalances] = useState<ExtendedTokenBalance[]>([]);

  const refetch = useCallback(async () => {
    await Promise.all([
      alchemyBalancesResult.refetch(),
      willBalancesResult.refetch()
    ]);
  }, [alchemyBalancesResult, willBalancesResult]);

  useEffect(() => {
    if (balances && protocolBalances) {
      const merged = mergeBalances(balances, protocolBalances);
      setMergedBalances(merged);
    }
  }, [balances, protocolBalances]);

  return {
    balances: mergedBalances,
    protocolBalances,
    isLoading: isBalancesLoading || isProtocolLoading,
    error: balancesError || protocolError,
    refetch
  };
};

function mergeBalances(
  userBalances: AlchemyTokenBalance[],
  protocolBalances: AlchemyTokenBalance[]
): ExtendedTokenBalance[] {
  const balanceMap = new Map<string, ExtendedTokenBalance>();

  // Add user balances to map
  userBalances.forEach(balance => {
    balanceMap.set(balance.contractAddress.toLowerCase(), balance as ExtendedTokenBalance);
  });

  // Merge protocol balances
  protocolBalances.forEach(balance => {
    const key = balance.contractAddress.toLowerCase();
    const existingBalance = balanceMap.get(key);

    if (existingBalance) {
      // Update existing balance with protocol info
      balanceMap.set(key, {
        ...existingBalance,
        protocolBalance: balance
      });
    } else {
      // Add new protocol balance
      balanceMap.set(key, balance as ExtendedTokenBalance);
    }
  });

  return Array.from(balanceMap.values()).sort((a, b) => {
    // Sort by balance value (descending)
    const aValue = parseFloat(a.formattedBalance);
    const bValue = parseFloat(b.formattedBalance);
    return bValue - aValue;
  });
}

export default useBalances;
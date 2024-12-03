import { useCallback } from 'react';
import { useAlchemyBalances, AlchemyTokenBalance } from './useAlchemyBalances';
import { useWillBalances } from './useWillBalances';

interface UseBalancesResult {
  balances: AlchemyTokenBalance[];
  protocolBalances: AlchemyTokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBalances(
  userAddress: string | undefined,
  chainId: string | undefined
): UseBalancesResult {
  const alchemyBalancesResult = useAlchemyBalances(userAddress, chainId);
  const balances = alchemyBalancesResult.balances;
  const isBalancesLoading = alchemyBalancesResult.isLoading;
  const balancesError = alchemyBalancesResult.error;

  const {
    willBalanceItems: protocolBalances,
    isLoading: isProtocolBalancesLoading,
    error: protocolBalancesError,
  } = useWillBalances(chainId || '');

  const isLoading = isBalancesLoading || isProtocolBalancesLoading;
  const error = balancesError || protocolBalancesError;
  const refetch = useCallback(() => {
    alchemyBalancesResult.refetch();
    useWillBalances(chainId || '').refetch();
  }, [alchemyBalancesResult, useWillBalances, chainId]);

  return {
    balances,
    protocolBalances,
    isLoading,
    error,
    refetch
  };
}

// Helper function to merge user and protocol balances
export function mergeBalances(
  userBalances: AlchemyTokenBalance[],
  protocolBalances: AlchemyTokenBalance[]
): AlchemyTokenBalance[] {
  const mergedBalances = [...userBalances];
  
  protocolBalances.forEach(protocolBalance => {
    const existingIndex = mergedBalances.findIndex(
      balance => balance.contractAddress === protocolBalance.contractAddress
    );
    
    if (existingIndex === -1) {
      mergedBalances.push(protocolBalance);
    }
  });
  
  return mergedBalances.sort((a: AlchemyTokenBalance, b: AlchemyTokenBalance) => {
    // Convert balance strings to BigInt for proper comparison
    const aUserBalance = BigInt(a.tokenBalance || '0');
    const bUserBalance = BigInt(b.tokenBalance || '0');
    
    const aProtocolBalance = BigInt(
      protocolBalances.find(p => p.contractAddress === a.contractAddress)?.tokenBalance || '0'
    );
    
    const bProtocolBalance = BigInt(
      protocolBalances.find(p => p.contractAddress === b.contractAddress)?.tokenBalance || '0'
    );
    
    // Calculate total balances
    const aTotalBalance = aUserBalance + aProtocolBalance;
    const bTotalBalance = bUserBalance + bProtocolBalance;
    
    // Compare and return sort order
    if (aTotalBalance < bTotalBalance) return 1;
    if (aTotalBalance > bTotalBalance) return -1;
    return 0;
  });
}

// Utility function to format balance display
export function formatBalance(balance: string | bigint): string {
  const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance;
  // Convert to string and handle decimals (assuming 18 decimals)
  const stringBalance = balanceBigInt.toString();
  const decimalPosition = Math.max(0, stringBalance.length - 18);
  
  if (decimalPosition === 0) {
    return `0.${stringBalance.padStart(18, '0')}`;
  }
  
  const wholePart = stringBalance.slice(0, decimalPosition);
  const decimalPart = stringBalance.slice(decimalPosition);
  
  return `${wholePart}.${decimalPart.padEnd(18, '0')}`;
}
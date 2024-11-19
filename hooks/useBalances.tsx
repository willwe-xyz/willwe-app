import { useCallback } from 'react';
import { BalanceItem } from '@covalenthq/client-sdk';
import { useCovalentBalances } from './useCovalentBalances';
import { useWillBalances } from './useWillBalances';

interface UseBalancesResult {
  balances: BalanceItem[];
  protocolBalances: BalanceItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBalances(
  userAddress: string | undefined,
  chainId: string | undefined
): UseBalancesResult {
  const {
    balances,
    isLoading: isBalancesLoading,
    error: balancesError,
    refetch: refetchBalances
  } = useCovalentBalances(userAddress || '', chainId || '');

  const {
    willBalanceItems: protocolBalances,
    isLoading: isProtocolBalancesLoading,
    error: protocolBalancesError,
  } = useWillBalances(chainId || '');

  const isLoading = isBalancesLoading || isProtocolBalancesLoading;
  const error = balancesError || protocolBalancesError;

  const refetch = useCallback(() => {
    refetchBalances();
  }, [refetchBalances]);

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
  userBalances: BalanceItem[],
  protocolBalances: BalanceItem[]
): BalanceItem[] {
  const mergedBalances = [...userBalances];
  
  protocolBalances.forEach(protocolBalance => {
    const existingIndex = mergedBalances.findIndex(
      balance => balance.contract_address === protocolBalance.contract_address
    );
    
    if (existingIndex === -1) {
      mergedBalances.push(protocolBalance);
    }
  });
  
  return mergedBalances.sort((a, b) => {
    // Convert bigint balance strings to BigInt for proper comparison
    const aUserBalance = BigInt(a.balance);
    const bUserBalance = BigInt(b.balance);
    
    const aProtocolBalance = BigInt(
      protocolBalances.find(p => p.contract_address === a.contract_address)?.balance || '0'
    );
    
    const bProtocolBalance = BigInt(
      protocolBalances.find(p => p.contract_address === b.contract_address)?.balance || '0'
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
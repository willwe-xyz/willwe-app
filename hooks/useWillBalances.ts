import { useState, useEffect, useCallback } from 'react';
import { AlchemyTokenBalance } from './useAlchemyBalances';
import { deployments } from '../config/deployments';

// Helper function to get excluded token strings
function getExcludedTokenStrings(): string[] {
  return [
    'test',
    'mock',
    'fake',
    'dummy',
    'sample',
    'example',
    't.me',
    't.ly',
    'fli.so',
    'claim until',
    'visit to claim',
    'swap within',
    'reward pool',
    'token distribution',
    'airdrop',
    '✅',
    '|',
    '[',
    ']',
    '*'
  ];
}

// Helper function to check if a token is spam
function isSpamToken(token: { name: string; symbol: string }): boolean {
  const name = token.name.toLowerCase();
  const symbol = token.symbol.toLowerCase();
  
  // Check for URLs
  const urlPattern = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)|(t\.ly\/[^\s]+)|(fli\.so\/[^\s]+)/i;
  if (urlPattern.test(name) || urlPattern.test(symbol)) {
    return true;
  }
  
  // Check for spam indicators
  const spamPatterns = [
    /claim until/i,
    /visit to claim/i,
    /swap within/i,
    /reward pool/i,
    /token distribution/i,
    /airdrop/i,
    /✅/,
    /[|\[\]]/,
    /\*/
  ];
  
  return spamPatterns.some(pattern => 
    pattern.test(name) || pattern.test(symbol)
  );
}

export const useWillBalances = (chainId: string | undefined) => {
  const [willBalanceItems, setWillBalanceItems] = useState<AlchemyTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillBalances = useCallback(async () => {
    if (!chainId) {
      setWillBalanceItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const willWeAddress = deployments.WillWe[chainId];
      if (!willWeAddress) {
        throw new Error(`No WillWe contract found for chain ${chainId}`);
      }

      // Use our internal API endpoint
      const response = await fetch(`/api/alchemy/balances?address=${willWeAddress}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error(`Error fetching Will balances: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter out spam tokens
      const excludedStrings = getExcludedTokenStrings();
      const filteredBalances = data.balances.filter((token: AlchemyTokenBalance) => {
        const tokenName = token.name.toLowerCase();
        const tokenSymbol = token.symbol.toLowerCase();
        const isExcluded = excludedStrings.some(str => tokenName.includes(str) || tokenSymbol.includes(str));
        const isSpam = isSpamToken(token);
        return !isExcluded && !isSpam;
      });

      console.log('Will balances before filtering:', data.balances.map((b: AlchemyTokenBalance) => ({
        name: b.name,
        symbol: b.symbol,
        balance: b.formattedBalance
      })));
      
      console.log('Will balances after filtering:', filteredBalances.map((b: AlchemyTokenBalance) => ({
        name: b.name,
        symbol: b.symbol,
        balance: b.formattedBalance
      })));

      setWillBalanceItems(filteredBalances);
    } catch (err) {
      console.error('Error fetching Will balances:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setWillBalanceItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  useEffect(() => {
    fetchWillBalances();
  }, [fetchWillBalances]);

  return {
    willBalanceItems,
    isLoading,
    error,
    refetch: fetchWillBalances
  };
};

export default useWillBalances;
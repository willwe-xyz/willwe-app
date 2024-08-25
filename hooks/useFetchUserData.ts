import { useState, useEffect } from 'react';
import { User } from '@privy-io/react-auth';
import { useCovalentBalances } from './useCovalentBalances';
import { FetchedUserData, UserContext } from '../types/chainData';
import { getCovalentApiKey } from '../config/apiKeys';

export const useFetchUserData = (ready: boolean, authenticated: boolean, user: User | null) => {
  const [userData, setUserData] = useState<FetchedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const chainId = user?.wallet?.chainId;
  const address = user?.wallet?.address;

  const { balances, isLoading: isBalancesLoading, error: balancesError } = useCovalentBalances(address || '', chainId || '1');

  useEffect(() => {
    const fetchUserContext = async () => {
      if (!ready || !authenticated || !user || !chainId || !address) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user context from your backend or smart contract
        // This is a placeholder and should be replaced with your actual implementation
        const userContext: UserContext = {
          userNodes: [],
          nodesOfRoot: []
        };

        setUserData({
          balanceItems: balances,
          userContext: userContext
        });
      } catch (err) {
        console.error('Error fetching user context:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserContext();
  }, [ready, authenticated, user, chainId, address, balances]);

  return { userData, isLoading: isLoading || isBalancesLoading, error: error || balancesError };
};
import { useState, useEffect } from 'react';
import { BalanceItem, NodeState } from '../lib/chainData';
import { User } from "@privy-io/react-auth";

export type UserContext = {
  activeBalancesResponse: [string[], string[]],
  nodes: NodeState[],
}

export type FetchedUserData = {
  balanceItems: BalanceItem[];
  WillBalanceItems: BalanceItem[];
  userContext: UserContext;
}

export const useFetchUserData = (ready: boolean, authenticated: boolean, user: User | null) => {
  const [userData, setUserData] = useState<FetchedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (ready && authenticated && user?.wallet) {
        setIsLoading(true);
        setError(null);
        try {
          const chainID = user.wallet.chainId.includes(":") ? user.wallet.chainId.split(":")[1] : user.wallet.chainId;
          const userAddress = user.wallet.address;

          const [willBalsRes, userDataRes] = await Promise.all([
            fetch(`/api/get/WILLBALANCES/${chainID}`),
            fetch(`/api/get/userdata/${chainID}/${userAddress}`, { cache: 'no-store' })
          ]);

          if (!willBalsRes.ok || !userDataRes.ok) {
            throw new Error('Failed to fetch data');
          }

          const willBals: BalanceItem[] = await willBalsRes.json();
          const fetchedUserData: Omit<FetchedUserData, 'WillBalanceItems'> = await userDataRes.json();

          setUserData({
            ...fetchedUserData,
            WillBalanceItems: willBals
          });
        } catch (error) {
          console.error("Failed to fetch user data", error);
          setError(error instanceof Error ? error : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ready, authenticated, user]);

  return { userData, isLoading, error };
};
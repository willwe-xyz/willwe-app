// File: ./hooks/useActivityFeed.ts

import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';

export interface ActivityItem {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'spawn' | 'membership';
  timestamp: number;
  description: string;
  account: string;
  nodeId?: string;
  amount?: string;
  tokenSymbol?: string;
  status: 'success' | 'pending' | 'failed';
  transactionHash?: string;
}

interface UseActivityFeedResult {
  activities: ActivityItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useActivityFeed(chainId: string): UseActivityFeedResult {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = usePrivy();
  const { currentHash, isTransacting } = useTransaction();

  // Add new activity
  const addActivity = useCallback((activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev]);
  }, []);

  // Update activity status
  const updateActivityStatus = useCallback((hash: string, status: 'success' | 'failed') => {
    setActivities(prev => 
      prev.map(activity => 
        activity.transactionHash === hash 
          ? { ...activity, status }
          : activity
      )
    );
  }, []);

  // Watch for new transactions
  useEffect(() => {
    if (currentHash && isTransacting) {
      addActivity({
        id: currentHash,
        type: 'transfer',
        timestamp: Date.now(),
        description: 'Transaction pending...',
        account: user?.wallet?.address || '',
        status: 'pending',
        transactionHash: currentHash
      });
    }
  }, [currentHash, isTransacting, addActivity, user?.wallet?.address]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!user?.wallet?.address || !chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate fetching activities - replace with actual API call
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'mint',
          timestamp: Date.now() - 1000 * 60 * 5,
          description: 'Minted 100 tokens',
          account: user.wallet.address,
          amount: '100',
          tokenSymbol: 'TKN',
          status: 'success'
        },
        {
          id: '2',
          type: 'signal',
          timestamp: Date.now() - 1000 * 60 * 30,
          description: 'Signaled preference',
          account: user.wallet.address,
          nodeId: '123',
          status: 'success'
        }
      ];

      setActivities(mockActivities);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.wallet?.address, chainId]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities
  };
}

export default useActivityFeed;
// File: ./hooks/useActivityFeed.ts

import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useTransaction } from '../contexts/TransactionContext';
import { usePonderData } from './usePonderData';

export interface ActivityItem {
  id: string;
  type: 'mint' | 'burn' | 'transfer' | 'signal' | 'spawn' | 'membership' | string;
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

export function useActivityFeed(chainId: string, userAddress: string): UseActivityFeedResult {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { getUserActivityLogs, getUserFeed } = usePonderData();

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



  // Convert Ponder activity data to our ActivityItem format
  const convertPonderActivity = useCallback((ponderActivity: any): ActivityItem => {
    // Generate a unique ID if one doesn't exist
    const id = ponderActivity.id || 
               ponderActivity.transactionHash || 
               `${ponderActivity.eventType}-${ponderActivity.timestamp || Date.now()}`;
    
    // Determine activity type
    const type = ponderActivity.eventType || 
                 ponderActivity.event_type || 
                 'unknown';
    
    // Get timestamp, ensuring it's a number
    let timestamp = Date.now();
    if (ponderActivity.timestamp) {
      timestamp = typeof ponderActivity.timestamp === 'number' 
        ? ponderActivity.timestamp 
        : Number(ponderActivity.timestamp);
      
      // Convert seconds to milliseconds if needed
      if (timestamp < 10000000000) {
        timestamp *= 1000;
      }
    } else if (ponderActivity.when) {
      timestamp = new Date(ponderActivity.when).getTime();
    }
    
    // Extract description
    const description = ponderActivity.description || 
                         ponderActivity.content || 
                         `${type} event`;
    
    // Get account information
    const account = ponderActivity.who || 
                    ponderActivity.userAddress || 
                    ponderActivity.user_address || 
                    user?.wallet?.address || '';
    
    // Extract nodeId if available
    const nodeId = ponderActivity.nodeId || 
                   ponderActivity.node_id || 
                   undefined;
    
    // Format our standardized activity item
    return {
      id,
      type,
      timestamp,
      description,
      account,
      nodeId,
      status: ponderActivity.status || 'success',
      transactionHash: ponderActivity.transactionHash || undefined
    };
  }, [userAddress]);

  // Fetch activities from both user logs and member nodes
  const fetchActivities = useCallback(async () => {
    if (!userAddress || !chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use Optimism Sepolia Chain ID as the default network
      const networkId = chainId;
      
      
      // Get user's direct activity logs
      const userActivities = await getUserActivityLogs(userAddress, networkId);
      console.log('Fetched user activities:', userActivities);
      
      // Get user's feed which includes nodes they're members of
      const userFeed = await getUserFeed(userAddress, networkId);
      console.log('Fetched user feed:', userFeed);
      
      // Extract events from user feed
      const feedEvents = userFeed.events || [];
      
      // Extract nodes where user is a member
      const memberNodes = userFeed.nodes || [];
      console.log('User is member of nodes:', memberNodes);
      
      // Combine all activities and convert to our format
      const allPonderActivities = [...userActivities, ...feedEvents];
      const formattedActivities = allPonderActivities.map(convertPonderActivity);
      
      // Sort by timestamp (newest first)
      formattedActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Update state with all activities
      setActivities(formattedActivities);
    } catch (err) {
      console.error('Error fetching user activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, chainId, getUserActivityLogs, getUserFeed, convertPonderActivity]);

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
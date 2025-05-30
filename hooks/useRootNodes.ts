import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';

export function useRootNodes(chainId: string, tokenAddress: string, userAddress?: string) {
  const [data, setData] = useState<NodeState[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !tokenAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/nodes/root?chainId=${chainId}&tokenAddress=${tokenAddress}&userAddress=${userAddress || ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch root nodes');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching root nodes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, tokenAddress, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
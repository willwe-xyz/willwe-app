import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';

export function useNodeDataLoading(chainId: string | undefined, nodeId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<NodeState | null>(null);

  // Move fetchData outside useEffect for reusability
  const fetchData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/nodes/data?chainId=${chainId}&nodeId=${nodeId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch node data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId]);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        setIsLoading(true);
        await fetchData();
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    data,
    refetch
  };
}
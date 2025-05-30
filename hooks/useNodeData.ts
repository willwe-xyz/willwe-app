import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';
import { ethers } from 'ethers';

export function useNodeData(chainId: string, userAddress: string, nodeId: string | number | bigint) {
  const [data, setData] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setIsLoading(false);
      setError(new Error('Missing required parameters: chainId and nodeId'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const nodeIdStr = nodeId.toString();
      // Use ZeroAddress if userAddress is empty or undefined
      const effectiveUserAddress = userAddress || ethers.ZeroAddress;
      
      const response = await fetch(
        `/api/nodes/data?chainId=${chainId}&nodeId=${nodeIdStr}&userAddress=${effectiveUserAddress}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch node data');
      }

      const result = await response.json();
      
      if (!result.data || !result.data.basicInfo) {
        throw new Error('Invalid node data received');
      }
      
      setData(result.data);
    } catch (err) {
      console.error('Error in useNodeData:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
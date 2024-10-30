import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState, TransformedNodeData } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { transformNodeData } from '../utils/formatters';

export function useRootNodes(chainId: string, tokenAddress: string, userAddress: string) {
  const [data, setData] = useState<TransformedNodeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !tokenAddress || !userAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      if (!willWeAddress) throw new Error(`No contract for chain ${cleanChainId}`);

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(willWeAddress, ABIs.WillWe, provider);

      const nodesData : NodeState[] = await contract.getAllNodesForRoot(tokenAddress, userAddress);
      const transformedData = nodesData.map(transformNodeData);
      console.log("got transformedData in useRootNodes : ", transformedData)
      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching root nodes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch root nodes'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, tokenAddress, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
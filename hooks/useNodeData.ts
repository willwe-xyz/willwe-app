import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState, TransformedNodeData } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import {transformNodeData} from '../utils/formatters'

export function useNodeData(chainId: string, nodeId: string) {
  const [data, setData] = useState<TransformedNodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setError(new Error('Invalid chainId or nodeId'));
      setIsLoading(false);
      return;
    }

    console.log('Fetching data for chainId:', chainId, 'and nodeId:', nodeId);

    try {
      setIsLoading(true);
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      if (!willWeAddress) throw new Error(`No contract for chain ${cleanChainId}`);

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(willWeAddress, ABIs.WillWe, provider);

      const nodeData : NodeState = await contract.getNodeData(nodeId);
      const transformedData : TransformedNodeData  = transformNodeData(nodeData);
      
      console.log("got transformedData in useNodeData : ", transformedData)

      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
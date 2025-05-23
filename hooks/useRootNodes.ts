import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

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
      
      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      
      if (!willWeAddress) {
        throw new Error(`No contract for chain ${cleanChainId}`);
      }

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(willWeAddress, ABIs.WillWe, provider);

      // Always use ZeroAddress for getAllNodesForRoot when no user address is provided
      const addressToUse = userAddress || ethers.ZeroAddress;
      
      // Ensure tokenAddress is properly formatted
      const formattedTokenAddress = ethers.getAddress(tokenAddress);
      
      const nodesData = await contract.getAllNodesForRoot(formattedTokenAddress, addressToUse);

      // Transform the data to ensure it's in the correct format
      const transformedData = nodesData.map((node: any) => ({
        basicInfo: node.basicInfo.map((item: any) => item?.toString() || ''),
        membraneMeta: node.membraneMeta?.toString() || '',
        membersOfNode: Array.isArray(node.membersOfNode) 
          ? node.membersOfNode.map((item: any) => item?.toString() || '')
          : [],
        childrenNodes: Array.isArray(node.childrenNodes)
          ? node.childrenNodes.map((item: any) => item?.toString() || '')
          : [],
        movementEndpoints: Array.isArray(node.movementEndpoints)
          ? node.movementEndpoints.map((item: any) => item?.toString() || '')
          : [],
        rootPath: Array.isArray(node.rootPath)
          ? node.rootPath.map((item: any) => item?.toString() || '')
          : [],
        nodeSignals: {
          signalers: Array.isArray(node.nodeSignals?.signalers)
            ? node.nodeSignals.signalers.map((item: any) => item?.toString() || '')
            : [],
          inflationSignals: Array.isArray(node.nodeSignals?.inflationSignals)
            ? node.nodeSignals.inflationSignals.map(([value, support]: [any, any]) => [
                value?.toString() || '',
                support?.toString() || ''
              ])
            : [],
          membraneSignals: Array.isArray(node.nodeSignals?.membraneSignals)
            ? node.nodeSignals.membraneSignals.map(([value, support]: [any, any]) => [
                value?.toString() || '',
                support?.toString() || ''
              ])
            : [],
          redistributionSignals: Array.isArray(node.nodeSignals?.redistributionSignals)
            ? node.nodeSignals.redistributionSignals.map((signal: any) => 
                Array.isArray(signal) ? signal.map((item: any) => item?.toString() || '') : []
              )
            : [],
        },
      }));

      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching root nodes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, tokenAddress, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
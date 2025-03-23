import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

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
      const cleanChainId = chainId.replace('eip155:', '');
      
      // Create provider
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      
      // Get contract instance
      const contractAddress = deployments.WillWe[cleanChainId];
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
      
      const contract = new ethers.Contract(
        contractAddress,
        ABIs.WillWe,
        provider as unknown as ethers.ContractRunner
      );

      console.log('Fetching node data for:', {
        chainId: cleanChainId,
        nodeId,
        contractAddress
      });

      // Fetch node data
      const nodeData = await contract.getNodeData(nodeId);
      
      // Transform and validate the data
      if (!nodeData || !nodeData.basicInfo) {
        throw new Error('Invalid node data received');
      }

      const transformedData: NodeState = {
        basicInfo: nodeData.basicInfo.map(String),
        membersOfNode: nodeData.membersOfNode || [],
        childrenNodes: nodeData.childrenNodes || [],
        rootPath: nodeData.rootPath || [],
        signals: nodeData.signals || [],
        membraneMeta: nodeData.membraneMeta || null,
        movementEndpoints: nodeData.movementEndpoints || []
      };

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
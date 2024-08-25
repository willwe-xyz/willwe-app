import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts'; // Import getRPCUrl from the contracts config

export const useNodeData = (chainId: string, nodeId: string) => {
  const [nodeData, setNodeData] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNodeData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setError(new Error('Missing chainId or nodeId'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use the existing getRPCUrl helper function
      const rpcUrl = getRPCUrl(chainId);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const contractAddress = deployments["WillWe"][chainId];
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chainId: ${chainId}`);
      }

      const contract = new ethers.Contract(contractAddress, ABIs["WillWe"], provider);
      
      const data = await contract.getNodeData(nodeId);
      
      // Transform the data into the NodeState format
      const transformedData: NodeState = {
        basicInfo: data.basicInfo,
        membersOfNode: data.membersOfNode,
        childrenNodes: data.childrenNodes,
        rootPath: data.rootPath,
        signals: data.signals
      };

      setNodeData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId]);

  useEffect(() => {
    fetchNodeData();
  }, [fetchNodeData]);

  return { nodeData, isLoading, error, refetch: fetchNodeData };
};
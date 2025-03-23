import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { NodeState } from '../types/chainData';

interface UseNodeDataResult {
  data: NodeState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNodeData(
  chainId: string | undefined,
  userAddress: string | undefined, 
  nodeIdOrAddress: string | undefined,
  isRootNode: boolean = false
): UseNodeDataResult {
  const [data, setData] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !nodeIdOrAddress) {
      setError(new Error('Invalid chainId or node identifier'));
      setIsLoading(false);
      return;
    }

    // If we don't have a userAddress, use zero address instead of returning early
    const addressToUse = userAddress || ethers.ZeroAddress;

    try {
      setIsLoading(true);
      setError(null);

      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(contractAddress, ABIs.WillWe, provider);

      let formattedId: string;
      if (isRootNode) {
        formattedId = ethers.toBigInt(nodeIdOrAddress).toString();
      } else {
        formattedId = nodeIdOrAddress;
      }

      console.log('Fetching node data:', {
        chainId: cleanChainId,
        nodeIdOrAddress,
        formattedId,
        userAddress: addressToUse,
        isRootNode,
        contractAddress
      });

      const nodeData = await contract.getNodeData(formattedId, addressToUse);

      console.log('Node data received:', nodeData);

      if (!nodeData?.basicInfo) {
        throw new Error('Invalid node data received');
      }

      // Transform data
      const transformedData: NodeState = {
        basicInfo: nodeData.basicInfo.map((item: any) => item.toString()),
        membraneMeta: nodeData.membraneMeta || '',
        membersOfNode: nodeData.membersOfNode || [],
        childrenNodes: (nodeData.childrenNodes || []).map((node: any) => node.toString()),
        movementEndpoints: nodeData.movementEndpoints || [],
        rootPath: (nodeData.rootPath || []).map((path: any) => path.toString()),
        signals: (nodeData.signals || []).map((signal: any) => ({
          MembraneInflation: (signal.MembraneInflation || []).map((mi: any[]) => 
            mi.map(item => item.toString())
          ),
          lastRedistSignal: (signal.lastRedistSignal || []).map((item: any) => 
            item.toString()
          )
        }))
      };

      setData(transformedData);
      setError(null);

    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeIdOrAddress, userAddress, isRootNode]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when userAddress becomes available
  useEffect(() => {
    if (userAddress) {
      fetchData();
    }
  }, [userAddress, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

export default useNodeData;
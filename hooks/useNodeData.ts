import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  NodeState, 
  TransformedNodeData, 
  isValidNodeState, 
  transformNodeData 
} from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

interface UseNodeDataResult {
  data: NodeState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Convert address to uint256 ID format
const addressToUint256 = (address: string): string => {
  try {
    // Ensure address is properly formatted
    const formattedAddress = address.toLowerCase().startsWith('0x') 
      ? address.toLowerCase()
      : `0x${address.toLowerCase()}`;

    // Remove '0x' prefix and convert to decimal string
    const withoutPrefix = formattedAddress.slice(2);
    return BigInt(`0x${withoutPrefix}`).toString();
  } catch (error) {
    console.error('Error converting address to uint256:', error);
    throw error;
  }
};

export function useNodeData(
  chainId: string | undefined, 
  nodeIdOrAddress: string | undefined,
  isRootNode: boolean = false // Add flag to indicate if this is a root node
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

      // Convert input to appropriate format based on whether it's a root node
      let formattedId: string;
      if (isRootNode) {
        // For root nodes, we need to convert the token address to uint256
        formattedId = addressToUint256(nodeIdOrAddress);
      } else {
        // For regular nodes, use the nodeId directly
        formattedId = BigInt(nodeIdOrAddress).toString();
      }

      console.log('Fetching node data:', {
        chainId: cleanChainId,
        nodeIdOrAddress,
        formattedId,
        isRootNode,
        contractAddress
      });

      // Get node data using the formatted ID
      const nodeData = await contract.getNodeData(formattedId);

      // Validate the received data
      if (!nodeData?.basicInfo) {
        throw new Error('Invalid node data received');
      }

      // Transform data to ensure all BigInt values are converted to strings
      const transformedData: NodeState = {
        basicInfo: nodeData.basicInfo.map((item: any) => item.toString()),
        membraneMeta: nodeData.membraneMeta || '',
        membersOfNode: nodeData.membersOfNode || [],
        childrenNodes: (nodeData.childrenNodes || []).map((node: any) => node.toString()),
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

      console.log('Node data fetched successfully:', transformedData);

    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeIdOrAddress, isRootNode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setData(null);
    setError(null);
    setIsLoading(true);
  }, [chainId, nodeIdOrAddress, isRootNode]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

// Helper functions for working with node data
export const isNodeMember = (nodeData: NodeState | null, address: string): boolean => {
  if (!nodeData?.membersOfNode || !address) return false;
  return nodeData.membersOfNode
    .map(addr => addr.toLowerCase())
    .includes(address.toLowerCase());
};

export const getNodeValue = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[4]) return '0';
  return nodeData.basicInfo[4];
};

export const getNodeInflation = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[1]) return '0';
  return nodeData.basicInfo[1];
};

export const getNodeMembraneId = (nodeData: NodeState | null): string => {
  if (!nodeData?.basicInfo?.[5]) return '0';
  return nodeData.basicInfo[5];
};

export default useNodeData;
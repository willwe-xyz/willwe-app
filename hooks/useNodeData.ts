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
  data: TransformedNodeData | null;
  rawData: NodeState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  // Convenience getters
  nodeId: string;
  value: string;
  inflation: string;
  balanceAnchor: string;
  balanceBudget: string;
  membraneId: string;
  memberCount: number;
  childCount: number;
  hasSignals: boolean;
  signalCount: number;
}

export function useNodeData(
  chainId: string | undefined, 
  nodeId: string | undefined
): UseNodeDataResult {
  const [data, setData] = useState<TransformedNodeData | null>(null);
  const [rawData, setRawData] = useState<NodeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!chainId || !nodeId) {
      setError(new Error('Invalid chainId or nodeId'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const cleanChainId = chainId.replace('eip155:', '');
      const willWeAddress = deployments.WillWe[cleanChainId];
      
      if (!willWeAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }

      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(willWeAddress, ABIs.WillWe, provider);

      console.log('Fetching data for:', {
        chainId: cleanChainId,
        nodeId,
        contract: willWeAddress
      });

      const rawNodeData = await contract.getNodeData(nodeId);

      // Validate the raw data
      if (!isValidNodeState(rawNodeData)) {
        throw new Error('Invalid node data received from contract');
      }

      // Store raw data
      setRawData(rawNodeData);

      // Transform and store processed data
      const transformedData = transformNodeData(rawNodeData);
      setData(transformedData);

      console.log('Node data fetched:', {
        raw: rawNodeData,
        transformed: transformedData
      });

    } catch (err) {
      console.error('Error fetching node data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch node data'));
      setData(null);
      setRawData(null);
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset state when chainId or nodeId changes
  useEffect(() => {
    setData(null);
    setRawData(null);
    setError(null);
    setIsLoading(true);
  }, [chainId, nodeId]);

  // Compute derived values from the transformed data
  const derivedData = {
    nodeId: data?.basicInfo.nodeId || '0',
    value: data?.basicInfo.value || '0',
    inflation: data?.basicInfo.inflation || '0',
    balanceAnchor: data?.basicInfo.balanceAnchor || '0',
    balanceBudget: data?.basicInfo.balanceBudget || '0',
    membraneId: data?.basicInfo.membraneId || '0',
    memberCount: data?.membersOfNode.length || 0,
    childCount: data?.childrenNodes.length || 0,
    hasSignals: (data?.signals.length || 0) > 0,
    signalCount: data?.signals.length || 0
  };

  return {
    data,
    rawData,
    isLoading,
    error,
    refetch: fetchData,
    ...derivedData
  };
}

// Helper hook for node permissions
export function useNodePermissions(
  nodeData: TransformedNodeData | null,
  userAddress: string | undefined
) {
  const [permissions, setPermissions] = useState({
    isMember: false,
    canSignal: false,
    canRedistribute: false,
    canSpawn: false
  });

  useEffect(() => {
    if (!nodeData || !userAddress) {
      setPermissions({
        isMember: false,
        canSignal: false,
        canRedistribute: false,
        canSpawn: false
      });
      return;
    }

    const isMember = nodeData.membersOfNode
      .map(addr => addr.toLowerCase())
      .includes(userAddress.toLowerCase());

    setPermissions({
      isMember,
      canSignal: isMember,
      canRedistribute: isMember,
      canSpawn: isMember
    });
  }, [nodeData, userAddress]);

  return permissions;
}

import { useQuery } from '@tanstack/react-query';
import { NodeState, isValidNodeState } from '../types/chainData';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export const useNodeData = (chainId: string, userAddress: string, nodeId: string) => {
  const { contract } = useContract(chainId);

  return useQuery({
    queryKey: ['nodeData', chainId, userAddress, nodeId],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not initialized');
      
      try {
        const nodeIdBN = ethers.toBigInt(nodeId);
        const data = await contract.getNodeData(nodeIdBN, userAddress);
        
        // Validate and transform the data
        if (!data || !Array.isArray(data.basicInfo) || data.basicInfo.length < 12) {
          throw new Error('Invalid node data structure');
        }

        // Transform the data into the expected format
        const nodeState: NodeState = {
          basicInfo: data.basicInfo.map((item: any) => item?.toString() || ''),
          membraneMeta: data.membraneMeta?.toString() || '',
          membersOfNode: Array.isArray(data.membersOfNode) 
            ? data.membersOfNode.map((item: any) => item?.toString() || '')
            : [],
          childrenNodes: Array.isArray(data.childrenNodes)
            ? data.childrenNodes.map((item: any) => item?.toString() || '')
            : [],
          movementEndpoints: Array.isArray(data.movementEndpoints)
            ? data.movementEndpoints.map((item: any) => item?.toString() || '')
            : [],
          rootPath: Array.isArray(data.rootPath)
            ? data.rootPath.map((item: any) => item?.toString() || '')
            : [],
          nodeSignals: {
            signalers: Array.isArray(data.nodeSignals?.signalers)
              ? data.nodeSignals.signalers.map((item: any) => item?.toString() || '')
              : [],
            inflationSignals: Array.isArray(data.nodeSignals?.inflationSignals)
              ? data.nodeSignals.inflationSignals.map(([value, support]: [any, any]) => [
                  value?.toString() || '',
                  support?.toString() || ''
                ])
              : [],
            membraneSignals: Array.isArray(data.nodeSignals?.membraneSignals)
              ? data.nodeSignals.membraneSignals.map(([value, support]: [any, any]) => [
                  value?.toString() || '',
                  support?.toString() || ''
                ])
              : [],
            redistributionSignals: Array.isArray(data.nodeSignals?.redistributionSignals)
              ? data.nodeSignals.redistributionSignals.map((signal: any) => 
                  Array.isArray(signal) ? signal.map((item: any) => item?.toString() || '') : []
                )
              : [],
          },
        };

        // Validate the transformed data
        if (!isValidNodeState(nodeState)) {
          console.error('Invalid node state:', nodeState);
          throw new Error('Transformed data does not match NodeState interface');
        }

        return nodeState;
      } catch (error) {
        console.error('Error fetching node data:', error);
        throw error;
      }
    },
    enabled: !!contract && !!userAddress && !!nodeId,
  });
};
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const fetchNodeData = async (chainId: string, nodeId: string): Promise<NodeState> => {
  const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId;
  const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
  const contractAddress = deployments["WillWe"][cleanChainId];
  const contract = new ethers.Contract(contractAddress, ABIs["WillWe"], provider);
  const data = await contract.getNodeData(nodeId);
  
  return {
    basicInfo: data.basicInfo,
    membersOfNode: data.membersOfNode,
    childrenNodes: data.childrenNodes,
    rootPath: data.rootPath,
    signals: data.signals
  };
};

export const useNodeData = (chainId: string, nodeId: string) => {
  const [data, setData] = useState<NodeState | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isNodeLoading, setIsNodeLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsNodeLoading(true);
      try {
        const result = await fetchNodeData(chainId, nodeId);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsNodeLoading(false);
      }
    };

    fetchData();
  }, [chainId, nodeId]);

  return { data, error, isNodeLoading };
};
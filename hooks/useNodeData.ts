import useSWR from 'swr';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const fetchNodeData = async ([chainId, nodeId]: [string, string]): Promise<NodeState> => {
  const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
  const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
  const contractAddress = deployments["WillWe"][cleanChainId];
  const contract = new ethers.Contract(contractAddress, ABIs["WillWe"], provider);
  const data = await contract.getNodeData(cleanChainId);
  
  return {
    basicInfo: data.basicInfo,
    membersOfNode: data.membersOfNode,
    childrenNodes: data.childrenNodes,
    rootPath: data.rootPath,
    signals: data.signals
  };
};

export const useNodeData = (chainId: string, nodeId: string) => {

    const cleanChainId = chainId.includes('eip') ? chainId.toString().replace('eip155:', '') : chainId
  const { data, error } = useSWR([cleanChainId, nodeId], fetchNodeData, {
    suspense: true,
    revalidateOnFocus: false,
  });

  return {
    nodeData: data,
    isLoading: !error && !data,
    error: error
  };
};
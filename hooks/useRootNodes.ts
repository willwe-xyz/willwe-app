import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NodeState, RootNodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl, getChainById } from '../config/contracts';

export const useRootNodes = (chainID: string, tokenAddress: string) => {
  const [rootNodeStates, setRootNodeStates] = useState<RootNodeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRootNodes = useCallback(async () => {
    if (!chainID || !tokenAddress) {
      setError(new Error('Missing chainID or tokenAddress'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const actualChainID = chainID.startsWith('eip155:') ? chainID.split(':')[1] : chainID;
      const rpcUrl = getRPCUrl(actualChainID);
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      if (!deployments["WillWe"][actualChainID]) {
        throw new Error(`No WillWe contract deployment found for chainID: ${actualChainID}`);
      }

      if (!ethers.isAddress(tokenAddress)) {
        throw new Error(`Invalid token address: ${tokenAddress}`);
      }

      const WW = new ethers.Contract(deployments["WillWe"][actualChainID], ABIs["WillWe"], provider);
      const nodeData: NodeState[] = await WW.getAllNodesForRoot(tokenAddress, tokenAddress);

      const nodesByDepth: { [depth: string]: NodeState[] } = {};
      nodeData.forEach((node) => {
        const depth = (node.rootPath.length - 1).toString();
        if (!nodesByDepth[depth]) {
          nodesByDepth[depth] = [];
        }
        nodesByDepth[depth].push(node);
      });

      const rootNodeStates: RootNodeState[] = Object.entries(nodesByDepth).map(([depth, nodes]) => ({
        nodes,
        depth
      }));

      rootNodeStates.sort((a, b) => parseInt(a.depth) - parseInt(b.depth));
      setRootNodeStates(rootNodeStates);
      setError(null);
    } catch (err) {
      console.error('Error fetching root nodes:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [chainID, tokenAddress]);

  useEffect(() => {
    fetchRootNodes();
  }, [fetchRootNodes]);

  return { rootNodeStates, isLoading, error, refetch: fetchRootNodes };
};
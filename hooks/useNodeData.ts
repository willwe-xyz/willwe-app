import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/deployments';

export const useNodeData = (chainId: string, tokenAddress: string) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!chainId || !tokenAddress) {
        console.log('Missing required params:', { chainId, tokenAddress });
        setData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const cleanChainId = chainId.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;
        
        // Get contract config
        const willWeAddress = deployments.WillWe[cleanChainId];
        const willWeABI = ABIs.WillWe;
        const rpcUrl = getRPCUrl(cleanChainId);

        console.log('Using contract config:', {
          chainId: cleanChainId,
          address: willWeAddress,
          rpcUrl,
          hasABI: !!willWeABI
        });

        if (!willWeAddress || !willWeABI || !rpcUrl) {
          throw new Error(
            `Invalid config for chain ${cleanChainId}. ` +
            `Missing: ${[
              !willWeAddress && 'contract address',
              !willWeABI && 'ABI',
              !rpcUrl && 'RPC URL'
            ].filter(Boolean).join(', ')}`
          );
        }

        // Create provider and contract
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
          willWeAddress,
          willWeABI,
          provider
        );

        // Fetch nodes
        console.log('Fetching nodes for:', { tokenAddress });
        const nodes = await contract.getAllNodesForRoot(tokenAddress, ethers.ZeroAddress);
        console.log('Received nodes:', nodes);

        // Transform node data
        const transformedNodes = nodes.map(node => ({
          basicInfo: node.basicInfo.map(String),
          membersOfNode: node.membersOfNode || [],
          childrenNodes: node.childrenNodes || [],
          rootPath: node.rootPath || [],
          signals: (node.signals || []).map(signal => ({
            MembraneInflation: signal.MembraneInflation || [],
            lastRedistSignal: signal.lastRedistSignal || []
          }))
        }));

        // Calculate total value
        const totalValue = transformedNodes.reduce((sum, node) => {
          const nodeValue = node.basicInfo[4] ? BigInt(node.basicInfo[4]) : BigInt(0);
          return sum + nodeValue;
        }, BigInt(0));

        // Calculate node relationships
        const relationships = new Map();
        transformedNodes.forEach(node => {
          const path = node.rootPath;
          if (path.length > 1) {
            const parentId = path[path.length - 2];
            if (!relationships.has(parentId)) {
              relationships.set(parentId, []);
            }
            relationships.get(parentId).push(node.basicInfo[0]);
          }
        });

        console.log('Processed node data:', {
          nodeCount: transformedNodes.length,
          totalValue: totalValue.toString(),
          relationshipCount: relationships.size
        });

        setData({
          nodes: transformedNodes,
          totalValue,
          relationships
        });
        
      } catch (err) {
        console.error('Error in useNodeData:', err);
        setError(err instanceof Error ? err : new Error('Unknown error in useNodeData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chainId, tokenAddress]);

  return {
    data,
    isLoading,
    error,
  };
};

export default useNodeData;
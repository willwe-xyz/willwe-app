import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface ChildNodeInfo {
  id: string;
  membraneTitle: string | null;
}

export function useChildNodes(node: NodeState, chainId: string) {
  const [childNodesInfo, setChildNodesInfo] = useState<{[key: string]: ChildNodeInfo}>({});

  useEffect(() => {
    const fetchChildNodeMembranes = async () => {
      if (!node?.childrenNodes?.length) return;

      const cleanChainId = chainId.replace('eip155:', '');
      const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
      const contract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        provider
      );
      const membraneContract = new ethers.Contract(
        deployments.Membrane[cleanChainId],
        ABIs.Membrane,
        provider
      );

      const childInfo: {[key: string]: ChildNodeInfo} = {};

      await Promise.all(node.childrenNodes.map(async (childId) => {
        try {
          const nodeData = await contract.getNodeData(childId);
          if (nodeData?.basicInfo?.[5]) {
            const membrane = await membraneContract.getMembraneById(nodeData.basicInfo[5]);
            if (membrane?.meta) {
              try {
                const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
                const metadata = await response.json();
                childInfo[childId] = {
                  id: childId,
                  membraneTitle: metadata.name || null
                };
              } catch (err) {
                console.error('Failed to fetch membrane metadata:', err);
                childInfo[childId] = { id: childId, membraneTitle: null };
              }
            }
          } else {
            childInfo[childId] = { id: childId, membraneTitle: null };
          }
        } catch (err) {
          console.error('Failed to fetch node data:', err);
          childInfo[childId] = { id: childId, membraneTitle: null };
        }
      }));

      setChildNodesInfo(childInfo);
    };

    fetchChildNodeMembranes();
  }, [node?.childrenNodes, chainId]);

  return { childNodesInfo };
}
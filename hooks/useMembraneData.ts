import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';
import { NodeState, MembraneMetadata } from '../types/chainData';

async function fetchIPFSData(cid: string): Promise<MembraneMetadata | null> {
  const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (!response.ok) throw new Error('IPFS fetch failed');
    const data = await response.json();
    return {
      name: data?.name || '',
      id: data?.id || '',
      characteristics: Array.isArray(data?.characteristics) ? data.characteristics : [],
      membershipConditions: Array.isArray(data?.membershipConditions) ? data.membershipConditions : [],
      createdAt: data?.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching IPFS data for CID ${cid}:`, error);
    return null;
  }
}

export async function getMembraneData(chainId: string, nodeIds: string[] = []) {
  if (!chainId || !nodeIds?.length) {
    return {
      membraneMetadata: [],
      getMembraneName: (id: string) => id
    };
  }

  try {
    // Fetch data for each node in parallel
    const promises = nodeIds.map(async (nodeId) => {
      try {
        // Ensure nodeId is passed as a string
        const nodeIdStr = nodeId.toString();
        const response = await fetch(
          `/api/nodes/data?chainId=${chainId}&nodeId=${nodeIdStr}&userAddress=${ethers.ZeroAddress}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch node data');
        }

        const result = await response.json();
        if (!result.data) {
          throw new Error('Invalid node data received');
        }
        return result.data;
      } catch (error) {
        console.error(`Error fetching node ${nodeId}:`, error);
        return null;
      }
    });

    const nodesData = await Promise.all(promises);
    const validNodesData = nodesData.filter((data): data is NodeState => data !== null);

    // Process membrane metadata
    const membraneMetadata = validNodesData.map(node => ({
      nodeId: node.basicInfo[0],
      membraneId: node.basicInfo[6],
      membraneMeta: node.membraneMeta
    }));

    // Helper function to get membrane name
    const getMembraneName = (id: string) => {
      const metadata = membraneMetadata.find(m => m.membraneId === id);
      return metadata?.membraneMeta || id;
    };

    return {
      membraneMetadata,
      getMembraneName
    };
  } catch (error) {
    console.error('Error in getMembraneData:', error);
    return {
      membraneMetadata: [],
      getMembraneName: (id: string) => id
    };
  }
}
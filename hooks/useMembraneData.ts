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
      membershipConditions: Array.isArray(data?.membershipConditions) ? data.membershipConditions : []
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
    const cleanChainId = chainId.replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    const willweContract = new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider
    );

    const nodesData: NodeState[] = await willweContract.getNodes(nodeIds) || [];
    console.log('Nodes data:', nodesData);
    
    const cids = nodesData.map((node: any) => 
      node && node.membraneMeta ? node.membraneMeta : null
    ).filter(Boolean);

    const membraneDataPromises = cids.map(cid => fetchIPFSData(cid));
    const membraneResults = await Promise.all(membraneDataPromises);
    console.log('Membrane metadata:', membraneResults);
    
    const membraneMetadata: MembraneMetadata[] = membraneResults
      .filter(Boolean)
      .map(data => ({
        name: data?.name || '',
        id: data?.id || '',
        characteristics: data?.characteristics || [],
        membershipConditions: data?.membershipConditions || []
      }));

    const getMembraneName = (id: string): string => {
      if (!membraneMetadata?.length) return id;
      const membrane = membraneMetadata.find(m => m?.id === id);
      return membrane?.name || id;
    };

    return { membraneMetadata, getMembraneName };
  } catch (err) {
    console.error('Error loading membrane metadata:', err);
    return {
      membraneMetadata: [],
      getMembraneName: (id: string) => id
    };
  }
}

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
    const cleanChainId = chainId.replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    const willweContract = new ethers.Contract(
      deployments.WillWe[cleanChainId],
      ABIs.WillWe,
      provider
    );

    // Get node data for all requested nodes
    console.log('Fetching data for nodes:', nodeIds);
    
    let nodesData: NodeState[] = [];
    
    try {
      // First try using getAllNodesForRoot if possible
      // For simplicity, we'll use the first node in the array as a reference point
      if (nodeIds.length > 0) {
        const firstNodeId = nodeIds[0];
        
        try {
          // Get the first node to figure out its root
          const firstNode = await willweContract.getNodeData(firstNodeId, ethers.ZeroAddress);
          
          // Extract root ID from the path
          let rootId;
          if (firstNode && firstNode.rootPath && firstNode.rootPath.length > 0) {
            rootId = firstNode.rootPath[0];
          } else {
            // If no root path is available, use the first node as the root
            rootId = firstNodeId;
          }
          
          console.log('Getting nodes for root ID:', rootId);
          
          // getAllNodesForRoot takes an address as the first parameter, not an ID
          // Convert rootId to an address
          const rootAddress = ethers.getAddress(ethers.toBeHex(rootId, 20));
          
          console.log('Root ID converted to address:', rootAddress);
          
          // Call with address parameters
          const allNodesForRoot: NodeState[] = await willweContract.getAllNodesForRoot(
            rootAddress, 
            ethers.ZeroAddress
          ) || [];
          
          // Filter to only include the nodes we're interested in
          const nodeIdStrings = nodeIds.map(id => id.toString());
          nodesData = allNodesForRoot.filter((node: any) => 
            node && node.basicInfo && nodeIdStrings.includes(node.basicInfo[0].toString())
          );
          
          console.log('Filtered nodes data:', nodesData);
        } catch (error) {
          console.error('Error using getAllNodesForRoot:', error);
          throw error; // Propagate to fallback
        }
      }
    } catch (error) {
      // Fallback: If getAllNodesForRoot fails, try getNodeData individually for each node
      console.log('Falling back to individual node queries');
      const individualNodesPromises = nodeIds.map(id => 
        willweContract.getNodeData(id, ethers.ZeroAddress)
          .catch(err => {
            console.error(`Error getting data for node ${id}:`, err);
            return null;
          })
      );
      nodesData = await Promise.all(individualNodesPromises);
      nodesData = nodesData.filter(Boolean);
    }
    
    // Now we have nodesData, continue with the original logic
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
        membershipConditions: data?.membershipConditions || [],
        createdAt: data?.createdAt || new Date().toISOString()
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
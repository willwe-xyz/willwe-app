import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { NodeState } from '../../../types/chainData';

// Helper function to convert BigInt values to strings
function convertBigIntsToStrings(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertBigIntsToStrings(obj[key]);
    }
    return result;
  }

  return obj;
}

// Helper function to transform contract response into NodeState format
function transformNodeData(nodeData: any): NodeState {
  return {
    basicInfo: nodeData.basicInfo.map((item: any) => item?.toString() || ''),
    membraneMeta: nodeData.membraneMeta?.toString() || '',
    membersOfNode: Array.isArray(nodeData.membersOfNode) 
      ? nodeData.membersOfNode.map((item: any) => item?.toString() || '')
      : [],
    childrenNodes: Array.isArray(nodeData.childrenNodes)
      ? nodeData.childrenNodes.map((item: any) => item?.toString() || '')
      : [],
    movementEndpoints: Array.isArray(nodeData.movementEndpoints)
      ? nodeData.movementEndpoints.map((item: any) => item?.toString() || '')
      : [],
    rootPath: Array.isArray(nodeData.rootPath)
      ? nodeData.rootPath.map((item: any) => item?.toString() || '')
      : [],
    nodeSignals: {
      signalers: Array.isArray(nodeData.nodeSignals?.signalers)
        ? nodeData.nodeSignals.signalers.map((item: any) => item?.toString() || '')
        : [],
      inflationSignals: Array.isArray(nodeData.nodeSignals?.inflationSignals)
        ? nodeData.nodeSignals.inflationSignals.map(([value, support]: [any, any]) => [
            value?.toString() || '',
            support?.toString() || ''
          ])
        : [],
      membraneSignals: Array.isArray(nodeData.nodeSignals?.membraneSignals)
        ? nodeData.nodeSignals.membraneSignals.map(([value, support]: [any, any]) => [
            value?.toString() || '',
            support?.toString() || ''
          ])
        : [],
      redistributionSignals: Array.isArray(nodeData.nodeSignals?.redistributionSignals)
        ? nodeData.nodeSignals.redistributionSignals.map((signal: any) => 
            Array.isArray(signal) ? signal.map((item: any) => item?.toString() || '') : []
          )
        : [],
    }
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chainId, tokenAddress, userAddress } = req.query;

  if (!chainId || !tokenAddress) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanChainId = chainId.toString().replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    const willWeAddress = deployments.WillWe[cleanChainId];

    if (!willWeAddress) {
      return res.status(400).json({ error: 'Invalid chain ID' });
    }

    const willWeContract = new ethers.Contract(
      willWeAddress,
      ABIs.WillWe,
      provider
    );

    // Use the provided user address or ZeroAddress if not provided
    const addressToUse = userAddress || ethers.ZeroAddress;
    
    // Ensure tokenAddress is properly formatted
    const formattedTokenAddress = ethers.getAddress(tokenAddress.toString());
    
    const nodesData = await willWeContract.getAllNodesForRoot(formattedTokenAddress, addressToUse);
    
    // Transform the contract response into the expected NodeState format
    const transformedData = nodesData.map(transformNodeData);
    
    // Convert all BigInt values to strings before sending the response
    const serializedData = convertBigIntsToStrings(transformedData);
    
    res.status(200).json({ data: serializedData });
  } catch (error) {
    console.error('Error fetching root nodes:', error);
    res.status(500).json({ error: 'Failed to fetch root nodes' });
  }
} 
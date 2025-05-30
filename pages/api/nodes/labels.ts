import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';
import { isEndpoint, getEndpointDisplayName } from '../../../utils/formatters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nodeId, chainId, rootPath } = req.query;

  if (!nodeId || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Parse rootPath if it's a string
    let parsedRootPath: string[] = [];
    if (rootPath) {
      try {
        parsedRootPath = typeof rootPath === 'string' ? JSON.parse(rootPath) : rootPath;
      } catch (e) {
        console.warn('Failed to parse rootPath:', rootPath);
      }
    }

    const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId.toString()));
    const willWeAddress = deployments.WillWe[chainId.toString()];

    if (!willWeAddress) {
      console.error('No WillWe address found for chainId:', chainId);
      return res.status(400).json({ error: 'Invalid chain ID' });
    }

    // Check if this is an endpoint
    if (parsedRootPath.length > 0) {
      const parentNodeId = parsedRootPath[parsedRootPath.length - 1];
      if (isEndpoint(nodeId.toString(), parentNodeId.toString())) {
        try {
          const endpointName = await getEndpointDisplayName(
            nodeId.toString(),
            parentNodeId.toString(),
            provider,
            chainId.toString()
          );
          if (endpointName) {
            return res.status(200).json({ label: endpointName });
          }
        } catch (error) {
          console.warn('Error getting endpoint name:', error);
          // Continue to try membrane name if endpoint name fails
        }
      }
    }

    // If not an endpoint or no endpoint name, try to get membrane name
    try {
      const willWeContract = new ethers.Contract(
        willWeAddress,
        ABIs.WillWe,
        provider
      );

      const nodeData = await willWeContract.getNodeData(nodeId, ethers.ZeroAddress);
      const labelCID = nodeData.basicInfo[6].toString(); // Active membrane ID

      if (labelCID && labelCID !== '0') {
        const membraneContract = new ethers.Contract(
          deployments.Membrane[chainId.toString()],
          ABIs.Membrane,
          provider
        );

        // Get membrane data from contract
        const membrane = await membraneContract.getMembraneById(labelCID);
        if (membrane && membrane.meta) {
          const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
          const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
          if (response.ok) {
            const metadata = await response.json();
            return res.status(200).json({ 
              label: metadata.name || metadata.title || `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error getting membrane name:', error);
      // Continue to fallback if membrane name fails
    }

    // Fallback if no valid membrane metadata
    return res.status(200).json({ 
      label: `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`
    });
  } catch (error) {
    console.error('Error in /api/nodes/labels:', error);
    // Return a fallback label instead of 500 error
    return res.status(200).json({ 
      label: `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`
    });
  }
} 
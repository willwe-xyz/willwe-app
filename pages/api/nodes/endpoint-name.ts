import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';

// Array of random emojis for WillWe-owned endpoints
const ENDPOINT_EMOJIS = ['🚀', '🌟', '💫', '✨', '⚡', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nodeId, parentNodeId, chainId } = req.query;

  if (!nodeId || !parentNodeId || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanChainId = chainId.toString().replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    
    if (!deployments.Execution[cleanChainId]) {
      return res.status(400).json({ error: 'Invalid chain ID' });
    }

    // Convert nodeId to address
    const nodeIdBigInt = BigInt(nodeId.toString());
    const endpointAddress = ethers.getAddress('0x' + nodeIdBigInt.toString(16).padStart(40, '0'));

    // Get the owner of the endpoint
    const powerProxy = new ethers.Contract(
      endpointAddress,
      ['function owner() view returns (address)'],
      provider
    );

    const ownerAddress = await powerProxy.owner();

    // If owner is Execution contract, it's an execution endpoint
    const executionAddress = deployments.Execution[cleanChainId];
    if (ownerAddress.toLowerCase() === executionAddress.toLowerCase()) {
      // Execution endpoint: random emoji
      try {
        // Get all endpoints for this parent node
        const willweContract = new ethers.Contract(
          deployments.WillWe[cleanChainId],
          ABIs.WillWe,
          provider
        );
        const nodeData = await willweContract.getNodeData(parentNodeId, ethers.ZeroAddress);
        const endpoints = nodeData.movementEndpoints || [];
        const index = endpoints.findIndex((ep: string) => ep.toLowerCase() === endpointAddress.toLowerCase());
        const emojiIndex = index % ENDPOINT_EMOJIS.length;
        return res.status(200).json({ name: ENDPOINT_EMOJIS[emojiIndex] });
      } catch (error) {
        // Fallback to hash-based emoji selection
        const addressHash = ethers.keccak256(ethers.toUtf8Bytes(endpointAddress));
        const emojiIndex = Number(addressHash.slice(0, 8)) % ENDPOINT_EMOJIS.length;
        return res.status(200).json({ name: ENDPOINT_EMOJIS[emojiIndex] });
      }
    }

    // User endpoint: door emoji + ENS or address
    try {
      // Try to resolve ENS name
      const response = await fetch(`/api/ens/resolve?address=${ownerAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data.name) {
          return res.status(200).json({ name: `🚪 ${data.name}` });
        }
      }
    } catch (error) {
      console.warn('Error resolving ENS name:', error);
    }

    // Fallback to truncated address
    return res.status(200).json({ 
      name: `🚪 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` 
    });

  } catch (error) {
    console.error('Error in endpoint name handler:', error);
    // Return a default name even in case of error
    const shortNodeId = nodeId.toString().slice(-6);
    return res.status(200).json({ name: `EP${shortNodeId}` });
  }
} 
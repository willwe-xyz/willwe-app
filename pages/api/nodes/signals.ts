import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../../config/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chainId, nodeId, userAddress } = req.query;

  if (!chainId || !nodeId || !userAddress) {
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

    const signals = await willWeContract.getUserNodeSignals(userAddress, nodeId);
    
    // Convert all BigInt values to strings before sending the response
    const serializedSignals = signals.map((signal: any) => signal.toString());
    
    res.status(200).json({ data: serializedSignals });
  } catch (error) {
    console.error('Error fetching user node signals:', error);
    res.status(500).json({ error: 'Failed to fetch user node signals' });
  }
} 
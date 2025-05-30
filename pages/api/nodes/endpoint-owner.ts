import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getRPCUrl } from '../../../config/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chainId, endpointAddress } = req.query;

  if (!chainId || !endpointAddress) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanChainId = chainId.toString().replace('eip155:', '');
    const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
    const powerProxy = new ethers.Contract(
      endpointAddress.toString(),
      ['function owner() view returns (address)'],
      provider
    );
    const ownerAddress = await powerProxy.owner();
    return res.status(200).json({ owner: ownerAddress });
  } catch (error) {
    console.error('Error fetching endpoint owner:', error);
    return res.status(500).json({ error: 'Failed to fetch endpoint owner' });
  }
} 
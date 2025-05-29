import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getRPCUrl } from '../../../config/contracts';
import { nodeIdToAddress } from '../../../utils/formatters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokenId, chainId } = req.query;

  if (!tokenId || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId.toString()));
    const tokenAddress = nodeIdToAddress(tokenId.toString());
    
    // First check if the contract exists
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      return res.status(200).json({ 
        name: tokenId.slice(0, 6) + '...' + tokenId.slice(-4)
      });
    }

    // Try to get the name using a more robust ABI
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function name() view returns (string)',
        'function symbol() view returns (string)'
      ],
      provider
    );

    try {
      const name = await tokenContract.name();
      return res.status(200).json({ name });
    } catch (nameError) {
      // If name() fails, try symbol()
      try {
        const symbol = await tokenContract.symbol();
        return res.status(200).json({ name: symbol });
      } catch (symbolError) {
        // If both fail, use the address
        return res.status(200).json({ 
          name: tokenId.slice(0, 6) + '...' + tokenId.slice(-4)
        });
      }
    }
  } catch (error) {
    console.error('Error fetching token name:', error);
    return res.status(500).json({ error: 'Failed to fetch token name' });
  }
} 
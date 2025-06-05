import { NextApiRequest, NextApiResponse } from 'next';
import { Network, Alchemy } from 'alchemy-sdk';

// Helper function to get Alchemy network from chainId
function getAlchemyNetwork(chainId: string): Network {
  // Convert chainId to string for consistent comparison
  const chain = String(chainId);
  
  switch (chain) {
    // Ethereum
    case '1':
      return Network.ETH_MAINNET;
    case '11155111':
      return Network.ETH_SEPOLIA;
    // Polygon
    case '137':
      return Network.MATIC_MAINNET;
    // Arbitrum
    case '42161':
      return Network.ARB_MAINNET;
    case '421614':
      return Network.ARB_SEPOLIA;
    // Optimism
    case '10':
      return Network.OPT_MAINNET;
    case '11155420':
      return Network.OPT_SEPOLIA;
    // Base
    case '8453':
      return Network.BASE_MAINNET;
    case '84532':
      return Network.BASE_SEPOLIA;
    // Default to mainnet if chain is not supported
    default:
      return Network.ETH_MAINNET;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, chainId } = req.query;

  if (!address || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check for Alchemy API key
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyApiKey) {
    console.error('ALCHEMY_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Alchemy API key is not configured' });
  }

  try {
    const network = getAlchemyNetwork(chainId as string);

    const alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network
    });

    const metadata = await alchemy.core.getTokenMetadata(address as string);
    
    res.status(200).json({ metadata });
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    res.status(500).json({ 
      error: 'Failed to fetch token metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
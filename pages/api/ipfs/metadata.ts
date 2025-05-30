import { NextApiRequest, NextApiResponse } from 'next';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: 'Missing required parameter: cid' });
  }

  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    res.status(200).json({ metadata });
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    res.status(500).json({ 
      error: 'Failed to fetch IPFS metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
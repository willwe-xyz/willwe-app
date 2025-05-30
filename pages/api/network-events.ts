import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { limit = 50, offset = 0, networkId },
  } = req;

  if (!networkId) {
    return res.status(400).json({ error: 'Missing networkId' });
  }

  try {
    // Fetch events from Ponder server
    const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL || 'http://localhost:42069';
    const response = await fetch(`${ponderUrl}/api/events?limit=${limit}&offset=${offset}&networkId=${networkId}`);

    if (!response.ok) {
      throw new Error(`Ponder server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching network events:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
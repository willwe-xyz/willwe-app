import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nodeId, networkId, limit = '50', offset = '0' } = req.query;

  if (!nodeId || !networkId || Array.isArray(nodeId)) {
    return res.status(400).json({ error: 'Missing or invalid required parameters' });
  }

  try {
    // Get Ponder server URL from environment variable
    const PONDER_SERVER_URL = process.env.NEXT_PUBLIC_PONDER_SERVER_URL;
    if (!PONDER_SERVER_URL) {
      throw new Error('Ponder server URL not configured');
    }

    // Fetch events from Ponder server
    const response = await fetch(
      `${PONDER_SERVER_URL}/node/${nodeId}?limit=${limit}&offset=${offset}&networkId=${networkId}`
    );

    if (!response.ok) {
      throw new Error(`Ponder server responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const events = [...(data.events || []), ...(data.signals || [])].map(event => {
      let when = event.timestamp || event.blockTimestamp || event.when || null;
      return {
        id: event.id || `${event.transactionHash}-${event.logIndex}`,
        nodeId: event.nodeId,
        who: event.userAddress,
        eventType: event.eventType || event.type || 'NodeEvent',
        eventName: event.eventName || event.type || 'Node Event',
        description: event.description || `Activity in node ${event.nodeId?.slice(0, 6)}...${event.nodeId?.slice(-4)}`,
        when,
        networkId: networkId,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        args: event.args || {}
      };
    });

    // Sort events by timestamp
    events.sort((a, b) => {
      const timeA = new Date(a.when).getTime();
      const timeB = new Date(b.when).getTime();
      return timeB - timeA;
    });

    res.status(200).json({
      events,
      meta: {
        total: events.length,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error in node events handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
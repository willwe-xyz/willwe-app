import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { nodeId, limit = 50, networkId },
  } = req;

  if (!nodeId) {
    return res.status(400).json({ error: 'Missing nodeId' });
  }

  // Placeholder: return empty events and meta, echoing back nodeId and networkId for debugging
  return res.status(200).json({
    events: [],
    meta: {
      total: 0,
      limit: Number(limit),
      nodeId,
      networkId: networkId || null,
    },
  });
} 
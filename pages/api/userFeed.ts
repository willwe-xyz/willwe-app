import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { userAddress, limit = 50, offset = 0, networkId },
  } = req;

  if (!userAddress) {
    return res.status(400).json({ error: 'Missing userAddress' });
  }

  // Placeholder: return empty events and meta
  return res.status(200).json({
    events: [],
    meta: {
      total: 0,
      limit: Number(limit),
      offset: Number(offset),
      nodeCount: 0,
      networkId: networkId || null,
    },
  });
} 
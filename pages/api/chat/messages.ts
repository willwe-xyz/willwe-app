import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[chat/messages] Received ${req.method} request`, {
      query: req.query,
      body: req.body
    });
    
    if (req.method === 'GET') {
      const { nodeId, limit = 50 } = req.query;
      
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID is required' });
      }
      
      // Return an empty array for now
      return res.status(200).json({ messages: [] });
    } 
    else if (req.method === 'POST') {
      const { nodeId, userAddress, content, networkId } = req.body;
      
      if (!nodeId || !userAddress || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Return a success message for now
      return res.status(201).json({ success: true, message: 'Message stored (placeholder)' });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[chat/messages] API error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
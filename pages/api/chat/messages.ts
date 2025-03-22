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
      
      console.log(`[chat/messages] Forwarding message request to Ponder server for node ${nodeId}`);
      
      // Forward request to Ponder server
      const ponderServerUrl = process.env.NEXT_PUBLIC_PONDER_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${ponderServerUrl}/chat/messages?nodeId=${nodeId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Error from Ponder server: ${response.statusText}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { nodeId, userAddress, content, networkId } = req.body;
      
      if (!nodeId || !userAddress || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      console.log(`[chat/messages] Forwarding message to Ponder server for node ${nodeId} from ${userAddress}`);
      
      // Forward post to Ponder server
      // Note: Remote server expects "sender" instead of "userAddress"
      const ponderServerUrl = process.env.NEXT_PUBLIC_PONDER_SERVER_URL || 'http://localhost:8080';
      console.log('[chat/messages] Sending to Ponder with params:', { 
        nodeId, 
        sender: userAddress, // Map userAddress to sender
        content, 
        networkId 
      });
      
      const response = await fetch(`${ponderServerUrl}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nodeId, 
          sender: userAddress, // Map userAddress to sender
          content, 
          networkId 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error from Ponder server: ${response.statusText}`);
      }
      
      const data = await response.json();
      return res.status(201).json(data);
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
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get Ponder server URL from environment variable
    const PONDER_SERVER_URL = process.env.PONDER_SERVER_URL;
    
    if (!PONDER_SERVER_URL) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Ponder server URL not configured. Please check environment variables.'
      });
    }
    
    if (req.method === 'GET') {
      const { nodeId, limit = 50 } = req.query;
      
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID is required' });
      }
      
      const url = `${PONDER_SERVER_URL}/chat/messages?nodeId=${nodeId}&limit=${limit}`;
      
      // Fetch messages from Ponder server
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ponder server responded with status: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // The Ponder server returns messages in a nested structure
      const messages = data.messages || [];
      
      // Format messages to match the expected structure
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        nodeId: msg.nodeId || msg.node_id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp.toString(),
        networkId: msg.networkId || msg.network_id
      }));
      
      // Return the formatted messages array
      return res.status(200).json(formattedMessages);
    } 
    else if (req.method === 'POST') {
      const { nodeId, userAddress, content, networkId } = req.body;
      
      if (!nodeId || !userAddress || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const url = `${PONDER_SERVER_URL}/chat/messages`;
      
      // Send message to Ponder server
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId,
          sender: userAddress,
          content,
          networkId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ponder server responded with status: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Format the message to match the expected structure
      const formattedMessage = {
        id: data.message.id,
        nodeId: data.message.nodeId || data.message.node_id,
        sender: data.message.sender,
        content: data.message.content,
        timestamp: data.message.timestamp.toString(),
        networkId: data.message.networkId || data.message.network_id
      };
      
      return res.status(201).json(formattedMessage);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { getChatMessages, storeChatMessage } from '../../../ponder/utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[chat-messages] Received ${req.method} request`, {
      query: req.query,
      body: req.body
    });
    
    if (req.method === 'GET') {
      const { nodeId, limit = 50 } = req.query;
      
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID is required' });
      }
      
      console.log(`[chat-messages] Fetching messages for node ${nodeId}`);
      
      // Get chat messages for a specific node
      const messages = await getChatMessages(nodeId as string, Number(limit));
      
      console.log(`[chat-messages] Found ${messages.length} messages`);
      
      return res.status(200).json(messages);
    } 
    else if (req.method === 'POST') {
      const { nodeId, sender, content } = req.body;
      
      if (!nodeId || !sender || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      console.log(`[chat-messages] Storing message for node ${nodeId} from ${sender}`);
      
      // Store chat message
      const message = await storeChatMessage(nodeId as string, sender, content);
      
      console.log(`[chat-messages] Message stored successfully with ID ${message.id}`);
      
      return res.status(201).json(message);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[chat-messages] API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

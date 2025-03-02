import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const { nodeId, limit = 50 } = req.query;
      
      if (!nodeId) {
        return res.status(400).json({ error: 'Node ID is required' });
      }
      
      // Get chat messages for a specific node
      const messages = await db.all(
        'SELECT * FROM ChatMessage WHERE nodeId = ? ORDER BY timestamp DESC LIMIT ?',
        [nodeId, Number(limit)]
      );
      
      return res.status(200).json(messages);
    } 
    else if (req.method === 'POST') {
      const { nodeId, sender, content } = req.body;
      
      if (!nodeId || !sender || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      // Insert chat message
      await db.run(
        'INSERT INTO ChatMessage (id, nodeId, sender, content, timestamp) VALUES (?, ?, ?, ?, ?)',
        [id, nodeId, sender, content, timestamp]
      );
      
      return res.status(201).json({ 
        id, 
        nodeId, 
        sender, 
        content, 
        timestamp
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

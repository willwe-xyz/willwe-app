import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();
    const { nodeId } = req.query;

    if (req.method === 'GET') {
      let membranes;
      
      if (nodeId) {
        // Get membranes for a specific node
        membranes = await db.all(
          'SELECT * FROM Membrane WHERE nodeId = ?',
          [nodeId]
        );
      } else {
        // Get all membranes
        membranes = await db.all('SELECT * FROM Membrane');
      }
      
      return res.status(200).json(membranes);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

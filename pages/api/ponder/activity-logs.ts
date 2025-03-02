import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();
    const { nodeId, userAddress, limit = 50 } = req.query;

    if (req.method === 'GET') {
      let logs;
      
      if (nodeId) {
        // Get activity logs for a specific node
        logs = await db.all(
          'SELECT * FROM ActivityLog WHERE nodeId = ? ORDER BY timestamp DESC LIMIT ?',
          [nodeId, Number(limit)]
        );
      } else if (userAddress) {
        // Get activity logs for a specific user
        logs = await db.all(
          'SELECT * FROM ActivityLog WHERE userAddress = ? ORDER BY timestamp DESC LIMIT ?',
          [userAddress, Number(limit)]
        );
      } else {
        // Get all activity logs
        logs = await db.all(
          'SELECT * FROM ActivityLog ORDER BY timestamp DESC LIMIT ?',
          [Number(limit)]
        );
      }
      
      // Parse the data field if it's a JSON string
      const processedLogs = logs.map(log => ({
        ...log,
        data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data
      }));
      
      return res.status(200).json(processedLogs);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

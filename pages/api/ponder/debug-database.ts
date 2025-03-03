import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../ponder/utils/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to debug the database
 * @param req The request object
 * @param res The response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize the database if it's not already initialized
    const database = await getDatabase();
    
    const { action, nodeId } = req.query;
    
    if (req.method === 'GET') {
      if (action === 'tables') {
        // Get a list of all tables in the database
        const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
        return res.status(200).json({ tables });
      }
      
      if (action === 'activity-logs') {
        // Get all activity logs
        const logs = await database.all('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
        return res.status(200).json({ logs });
      }
      
      if (action === 'activity-count') {
        // Count activity logs by event type
        const counts = await database.all('SELECT eventType, COUNT(*) as count FROM activity_logs GROUP BY eventType');
        return res.status(200).json({ counts });
      }
      
      if (action === 'node-activities' && nodeId) {
        // Get activities for a specific node
        const logs = await database.all(
          'SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT 100',
          [nodeId]
        );
        return res.status(200).json({ logs });
      }
      
      if (action === 'test-insert' && nodeId) {
        // Insert a test activity log
        const id = uuidv4();
        const timestamp = new Date().toISOString();
        const userAddress = req.query.userAddress || '0xTestUser';
        const testData = {
          test: true,
          message: 'This is a test activity'
        };
        
        await database.run(
          'INSERT INTO activity_logs (id, node_id, user_address, event_type, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [id, nodeId, userAddress, 'TestEvent', JSON.stringify(testData), timestamp]
        );
        
        return res.status(200).json({ success: true, id });
      }
      
      if (action === 'reset-table') {
        // Drop and recreate the activity_logs table
        await database.run('DROP TABLE IF EXISTS activity_logs');
        await database.run(`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            node_id TEXT,
            user_address TEXT,
            event_type TEXT,
            data TEXT,
            timestamp TEXT
          )
        `);
        return res.status(200).json({ success: true });
      }
      
      // Default response
      return res.status(200).json({ 
        message: 'Debug database API', 
        availableActions: [
          'tables', 
          'activity-logs', 
          'activity-count', 
          'node-activities', 
          'test-insert', 
          'reset-table'
        ] 
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in debug-database API:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

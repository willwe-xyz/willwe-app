import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nodeId } = req.query;

    if (req.method === 'GET') {
      // Log the incoming request
      console.log('Fetching movements for nodeId:', nodeId);

      const sql = `
        SELECT 
          movement_hash,
          node_id,
          category,
          type,
          description,
          initiator,
          current_signatures,
          required_signatures,
          expires_at,
          executed,
          executed_at,
          created_at,
          status
        FROM Movement
        WHERE node_id = ?
        ORDER BY created_at DESC
      `;
      
      try {
        const movements = await query(sql, [nodeId]);
        console.log(`Found ${movements.length} movements`);
        
        // Transform the data to match the expected format
        const formattedMovements = movements.map(movement => ({
          movement_hash: movement.movement_hash,
          node_id: movement.node_id,
          category: movement.category,
          description: movement.description,
          initiator: movement.initiator,
          current_signatures: movement.current_signatures || 0,
          required_signatures: movement.required_signatures || 0,
          expires_at: movement.expires_at,
          created_at: movement.created_at,
          status: movement.status || 'pending',
          executed: Boolean(movement.executed),
          executed_at: movement.executed_at
        }));
        
        return res.status(200).json(formattedMovements);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ 
          error: 'Database operation failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

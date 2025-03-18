import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/ponder-client';

/**
 * API endpoint to directly query the Ponder database
 * @param req The request object
 * @param res The response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nodeId, eventType, limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (!nodeId) {
      return res.status(400).json({ error: 'Node ID is required' });
    }
    
    console.log(`[API] Direct query for node ${nodeId}, event type: ${eventType}, limit: ${limitNum}`);
    
    // Connect to the database using our utility
    const db = await getDatabase();
    
    // Get the list of tables in the database
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    console.log(`[API] Found ${tables.length} tables in database:`, tables.map((t: any) => t.name).join(', '));
    
    // If event type is specified, query only that table
    if (eventType) {
      try {
        // Find the actual table name with correct case
        const actualTable = tables.find((t: any) => 
          t.name.toLowerCase() === (eventType as string).toLowerCase()
        );
        
        if (!actualTable) {
          return res.status(404).json({
            error: `Table ${eventType} not found in database`,
            availableTables: tables.map((t: any) => t.name)
          });
        }
        
        const events = await db.all(
          `SELECT * FROM "${actualTable.name}" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
          [nodeId, limitNum]
        );
        
        return res.status(200).json({
          table: actualTable.name,
          events
        });
      } catch (error) {
        return res.status(500).json({
          error: `Error querying table ${eventType}`,
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Otherwise, query all relevant tables
    const results: Record<string, any[]> = {};
    
    // List of tables that might contain node-related events
    const relevantTables = [
      'Burn',
      'InflationMinted',
      'MembershipMinted',
      'InflationRateChanged',
      'MembraneChanged',
      'Signaled',
      'Transfer',
      'TransferSingle',
      'NewBranch',
      'NewRootBranch',
      'MembershipMitend',
      'ActivityLog'  
    ];
    
    // Filter to only include tables that exist in the database
    const existingTables = relevantTables.filter(table => 
      tables.some((t: any) => t.name.toLowerCase() === table.toLowerCase())
    );
    
    // Query each table
    for (const table of existingTables) {
      try {
        // Find the actual table name with correct case
        const actualTable = tables.find((t: any) => 
          t.name.toLowerCase() === table.toLowerCase()
        );
        
        if (actualTable) {
          const events = await db.all(
            `SELECT * FROM "${actualTable.name}" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
            [nodeId, limitNum]
          );
          
          if (events.length > 0) {
            results[actualTable.name] = events;
          }
        }
      } catch (error) {
        console.error(`[API] Error querying table ${table}:`, error);
      }
    }
    
    // Also check the activity_logs table directly
    try {
      const activityLogs = await db.all(
        `SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?`,
        [nodeId, limitNum]
      );
      
      if (activityLogs.length > 0) {
        results['activity_logs'] = activityLogs.map(log => {
          try {
            return {
              ...log,
              data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data
            };
          } catch (error) {
            return log;
          }
        });
      }
    } catch (error) {
      console.error(`[API] Error querying activity_logs table:`, error);
    }
    
    return res.status(200).json({
      tables: tables.map((t: any) => t.name),
      relevantTables: existingTables,
      results
    });
  } catch (error) {
    console.error('[API] Error in direct-query:', error);
    return res.status(500).json({ 
      error: 'Query operation failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

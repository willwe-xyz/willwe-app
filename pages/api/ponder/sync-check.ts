import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../ponder/utils/database';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';

/**
 * API endpoint to check if the Ponder database is in sync with our SQLite database
 * @param req The request object
 * @param res The response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Possible paths to the Ponder database
  const ponderDbPaths = [
    path.join(process.cwd(), '.ponder/pglite/ponder.db'),
    path.join(process.cwd(), 'db/ponder.db')
  ];
  
  // Find the first path that exists
  let ponderDbPath = null;
  for (const dbPath of ponderDbPaths) {
    if (fs.existsSync(dbPath)) {
      ponderDbPath = dbPath;
      break;
    }
  }
  
  if (!ponderDbPath) {
    return res.status(404).json({ 
      error: 'Ponder database not found',
      checkedPaths: ponderDbPaths
    });
  }
  
  console.log(`[API] Using Ponder database at: ${ponderDbPath}`);
  
  let ponderDb = null;
  
  try {
    // Initialize our database
    const database = await getDatabase();
    
    const { nodeId } = req.query;
    
    if (!nodeId) {
      return res.status(400).json({ error: 'Node ID is required' });
    }
    
    console.log(`[API] Checking sync status for node ${nodeId}`);
    
    // Connect to the Ponder database
    ponderDb = await open({
      filename: ponderDbPath,
      driver: sqlite3.Database
    });
    
    // Get the list of tables in the Ponder database
    const tables = await ponderDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    // List of tables that might contain node-related events
    const relevantTables = [
      'Burn',
      'InflationMinted',
      'MembershipMinted',
      'InflationRateChanged',
      'MembraneChanged',
      'Signaled',
      'Transfer'
    ];
    
    // Filter to only include tables that exist in the database
    const existingTables = relevantTables.filter(table => 
      tables.some((t: any) => t.name === table)
    );
    
    // Count events in Ponder database
    let ponderEventCount = 0;
    const ponderCounts: Record<string, number> = {};
    
    for (const table of existingTables) {
      try {
        const result = await ponderDb.get(
          `SELECT COUNT(*) as count FROM "${table}" WHERE "nodeId" = ?`,
          [nodeId]
        );
        
        const count = result ? result.count : 0;
        ponderEventCount += count;
        ponderCounts[table] = count;
      } catch (error) {
        console.error(`[API] Error counting events in table ${table}:`, error);
        ponderCounts[table] = 0;
      }
    }
    
    // Count events in our database
    const ourEventCount = await database.get(
      'SELECT COUNT(*) as count FROM activity_logs WHERE node_id = ?',
      [nodeId]
    );
    
    // Get event type counts from our database
    const ourEventTypes = await database.all(
      'SELECT event_type, COUNT(*) as count FROM activity_logs WHERE node_id = ? GROUP BY event_type',
      [nodeId]
    );
    
    const ourCounts: Record<string, number> = {};
    for (const row of ourEventTypes) {
      ourCounts[row.event_type] = row.count;
    }
    
    // Calculate sync percentage
    const syncPercentage = ponderEventCount > 0 
      ? Math.min(100, Math.round((ourEventCount.count / ponderEventCount) * 100)) 
      : 0;
    
    return res.status(200).json({
      nodeId,
      ponderEventCount,
      ourEventCount: ourEventCount.count,
      syncPercentage,
      ponderCounts,
      ourCounts,
      isSynced: syncPercentage >= 100
    });
  } catch (error) {
    console.error('[API] Error in sync-check:', error);
    return res.status(500).json({ 
      error: 'Sync check operation failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  } finally {
    // Close the Ponder database connection
    if (ponderDb) {
      await ponderDb.close();
    }
  }
}

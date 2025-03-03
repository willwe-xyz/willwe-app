import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';

/**
 * API endpoint to directly query the Ponder database
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
    const { nodeId, eventType, limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (!nodeId) {
      return res.status(400).json({ error: 'Node ID is required' });
    }
    
    console.log(`[API] Direct query for node ${nodeId}, event type: ${eventType}, limit: ${limitNum}`);
    
    // Connect to the Ponder database
    ponderDb = await open({
      filename: ponderDbPath,
      driver: sqlite3.Database
    });
    
    // Get the list of tables in the Ponder database
    const tables = await ponderDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    console.log(`[API] Found ${tables.length} tables in Ponder database:`, tables.map((t: any) => t.name).join(', '));
    
    // If event type is specified, query only that table
    if (eventType) {
      try {
        const events = await ponderDb.all(
          `SELECT * FROM "${eventType}" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
          [nodeId, limitNum]
        );
        
        return res.status(200).json({
          table: eventType,
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
      'Transfer'
    ];
    
    // Filter to only include tables that exist in the database
    const existingTables = relevantTables.filter(table => 
      tables.some((t: any) => t.name === table)
    );
    
    // Query each table
    for (const table of existingTables) {
      try {
        const events = await ponderDb.all(
          `SELECT * FROM "${table}" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
          [nodeId, limitNum]
        );
        
        if (events.length > 0) {
          results[table] = events;
        }
      } catch (error) {
        console.error(`[API] Error querying table ${table}:`, error);
      }
    }
    
    return res.status(200).json({
      dbPath: ponderDbPath,
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
  } finally {
    // Close the Ponder database connection
    if (ponderDb) {
      await ponderDb.close();
    }
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, storeActivityLog } from '../../../ponder/utils/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';

/**
 * API endpoint to sync activities from Ponder to our SQLite database
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
    
    const { nodeId, limit = '100' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (!nodeId) {
      return res.status(400).json({ error: 'Node ID is required' });
    }
    
    console.log(`[API] Sync activities for node ${nodeId}, limit: ${limitNum}`);
    
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
    
    // Query the Ponder database for events related to the node
    // We'll look for various event types that might be related to the node
    
    // Get burn events
    let burnEvents = [];
    try {
      burnEvents = await ponderDb.all(
        `SELECT * FROM "Burn" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
        [nodeId, limitNum]
      );
      console.log(`[API] Found ${burnEvents.length} burn events`);
    } catch (error) {
      console.error('[API] Error querying burn events:', error);
    }
    
    // Get mint events
    let mintEvents = [];
    try {
      mintEvents = await ponderDb.all(
        `SELECT * FROM "InflationMinted" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
        [nodeId, limitNum]
      );
      console.log(`[API] Found ${mintEvents.length} mint events`);
    } catch (error) {
      console.error('[API] Error querying mint events:', error);
    }
    
    // Get membership events
    let membershipEvents = [];
    try {
      membershipEvents = await ponderDb.all(
        `SELECT * FROM "MembershipMinted" WHERE "nodeId" = ? ORDER BY "blockTimestamp" DESC LIMIT ?`,
        [nodeId, limitNum]
      );
      console.log(`[API] Found ${membershipEvents.length} membership events`);
    } catch (error) {
      console.error('[API] Error querying membership events:', error);
    }
    
    // Combine all events
    const allEvents = [
      ...burnEvents.map((event: any) => ({ ...event, eventType: 'Burn' })),
      ...mintEvents.map((event: any) => ({ ...event, eventType: 'InflationMinted' })),
      ...membershipEvents.map((event: any) => ({ ...event, eventType: 'MembershipMinted' }))
    ];
    
    console.log(`[API] Found ${allEvents.length} events in Ponder database`);
    
    // Check which events are already in our database
    const existingEvents = new Set();
    for (const event of allEvents) {
      const eventId = event.id || uuidv4();
      const exists = await database.get(
        'SELECT id FROM activity_logs WHERE id = ?',
        [eventId]
      );
      if (exists) {
        existingEvents.add(eventId);
      }
    }
    
    console.log(`[API] ${existingEvents.size} events already exist in our database`);
    
    // Store new events in our database
    let syncedCount = 0;
    for (const event of allEvents) {
      const eventId = event.id || uuidv4();
      if (!existingEvents.has(eventId)) {
        try {
          const userAddress = event.from || event.to || event.user || event.member || '';
          const timestamp = new Date(Number(event.blockTimestamp) * 1000).toISOString();
          const data = { ...event };
          delete data.id;
          delete data.eventType;
          
          await storeActivityLog(
            nodeId as string,
            userAddress,
            event.eventType,
            data,
            eventId,
            timestamp
          );
          
          syncedCount++;
        } catch (error) {
          console.error(`[API] Error storing activity log for event ${eventId}:`, error);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      dbPath: ponderDbPath,
      tables: tables.map((t: any) => t.name),
      total: allEvents.length,
      existing: existingEvents.size,
      synced: syncedCount
    });
  } catch (error) {
    console.error('[API] Error in sync-activities:', error);
    return res.status(500).json({ 
      error: 'Sync operation failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  } finally {
    // Close the Ponder database connection
    if (ponderDb) {
      await ponderDb.close();
    }
  }
}

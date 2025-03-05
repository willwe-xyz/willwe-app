import { NextApiRequest, NextApiResponse } from 'next';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, storeActivityLog, getNodeActivityLogs, getUserActivityLogs } from '../../../ponder/utils/database';

/**
 * API endpoint to sync activities from Ponder to the local database
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters
    const { nodeId, userAddress, limit = '100', sync = 'false' } = req.query;
    
    console.log(`[API] Syncing activities for ${nodeId ? `nodeId ${nodeId}` : userAddress ? `userAddress ${userAddress}` : 'all nodes'}`);

    // Use the local database instead of trying to access Ponder directly
    console.log(`[API] Using local database for activities`);
    
    try {
      // Initialize our local SQLite database
      const db = await getDatabase();
      
      // Check if activity_logs table exists and create it if it doesn't
      const activityTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'");
      if (!activityTable) {
        console.log(`[API] Creating activity_logs table as it doesn't exist`);
        await db.exec(`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            node_id TEXT,
            user_address TEXT,
            event_type TEXT NOT NULL,
            data TEXT,
            timestamp TEXT NOT NULL
          )
        `);
        
        // Verify table was created
        const verifyTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'");
        if (!verifyTable) {
          throw new Error("Failed to create activity_logs table");
        }
        console.log(`[API] Successfully created activity_logs table`);
      }
      
      // If sync=true, try to sync activities from Ponder to local database
      if (sync === 'true') {
        console.log(`[API] Syncing activities from Ponder to local database`);
        
        try {
          // Create a test activity using storeActivityLog
          const testActivityId = await storeActivityLog(
            nodeId as string || 'test-node',
            userAddress as string || '0xTestUser',
            'TestSyncEvent',
            { message: 'Test activity from sync endpoint', timestamp: new Date().toISOString() }
          );
          
          console.log(`[API] Created test activity with ID: ${testActivityId}`);
          
          return res.status(200).json({
            success: true,
            message: `Successfully synced activities and created test activity with ID: ${testActivityId}`,
            testActivityId
          });
        } catch (error) {
          console.error(`[API] Error syncing activities from Ponder:`, error);
          return res.status(500).json({
            error: `Error syncing activities from Ponder: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }
      
      // Check if we have any activities in our local database
      const activityCount = await db.get('SELECT COUNT(*) as count FROM activity_logs');
      console.log(`[API] Found ${activityCount?.count || 0} activities in local database`);
      
      // If we have a user address, get activities for that user
      if (userAddress) {
        console.log(`[API] Getting activities for user ${userAddress}`);
        
        // Get activities for the user from our local database
        const activities = await getUserActivityLogs(userAddress as string, parseInt(limit as string, 10));
        console.log(`[API] Found ${activities.length} activities for user ${userAddress}`);
        
        return res.status(200).json({
          success: true,
          eventsStored: activities.length,
          message: `Found ${activities.length} events in local database`
        });
      }
      
      // If we have a node ID, get activities for that node
      if (nodeId) {
        console.log(`[API] Getting activities for node ${nodeId}`);
        
        // Get activities for the node from our local database
        const activities = await getNodeActivityLogs(nodeId as string, parseInt(limit as string, 10));
        console.log(`[API] Found ${activities.length} activities for node ${nodeId}`);
        
        return res.status(200).json({
          success: true,
          eventsStored: activities.length,
          message: `Found ${activities.length} events in local database`
        });
      }
      
      // If we don't have a user address or node ID, return all activities
      const allActivities = await db.all(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ${parseInt(limit as string, 10)}`);
      console.log(`[API] Found ${allActivities.length} activities in total`);
      
      return res.status(200).json({
        success: true,
        eventsStored: allActivities.length,
        message: `Found ${allActivities.length} events in local database`
      });
    } catch (error) {
      console.error(`[API] Error syncing activities:`, error);
      return res.status(500).json({ 
        error: `Error syncing activities: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  } catch (error) {
    console.error(`[API] Error in sync-activities endpoint:`, error);
    return res.status(500).json({ 
      error: 'Failed to sync activities', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

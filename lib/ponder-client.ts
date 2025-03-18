import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { ActivityLogEntry } from '../types/activity';
import { ponderConfig } from './config';

let database: Database | null = null;

/**
 * Configuration for the Ponder client
 */
export interface PonderClientConfig {
  serverUrl?: string;
  localDbPath?: string;
}

/**
 * Default configuration
 */
const defaultConfig: PonderClientConfig = {
  serverUrl: ponderConfig.serverUrl,
  localDbPath: ponderConfig.localDbPath
};

/**
 * Get a connection to the Ponder database
 * @param config Optional configuration
 * @returns Database connection
 */
export async function getDatabase(config: PonderClientConfig = defaultConfig): Promise<Database> {
  if (database) {
    return database;
  }

  // For local development, we use SQLite
  // In production, this would connect to the Ponder server API
  try {
    console.log('Initializing database connection to local SQLite database');
    
    // Open a connection to our local SQLite database
    database = await open({
      filename: config.localDbPath || defaultConfig.localDbPath,
      driver: sqlite3.Database
    });
    
    // Create the activity_logs table if it doesn't exist
    await createActivityLogsTable(database);
    
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Create the activity_logs table if it doesn't exist
 * @param db Database connection
 */
async function createActivityLogsTable(db: Database): Promise<void> {
  try {
    // Check if the table exists (case-insensitive)
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'activity_logs' COLLATE NOCASE"
    );
    
    if (tables.length === 0) {
      console.log('Creating activity_logs table');
      
      await db.exec(`
        CREATE TABLE activity_logs (
          id TEXT PRIMARY KEY,
          node_id TEXT,
          user_address TEXT,
          event_type TEXT,
          data TEXT,
          timestamp TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes for faster queries
      await db.exec('CREATE INDEX idx_activity_logs_node_id ON activity_logs(node_id)');
      await db.exec('CREATE INDEX idx_activity_logs_user_address ON activity_logs(user_address)');
      await db.exec('CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp)');
      
      console.log('activity_logs table created successfully');
    } else {
      console.log('activity_logs table already exists');
    }
  } catch (error) {
    console.error('Error creating activity_logs table:', error);
    throw error;
  }
}

/**
 * Store an activity log in the database
 * @param nodeId Node ID
 * @param userAddress User address
 * @param eventType Event type
 * @param data Event data
 * @returns ID of the created activity log
 */
export async function storeActivityLog(
  nodeId: string,
  userAddress: string,
  eventType: string,
  data: any
): Promise<string> {
  const db = await getDatabase();
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const timestamp = new Date().toISOString();
  
  try {
    await db.run(
      'INSERT INTO activity_logs (id, node_id, user_address, event_type, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nodeId, userAddress, eventType, typeof data === 'string' ? data : JSON.stringify(data), timestamp]
    );
    
    return id;
  } catch (error) {
    console.error('Error storing activity log:', error);
    throw error;
  }
}

/**
 * Get activity logs for a node
 * @param nodeId Node ID
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getNodeActivityLogs(nodeId: string, limit: number = 50): Promise<ActivityLogEntry[]> {
  const db = await getDatabase();
  
  try {
    // Query the local database first
    const localActivities = await db.all(
      'SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?',
      [nodeId, limit]
    );
    
    // If we have activities, return them
    if (localActivities.length > 0) {
      return localActivities.map(formatActivityLog);
    }
    
    // Otherwise, fetch from the Ponder server
    return await fetchActivitiesFromPonderServer('node', nodeId, limit);
  } catch (error) {
    console.error(`Error getting node activity logs for ${nodeId}:`, error);
    throw error;
  }
}

/**
 * Get activity logs for a user
 * @param userAddress User address
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getUserActivityLogs(userAddress: string, limit: number = 50): Promise<ActivityLogEntry[]> {
  const db = await getDatabase();
  
  try {
    // Query the local database first
    const localActivities = await db.all(
      'SELECT * FROM activity_logs WHERE user_address = ? ORDER BY timestamp DESC LIMIT ?',
      [userAddress, limit]
    );
    
    // If we have activities, return them
    if (localActivities.length > 0) {
      return localActivities.map(formatActivityLog);
    }
    
    // Otherwise, fetch from the Ponder server
    return await fetchActivitiesFromPonderServer('user', userAddress, limit);
  } catch (error) {
    console.error(`Error getting user activity logs for ${userAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch activities from the Ponder server
 * @param type Type of entity (node or user)
 * @param id Entity ID
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
async function fetchActivitiesFromPonderServer(
  type: 'node' | 'user',
  id: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const config = defaultConfig;
  const endpoint = `${config.serverUrl}/api/activities`;
  
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  
  if (type === 'node') {
    params.append('nodeId', id);
  } else {
    params.append('userAddress', id);
  }
  
  try {
    const response = await fetch(`${endpoint}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities from Ponder server: ${response.statusText}`);
    }
    
    const data = await response.json();
    const activities = data.activities || [];
    
    // Store the activities in our local database for future use
    const db = await getDatabase();
    for (const activity of activities) {
      try {
        await storeActivityLog(
          activity.nodeId || activity.node_id || '',
          activity.userAddress || activity.user_address || '',
          activity.eventType || activity.event_type || '',
          activity.data
        );
      } catch (error) {
        console.error('Error storing activity from Ponder server:', error);
      }
    }
    
    return activities.map(formatActivityLog);
  } catch (error) {
    console.error(`Error fetching activities from Ponder server:`, error);
    return [];
  }
}

/**
 * Format an activity log from the database
 * @param log Activity log from the database
 * @returns Formatted activity log
 */
function formatActivityLog(log: any): ActivityLogEntry {
  return {
    id: log.id,
    nodeId: log.nodeId || log.node_id,
    node_id: log.nodeId || log.node_id,
    userAddress: log.userAddress || log.user_address,
    user_address: log.userAddress || log.user_address,
    eventType: log.eventType || log.event_type,
    event_type: log.eventType || log.event_type,
    data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data,
    timestamp: log.timestamp
  };
}

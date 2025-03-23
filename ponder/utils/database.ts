import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogEntry } from '../../types/activity';

/**
 * Get or initialize the SQLite database
 * @returns SQLite database instance
 */
export async function getDatabase() {
  // Use in-memory database for API routes
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });
  
  // Create activity_logs table if it doesn't exist
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
  
  return db;
}

/**
 * Store an activity log
 * @param nodeId Node ID
 * @param userAddress User address
 * @param eventType Event type
 * @param data Event data
 * @returns ID of the stored activity log
 */
export async function storeActivityLog(
  nodeId: string,
  userAddress: string,
  eventType: string,
  data: any
): Promise<string> {
  const db = await getDatabase();
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  
  await db.run(
    `INSERT INTO activity_logs (id, node_id, user_address, event_type, data, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, nodeId, userAddress, eventType, JSON.stringify(data), timestamp]
  );
  
  return id;
}

/**
 * Get activity logs for a node
 * @param nodeId Node ID
 * @param limit Maximum number of logs to return
 * @returns Activity logs
 */
export async function getNodeActivityLogs(
  nodeId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const db = await getDatabase();
  
  const logs = await db.all(
    `SELECT * FROM activity_logs 
     WHERE node_id = ? 
     ORDER BY timestamp DESC 
     LIMIT ?`,
    [nodeId, limit]
  );
  
  return logs.map(formatActivityLog);
}

/**
 * Get activity logs for a user
 * @param userAddress User address
 * @param limit Maximum number of logs to return
 * @returns Activity logs
 */
export async function getUserActivityLogs(
  userAddress: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const db = await getDatabase();
  
  const logs = await db.all(
    `SELECT * FROM activity_logs 
     WHERE user_address = ? 
     ORDER BY timestamp DESC 
     LIMIT ?`,
    [userAddress, limit]
  );
  
  return logs.map(formatActivityLog);
}

/**
 * Format an activity log entry
 * @param log Activity log from database
 * @returns Formatted activity log
 */
function formatActivityLog(log: any): ActivityLogEntry {
  return {
    id: log.id,
    nodeId: log.node_id,
    node_id: log.node_id,
    userAddress: log.user_address,
    user_address: log.user_address,
    eventType: log.event_type,
    event_type: log.event_type,
    data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data,
    timestamp: log.timestamp
  };
}
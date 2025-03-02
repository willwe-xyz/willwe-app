import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import path from 'path';

let db: SQLiteDatabase | null = null;

/**
 * Get a connection to the SQLite database
 * @returns SQLite database connection
 */
export async function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'db', 'ponder.db');
    
    db = await open({
      filename: dbPath,
      driver: Database
    });
    
    // Initialize tables if they don't exist
    await initializeTables();
  }
  
  return db;
}

/**
 * Initialize SQLite tables if they don't exist
 */
async function initializeTables() {
  const database = await getDatabase();
  
  // Create tables
  await database.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_address TEXT NOT NULL,
      redistributive_preferences TEXT,
      supported_movements TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      node_id TEXT,
      user_address TEXT,
      event_type TEXT NOT NULL,
      data TEXT,
      timestamp TEXT NOT NULL
    );
  `);
}

/**
 * Store a chat message in the database
 * @param nodeId The ID of the node the message belongs to
 * @param sender The address of the sender
 * @param content The content of the message
 */
export async function storeChatMessage(nodeId: string, sender: string, content: string) {
  const database = await getDatabase();
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  await database.run(
    'INSERT INTO chat_messages (id, node_id, sender, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, nodeId, sender, content, timestamp]
  );
  
  return { id, node_id: nodeId, sender, content, timestamp };
}

/**
 * Get chat messages for a node
 * @param nodeId The ID of the node
 * @param limit The maximum number of messages to retrieve
 * @param offset The offset for pagination
 */
export async function getChatMessages(nodeId: string, limit = 50, offset = 0) {
  const database = await getDatabase();
  
  const messages = await database.all(
    'SELECT * FROM chat_messages WHERE node_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [nodeId, limit, offset]
  );
  
  return messages;
}

/**
 * Store activity log in the database
 * @param nodeId The ID of the node
 * @param userAddress The address of the user
 * @param eventType The type of event
 * @param data The event data
 */
export async function storeActivityLog(nodeId: string | null, userAddress: string | null, eventType: string, data: any) {
  const database = await getDatabase();
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();
  const jsonData = JSON.stringify(data);
  
  await database.run(
    'INSERT INTO activity_logs (id, node_id, user_address, event_type, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [id, nodeId, userAddress, eventType, jsonData, timestamp]
  );
  
  return { id, node_id: nodeId, user_address: userAddress, event_type: eventType, data: jsonData, timestamp };
}

/**
 * Get activity logs for a node
 * @param nodeId The ID of the node
 * @param limit The maximum number of logs to retrieve
 */
export async function getNodeActivityLogs(nodeId: string, limit = 50) {
  const database = await getDatabase();
  
  const logs = await database.all(
    'SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?',
    [nodeId, limit]
  );
  
  return logs.map(log => ({
    ...log,
    data: JSON.parse(log.data || '{}')
  }));
}

/**
 * Get activity logs for a user
 * @param userAddress The address of the user
 * @param limit The maximum number of logs to retrieve
 */
export async function getUserActivityLogs(userAddress: string, limit = 50) {
  const database = await getDatabase();
  
  const logs = await database.all(
    'SELECT * FROM activity_logs WHERE user_address = ? ORDER BY timestamp DESC LIMIT ?',
    [userAddress, limit]
  );
  
  return logs.map(log => ({
    ...log,
    data: JSON.parse(log.data || '{}')
  }));
}

/**
 * Store user preferences in the database
 * @param userAddress The address of the user
 * @param redistributivePreferences The user's redistributive preferences
 * @param supportedMovements The user's supported movements
 */
export async function storeUserPreferences(userAddress: string, redistributivePreferences: any, supportedMovements: any) {
  const database = await getDatabase();
  const id = `${userAddress}`;
  const timestamp = new Date().toISOString();
  
  // Check if user preferences already exist
  const existingPrefs = await database.get(
    'SELECT * FROM user_preferences WHERE user_address = ?',
    [userAddress]
  );
  
  if (existingPrefs) {
    // Update existing preferences
    await database.run(
      'UPDATE user_preferences SET redistributive_preferences = ?, supported_movements = ?, updated_at = ? WHERE user_address = ?',
      [
        JSON.stringify(redistributivePreferences),
        JSON.stringify(supportedMovements),
        timestamp,
        userAddress
      ]
    );
  } else {
    // Create new preferences
    await database.run(
      'INSERT INTO user_preferences (id, user_address, redistributive_preferences, supported_movements, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        userAddress,
        JSON.stringify(redistributivePreferences),
        JSON.stringify(supportedMovements),
        timestamp,
        timestamp
      ]
    );
  }
  
  return {
    id,
    user_address: userAddress,
    redistributive_preferences: redistributivePreferences,
    supported_movements: supportedMovements,
    created_at: timestamp,
    updated_at: timestamp
  };
}

/**
 * Get user preferences from the database
 * @param userAddress The address of the user
 */
export async function getUserPreferences(userAddress: string) {
  const database = await getDatabase();
  
  const prefs = await database.get(
    'SELECT * FROM user_preferences WHERE user_address = ?',
    [userAddress]
  );
  
  if (!prefs) return null;
  
  return {
    ...prefs,
    redistributive_preferences: JSON.parse(prefs.redistributive_preferences || '{}'),
    supported_movements: JSON.parse(prefs.supported_movements || '[]')
  };
}

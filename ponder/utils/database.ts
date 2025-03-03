import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

let db: SQLiteDatabase | null = null;

/**
 * Get a connection to the SQLite database
 * @returns SQLite database connection
 */
export async function getDatabase() {
  if (!db) {
    console.log('[database] Initializing database connection');
    try {
      const dbPath = path.join(process.cwd(), 'db', 'ponder.db');
      console.log(`[database] Database path: ${dbPath}`);
      
      // Check if the directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        console.log(`[database] Creating directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      db = await open({
        filename: dbPath,
        driver: Database
      });
      
      // Initialize tables if they don't exist
      await initializeTables();
      
      console.log('[database] Database connection established successfully');
    } catch (error) {
      console.error('[database] Error initializing database:', error);
      throw error;
    }
  }
  
  return db;
}

/**
 * Initialize SQLite tables if they don't exist
 */
async function initializeTables() {
  console.log('[database] Initializing database tables');
  const database = await getDatabase();
  
  try {
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
    
    // Check if tables were created successfully
    const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('[database] Tables in database:', tables.map(t => t.name).join(', '));
    
    // Check if activity_logs table exists
    const activityLogsTable = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'");
    if (!activityLogsTable) {
      console.error('[database] activity_logs table was not created successfully!');
      
      // Try to create it again with a separate statement
      await database.exec(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          node_id TEXT,
          user_address TEXT,
          event_type TEXT NOT NULL,
          data TEXT,
          timestamp TEXT NOT NULL
        )
      `);
      
      // Check again
      const retryCheck = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'");
      console.log('[database] Retry creating activity_logs table:', retryCheck ? 'success' : 'failed');
    }
    
    console.log('[database] Database tables initialized successfully');
  } catch (error) {
    console.error('[database] Error initializing tables:', error);
    throw error;
  }
}

/**
 * Store a chat message in the database
 * @param nodeId The ID of the node the message belongs to
 * @param sender The address of the sender
 * @param content The content of the message
 */
export async function storeChatMessage(nodeId: string, sender: string, content: string) {
  console.log(`[database] Storing chat message for node ${nodeId} from ${sender}`);
  
  try {
    const database = await getDatabase();
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Log the SQL query we're about to execute
    console.log(`[database] Executing SQL: INSERT INTO chat_messages (id, node_id, sender, content, timestamp) VALUES (?, ?, ?, ?, ?)`);
    console.log(`[database] With params: [${id}, ${nodeId}, ${sender}, ${content.substring(0, 20)}..., ${timestamp}]`);
    
    await database.run(
      'INSERT INTO chat_messages (id, node_id, sender, content, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, nodeId, sender, content, timestamp]
    );
    
    console.log(`[database] Chat message stored successfully with ID ${id}`);
    
    return { id, node_id: nodeId, sender, content, timestamp };
  } catch (error) {
    console.error('[database] Error storing chat message:', error);
    throw error;
  }
}

/**
 * Get chat messages for a node
 * @param nodeId The ID of the node
 * @param limit The maximum number of messages to retrieve
 * @param offset The offset for pagination
 */
export async function getChatMessages(nodeId: string, limit = 50, offset = 0) {
  console.log(`[database] Getting chat messages for node ${nodeId} with limit ${limit} and offset ${offset}`);
  
  try {
    const database = await getDatabase();
    
    // Check if the chat_messages table exists
    const tableExists = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_messages'");
    console.log(`[database] Chat messages table exists: ${!!tableExists}`);
    
    if (!tableExists) {
      console.log('[database] Creating chat_messages table');
      await database.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          node_id TEXT NOT NULL,
          sender TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);
    }
    
    // Log the SQL query we're about to execute
    console.log(`[database] Executing SQL: SELECT * FROM chat_messages WHERE node_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`);
    console.log(`[database] With params: [${nodeId}, ${limit}, ${offset}]`);
    
    const messages = await database.all(
      'SELECT * FROM chat_messages WHERE node_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [nodeId, limit, offset]
    );
    
    console.log(`[database] Found ${messages.length} chat messages`);
    
    return messages;
  } catch (error) {
    console.error('[database] Error getting chat messages:', error);
    throw error;
  }
}

/**
 * Store an activity log in the database
 * @param nodeId The ID of the node
 * @param userAddress The address of the user
 * @param eventType The type of event
 * @param data The event data
 * @param id Optional ID for the activity log
 * @param timestamp Optional timestamp for the activity log
 * @returns The ID of the stored activity log
 */
export async function storeActivityLog(
  nodeId: string,
  userAddress: string,
  eventType: string,
  data: any,
  id: string = uuidv4(),
  timestamp: string = new Date().toISOString()
): Promise<string> {
  try {
    console.log(`[Database] Storing activity log: ${id} for node ${nodeId}, event type: ${eventType}`);
    
    // Ensure the database is initialized
    const database = await getDatabase();
    
    // Convert data to JSON string if it's not already a string
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Insert the activity log
    await database.run(
      'INSERT INTO activity_logs (id, node_id, user_address, event_type, data, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nodeId, userAddress, eventType, jsonData, timestamp]
    );
    
    console.log(`[Database] Successfully stored activity log: ${id}`);
    return id;
  } catch (error) {
    console.error(`[Database] Error storing activity log for node ${nodeId}:`, error);
    throw error;
  }
}

/**
 * Get activity logs for a node
 * @param nodeId The ID of the node
 * @param limit Maximum number of logs to return
 * @returns Array of activity logs
 */
export async function getNodeActivityLogs(nodeId: string, limit: number = 50): Promise<any[]> {
  try {
    console.log(`[Database] Getting activity logs for node ${nodeId}, limit: ${limit}`);
    
    // Ensure the database is initialized
    const database = await getDatabase();
    
    // Get the logs for the node
    const logs = await database.all(
      'SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?',
      [nodeId, limit]
    );
    
    console.log(`[Database] Found ${logs.length} activity logs for node ${nodeId}`);
    
    // If no logs found with exact match, try to find logs with similar node IDs
    if (logs.length === 0) {
      console.log(`[Database] No logs found for node ${nodeId}, checking for similar node IDs`);
      
      // Check if there are any activities for nodes with similar IDs (in case of formatting issues)
      const similarNodeQuery = await database.all(
        "SELECT node_id, COUNT(*) as count FROM activity_logs GROUP BY node_id"
      );
      
      if (similarNodeQuery.length > 0) {
        console.log(`[Database] Found activities for ${similarNodeQuery.length} different node IDs:`);
        
        // Find node IDs that might be similar to our target nodeId
        const similarNodes = similarNodeQuery
          .filter((row: any) => row.node_id && 
            (row.node_id.includes(nodeId) || nodeId.includes(row.node_id)))
          .map((row: any) => row.node_id);
        
        if (similarNodes.length > 0) {
          console.log(`[Database] Found ${similarNodes.length} similar node IDs:`, similarNodes);
          
          // Get logs for the most similar node ID (the first one)
          const similarLogs = await database.all(
            'SELECT * FROM activity_logs WHERE node_id = ? ORDER BY timestamp DESC LIMIT ?',
            [similarNodes[0], limit]
          );
          
          console.log(`[Database] Found ${similarLogs.length} logs for similar node ID ${similarNodes[0]}`);
          return similarLogs;
        }
      }
    }
    
    return logs;
  } catch (error) {
    console.error(`[Database] Error getting activity logs for node ${nodeId}:`, error);
    throw error;
  }
}

/**
 * Get activity logs for a user
 * @param userAddress The address of the user
 * @param limit The maximum number of logs to retrieve
 */
export async function getUserActivityLogs(userAddress: string, limit = 50) {
  try {
    console.log(`[Database] Getting activity logs for user ${userAddress}, limit: ${limit}`);
    
    // Ensure the database is initialized
    const database = await getDatabase();
    
    // Get the logs for the user
    const logs = await database.all(
      'SELECT * FROM activity_logs WHERE user_address = ? ORDER BY timestamp DESC LIMIT ?',
      [userAddress, limit]
    );
    
    console.log(`[Database] Found ${logs.length} activity logs for user ${userAddress}`);
    
    // Parse the data field for each log
    return logs.map(log => {
      try {
        return {
          ...log,
          data: typeof log.data === 'string' ? JSON.parse(log.data) : log.data
        };
      } catch (error) {
        console.error(`[Database] Error parsing data for log ${log.id}:`, error);
        return {
          ...log,
          data: {}
        };
      }
    });
  } catch (error) {
    console.error(`[Database] Error getting activity logs for user ${userAddress}:`, error);
    throw error;
  }
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

/**
 * Initialize the database
 * This function ensures that the database is initialized and the required tables are created
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  try {
    console.log('[Database] Initializing database');
    
    // Get the database instance
    const database = await getDatabase();
    
    // Create the activity_logs table if it doesn't exist
    await database.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        node_id TEXT,
        user_address TEXT,
        event_type TEXT NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL
      )
    `);
    
    console.log('[Database] Database initialized successfully');
    return database;
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
    throw error;
  }
}

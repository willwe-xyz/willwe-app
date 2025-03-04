const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDatabase() {
  console.log('Initializing SQLite database...');
  
  try {
    // Open the database connection
    const db = await open({
      filename: path.join(process.cwd(), 'ponder.db'), // Adjust the path if needed
      driver: sqlite3.Database
    });
    
    console.log('Database connection established');
    
    // Create the ActivityLog table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ActivityLog (
        id TEXT PRIMARY KEY,
        nodeId TEXT,
        userAddress TEXT,
        eventType TEXT,
        data TEXT,
        timestamp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('ActivityLog table created');
    
    // Create additional tables for your application
    
    // Create the ChatMessage table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ChatMessage (
        id TEXT PRIMARY KEY,
        nodeId TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('ChatMessage table created');
    
    // Create table for user preferences if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS UserPreference (
        userAddress TEXT PRIMARY KEY,
        redistributive_preferences TEXT,
        supported_movements TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('UserPreference table created');
    
    // Create indices for better query performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_activity_node ON ActivityLog (nodeId);
      CREATE INDEX IF NOT EXISTS idx_activity_user ON ActivityLog (userAddress);
      CREATE INDEX IF NOT EXISTS idx_chat_node ON ChatMessage (nodeId);
    `);
    console.log('Indices created');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();

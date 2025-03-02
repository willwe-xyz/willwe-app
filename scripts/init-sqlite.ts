import { open, Database } from 'sqlite';
import { Database as SQLiteDatabase } from 'sqlite3';

async function initializeSQLiteDatabase() {
  console.log('Initializing SQLite database...');
  
  try {
    // Open database connection
    const db = await open({
      filename: './ponder.db',
      driver: SQLiteDatabase
    });
    
    console.log('Creating tables...');
    
    // Create tables
    await db.exec(`
      -- Activity logs table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        node_id TEXT,
        user_address TEXT,
        event_type TEXT NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL
      );
      
      -- Chat messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
      
      -- User preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_address TEXT NOT NULL,
        redistributive_preferences TEXT,
        supported_movements TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      -- Membranes table
      CREATE TABLE IF NOT EXISTS membranes (
        id TEXT PRIMARY KEY,
        membrane_id TEXT NOT NULL,
        creator TEXT NOT NULL,
        cid TEXT,
        tokens TEXT,
        balances TEXT,
        node_id TEXT,
        created_at TEXT NOT NULL
      );
      
      -- Movements table
      CREATE TABLE IF NOT EXISTS movements (
        movement_hash TEXT PRIMARY KEY,
        category INTEGER NOT NULL,
        type TEXT NOT NULL,
        initiator TEXT NOT NULL,
        node_id TEXT NOT NULL,
        expires_at TEXT,
        description TEXT,
        payload TEXT,
        state TEXT,
        required_signatures INTEGER,
        current_signatures INTEGER,
        executed INTEGER DEFAULT 0,
        executed_at TEXT,
        created_at TEXT NOT NULL
      );
      
      -- Signatures table
      CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY,
        movement_hash TEXT NOT NULL,
        signer TEXT NOT NULL,
        signed_at TEXT NOT NULL,
        FOREIGN KEY (movement_hash) REFERENCES movements(movement_hash)
      );
      
      -- Movement signatures table (for detailed signature data)
      CREATE TABLE IF NOT EXISTS movement_signatures (
        id TEXT PRIMARY KEY,
        movement_hash TEXT NOT NULL,
        signature_data TEXT NOT NULL,
        user_address TEXT NOT NULL,
        node_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_activity_logs_node_id ON activity_logs(node_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_address ON activity_logs(user_address);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
      
      CREATE INDEX IF NOT EXISTS idx_chat_messages_node_id ON chat_messages(node_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);
      
      CREATE INDEX IF NOT EXISTS idx_movements_node_id ON movements(node_id);
      CREATE INDEX IF NOT EXISTS idx_movements_initiator ON movements(initiator);
      
      CREATE INDEX IF NOT EXISTS idx_signatures_movement_hash ON signatures(movement_hash);
      CREATE INDEX IF NOT EXISTS idx_signatures_signer ON signatures(signer);
    `);
    
    console.log('SQLite database initialized successfully!');
    
    // Close the database connection
    await db.close();
    
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
}

// Run the initialization
initializeSQLiteDatabase();

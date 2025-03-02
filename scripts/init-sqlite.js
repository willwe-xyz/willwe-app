const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'ponder.db');

console.log('Initializing SQLite database...');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Create tables
  db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Activity logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        node_id TEXT,
        user_address TEXT,
        event_type TEXT NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL
      )
    `);
    
    // Chat messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
    
    // User preferences table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_address TEXT NOT NULL,
        redistributive_preferences TEXT,
        supported_movements TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // Membranes table
    db.run(`
      CREATE TABLE IF NOT EXISTS membranes (
        id TEXT PRIMARY KEY,
        membrane_id TEXT NOT NULL,
        creator TEXT NOT NULL,
        cid TEXT,
        tokens TEXT,
        balances TEXT,
        node_id TEXT,
        created_at TEXT NOT NULL
      )
    `);
    
    // Movements table
    db.run(`
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
      )
    `);
    
    // Signatures table
    db.run(`
      CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY,
        movement_hash TEXT NOT NULL,
        signer TEXT NOT NULL,
        signed_at TEXT NOT NULL,
        FOREIGN KEY (movement_hash) REFERENCES movements(movement_hash)
      )
    `);
    
    // Movement signatures table (for detailed signature data)
    db.run(`
      CREATE TABLE IF NOT EXISTS movement_signatures (
        id TEXT PRIMARY KEY,
        movement_hash TEXT NOT NULL,
        signature_data TEXT NOT NULL,
        user_address TEXT NOT NULL,
        node_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    
    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_node_id ON activity_logs(node_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_user_address ON activity_logs(user_address)');
    db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_chat_messages_node_id ON chat_messages(node_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_movements_node_id ON movements(node_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_movements_initiator ON movements(initiator)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_signatures_movement_hash ON signatures(movement_hash)');
    db.run('CREATE INDEX IF NOT EXISTS idx_signatures_signer ON signatures(signer)');
    
    console.log('SQLite database tables created successfully!');
  });
  
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});

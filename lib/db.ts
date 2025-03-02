import { open, Database } from 'sqlite';
import { Database as SQLiteDatabase } from 'sqlite3';
import path from 'path';

let db: Database | null = null;

async function initializeDb(database: Database) {
  // Create tables if they don't exist
  await database.exec(`
    CREATE TABLE IF NOT EXISTS Movement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movement_hash TEXT NOT NULL,
      node_id TEXT NOT NULL,
      category INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      initiator TEXT NOT NULL,
      current_signatures INTEGER DEFAULT 0,
      required_signatures INTEGER,
      expires_at TEXT,
      executed BOOLEAN DEFAULT FALSE,
      executed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_movement_node_id ON Movement(node_id);
    CREATE INDEX IF NOT EXISTS idx_movement_hash ON Movement(movement_hash);
  `);
}

export async function getDb() {
  if (db) return db;
  
  try {
    const dbPath = path.join(process.cwd(), '.ponder', 'pglite', 'ponder.db');
    
    db = await open({
      filename: dbPath,
      driver: SQLiteDatabase
    });

    // Initialize database tables
    await initializeDb(db);
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

export async function closeDb() {
  if (db) {
    try {
      await db.close();
      db = null;
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

export async function query(sql: string, params: any[] = []) {
  const database = await getDb();
  try {
    return await database.all(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', sql);
    console.error('Parameters:', params);
    throw error;
  }
}

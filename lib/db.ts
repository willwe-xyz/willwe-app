import { getDatabase as getPonderDatabase } from './ponder-client';
import { Database } from 'sqlite';

/**
 * Get a connection to the database
 * @returns Database connection
 */
export async function getDb() {
  return await getPonderDatabase();
}

/**
 * Close the database connection
 * This is a no-op since the database connection is managed by ponder-client.ts
 */
export async function closeDb() {
  // No-op as the connection is managed by ponder-client.ts
  console.log('Database connection is managed by ponder-client.ts');
}

/**
 * Execute a query on the database
 * @param sql SQL query to execute
 * @param params Parameters for the query
 * @returns Query results
 */
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

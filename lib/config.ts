/**
 * Application configuration
 */

/**
 * Ponder server configuration
 */
export const ponderConfig = {
  /**
   * URL of the Ponder server
   */
  serverUrl: process.env.PONDER_SERVER_URL || 'http://localhost:8080',
  
  /**
   * Path to the local database
   */
  localDbPath: process.env.LOCAL_DB_PATH || './db/local.db'
};

/**
 * API configuration
 */
export const apiConfig = {
  /**
   * Base URL for API requests
   */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
};

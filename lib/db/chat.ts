import { Pool } from 'pg';

if (!process.env.PSQL_CHAT_DATABASE_REMOTE) {
  throw new Error('PSQL_CHAT_DATABASE_REMOTE environment variable is not set');
}

// Parse the connection URL to extract components
const connectionString = process.env.PSQL_CHAT_DATABASE_REMOTE;
const url = new URL(connectionString);

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: parseInt(url.port, 10),
  database: url.pathname.replace(/^\//, ''), // Remove leading slash
  ssl: {
    rejectUnauthorized: false // Required for some remote PostgreSQL providers
  },
  // Add connection timeout to prevent hanging
  connectionTimeoutMillis: 5000,
  // Add max client to prevent too many connections
  max: 20,
  // Add idle timeout to close idle clients
  idleTimeoutMillis: 30000
});

// Log connection events for debugging
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Initialize the chat_messages table if it doesn't exist
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        node_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        network_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_chat_messages_node_id ON chat_messages(node_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
    `);
    console.log('Chat database initialized');
  } catch (error) {
    console.error('Error initializing chat database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize the database when this module is imported
initializeDatabase().catch(console.error);

interface ChatMessage {
  id: number;
  node_id: string;
  sender: string;
  content: string;
  network_id: string;
  created_at: string;
}

export async function getChatMessages(nodeId: string, limit = 50): Promise<ChatMessage[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<ChatMessage>(
      `SELECT * FROM chat_messages 
       WHERE node_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [nodeId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function addChatMessage(
  nodeId: string, 
  sender: string, 
  content: string, 
  networkId: string = '1' // Default to '1' if not specified
): Promise<ChatMessage> {
  // Input validation
  if (!nodeId || typeof nodeId !== 'string') {
    throw new Error('Invalid nodeId');
  }
  if (!sender || typeof sender !== 'string') {
    throw new Error('Invalid sender');
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error('Message content cannot be empty');
  }
  if (!networkId || typeof networkId !== 'string') {
    throw new Error('Invalid networkId');
  }

  const client = await pool.connect();
  
  try {
    console.log(`Adding chat message to node ${nodeId} from ${sender}`);
    
    const result = await client.query<ChatMessage>(
      `INSERT INTO chat_messages (node_id, sender, content, network_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nodeId, sender, content.trim(), networkId]
    );
    
    if (!result.rows[0]) {
      throw new Error('Failed to insert chat message: No data returned');
    }
    
    console.log(`Successfully added chat message with ID: ${result.rows[0].id}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('Error adding chat message:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      nodeId,
      sender: sender ? `${sender.substring(0, 6)}...` : 'undefined',
      contentLength: content?.length || 0,
      networkId
    });
    
    // Re-throw with more context if needed
    if (error instanceof Error) {
      throw new Error(`Failed to add chat message: ${error.message}`);
    }
    throw new Error('Failed to add chat message: Unknown error');
    
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      console.error('Error releasing database client:', releaseError);
    }
  }
}

export default {
  getChatMessages,
  addChatMessage,
  initializeDatabase
};

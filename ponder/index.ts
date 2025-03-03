import { ponder } from '@/generated';
import { getDatabase } from './utils/database';

// Import handlers
import './handlers/willwe';
import './handlers/membranes';
import './handlers/execution';
import './handlers/nodeEvents';
import './handlers/executionEvents';
import './handlers/tokenEvents';
import './handlers/chat';

// Initialize SQLite database when Ponder starts
ponder.on('start', async () => {
  console.log('Ponder is starting...');
  try {
    // Initialize SQLite database
    await getDatabase();
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
});

// Log when Ponder is ready
ponder.on('ready', () => {
  console.log('Ponder is ready and indexing data');
});

// Log when Ponder encounters an error
ponder.on('error', (error) => {
  console.error('Ponder encountered an error:', error);
});

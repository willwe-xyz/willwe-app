# SQLite Integration for Ponder.sh

This document outlines the integration of SQLite with Ponder.sh for the WillWe application.

## Overview

The application now uses SQLite as the default database for storing and retrieving data indexed by Ponder. This replaces the previous Supabase integration.

## Setup

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Initialize the SQLite database:
   ```bash
   npm run init-sqlite
   ```

3. Start the Ponder indexer:
   ```bash
   npm run ponder:dev
   ```

## Database Structure

The SQLite database (`ponder.db`) contains the following tables:

- **activity_logs**: Stores all activity events (movements, memberships, etc.)
- **chat_messages**: Stores node chat messages
- **user_preferences**: Stores user preferences and settings
- **membranes**: Stores membrane data
- **movements**: Stores movement data
- **signatures**: Stores movement signatures
- **movement_signatures**: Stores detailed signature data

## Key Files

- `/ponder/utils/database.ts`: Contains utility functions for interacting with the SQLite database
- `/hooks/usePonderData.ts`: React hook for accessing SQLite data in components
- `/scripts/init-sqlite.ts`: Script to initialize the SQLite database tables

## Usage in Components

Components can access the SQLite data through the `usePonderData` hook:

```typescript
import { usePonderData } from '@/hooks/usePonderData';

function MyComponent() {
  const { 
    getNodeActivityLogs, 
    getNodeChatMessages, 
    sendChatMessage,
    // other functions...
    isLoading,
    error
  } = usePonderData();

  // Use the functions to interact with the database
}
```

## Event Handlers

The Ponder event handlers in `/ponder/handlers/` have been updated to store data in both the Ponder database and SQLite for real-time access:

- `willwe.ts`: Handles WillWe contract events
- `membranes.ts`: Handles Membranes contract events
- `execution.ts`: Handles Execution contract events
- `chat.ts`: Provides chat functionality

## Migrating from Supabase

If you were previously using Supabase, your data will need to be migrated to SQLite. The database schema has been designed to be compatible with the previous Supabase schema, but the data will need to be manually transferred.

## Performance Considerations

SQLite is a file-based database that works well for development and smaller deployments. For production environments with high traffic, you may want to consider using a more robust database solution.

## Troubleshooting

If you encounter issues with the SQLite integration:

1. Ensure the `ponder.db` file exists in the root directory
2. Check that the SQLite tables are properly initialized
3. Verify that the SQLite dependencies are installed
4. Check the console for any SQLite-related errors

For persistent issues, you can delete the `ponder.db` file and run `npm run init-sqlite` to recreate the database.

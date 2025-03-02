# Ponder Integration for WillWe

This directory contains the Ponder.sh integration for the WillWe application. Ponder is used to monitor blockchain events and populate the database with indexed data.

## Overview

The Ponder integration indexes the following data:
- User memberships and node data
- Membranes and their details
- Movements, signatures, and execution status
- Activity logs for nodes and users
- Chat messages for nodes

## Directory Structure

- `/ponder/handlers/`: Contains event handlers for different contracts
  - `willwe.ts`: Handles WillWe contract events (MembershipMinted, InflationMinted)
  - `membranes.ts`: Handles Membranes contract events (MembraneCreated)
  - `execution.ts`: Handles Execution contract events (MovementCreated, MovementSigned, MovementExecuted)
  - `chat.ts`: Utilities for storing and retrieving chat messages
- `/ponder/utils/`: Utility functions
  - `supabase.ts`: Supabase client and table initialization
- `/ponder/index.ts`: Main entry point for Ponder

## Database Schema

The integration creates and uses the following tables in Supabase:

1. `users`: Stores user information
2. `nodes`: Stores node information
3. `membranes`: Stores membrane details
4. `movements`: Stores movement details
5. `signatures`: Stores movement signatures
6. `chat_messages`: Stores chat messages for nodes
7. `movement_signatures`: Stores detailed signature data
8. `activity_logs`: Stores activity logs for nodes and users
9. `user_preferences`: Stores user redistributive preferences

## Usage

### Starting Ponder

Ponder is configured to start automatically with the application. You can use the following npm scripts:

- `npm run dev`: Starts both the Next.js app and Ponder in development mode
- `npm run ponder:dev`: Starts only Ponder in development mode
- `npm run ponder:build`: Builds the Ponder project
- `npm run ponder:start`: Starts Ponder in production mode

### React Hooks

The `usePonderData` hook in `/hooks/usePonderData.ts` provides functions to interact with the indexed data:

- `getNodeMembranes`: Get membranes for a specific node
- `getAllMembranes`: Get all membranes
- `getNodeMovements`: Get movements for a specific node
- `getMovementSignatures`: Get signatures for a specific movement
- `getNodeActivityLogs`: Get activity logs for a specific node
- `getUserActivityLogs`: Get activity logs for a specific user
- `getNodeChatMessages`: Get chat messages for a specific node
- `sendChatMessage`: Send a chat message for a specific node
- `storeMovementSignature`: Store a movement signature
- `getUserFeed`: Get user feed based on node memberships
- `getUserPreferences`: Get user redistributive preferences
- `updateUserPreferences`: Update user redistributive preferences

## Components

The following components use the indexed data:

- `ActivityLog`: Displays activity logs for nodes and users
- `NodeChat`: Provides a chat interface for node-specific discussions
- `Movements`: Displays and manages movements for a node

## Environment Variables

Make sure the following environment variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
```

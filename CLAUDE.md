# WillWe Development Guidelines

## Build & Development Commands
- `npm run dev` - Start Next.js development server
- `npm run dev:full` - Start both Next.js and Ponder servers concurrently
- `npm run build` - Build Next.js application
- `npm run build:full` - Build both Next.js and Ponder
- `npm run lint` - Run ESLint, Prettier check, and TypeScript type checking
- `npm run format` - Format code with Prettier

## Code Style Guidelines
- **Formatting**: Use Prettier for consistent code formatting
- **Imports**: Group imports by external libraries first, then internal components/utilities
- **TypeScript**: Use strict typing; prefer explicit types for function parameters and returns
- **Components**: Use functional components with React hooks
- **Naming**: PascalCase for components, camelCase for variables/functions
- **State Management**: Use React Context for shared state (NodeContext, TokenContext, TransactionContext)
- **Error Handling**: Use ErrorBoundary components for UI errors; proper try/catch for async operations
- **Blockchain Interactions**: Use useTransaction hook for contract interactions; handle pending/success/error states

## Architecture
- **Frontend**: Next.js React application with Chakra UI + Tailwind
- **Smart Contracts**: Ethereum contracts (WillWe, Membranes, Execution) in /contracts-context
- **Data Indexing**: External Ponder server accessed via API endpoints in /pages/api/ponder
- **Data Access**: Custom hooks (useNodeData, useMovements, useActivityFeed) to access blockchain and indexed data
- **Remote Storage**: Ponder service handles data persistence (activities, chat, signatures, user preferences)

## Notes
- The codebase combines on-chain governance with off-chain data retrieval
- All Ponder-related operations go through the API client in lib/ponder-client.ts
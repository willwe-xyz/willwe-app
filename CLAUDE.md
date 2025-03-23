# WillWe Development Guidelines

## Build & Development Commands
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
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
- **UI Components**: Tab-based navigation with proper scrolling using sticky positioning and overflow control

## UI/UX Notes
- Tab-based components use a simple, minimalist approach:
  - Avoid excessive nesting of scrollable containers
  - Tabs component with `className="tabs"` for custom scrollbar styling
  - TabPanels with standard padding (p={6})
  - Avoid positioning fixed or sticky elements that might interfere with natural document flow
  - Use minimal CSS to allow browser's native scrolling to work properly
  - Ensure content is fully visible without unnecessary constraints

- CRITICAL: Avoid setting `overflow: hidden` on parent containers if children need to scroll
  - The main cause of scrolling issues was nested containers with `overflow: hidden`
  - The proper layout hierarchy is:
    1. `MainLayout` - Handles overall page layout with `overflow: auto` for main content
    2. Node page container - Should not restrict overflow 
    3. NodeDetails component - Simple structure with standard tabs

## Notes
- The codebase combines on-chain governance with off-chain data retrieval
- All Ponder-related operations go through the API client in lib/ponder-client.ts
- Signal history display has been removed from ActivitySection component to simplify the UI
- Activity tab now only shows recent node activity from Ponder data source

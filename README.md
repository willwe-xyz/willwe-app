# WillWe Frontend Application

A decentralized social network built on Ethereum with token-based governance, node spawning, and cooperative effort coordination.

## Overview

WillWe is a systematizing order
for instant, permissionless, 
dis-incentivized governance.

This repository contains a web app client for the underlying protocol.
## Features

- govern by funding 
- or working when needed
- is legible
- gives coins organizational competencies
- facilitates pluralisty by means of localized autonomy

### Core Functionality
- **Node System**: Hierarchical node structure with spawning capabilities
- **Token Management**: ERC-20 token operations with balances and transfers
- **Governance**: On-chain voting and decision-making mechanisms
- **Activity Feeds**: Real-time updates on network activity and user actions
- **Chat System**: Node-based messaging and communication
- **Membrane Operations**: Advanced token economics and flow control

### User Interface
- **Dashboard**: Overview of user activity and network status
- **Node Details**: Comprehensive node information with operations
- **Token Operations**: Minting, burning, and transfer capabilities
- **Activity Tracking**: User and network-wide activity monitoring
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Multi-chain Support**: Base Mainnet (only, currently)
- **IPFS Integration**: Decentralized metadata storage
- **ENS Resolution**: Ethereum Name Service support
- **Real-time Updates**: Live data fetching and updates
- **Error Handling**: Comprehensive error boundaries and user feedback

## Tech Stack

### Frontend
- **Framework**: Next.js 13+ with React 18
- **UI Library**: Chakra UI + Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context (NodeContext, TokenContext, TransactionContext)
- **Data Fetching**: SWR and TanStack Query

### Blockchain
- **Web3 Library**: Ethers.js v6, Viem
- **Authentication**: Privy (wallet connection and user management)
- **Networks**: Ethereum mainnet, Base
- **Smart Contracts**: WillWe, Membranes, Execution contracts

### Data & Storage
- **Indexing**: Ponder server for blockchain data indexing
- **Database**: PostgreSQL (via Ponder)
- **File Storage**: IPFS (Helia, Filebase SDK)
- **Caching**: SWR for client-side caching

### Development
- **Language**: TypeScript
- **Linting**: ESLint + Prettier
- **Testing**: Cypress (E2E testing)
- **Build**: Next.js build system

## Getting Started

### Prerequisites
- Node.js 19+ (< 20.19.0)
- npm 8+ (< 10.8.2)
- Ethereum wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd willweapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint, Prettier check, and TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run context` - Generate contracts context

## Project Structure

```
willweapp/
├── components/           # React components
│   ├── Layout/          # Layout components (Header, MainLayout)
│   ├── Node/            # Node-related components
│   ├── Token/           # Token management components
│   └── shared/          # Shared/utility components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── pages/               # Next.js pages and API routes
│   ├── api/             # API endpoints
│   ├── nodes/           # Node detail pages
│   └── dashboard.tsx    # Main dashboard
├── contracts-context/   # Smart contract files
├── config/              # Configuration files
├── lib/                 # Utility libraries
├── styles/              # Global styles
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── public/              # Static assets
```

## Key Components

### Dashboard (`/pages/dashboard.tsx`)
- Main application interface
- Token selection and management
- Network switching functionality
- Activity feeds and node overview

### Node System (`/components/Node/`)
- Node details and operations
- Movement tracking and visualization
- Member management
- Signal operations

### Authentication
- Privy integration for wallet connection
- Multi-wallet support
- Session management

### Data Management
- Ponder client for indexed blockchain data
- Real-time updates via SWR
- Caching and error handling

## Smart Contracts

The application interacts with several smart contracts:

- **WillWe**: Main contract for node creation and token operations
- **Membranes**: Token flow control and economics
- **Execution**: Transaction execution and governance

Contract addresses are configured in `/config/deployments.ts`.

## Environment Variables

Key environment variables (see `.env.example`):

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_DEFAULT_CHAIN=8453
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_PONDER_API_URL=your_ponder_url
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Development Guidelines

### Code Style
- Use Prettier for consistent code formatting
- Follow TypeScript strict typing conventions
- Group imports: external libraries first, then internal components
- Use functional components with React hooks
- PascalCase for components, camelCase for variables/functions

### State Management
- Use React Context for shared state (NodeContext, TokenContext, TransactionContext)
- Custom hooks for data fetching and business logic
- Error boundaries for UI error handling

### UI/UX
- Chakra UI + Tailwind for styling
- Responsive design principles
- Minimal, clean interface
- Proper loading states and error handling

## API Endpoints

The application includes several API endpoints in `/pages/api/`:

- `/api/nodes/` - Node data and operations
- `/api/tokens/` - Token information and metadata
- `/api/chat/` - Chat messaging system
- `/api/alchemy/` - Alchemy API integration
- `/api/will/` - WillWe contract interactions

## Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Network Configuration
- Supports Ethereum mainnet and Base network
- Automatic network switching
- Contract deployment configuration per network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style guidelines
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license - see the `LICENSE` file for details.

## Support

For issues and questions:
- Check the project documentation
- Review existing GitHub issues
- Create a new issue with detailed information

---

**Note**: This is experimental software. Use at your own risk and do not use in production without thorough testing.

import { cookieStorage, createStorage } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, optimismSepolia } from 'viem/chains';
import type { Chain } from 'viem';
import { createAppKit } from '@reown/appkit';
import { walletConnect } from 'wagmi/connectors';

// Read Project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Ensure Project ID is defined at build time
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not defined. Please set it in .env.local');
}

// Define supported networks
export const networks: [Chain, ...Chain[]] = [base, baseSepolia, optimismSepolia];

// Create the Wagmi adapter instance with configuration
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  customRpcUrls: {
    [base.id]: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    [optimismSepolia.id]: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
  },
  pendingTransactionsFilter: {
    enable: true,
    pollingInterval: 1000,
  },
});

// Define application metadata
export const metadata = {
  name: "WillWe",
  description: "Token Coordination Protocol",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Must match your domain
  icons: ["https://willwe.app/favicons/icon.svg"],
};

// Export the AppKit configuration
export const appKitConfig = {
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  debug: process.env.NODE_ENV === 'development',
  features: {
    analytics: true,
    history: true,
    notifications: true,
  },
};

// Initialize AppKit synchronously
export const appKit = createAppKit(appKitConfig); 
export function getRPCUrl(chainId: string): string {
  // Add your RPC URLs here
  const RPC_URLS: { [key: string]: string } = {
    '1': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
    '11155111': process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    '11155420': process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
    '84532': process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    '8453': process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base.llamarpc.com',
    '167009': process.env.NEXT_PUBLIC_TAIKO_HEKLA_RPC_URL || 'https://rpc.katla.taiko.xyz',
    '167000': process.env.NEXT_PUBLIC_TAIKO_RPC_URL || 'https://rpc.taiko.xyz',
    '534351': process.env.NEXT_PUBLIC_SCROLL_TESTNET_RPC_URL || 'https://sepolia-rpc.scroll.io'
    // Add more networks as needed
  };

  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }

  return rpcUrl;
} 
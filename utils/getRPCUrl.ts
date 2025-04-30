export function getRPCUrl(chainId: string): string {
  // Add your RPC URLs here
  const RPC_URLS: { [key: string]: string } = {
    '1': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
    '11155111': process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    '11155420': process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
    '84532': process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org',
    '8453': process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base.llamarpc.com'
    // Add more networks as needed
  };

  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
  }

  return rpcUrl;
} 
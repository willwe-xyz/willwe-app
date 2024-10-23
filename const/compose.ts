export const SUPPORTED_CHAINS = {
    ETHEREUM: '1',
    POLYGON: '137',
    ARBITRUM: '42161',
    OPTIMISM: '10',
    BASE: '8453',
  } as const;
  
  export const GAS_PRICE_ENDPOINTS = {
    [SUPPORTED_CHAINS.ETHEREUM]: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
    [SUPPORTED_CHAINS.POLYGON]: 'https://api.polygonscan.com/api?module=gastracker&action=gasoracle',
    [SUPPORTED_CHAINS.ARBITRUM]: 'https://api.arbiscan.io/api?module=gastracker&action=gasoracle',
    [SUPPORTED_CHAINS.OPTIMISM]: 'https://api-optimistic.etherscan.io/api?module=gastracker&action=gasoracle',
    [SUPPORTED_CHAINS.BASE]: 'https://api.basescan.org/api?module=gastracker&action=gasoracle',
  };
  
  export const DEFAULT_TOKENS = {
    [SUPPORTED_CHAINS.ETHEREUM]: [
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
      },
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
    ],
  };
  
  export const ERROR_MESSAGES = {
    INVALID_ADDRESS: 'Invalid Ethereum address',
    INVALID_AMOUNT: 'Invalid amount',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    NETWORK_ERROR: 'Network error occurred',
    TRANSACTION_FAILED: 'Transaction failed',
    USER_REJECTED: 'User rejected the transaction',
    IPFS_UPLOAD_FAILED: 'Failed to upload to IPFS',
  } as const;
  
  export const IPFS_GATEWAY_URLS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
  ];
  
  export const TRANSACTION_TYPES = {
    TOKEN_DEPLOYMENT: 'token_deployment',
    ENTITY_CREATION: 'entity_creation',
    MEMBRANE_UPDATE: 'membrane_update',
  } as const;
  
  export const UI_CONSTANTS = {
    MODAL_SIZES: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1000px',
    },
    ANIMATION_DURATION: 200,
    TOAST_DURATION: 5000,
    MAX_RETRIES: 3,
    DEBOUNCE_DELAY: 500,
  } as const;
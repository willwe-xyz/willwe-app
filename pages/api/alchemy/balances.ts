import { NextApiRequest, NextApiResponse } from 'next';
import { Network, Alchemy } from 'alchemy-sdk';
import { deployments } from '../../../config/deployments';
import { filterTokenBalances } from '../../../utils/tokenSpamFilter';

// Helper function to get Alchemy network from chainId
function getAlchemyNetwork(chainId: string): Network {
  // Convert chainId to string for consistent comparison
  const chain = String(chainId);
  
  switch (chain) {
    // Ethereum
    case '1':
      return Network.ETH_MAINNET;
    case '11155111':
      return Network.ETH_SEPOLIA;
    // Polygon
    case '137':
      return Network.MATIC_MAINNET;
    // Arbitrum
    case '42161':
      return Network.ARB_MAINNET;
    case '421614':
      return Network.ARB_SEPOLIA;
    // Optimism
    case '10':
      return Network.OPT_MAINNET;
    case '11155420':
      return Network.OPT_SEPOLIA;
    // Base
    case '8453':
      return Network.BASE_MAINNET;
    case '84532':
      return Network.BASE_SEPOLIA;
    // Default to mainnet if chain is not supported
    default:
      return Network.ETH_MAINNET;
  }
}

// Helper function to get excluded token strings from env or default
function getExcludedTokenStrings(): string[] {
  const envList = process.env.NEXT_PUBLIC_TOKEN_BALANCE_EXCLUDEIF;
  if (envList) {
    return envList.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [
    'test',
    'mock',
    'fake',
    'dummy',
    'sample',
    'example',
    't.me',
    't.ly',
    'fli.so',
    'claim until',
    'visit to claim',
    'swap within',
    'reward pool',
    'token distribution',
    'airdrop',
    '✅',
    '|',
    '[',
    ']',
    '*',
    'claim',
    'http',
    'ro'
  ];
}

// Helper function to check if a token is spam
function isSpamToken(token: { name: string; symbol: string }): boolean {
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();
  const excludedStrings = getExcludedTokenStrings().map(s => s.toLowerCase().trim());

  // Exclude if any excluded string is contained in name or symbol (case-insensitive)
  if (excludedStrings.some(str => name.includes(str) || symbol.includes(str))) {
    return true;
  }

  // Emoji regex (matches most emoji, compatible with ES5+)
  const emojiPattern = /[\u203C-\u3299\u1F000-\u1F9FF\u1F300-\u1F5FF\u1F600-\u1F64F\u1F680-\u1F6FF\u1F700-\u1F77F\u1F780-\u1F7FF\u1F800-\u1F8FF\u1F900-\u1F9FF\u1FA00-\u1FA6F\u1FA70-\u1FAFF\u2600-\u26FF\u2700-\u27BF]/;
  if (emojiPattern.test(name) || emojiPattern.test(symbol)) {
    return true;
  }

  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, chainId } = req.query;

  if (!address || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Check for Alchemy API key
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyApiKey) {
    console.error('ALCHEMY_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Alchemy API key is not configured' });
  }

  try {
    const network = getAlchemyNetwork(chainId as string);

    const alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network,
      maxRetries: 3
    });

    const response = await alchemy.core.getTokenBalances(address as string);
    console.log("returned balances", response.tokenBalances.length);

    // Get WETH and WILL token addresses for the current chain
    const wethAddress = deployments.WETH?.[chainId as string];
    const willAddress = deployments.Will?.[chainId as string];
    
    if (!wethAddress || !willAddress) {
      console.error('WETH or WILL address not found for chainId:', chainId);
    }

    console.log("returned balances", response.tokenBalances.length);
    
    // Ensure WETH and WILL are included in the balances
    const allBalances = [...response.tokenBalances];
    
    // Add WETH if not present and address is available
    if (wethAddress && !allBalances.find(t => t.contractAddress.toLowerCase() === wethAddress.toLowerCase())) {
      allBalances.push({
        contractAddress: wethAddress,
        tokenBalance: "0",
        error: null
      });
    }
    
    // Add WILL if not present and address is available
    if (willAddress && !allBalances.find(t => t.contractAddress.toLowerCase() === willAddress.toLowerCase())) {
      allBalances.push({
        contractAddress: willAddress,
        tokenBalance: "0",
        error: null
      });
    }

    const balances = await Promise.all(
      allBalances.map(async (token) => {
        try {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );

          const balance = Number(token.tokenBalance) / Math.pow(10, metadata.decimals ?? 18);
          const formattedBalance = balance.toFixed(2);

          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: metadata.decimals,
            logo: metadata.logo,
            formattedBalance
          };
        } catch (error) {
          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: 'Unknown Token',
            symbol: '???',
            decimals: 18,
            logo: null,
            formattedBalance: '0.00'
          };
        }
      })
    );

    // Restore: Use centralized filter
    const filteredBalances = filterTokenBalances(balances, chainId as string);
    res.status(200).json({ balances: filteredBalances });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch balances',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
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
  const debug = process.env.DEBUG_LOGGING === 'true';
  
  if (debug) {
    console.log(`[DEBUG] Fetching balances for address: ${address} on chain: ${chainId}`);
  }

  if (!address || !chainId) {
    const errorMsg = `Missing required parameters. Address: ${address}, ChainId: ${chainId}`;
    console.error(errorMsg);
    return res.status(400).json({ error: 'Missing required parameters', details: errorMsg });
  }

  // Check for Alchemy API key
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyApiKey) {
    const errorMsg = 'ALCHEMY_API_KEY is not set in environment variables';
    console.error(errorMsg);
    return res.status(500).json({ 
      error: 'Alchemy API key is not configured',
      details: errorMsg 
    });
  }

  try {
    if (debug) {
      console.log(`[DEBUG] Initializing Alchemy for chainId: ${chainId}`);
    }
    
    const network = getAlchemyNetwork(chainId as string);
    
    if (!network) {
      const errorMsg = `Unsupported chainId: ${chainId}`;
      console.error(errorMsg);
      return res.status(400).json({ 
        error: 'Unsupported network',
        details: errorMsg,
        supportedNetworks: ['1', '11155111', '137', '42161', '421614', '10', '11155420', '8453', '84532']
      });
    }

    if (debug) {
      console.log(`[DEBUG] Using Alchemy network: ${network}`);
    }
    
    const alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network,
      maxRetries: 3
    });

    if (debug) {
      console.log(`[DEBUG] Fetching token balances for address: ${address}`);
    }
    
    const response = await alchemy.core.getTokenBalances(address as string);
    
    if (debug) {
      console.log(`[DEBUG] Received ${response.tokenBalances?.length || 0} token balances`);
    }

    // Get WETH and WILL token addresses for the current chain
    const wethAddress = deployments.WETH?.[chainId as string];
    const willAddress = deployments.Will?.[chainId as string];
    
    if (!wethAddress || !willAddress) {
      if (debug) {
        console.warn(`[DEBUG] WETH or WILL address not found for chainId: ${chainId}`);
      }
    }

    
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

    if (debug) {
      console.log(`[DEBUG] Processing ${allBalances.length} token balances...`);
    }
    
    const balances = await Promise.all(
      allBalances.map(async (token, index) => {
        const tokenStartTime = debug ? Date.now() : 0;
        
        try {
          if (debug) {
            console.log(`[DEBUG] Fetching metadata for token ${index + 1}/${allBalances.length}: ${token.contractAddress}`);
          }
          
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          
          if (!metadata) {
            if (debug) {
              console.warn(`[DEBUG] No metadata returned for token: ${token.contractAddress}`);
            }
            return null;
          }

          const decimals = metadata.decimals ?? 18;
          const balance = token.tokenBalance !== '0' 
            ? (Number(token.tokenBalance) / Math.pow(10, decimals)).toFixed(6)
            : '0';

          const tokenData = {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals,
            logo: metadata.logo,
            formattedBalance: balance
          };
          
          if (debug) {
            const duration = Date.now() - tokenStartTime;
            console.log(`[DEBUG] Processed token ${index + 1}/${allBalances.length} in ${duration}ms: ${tokenData.symbol} (${tokenData.name})`);
          }
          
          return tokenData;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          if (debug) {
            console.error(`[DEBUG] Error processing token ${token.contractAddress}:`, errorMsg);
          }
          
          // Only return basic info for failed tokens
          return {
            contractAddress: token.contractAddress,
            tokenBalance: token.tokenBalance,
            name: 'Unknown Token',
            symbol: '???',
            decimals: 18,
            logo: null,
            formattedBalance: '0',
            error: 'Failed to fetch metadata'
          };
        }
      })
    );

    // Filter out null balances and tokens with zero balance
    const validBalances = balances.filter(
      (balance): balance is NonNullable<typeof balance> => 
        balance !== null && balance.tokenBalance !== '0'
    );
    
    if (debug) {
      console.log(`[DEBUG] Successfully processed ${validBalances.length} non-zero token balances`);
    }
    
    try {
      // Use centralized filter
      const filteredBalances = filterTokenBalances(validBalances, chainId as string);
      
      if (debug) {
        console.log(`[DEBUG] Filtered down to ${filteredBalances.length} non-spam token balances`);
      }
      
      return res.status(200).json({ 
        success: true,
        balances: filteredBalances,
        meta: {
          total: filteredBalances.length,
          chainId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (filterError) {
      console.error('Error filtering token balances:', filterError);
      // If filtering fails, return the unfiltered but valid balances
      return res.status(200).json({
        success: true,
        balances: validBalances,
        warning: 'Token filtering failed, returning unfiltered results',
        meta: {
          total: validBalances.length,
          chainId,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Critical error in balances API:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch balances',
      details: errorMsg,
      request: {
        address,
        chainId,
        timestamp: new Date().toISOString()
      }
    });
  }
} 
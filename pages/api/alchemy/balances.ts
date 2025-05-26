import { NextApiRequest, NextApiResponse } from 'next';
import { Network, Alchemy } from 'alchemy-sdk';
import { deployments } from '../../../config/deployments';

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

// Helper function to get excluded token strings
function getExcludedTokenStrings(): string[] {
  return [
    'test',
    'mock',
    'fake',
    'dummy',
    'sample',
    'example'
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    console.log(`Using Alchemy network: ${network} for chainId: ${chainId}`);

    const alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network
    });

    console.log(`Fetching token balances for address: ${address}`);
    const response = await alchemy.core.getTokenBalances(address as string);
    console.log("got response", response);
    // Get WETH and WILL token addresses for the current chain
    const wethAddress = deployments.WETH?.[chainId as string];
    const willAddress = deployments.Will?.[chainId as string];
    
    if (!wethAddress || !willAddress) {
      console.warn(`Missing token addresses for chainId ${chainId}:`, { wethAddress, willAddress });
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

    console.log(`Processing ${allBalances.length} token balances`);
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
          console.error(`Error processing token ${token.contractAddress}:`, error);
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

    // Filter out tokens based on name or symbol, but keep WETH and WILL
    const excludedStrings = getExcludedTokenStrings();
    const filteredBalances = balances.filter(token => {
      const tokenName = token.name.toLowerCase();
      const tokenSymbol = token.symbol.toLowerCase();
      const isExcluded = excludedStrings.some(str => tokenName.includes(str) || tokenSymbol.includes(str));
      const isWethOrWill = token.contractAddress.toLowerCase() === wethAddress?.toLowerCase() || 
                          token.contractAddress.toLowerCase() === willAddress?.toLowerCase();
      return !isExcluded || isWethOrWill;
    });

    console.log(`Returning ${filteredBalances.length} filtered balances`);
    res.status(200).json({ balances: filteredBalances });
  } catch (error) {
    console.error('Error fetching balances:', error);
    // Return a more detailed error message
    res.status(500).json({ 
      error: 'Failed to fetch balances',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
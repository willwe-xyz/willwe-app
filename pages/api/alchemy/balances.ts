import { NextApiRequest, NextApiResponse } from 'next';
import { Alchemy, Network } from 'alchemy-sdk';

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

// Get excluded token strings from environment variable
const getExcludedTokenStrings = (): string[] => {
  const excludedStrings = process.env.TOKEN_BALANCE_EXCLUDEIF || '';
  const defaultExcludedStrings = [
    'claim', 'CLAIM',
    'rdrop', 'RDROP',
    'visit', 'VISIT',
    'http', 'HTTP',
    'www', 'WWW',
    'swap', 'SWAP',
    'rewards', 'REWARDS',
    'promo', 'PROMO',
    'verify', 'VERIFY',
    'eligible', 'ELIGIBLE',
    'drop', 'DROP',
    '!', '!',
    't.ly', 'T.LY',
    'discord', 'DISCORD',
    'twitter', 'TWITTER',
    'join', 'JOIN',
    'presale', 'PRESALE',
    'giveaway', 'GIVEAWAY',
    '✅', '💰'
  ];
  
  const envExcludedStrings = excludedStrings.split(',')
    .map(str => str.toLowerCase().trim())
    .filter(str => str !== '')
    .flatMap(str => [str, str.toUpperCase()]);
    
  return defaultExcludedStrings.concat(envExcludedStrings);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, chainId } = req.query;

  if (!address || !chainId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY || '',
      network: getAlchemyNetwork(chainId as string)
    });

    const response = await alchemy.core.getTokenBalances(address as string);
    const nonZeroBalances = response.tokenBalances.filter(
      token => token.tokenBalance !== "0"
    );

    const balances = await Promise.all(
      nonZeroBalances.map(async (token) => {
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
      })
    );

    // Filter out tokens based on name or symbol
    const excludedStrings = getExcludedTokenStrings();
    const filteredBalances = balances.filter(token => {
      const tokenName = token.name.toLowerCase();
      const tokenSymbol = token.symbol.toLowerCase();
      const isExcluded = excludedStrings.some(str => tokenName.includes(str) || tokenSymbol.includes(str));
      return !isExcluded;
    });

    res.status(200).json({ balances: filteredBalances });
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
} 
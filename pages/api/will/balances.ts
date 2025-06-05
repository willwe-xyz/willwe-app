import { NextApiRequest, NextApiResponse } from 'next';
import { deployments } from '../../../config/deployments';
import { AlchemyTokenBalance } from '../../../hooks/useAlchemyBalances';
import { filterTokenBalances } from '../../../utils/tokenSpamFilter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chainId } = req.query;

  if (!chainId || typeof chainId !== 'string') {
    return res.status(400).json({ error: 'Invalid chainId' });
  }

  try {
    const willWeAddress = deployments.WillWe[chainId];
    if (!willWeAddress) {
      return res.status(400).json({ error: `No WillWe contract found for chain ${chainId}` });
    }

    // Use Alchemy API to fetch balances
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [willWeAddress],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to match AlchemyTokenBalance format
    const balances: AlchemyTokenBalance[] = data.result.tokenBalances.map((balance: any) => ({
      contractAddress: balance.contractAddress,
      tokenBalance: balance.tokenBalance,
      name: '', // Will be populated by token metadata
      symbol: '', // Will be populated by token metadata
      decimals: 18, // Default to 18, will be updated with actual value
      logo: null,
      formattedBalance: '0', // Will be formatted based on decimals
    }));

    // Fetch token metadata for each token
    const metadataPromises = balances.map(async (balance) => {
      try {
        const metadataResponse = await fetch(
          `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'alchemy_getTokenMetadata',
              params: [balance.contractAddress],
            }),
          }
        );

        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch token metadata: ${metadataResponse.statusText}`);
        }

        const metadata = await metadataResponse.json();
        if (metadata.result) {
          balance.name = metadata.result.name || '';
          balance.symbol = metadata.result.symbol || '';
          balance.decimals = metadata.result.decimals || 18;
          balance.logo = metadata.result.logo || null;
          
          // Format balance based on decimals
          const formattedBalance = Number(balance.tokenBalance) / Math.pow(10, balance.decimals);
          balance.formattedBalance = formattedBalance.toFixed(6);
        }
      } catch (error) {
        // Ignore metadata errors, leave defaults
      }
      return balance;
    });

    const balancesWithMetadata = await Promise.all(metadataPromises);

    // Use centralized filter
    const filteredBalances = filterTokenBalances(balancesWithMetadata, chainId);

    return res.status(200).json({ balances: filteredBalances });
  } catch (error) {
    console.error('Error fetching Will balances:', error);
    return res.status(500).json({ error: 'Failed to fetch Will balances' });
  }
} 
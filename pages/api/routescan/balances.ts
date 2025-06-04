import { NextApiRequest, NextApiResponse } from 'next';
import { deployments } from '../../../config/deployments';

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

  // Only use Routescan for Base mainnet and testnet
  if (chainId !== '8453' && chainId !== '84532') {
    return res.status(200).json({ balances: [] });
  }

  try {
    const network = chainId === '8453' ? 'mainnet' : 'testnet';
    const apiUrl = `https://api.routescan.io/v2/network/${network}/evm/${chainId}/etherscan/api`;
    
    console.log('Fetching from Routescan API:', `${apiUrl}?module=account&action=addresstokenbalance&address=${address}&page=1&offset=100`);
    
    const response = await fetch(
      `${apiUrl}?module=account&action=addresstokenbalance&address=${address}&page=1&offset=100&apikey=${process.env.ROUTESCAN_API_KEY}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Routescan API request failed:', response.statusText);
      return res.status(200).json({ balances: [] }); // Return empty array to trigger Alchemy fallback
    }

    const data = await response.json();
    console.log('Routescan API response:', data);
    
    if (data.status !== '1' || !data.result) {
      console.warn('Routescan API returned invalid data:', data);
      return res.status(200).json({ balances: [] });
    }

    // Transform Routescan response to match Alchemy format
    const balances = data.result.map((token: any) => ({
      contractAddress: token.TokenAddress,
      tokenBalance: token.TokenQuantity,
      name: token.TokenName || 'Unknown Token',
      symbol: token.TokenSymbol || '???',
      decimals: parseInt(token.TokenDivisor) || 18,
      logo: null,
      formattedBalance: (Number(token.TokenQuantity) / Math.pow(10, parseInt(token.TokenDivisor) || 18)).toFixed(2)
    }));

    // Ensure WETH and WILL are included
    const wethAddress = deployments.WETH?.[chainId as string];
    const willAddress = deployments.Will?.[chainId as string];

    if (wethAddress && !balances.find((t: any) => t.contractAddress.toLowerCase() === wethAddress.toLowerCase())) {
      balances.push({
        contractAddress: wethAddress,
        tokenBalance: "0",
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        logo: null,
        formattedBalance: "0.00"
      });
    }

    if (willAddress && !balances.find((t: any) => t.contractAddress.toLowerCase() === willAddress.toLowerCase())) {
      balances.push({
        contractAddress: willAddress,
        tokenBalance: "0",
        name: "Will Token",
        symbol: "WILL",
        decimals: 18,
        logo: null,
        formattedBalance: "0.00"
      });
    }

    console.log('Returning balances:', balances);
    res.status(200).json({ balances });
  } catch (error) {
    console.error('Error fetching Routescan balances:', error);
    // Return empty array to trigger Alchemy fallback
    res.status(200).json({ balances: [] });
  }
} 
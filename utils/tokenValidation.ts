import { createPublicClient, http, parseAbi } from 'viem';
import { getChainById } from '../config/contracts';

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export async function validateToken(
  address: string,
  chainId: string
): Promise<TokenInfo | null> {
  try {
    const chain = getChainById(chainId);
    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    const tokenAbi = parseAbi([
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function name() view returns (string)'
    ]);

    const [symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: 'symbol'
      }),
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: tokenAbi,
        functionName: 'decimals'
      })
    ]);

    return {
      address,
      symbol: symbol as string,
      decimals: decimals as number
    };

  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

export function isValidTokenAmount(amount: string): boolean {
  try {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return false;
    }
    // Check for proper decimal format
    const parts = amount.split('.');
    if (parts.length > 2) return false;
    if (parts[1] && parts[1].length > 18) return false;
    return true;
  } catch {
    return false;
  }
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const num = Number(amount);
    if (isNaN(num)) return '0';
    return num.toFixed(Math.min(decimals, 18));
  } catch {
    return '0';
  }
}

// Cache validated tokens to avoid repeated RPC calls
const tokenCache: Record<string, TokenInfo> = {};

export async function validateTokenWithCache(
  address: string,
  chainId: string
): Promise<TokenInfo | null> {
  const cacheKey = `${chainId}-${address.toLowerCase()}`;
  
  if (tokenCache[cacheKey]) {
    return tokenCache[cacheKey];
  }

  const tokenInfo = await validateToken(address, chainId);
  if (tokenInfo) {
    tokenCache[cacheKey] = tokenInfo;
  }

  return tokenInfo;
}

export function clearTokenCache() {
  Object.keys(tokenCache).forEach(key => delete tokenCache[key]);
}

// Helper for handling common token errors
export function getTokenValidationError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('contract not deployed')) {
      return 'Token contract not found at this address';
    }
    if (error.message.includes('execution reverted')) {
      return 'Invalid token contract';
    }
    return error.message;
  }
  return 'Failed to validate token';
}
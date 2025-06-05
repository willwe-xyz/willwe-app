import { deployments } from '../config/deployments';

export function getExcludedTokenStrings(): string[] {
  const envList = process.env.TOKEN_BALANCE_EXCLUDEIF;
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
    'claim',
    'http',
    'promo',
    'giveaway',
    'discord',
    'twitter',
    'join',
    'presale',
    'reward',
    'eligible',
    'drop',
    'www',
    '!',
    '[',
    ']',
    '✅',
    '✔'
  ];
}

export function isSpamToken(token: { name: string; symbol: string }, chainId?: string): boolean {
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();
  const excludedStrings = getExcludedTokenStrings().map(s => s.toLowerCase().trim());

  // Exclude if any excluded string is contained in name or symbol (case-insensitive)
  if (excludedStrings.some(str => name.includes(str) || symbol.includes(str))) {
    return true;
  }

  return false;
}

export function filterTokenBalances(tokens: any[], chainId?: string): any[] {
  const wethAddress = chainId ? deployments.WETH?.[chainId] : undefined;
  const willAddress = chainId ? deployments.Will?.[chainId] : undefined;
  return tokens.filter(token => {
    const isSpam = isSpamToken(token, chainId);
    const isWethOrWill = token.contractAddress && (
      token.contractAddress.toLowerCase() === wethAddress?.toLowerCase() ||
      token.contractAddress.toLowerCase() === willAddress?.toLowerCase()
    );
    return !isSpam || isWethOrWill;
  });
} 
import { AlchemyTokenBalance } from '../hooks/useAlchemyBalances';

// Cache types
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  userId?: string;
}

interface TokenInfo {
  // Add your token info type here
  [key: string]: any;
}

// Cache expiration times
const CACHE_EXPIRATION = {
  BALANCES: 5 * 60 * 1000, // 5 minutes
  TOKENS: 30 * 60 * 1000,  // 30 minutes
  ENS: 24 * 60 * 60 * 1000 // 24 hours
};

// Cache storage
const balanceCache = new Map<string, CacheEntry<AlchemyTokenBalance[]>>();
const tokenCache = new Map<string, CacheEntry<TokenInfo>>();
const ensCache = new Map<string, CacheEntry<string>>();

// Helper to generate cache key with user ID
const getCacheKey = (key: string, userId?: string) => {
  return userId ? `${userId}:${key}` : key;
};

// Cache manager class
class CacheManager {
  private static instance: CacheManager;
  private currentUserId?: string;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  setUserId(userId: string) {
    this.currentUserId = userId;
  }

  clearUserId() {
    this.currentUserId = undefined;
  }

  // Balance cache methods
  getBalance(address: string, chainId: string): AlchemyTokenBalance[] | null {
    const key = getCacheKey(`${address}-${chainId}`, this.currentUserId);
    const entry = balanceCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRATION.BALANCES) {
      return entry.value;
    }
    
    if (entry) {
      balanceCache.delete(key);
    }
    return null;
  }

  setBalance(address: string, chainId: string, balances: AlchemyTokenBalance[]) {
    const key = getCacheKey(`${address}-${chainId}`, this.currentUserId);
    balanceCache.set(key, {
      value: balances,
      timestamp: Date.now(),
      userId: this.currentUserId
    });
  }

  // Token cache methods
  getToken(address: string, chainId: string): TokenInfo | null {
    const key = getCacheKey(`${chainId}-${address.toLowerCase()}`, this.currentUserId);
    const entry = tokenCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRATION.TOKENS) {
      return entry.value;
    }
    
    if (entry) {
      tokenCache.delete(key);
    }
    return null;
  }

  setToken(address: string, chainId: string, info: TokenInfo) {
    const key = getCacheKey(`${chainId}-${address.toLowerCase()}`, this.currentUserId);
    tokenCache.set(key, {
      value: info,
      timestamp: Date.now(),
      userId: this.currentUserId
    });
  }

  // ENS cache methods
  getENS(address: string): string | null {
    const key = getCacheKey(address.toLowerCase(), this.currentUserId);
    const entry = ensCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRATION.ENS) {
      return entry.value;
    }
    
    if (entry) {
      ensCache.delete(key);
    }
    return null;
  }

  setENS(address: string, name: string) {
    const key = getCacheKey(address.toLowerCase(), this.currentUserId);
    ensCache.set(key, {
      value: name,
      timestamp: Date.now(),
      userId: this.currentUserId
    });
  }

  // Clear all caches
  clearAll() {
    balanceCache.clear();
    tokenCache.clear();
    ensCache.clear();
    this.clearUserId();
  }

  // Clear user-specific caches
  clearUserCaches() {
    if (!this.currentUserId) return;

    // Clear balance cache
    for (const [key, entry] of balanceCache.entries()) {
      if (entry.userId === this.currentUserId) {
        balanceCache.delete(key);
      }
    }

    // Clear token cache
    for (const [key, entry] of tokenCache.entries()) {
      if (entry.userId === this.currentUserId) {
        tokenCache.delete(key);
      }
    }

    // Clear ENS cache
    for (const [key, entry] of ensCache.entries()) {
      if (entry.userId === this.currentUserId) {
        ensCache.delete(key);
      }
    }

    this.clearUserId();
  }
}

export const cacheManager = CacheManager.getInstance(); 
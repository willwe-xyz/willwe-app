import { ethers } from 'ethers';
import { getRPCUrl } from '../config/contracts';

// Cache for storing resolved ENS names
const ensCache: { [address: string]: { name: string; timestamp: number } } = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

// In-flight promise deduplication
const inFlight: { [address: string]: Promise<string> } = {};

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
const REQUEST_QUEUE: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

// Fallback providers
const getProviders = () => {
  const providers = [
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ENS_INFURA_RPC),
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL_MAINNET)
  ];
  return providers;
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process the request queue
 */
const processQueue = async () => {
  if (isProcessingQueue || REQUEST_QUEUE.length === 0) return;
  
  isProcessingQueue = true;
  while (REQUEST_QUEUE.length > 0) {
    const request = REQUEST_QUEUE.shift();
    if (request) {
      await request();
      await sleep(MIN_REQUEST_INTERVAL);
    }
  }
  isProcessingQueue = false;
};

/**
 * Add a request to the queue
 */
const queueRequest = async <T>(request: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    REQUEST_QUEUE.push(async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

/**
 * Try to resolve ENS with multiple providers
 */
const tryResolveWithProviders = async (address: string): Promise<string | null> => {
  const providers = getProviders();
  
  for (const provider of providers) {
    try {
      const ensName = await provider.lookupAddress(address);
      if (ensName) return ensName;
    } catch (error) {
      console.warn(`Provider failed for ${address}:`, error);
      continue;
    }
  }
  
  return null;
};

/**
 * Resolves an Ethereum address to its ENS name if available, otherwise returns a truncated address
 * @param address The Ethereum address to resolve
 * @returns A promise that resolves to the ENS name or truncated address
 */
export async function resolveENS(address: string): Promise<string> {
  if (!address || !ethers.isAddress(address)) {
    return address;
  }

  // Check cache first
  const cached = ensCache[address];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.name;
  }

  // In-flight deduplication
  if (inFlight[address]) {
    return inFlight[address];
  }

  // Start a new lookup and store the promise
  inFlight[address] = (async () => {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }

    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        lastRequestTime = Date.now();
        // Queue the request to prevent concurrent calls
        const ensName = await queueRequest(async () => {
          return await tryResolveWithProviders(address);
        });
        if (ensName) {
          // Cache the result
          ensCache[address] = {
            name: ensName,
            timestamp: Date.now()
          };
          delete inFlight[address];
          return ensName;
        }
        break; // If no ENS name found, exit retry loop
      } catch (error: any) {
        retryCount++;
        if (retryCount === MAX_RETRIES) {
          console.error(`Error resolving ENS for ${address} after ${MAX_RETRIES} retries:`, error);
          // If we hit a rate limit, return the cached value even if expired
          if (cached) {
            delete inFlight[address];
            return cached.name;
          }
          break;
        }
        // Exponential backoff
        await sleep(INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1));
      }
    }

    // Fallback to truncated address
    const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    // Cache the truncated address to prevent repeated API calls for the same address
    ensCache[address] = {
      name: truncatedAddress,
      timestamp: Date.now()
    };
    delete inFlight[address];
    return truncatedAddress;
  })();

  return inFlight[address];
}

/**
 * Resolves multiple Ethereum addresses to their ENS names in parallel
 * @param addresses Array of Ethereum addresses to resolve
 * @returns A promise that resolves to an array of resolved names/addresses
 */
export async function resolveMultipleENS(addresses: string[]): Promise<string[]> {
  // Filter out duplicates and addresses already in cache
  const uniqueAddresses = Array.from(new Set(addresses));
  const addressesToResolve = uniqueAddresses.filter(addr => {
    const cached = ensCache[addr];
    return !cached || Date.now() - cached.timestamp >= CACHE_DURATION;
  });

  // Resolve only the addresses that need updating
  if (addressesToResolve.length > 0) {
    try {
      // Process in smaller batches to avoid rate limits
      const batchSize = 3; // Reduced batch size
      for (let i = 0; i < addressesToResolve.length; i += batchSize) {
        const batch = addressesToResolve.slice(i, i + batchSize);
        // Use resolveENS for deduplication and caching
        await Promise.all(batch.map(addr => resolveENS(addr)));
        // Add longer delay between batches
        if (i + batchSize < addressesToResolve.length) {
          await sleep(MIN_REQUEST_INTERVAL * 3);
        }
      }
    } catch (error) {
      console.error('Error resolving multiple ENS names:', error);
    }
  }

  // Return results from cache
  return uniqueAddresses.map(addr => {
    const cached = ensCache[addr];
    return cached ? cached.name : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  });
} 
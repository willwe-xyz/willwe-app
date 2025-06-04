class RPCRateLimiter {
  private static instance: RPCRateLimiter;
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minDelay = 100; // Minimum delay between requests in ms

  private constructor() {}

  static getInstance(): RPCRateLimiter {
    if (!RPCRateLimiter.instance) {
      RPCRateLimiter.instance = new RPCRateLimiter();
    }
    return RPCRateLimiter.instance;
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;
    const request = this.requestQueue.shift();

    if (request) {
      try {
        // Ensure minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
          await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
        }

        await request();
        this.lastRequestTime = Date.now();
      } catch (error: any) {
        console.error('RPC request failed:', error);
        // If we get a 429 error, add a longer delay
        if (error?.message?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Requeue the request
          this.requestQueue.unshift(request);
        }
      }
    }

    this.processing = false;
    this.processQueue();
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}

export const rpcRateLimiter = RPCRateLimiter.getInstance(); 
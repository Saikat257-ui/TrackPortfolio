import axios, { AxiosError } from 'axios';

const FINNHUB_API_KEY = 'cu6al39r01qujm3q6mg0cu6al39r01qujm3q6mgg';
const FINNHUB_API = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: {
    token: FINNHUB_API_KEY
  }
});

interface RequestQueueItem {
  request: () => Promise<void>;
  retryCount: number;
}

class FinnhubAPI {
  private priceCallbacks: Map<string, (price: number) => void> = new Map();
  private pollingInterval: number = 15000;
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map();
  private requestQueue: RequestQueueItem[] = [];
  private maxRequestsPerSecond: number = 20;
  private requestInterval: number = 1000 / this.maxRequestsPerSecond;
  private lastPrices: Map<string, number> = new Map();
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  
  // Configuration for retry strategy
  private readonly maxRetries: number = 3;
  private readonly baseRetryDelay: number = 1000;
  private readonly maxBackoffDelay: number = 30000;

  private maxConcurrentSymbols: number = 25;
  private activeSymbols: Set<string> = new Set();

  constructor() {
    this.processQueue();
  }

  private calculateBackoffDelay(retryCount: number): number {
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, retryCount),
      this.maxBackoffDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const minDelay = 100;
      const now = Date.now();
      const timeToWait = Math.max(minDelay, this.requestInterval - (now - this.lastRequestTime));
      
      await new Promise(resolve => setTimeout(resolve, timeToWait));

      const item = this.requestQueue.shift();
      if (!item) continue;

      try {
        this.lastRequestTime = Date.now();
        await item.request();
      } catch (error) {
        if (this.shouldRetryRequest(error) && item.retryCount < this.maxRetries) {
          const backoffDelay = this.calculateBackoffDelay(item.retryCount);
          item.retryCount++;
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          this.requestQueue.unshift(item); // Retry this request
          console.log(`Retrying request (attempt ${item.retryCount})`);
        } else {
          console.error('Max retries reached or non-retryable error:', error);
        }
      }
    }

    this.isProcessingQueue = false;
    // Schedule next queue processing
    setTimeout(() => this.processQueue(), this.requestInterval);
  }

  private shouldRetryRequest(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Retry on rate limit (429) or server errors (500+)
      return axiosError.response?.status === 429 || 
             (axiosError.response?.status ?? 0) >= 500;
    }
    return false;
  }

  private enqueueRequest(request: () => Promise<void>) {
    this.requestQueue.push({ request, retryCount: 0 });
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async fetchAndNotify(symbol: string) {
    try {
      const cachedPrice = this.lastPrices.get(symbol);
      const response = await FINNHUB_API.get('/quote', {
        params: { symbol }
      });
      
      const currentPrice = response.data.c;
      
      // Only notify if price has changed
      if (currentPrice !== cachedPrice) {
        this.lastPrices.set(symbol, currentPrice);
        const callback = this.priceCallbacks.get(symbol);
        if (callback) {
          callback(currentPrice);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        // Handle rate limit specifically
        const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        throw error; // Let the retry mechanism handle it
      }
      console.error(`Error fetching stock data for ${symbol}:`, error);
      throw error;
    }
  }

  public async watchStock(symbol: string, callback: (price: number) => void) {
    if (this.activeSymbols.size >= this.maxConcurrentSymbols) {
      throw new Error(`Maximum number of watched symbols (${this.maxConcurrentSymbols}) reached`);
    }
    
    this.activeSymbols.add(symbol);
    this.priceCallbacks.set(symbol, callback);
    this.enqueueRequest(() => this.fetchAndNotify(symbol));
    this.startPolling(symbol);
  }

  public unwatchStock(symbol: string) {
    this.activeSymbols.delete(symbol);
    this.priceCallbacks.delete(symbol);
    this.stopPolling(symbol);
  }

  private startPolling(symbol: string) {
    if (this.pollingTimers.has(symbol)) {
      return; // Already polling this symbol
    }
    const timer = setInterval(() => this.enqueueRequest(() => this.fetchAndNotify(symbol)), this.pollingInterval);
    this.pollingTimers.set(symbol, timer);
  }

  private stopPolling(symbol: string) {
    const timer = this.pollingTimers.get(symbol);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(symbol);
    }
  }

  public async getStockQuote(symbol: string) {
    try {
      const response = await FINNHUB_API.get('/quote', {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }
}

export const finnhubAPI = new FinnhubAPI();
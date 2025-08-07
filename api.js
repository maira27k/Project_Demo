// api.js - API service layer for backend communication

class APIService {
    constructor() {
      this.baseURL = CONFIG.API_BASE_URL;
      this.cache = new Map();
      this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
  
    // Generic API request method
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      };
  
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
      }
    }
  
    // Cache helper methods
    getCacheKey(key) {
      return `api_cache_${key}`;
    }
  
    getFromCache(key) {
      const cacheKey = this.getCacheKey(key);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      
      this.cache.delete(cacheKey);
      return null;
    }
  
    setCache(key, data) {
      const cacheKey = this.getCacheKey(key);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
  
    // Portfolio API methods
    async getPortfolio() {
      try {
        const cached = this.getFromCache('portfolio');
        if (cached) return cached;
  
        const data = await this.request(CONFIG.ENDPOINTS.PORTFOLIO);
        this.setCache('portfolio', data);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to fetch portfolio data', 'error');
        throw error;
      }
    }
  
    async addPortfolioItem(item) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.PORTFOLIO}/add`, {
          method: 'POST',
          body: JSON.stringify(item)
        });
        
        // Invalidate portfolio cache
        this.cache.delete(this.getCacheKey('portfolio'));
        UTILS.showNotification('Portfolio item added successfully', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to add portfolio item', 'error');
        throw error;
      }
    }
  
    async updatePortfolioItem(id, item) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.PORTFOLIO}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(item)
        });
        
        this.cache.delete(this.getCacheKey('portfolio'));
        UTILS.showNotification('Portfolio item updated successfully', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to update portfolio item', 'error');
        throw error;
      }
    }
  
    async deletePortfolioItem(id) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.PORTFOLIO}/remove/${id}`, {
          method: 'DELETE'
        });
        
        this.cache.delete(this.getCacheKey('portfolio'));
        UTILS.showNotification('Portfolio item deleted successfully', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to delete portfolio item', 'error');
        throw error;
      }
    }
  
    // Transaction API methods
    async getTransactions(filters = {}) {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `${CONFIG.ENDPOINTS.TRANSACTIONS}${queryParams ? `?${queryParams}` : ''}`;
        
        const cached = this.getFromCache(`transactions_${queryParams}`);
        if (cached) return cached;
  
        const data = await this.request(endpoint);
        this.setCache(`transactions_${queryParams}`, data);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to fetch transactions', 'error');
        throw error;
      }
    }
  
    async addTransaction(transaction) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.TRANSACTIONS}/add`, {
          method: 'POST',
          body: JSON.stringify(transaction)
        });
        
        // Invalidate related caches
        this.cache.clear();
        UTILS.showNotification('Transaction added successfully', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to add transaction', 'error');
        throw error;
      }
    }
  
    async deleteTransaction(id) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`, {
          method: 'DELETE'
        });
        
        this.cache.clear();
        UTILS.showNotification('Transaction deleted successfully', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to delete transaction', 'error');
        throw error;
      }
    }
  
    // Performance API methods
    async getPerformanceData(period = '1M') {
      try {
        const cached = this.getFromCache(`performance_${period}`);
        if (cached) return cached;
  
        const data = await this.request(`${CONFIG.ENDPOINTS.PERFORMANCE}?period=${period}`);
        this.setCache(`performance_${period}`, data);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to fetch performance data', 'error');
        throw error;
      }
    }
  
    // Tax API methods
    async getTaxRecords() {
      try {
        const cached = this.getFromCache('tax_records');
        if (cached) return cached;
  
        const data = await this.request(CONFIG.ENDPOINTS.TAX);
        this.setCache('tax_records', data);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to fetch tax records', 'error');
        throw error;
      }
    }
  
    async calculateTax(year = new Date().getFullYear()) {
      try {
        const data = await this.request(`${CONFIG.ENDPOINTS.TAX}/calculate`, {
          method: 'POST',
          body: JSON.stringify({ year })
        });
        
        UTILS.showNotification('Tax calculation completed', 'success');
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to calculate tax', 'error');
        throw error;
      }
    }
  
    // Benchmark API methods
    async getBenchmarkData() {
      try {
        const cached = this.getFromCache('benchmark');
        if (cached) return cached;
  
        const data = await this.request(CONFIG.ENDPOINTS.BENCHMARK);
        this.setCache('benchmark', data);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to fetch benchmark data', 'error');
        throw error;
      }
    }
  
    // Market Data API methods
    async getMarketData(symbols) {
      try {
        const symbolsStr = Array.isArray(symbols) ? symbols.join(',') : symbols;
        const cached = this.getFromCache(`market_${symbolsStr}`);
        if (cached) return cached;
  
        const data = await this.request(`${CONFIG.ENDPOINTS.MARKET_DATA}?symbols=${symbolsStr}`);
        this.setCache(`market_${symbolsStr}`, data);
        return data;
      } catch (error) {
        console.warn('Failed to fetch market data from backend, trying Alpha Vantage...');
        return await this.fetchFromAlphaVantage(symbols);
      }
    }
  
    async fetchFromAlphaVantage(symbols) {
      try {
        const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
        const results = {};
  
        for (const symbol of symbolArray) {
          try {
            const data = await UTILS.alphaVantageRequest(symbol);
            const parsed = UTILS.parseAlphaVantageQuote(data);
            if (parsed) {
              results[symbol] = parsed;
              // Store in backend for caching
              await this.storeMarketData(symbol, parsed);
            }
          } catch (error) {
            console.warn(`Failed to fetch data for ${symbol}:`, error);
          }
          
          // Add delay to respect API limits
          await new Promise(resolve => setTimeout(resolve, 200));
        }
  
        return results;
      } catch (error) {
        UTILS.showNotification('Failed to fetch market data', 'error');
        throw error;
      }
    }
  
    async storeMarketData(symbol, data) {
      try {
        await this.request(`${CONFIG.ENDPOINTS.MARKET_DATA}/store`, {
          method: 'POST',
          body: JSON.stringify({ symbol, data })
        });
      } catch (error) {
        console.warn('Failed to store market data:', error);
      }
    }
  
    // Dashboard summary
    async getDashboardSummary() {
      try {
        const cached = this.getFromCache('dashboard_summary');
        if (cached) return cached;
  
        const [portfolio, performance, benchmark] = await Promise.all([
          this.getPortfolio(),
          this.getPerformanceData('1D'),
          this.getBenchmarkData()
        ]);
  
        const summary = {
          portfolio,
          performance,
          benchmark,
          lastUpdated: new Date().toISOString()
        };
  
        this.setCache('dashboard_summary', summary);
        return summary;
      } catch (error) {
        UTILS.showNotification('Failed to fetch dashboard data', 'error');
        throw error;
      }
    }
  
    // Export data
    async exportData(type = 'json') {
      try {
        const data = await this.request(`/export?format=${type}`);
        return data;
      } catch (error) {
        UTILS.showNotification('Failed to export data', 'error');
        throw error;
      }
    }
  
    // Clear all cache
    clearCache() {
      this.cache.clear();
      UTILS.showNotification('Cache cleared', 'info');
    }
  }
  
  // Market Data Sync Service
  class MarketDataSync {
    constructor(apiService) {
      this.api = apiService;
      this.syncInterval = null;
      this.isRunning = false;
    }
  
    start() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.syncNow();
      
      // Set up periodic sync
      this.syncInterval = setInterval(() => {
        this.syncNow();
      }, CONFIG.REFRESH_INTERVALS.MARKET_DATA);
      
      console.log('Market data sync started');
    }
  
    stop() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      
      this.isRunning = false;
      console.log('Market data sync stopped');
    }
  
    async syncNow() {
      try {
        // Get portfolio symbols
        const portfolio = await this.api.getPortfolio();
        const symbols = portfolio.map(item => item.ticker_symbol || item.symbol).filter(Boolean);
        
        if (symbols.length === 0) return;
        
        console.log('Syncing market data for symbols:', symbols);
        
        // Fetch market data in batches to respect API limits
        const batchSize = 5;
        for (let i = 0; i < symbols.length; i += batchSize) {
          const batch = symbols.slice(i, i + batchSize);
          await this.api.getMarketData(batch);
          
          // Wait between batches
          if (i + batchSize < symbols.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Sync benchmark data
        const benchmarkSymbols = Object.values(CONFIG.INDICES);
        await this.api.getMarketData(benchmarkSymbols);
        
      } catch (error) {
        console.error('Market data sync failed:', error);
      }
    }
  }
  
  // Initialize services
  const apiService = new APIService();
  const marketDataSync = new MarketDataSync(apiService);
  
  // Auto-start market data sync when market is open
  const marketStatus = UTILS.getMarketStatus();
  if (marketStatus.isOpen) {
    marketDataSync.start();
  }
  
  // Stop sync when page unloads
  window.addEventListener('beforeunload', () => {
    marketDataSync.stop();
  });
  
  // Export for global use
  window.apiService = apiService;
  window.marketDataSync = marketDataSync;
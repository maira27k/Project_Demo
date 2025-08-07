// config.js - Configuration and constants

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    ALPHA_VANTAGE_API_KEY: 'YSCFRQID71ETIR0C',
    ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
    
    // Endpoints
    ENDPOINTS: {
      PORTFOLIO: '/portfolio',
      TRANSACTIONS: '/transactions',
      TAX: '/tax',
      PERFORMANCE: '/performance',
      BENCHMARK: '/benchmark',
      MARKET_DATA: '/market-data'
    },
    
    // Market Data Refresh Intervals (in milliseconds)
    REFRESH_INTERVALS: {
      PORTFOLIO: 30000,      // 30 seconds
      MARKET_DATA: 60000,    // 1 minute
      BENCHMARK: 300000,     // 5 minutes
      PERFORMANCE: 300000    // 5 minutes
    },
    
    // Indian Stock Exchanges
    EXCHANGES: {
      NSE: 'NSE',
      BSE: 'BSE'
    },
    
    // Indian Market Indices
    INDICES: {
      NIFTY50: '^NSEI',
      SENSEX: '^BSESN',
      BANKNIFTY: '^NSEBANK'
    },
    
    // Tax Configuration (AY 2024-25)
    TAX_CONFIG: {
      STCG_RATE: 0.15,           // 15% for short term capital gains
      LTCG_RATE: 0.10,           // 10% for long term capital gains
      LTCG_EXEMPTION: 100000,    // ₹1 lakh exemption for LTCG
      HOLDING_PERIOD_DAYS: 365,  // 1 year for equity to be considered long term
      DIVIDEND_TAX_SLAB: true    // Dividend taxed as per individual tax slab
    },
    
    // Chart Configuration
    CHART_CONFIG: {
      COLORS: {
        PRIMARY: '#007bff',
        SUCCESS: '#28a745',
        DANGER: '#dc3545',
        WARNING: '#ffc107',
        INFO: '#17a2b8'
      },
      GRADIENT: {
        LIGHT: 'rgba(0, 123, 255, 0.1)',
        DARK: 'rgba(0, 212, 255, 0.1)'
      }
    },
    
    // Currency Configuration
    CURRENCY: {
      SYMBOL: '₹',
      CODE: 'INR',
      LOCALE: 'en-IN'
    },
    
    // Date Formats
    DATE_FORMATS: {
      DISPLAY: 'DD/MM/YYYY',
      API: 'YYYY-MM-DD',
      CHART: 'MMM DD'
    },
    
    // Notification Configuration
    NOTIFICATION_DURATION: 5000, // 5 seconds
    
    // Download Configuration
    DOWNLOAD: {
      FILENAME_PREFIX: 'portfolio_',
      FORMATS: {
        JSON: 'json',
        CSV: 'csv',
        PDF: 'pdf'
      }
    },
    
    // Validation Rules
    VALIDATION: {
      SYMBOL: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 20,
        PATTERN: /^[A-Z0-9.-]+$/
      },
      QUANTITY: {
        MIN: 0.0001,
        MAX: 999999999
      },
      PRICE: {
        MIN: 0.01,
        MAX: 999999999
      }
    }
  };
  
  // Utility Functions
  const UTILS = {
    // Format currency according to Indian standards
    formatCurrency: (amount, showSymbol = true) => {
      const formatted = new Intl.NumberFormat(CONFIG.CURRENCY.LOCALE, {
        style: 'currency',
        currency: CONFIG.CURRENCY.CODE,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
      return showSymbol ? formatted : formatted.replace(CONFIG.CURRENCY.SYMBOL, '').trim();
    },
    
    // Format large numbers with Indian number system (Lakh, Crore)
    formatLargeNumber: (number) => {
      if (number >= 10000000) { // 1 Crore
        return (number / 10000000).toFixed(2) + ' Cr';
      } else if (number >= 100000) { // 1 Lakh
        return (number / 100000).toFixed(2) + ' L';
      } else if (number >= 1000) { // 1 Thousand
        return (number / 1000).toFixed(2) + 'K';
      }
      return number.toFixed(2);
    },
    
    // Format percentage
    formatPercentage: (value, decimals = 2) => {
      return `${value.toFixed(decimals)}%`;
    },
    
    // Format date
    formatDate: (date, format = CONFIG.DATE_FORMATS.DISPLAY) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-IN');
    },
    
    // Calculate percentage change
    calculatePercentageChange: (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    },
    
    // Calculate holding period in days
    calculateHoldingPeriod: (buyDate, sellDate = new Date()) => {
      const buy = new Date(buyDate);
      const sell = new Date(sellDate);
      return Math.floor((sell - buy) / (1000 * 60 * 60 * 24));
    },
    
    // Determine if capital gain is short term or long term
    isLongTermCapitalGain: (holdingPeriodDays) => {
      return holdingPeriodDays >= CONFIG.TAX_CONFIG.HOLDING_PERIOD_DAYS;
    },
    
    // Calculate tax on capital gains
    calculateCapitalGainsTax: (gain, isLongTerm) => {
      if (gain <= 0) return 0;
      
      if (isLongTerm) {
        const taxableGain = Math.max(0, gain - CONFIG.TAX_CONFIG.LTCG_EXEMPTION);
        return taxableGain * CONFIG.TAX_CONFIG.LTCG_RATE;
      } else {
        return gain * CONFIG.TAX_CONFIG.STCG_RATE;
      }
    },
    
    // Debounce function for API calls
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Generate unique ID
    generateId: () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Validate Indian stock symbol
    validateSymbol: (symbol) => {
      return CONFIG.VALIDATION.SYMBOL.PATTERN.test(symbol) &&
             symbol.length >= CONFIG.VALIDATION.SYMBOL.MIN_LENGTH &&
             symbol.length <= CONFIG.VALIDATION.SYMBOL.MAX_LENGTH;
    },
    
    // Get market status based on time
    getMarketStatus: () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      // Indian market hours: 9:15 AM to 3:30 PM (IST)
      const marketOpen = 9 * 60 + 15;  // 9:15 AM
      const marketClose = 15 * 60 + 30; // 3:30 PM
      
      if (isWeekend) {
        return { isOpen: false, status: 'Weekend' };
      } else if (currentTime >= marketOpen && currentTime <= marketClose) {
        return { isOpen: true, status: 'Market Open' };
      } else if (currentTime < marketOpen) {
        return { isOpen: false, status: 'Pre-Market' };
      } else {
        return { isOpen: false, status: 'Market Closed' };
      }
    },
    
    // Get theme from localStorage or system preference
    getTheme: () => {
      const savedTheme = localStorage.getItem('portfolio-theme');
      if (savedTheme) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    // Set theme
    setTheme: (theme) => {
      localStorage.setItem('portfolio-theme', theme);
      document.body.className = `${theme}-theme`;
    },
    
    // Show notification
    showNotification: (message, type = 'info', duration = CONFIG.NOTIFICATION_DURATION) => {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : type === 'warning' ? 'fa-exclamation' : 'fa-info'}"></i>
        ${message}
      `;
      
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => notification.classList.add('show'), 100);
      
      // Hide notification
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, duration);
    },
    
    // API request helper with error handling
    apiRequest: async (endpoint, options = {}) => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Request failed:', error);
        UTILS.showNotification(`API Error: ${error.message}`, 'error');
        throw error;
      }
    },
    
    // Alpha Vantage API helper
    alphaVantageRequest: async (symbol, function_type = 'GLOBAL_QUOTE') => {
      try {
        const params = new URLSearchParams({
          function: function_type,
          symbol: symbol,
          apikey: CONFIG.ALPHA_VANTAGE_API_KEY
        });
        
        const response = await fetch(`${CONFIG.ALPHA_VANTAGE_BASE_URL}?${params}`);
        const data = await response.json();
        
        if (data['Error Message']) {
          throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
        }
        
        if (data['Note']) {
          throw new Error('API call frequency limit reached. Please try again later.');
        }
        
        return data;
      } catch (error) {
        console.error('Alpha Vantage API Error:', error);
        throw error;
      }
    },
    
    // Parse Alpha Vantage quote response
    parseAlphaVantageQuote: (data) => {
      const quote = data['Global Quote'];
      if (!quote) return null;
      
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: quote['07. latest trading day']
      };
    },
    
    // Storage helpers
    storage: {
      get: (key, defaultValue = null) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
        } catch {
          return defaultValue;
        }
      },
      
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      },
      
      remove: (key) => {
        try {
          localStorage.removeItem(key);
          return true;
        } catch {
          return false;
        }
      }
    }
  };
  
  // Common Indian Stock Symbols for autocomplete
  const INDIAN_STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HDFC', 'KOTAKBANK', 'HINDUNILVR',
    'ITC', 'SBIN', 'BHARTIARTL', 'ASIANPAINT', 'DMART', 'ICICIBANK', 'ADANIENT',
    'LT', 'HCLTECH', 'MARUTI', 'SUNPHARMA', 'TITAN', 'NESTLEIND', 'ULTRACEMCO',
    'WIPRO', 'NTPC', 'AXISBANK', 'M&M', 'ONGC', 'TECHM', 'TATAMOTORS', 'POWERGRID',
    'JSWSTEEL', 'BAJFINANCE', 'GRASIM', 'TATASTEEL', 'CIPLA', 'COALINDIA',
    'HDFCLIFE', 'DIVISLAB', 'EICHERMOT', 'BAJAJFINSV', 'DRREDDY', 'BRITANNIA',
    'APOLLOHOSP', 'BAJAJ-AUTO', 'HEROMOTOCO', 'SBILIFE', 'INDUSINDBK', 'TATACONSUM'
  ];
  
  // Chart.js default configuration
  const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          color: 'var(--text-primary)'
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-primary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--chart-grid)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      y: {
        grid: {
          color: 'var(--chart-grid)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          callback: function(value) {
            return UTILS.formatCurrency(value);
          }
        }
      }
    }
  };
  
  // Export for use in other modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, UTILS, INDIAN_STOCKS, CHART_DEFAULTS };
  }
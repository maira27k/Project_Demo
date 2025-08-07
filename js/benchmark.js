// Benchmark Module for fetching market data

let benchmarkData = {
    NIFTY: { price: 18245, change: 0.85, volume: '145.2M' },
    SENSEX: { price: 61872, change: 1.12, volume: '234.5M' },
    BANKNIFTY: { price: 42156, change: -0.45, volume: '89.3M' },
    USDINR: { price: 82.45, change: 0.23, volume: '2.1B' },
    GOLD: { price: 59240, change: 0.67, volume: '45.8K' }
  };
  
  export function initializeBenchmark() {
    try {
      fetchBenchmarkData();
      
      // Update benchmark data every 30 seconds
      setInterval(fetchBenchmarkData, 30000);
      
      console.log('Benchmark module initialized');
    } catch (error) {
      console.error('Error initializing benchmark module:', error);
    }
  }
  
  async function fetchBenchmarkData() {
    try {
      // In a real application, this would fetch from actual APIs like:
      // - NSE API for NIFTY, SENSEX
      // - Yahoo Finance API
      // - Alpha Vantage API
      // - Economic Times API
      
      // For now, simulate API response with realistic data fluctuations
      const updatedData = simulateMarketData();
      
      updateBenchmarkDisplay(updatedData);
      updateTickerDisplay(updatedData);
      
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      showBenchmarkError();
    }
  }
  
  function simulateMarketData() {
    const updatedData = { ...benchmarkData };
    
    Object.keys(updatedData).forEach(symbol => {
      // Simulate price movement (-1% to +1% for most realistic market movement)
      const changePercent = (Math.random() - 0.5) * 0.02;
      const oldPrice = updatedData[symbol].price;
      const newPrice = oldPrice * (1 + changePercent);
      
      updatedData[symbol] = {
        ...updatedData[symbol],
        price: Math.round(newPrice * 100) / 100,
        change: ((newPrice - oldPrice) / oldPrice * 100),
        lastUpdated: new Date()
      };
      
      // Update volume with small variations
      const volumeChange = (Math.random() - 0.5) * 0.1;
      const volumeStr = updatedData[symbol].volume;
      const volumeUnit = volumeStr.slice(-1);
      const currentVolume = parseFloat(volumeStr.slice(0, -1));
      const newVolume = (currentVolume * (1 + volumeChange)).toFixed(1);
      updatedData[symbol].volume = newVolume + volumeUnit;
    });
    
    benchmarkData = updatedData;
    return updatedData;
  }
  
  function updateBenchmarkDisplay(data) {
    const benchmarkSection = document.getElementById('benchmarkSection');
    if (!benchmarkSection) return;
    
    const benchmarkGrid = benchmarkSection.querySelector('.row');
    if (!benchmarkGrid) return;
    
    const indices = [
      { key: 'NIFTY', name: 'NIFTY 50' },
      { key: 'SENSEX', name: 'SENSEX' },
      { key: 'BANKNIFTY', name: 'BANK NIFTY' },
      { key: 'USDINR', name: 'USD/INR' }
    ];
    
    benchmarkGrid.innerHTML = indices.map((index, i) => {
      const indexData = data[index.key];
      if (!indexData) return ''; // Handle missing data
      
      const changeClass = indexData.change >= 0 ? 'positive' : 'negative';
      const changeIcon = indexData.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
      
      return `
        <div class="col-md-3 col-6 text-center">
          <div class="h4 text-primary">${formatPrice(indexData.price, index.key)}</div>
          <div class="small text-secondary">${index.name}</div>
          <div class="small ${changeClass}">
            <i class="fas ${changeIcon}"></i>
            ${indexData.change >= 0 ? '+' : ''}${indexData.change.toFixed(2)}%
          </div>
          <div class="small text-secondary mt-1">Vol: ${indexData.volume}</div>
        </div>
      `;
    }).join('');
  }
  
  function updateTickerDisplay(data) {
    const ticker = document.getElementById('priceTicker');
    if (!ticker) return;
    
    const tickerItems = Object.keys(data).map(key => {
      const item = data[key];
      if (!item) return ''; // Handle missing data
      
      const changeClass = item.change >= 0 ? 'positive' : 'negative';
      const displayName = getDisplayName(key);
      
      return `<span class="ticker-item">${displayName}: ${formatPrice(item.price, key)} <span class="${changeClass}">${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}%</span></span>`;
    }).join('');
    
    ticker.innerHTML = tickerItems;
  }
  
  function formatPrice(price, symbol) {
    if (!price && price !== 0) return 'N/A'; // Handle undefined/null prices
    
    if (symbol === 'USDINR') {
      return price.toFixed(2);
    } else if (symbol === 'GOLD') {
      return `₹${price.toLocaleString('en-IN')}`;
    } else {
      return price.toLocaleString('en-IN');
    }
  }
  
  function getDisplayName(key) {
    const names = {
      'NIFTY': 'NIFTY',
      'SENSEX': 'SENSEX',
      'BANKNIFTY': 'BANK NIFTY',
      'USDINR': 'USD/INR',
      'GOLD': 'GOLD'
    };
    return names[key] || key;
  }
  
  function showBenchmarkError() {
    const benchmarkSection = document.getElementById('benchmarkSection');
    if (benchmarkSection) {
      benchmarkSection.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Unable to fetch live market data. Displaying cached data.
          <button class="btn btn-sm btn-outline-warning ms-2" onclick="retryBenchmarkData()">
            <i class="fas fa-refresh"></i> Retry
          </button>
        </div>
      `;
    }
  }
  
  // Global function for retry button
  window.retryBenchmarkData = function() {
    fetchBenchmarkData();
  };
  
  // Market status functions
  export function getMarketStatus() {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Indian market hours: 9:15 AM to 3:30 PM, Monday to Friday
    const marketOpenTime = 915;  // 9:15 AM
    const marketCloseTime = 1530; // 3:30 PM
    
    if (currentDay === 0 || currentDay === 6) {
      return { status: 'CLOSED', reason: 'Weekend' };
    }
    
    if (currentTime < marketOpenTime) {
      return { status: 'PRE_MARKET', reason: 'Market opens at 9:15 AM' };
    }
    
    if (currentTime > marketCloseTime) {
      return { status: 'POST_MARKET', reason: 'Market closed at 3:30 PM' };
    }
    
    return { status: 'OPEN', reason: 'Market is open' };
  }
  
  export function updateMarketStatusIndicator() {
    const marketStatus = getMarketStatus();
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-indicator + span');
    
    if (statusIndicator && statusText) {
      switch(marketStatus.status) {
        case 'OPEN':
          statusIndicator.className = 'status-indicator status-online';
          statusText.textContent = 'Live Market Data';
          break;
        case 'CLOSED':
        case 'PRE_MARKET':
        case 'POST_MARKET':
          statusIndicator.className = 'status-indicator status-offline';
          statusText.textContent = 'Market Closed';
          break;
      }
    }
  }
  
  // Historical data functions
  export function getHistoricalData(symbol, period = '1M') {
    // Mock historical data generation
    const periods = {
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };
    
    const dataPoints = periods[period] || 30;
    const basePrice = benchmarkData[symbol]?.price || 1000;
    const data = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const randomWalk = (Math.random() - 0.5) * 0.02;
      const price = basePrice * (1 + randomWalk * (dataPoints - i) / dataPoints);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    return data;
  }
  
  // Economic indicators
  export function getEconomicIndicators() {
    return {
      inflation: { value: 5.66, change: -0.12, unit: '%' },
      gdpGrowth: { value: 7.2, change: 0.3, unit: '%' },
      repoRate: { value: 6.50, change: 0, unit: '%' },
      cpi: { value: 139.7, change: 0.8, unit: 'points' },
      fiscalDeficit: { value: 3.4, change: -0.2, unit: '% of GDP' }
    };
  }
  
  // Currency exchange rates
  export function getCurrencyRates() {
    return {
      'USD/INR': { rate: 82.45, change: 0.23 },
      'EUR/INR': { rate: 89.34, change: -0.15 },
      'GBP/INR': { rate: 101.23, change: 0.45 },
      'JPY/INR': { rate: 0.55, change: -0.08 }
    };
  }
  
  // Sector performance
  export function getSectorPerformance() {
    const sectors = [
      'Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Energy', 
      'Infrastructure', 'Metals', 'Realty', 'Telecom'
    ];
    
    return sectors.map(sector => ({
      name: sector,
      change: (Math.random() - 0.5) * 4, // -2% to +2%
      volume: Math.floor(Math.random() * 500) + 100
    }));
  }
  
  // Top gainers and losers
  export function getTopMovers() {
    const gainers = [
      { symbol: 'ADANIENT', price: 2456, change: 8.5 },
      { symbol: 'TATAMOTORS', price: 589, change: 6.2 },
      { symbol: 'JSWSTEEL', price: 789, change: 5.8 }
    ];
    
    const losers = [
      { symbol: 'BAJFINANCE', price: 6789, change: -4.2 },
      { symbol: 'HDFCLIFE', price: 567, change: -3.8 },
      { symbol: 'SBILIFE', price: 1234, change: -3.1 }
    ];
    
    return { gainers, losers };
  }
  
  // Market breadth
  export function getMarketBreadth() {
    const advances = Math.floor(Math.random() * 1000) + 800;
    const declines = Math.floor(Math.random() * 800) + 600;
    const unchanged = Math.floor(Math.random() * 200) + 50;
    
    return {
      advances,
      declines,
      unchanged,
      advanceDeclineRatio: (advances / declines).toFixed(2)
    };
  }
  
  // Initialize market status updates
  if (typeof window !== 'undefined') {
    setInterval(updateMarketStatusIndicator, 60000); // Update every minute
    updateMarketStatusIndicator(); // Initial update
  }
  
  // Export the benchmark data for other modules
  export { benchmarkData, fetchBenchmarkData };
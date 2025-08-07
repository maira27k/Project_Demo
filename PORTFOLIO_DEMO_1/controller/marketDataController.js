// Enhanced backend controller with Alpha Vantage integration
// marketDataController.js

const db = require('../config/db');
const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = 'YSCFRQID71ETIR0C';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Cache to store market data and avoid API limit hits
const marketDataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get market data from database first, then from Alpha Vantage if needed
exports.getMarketData = async (req, res) => {
  const { symbols } = req.query;
  const symbolArray = symbols ? symbols.split(',') : [];

  if (symbolArray.length === 0) {
    return res.status(400).json({ error: 'No symbols provided' });
  }

  try {
    const results = {};
    const symbolsToFetch = [];

    // Check database cache first
    for (const symbol of symbolArray) {
      const cachedData = await getCachedMarketData(symbol);
      if (cachedData) {
        results[symbol] = cachedData;
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Fetch missing symbols from Alpha Vantage
    if (symbolsToFetch.length > 0) {
      const fetchedData = await fetchFromAlphaVantage(symbolsToFetch);
      Object.assign(results, fetchedData);
    }

    res.json(results);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Store market data in database
exports.storeMarketData = async (req, res) => {
  const { symbol, data } = req.body;

  if (!symbol || !data) {
    return res.status(400).json({ error: 'Symbol and data required' });
  }

  try {
    await storeMarketDataInDB(symbol, data);
    res.json({ message: 'Market data stored successfully' });
  } catch (error) {
    console.error('Store market data error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get cached market data from database
async function getCachedMarketData(symbol) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM market_data 
      WHERE symbol = ? AND updated_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY updated_at DESC LIMIT 1
    `;
    
    db.query(query, [symbol], (err, results) => {
      if (err) {
        console.error('Database cache error:', err);
        resolve(null);
        return;
      }

      if (results.length > 0) {
        const data = results[0];
        resolve({
          symbol: data.symbol,
          price: parseFloat(data.price),
          change: parseFloat(data.change_amount),
          changePercent: parseFloat(data.change_percent),
          volume: parseInt(data.volume),
          lastUpdated: data.updated_at
        });
      } else {
        resolve(null);
      }
    });
  });
}

// Store market data in database
async function storeMarketDataInDB(symbol, data) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO market_data (symbol, price, change_amount, change_percent, volume, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      price = VALUES(price),
      change_amount = VALUES(change_amount),
      change_percent = VALUES(change_percent),
      volume = VALUES(volume),
      updated_at = VALUES(updated_at)
    `;
    
    db.query(query, [
      symbol,
      data.price,
      data.change,
      data.changePercent,
      data.volume
    ], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Fetch data from Alpha Vantage API
async function fetchFromAlphaVantage(symbols) {
  const results = {};
  
  for (const symbol of symbols) {
    try {
      // Check memory cache first
      const cacheKey = `${symbol}_${Date.now()}`;
      const cached = marketDataCache.get(symbol);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        results[symbol] = cached.data;
        continue;
      }

      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });

      const data = response.data;
      
      if (data['Error Message']) {
        console.error(`Alpha Vantage Error for ${symbol}:`, data['Error Message']);
        continue;
      }

      if (data['Note']) {
        console.warn('Alpha Vantage API limit reached');
        break;
      }

      const quote = data['Global Quote'];
      if (quote) {
        const marketData = {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']) || 0,
          lastUpdated: quote['07. latest trading day']
        };

        // Store in memory cache
        marketDataCache.set(symbol, {
          data: marketData,
          timestamp: Date.now()
        });

        // Store in database
        await storeMarketDataInDB(symbol, marketData);
        
        results[symbol] = marketData;
      }

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error.message);
    }
  }

  return results;
}

// Enhanced portfolio controller with real-time pricing
exports.getPortfolioWithLivePrices = async (req, res) => {
  try {
    // Get portfolio items
    const portfolioQuery = 'SELECT * FROM portfolio_items';
    db.query(portfolioQuery, async (err, portfolioResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (portfolioResults.length === 0) {
        return res.json([]);
      }

      // Extract unique symbols
      const symbols = [...new Set(portfolioResults
        .map(item => item.ticker_symbol || item.symbol)
        .filter(Boolean))];

      // Fetch live market data
      const marketData = {};
      for (const symbol of symbols) {
        const cachedData = await getCachedMarketData(symbol);
        if (cachedData) {
          marketData[symbol] = cachedData;
        }
      }

      // If we don't have recent data, fetch from Alpha Vantage
      const missingSymbols = symbols.filter(symbol => !marketData[symbol]);
      if (missingSymbols.length > 0) {
        const fetchedData = await fetchFromAlphaVantage(missingSymbols);
        Object.assign(marketData, fetchedData);
      }

      // Enhance portfolio data with live prices
      const enhancedPortfolio = portfolioResults.map(item => {
        const symbol = item.ticker_symbol || item.symbol;
        const liveData = marketData[symbol];
        
        if (liveData) {
          const currentValue = item.quantity * liveData.price;
          const totalCost = item.quantity * item.avg_cost;
          const gainLoss = currentValue - totalCost;
          const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

          return {
            ...item,
            current_price: liveData.price,
            current_value: currentValue,
            gain_loss: gainLoss,
            gain_loss_percent: gainLossPercent,
            day_change: liveData.change,
            day_change_percent: liveData.changePercent,
            last_updated: liveData.lastUpdated
          };
        }

        return item;
      });

      res.json(enhancedPortfolio);
    });
  } catch (error) {
    console.error('Portfolio with live prices error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Enhanced tax controller with updated Indian tax rules
exports.calculateTaxEnhanced = async (req, res) => {
  const { year = new Date().getFullYear() } = req.body;

  try {
    // Get all completed transactions for tax calculation
    const transactionQuery = `
      SELECT t.*, p.ticker_symbol, p.asset_name
      FROM transactions t
      LEFT JOIN portfolio_items p ON t.item_id = p.item_id
      WHERE YEAR(t.txn_date) = ? OR (t.txn_type = 'sell' AND YEAR(t.txn_date) <= ?)
      ORDER BY t.txn_date
    `;

    db.query(transactionQuery, [year, year], (err, transactions) => {
      if (err) return res.status(500).json({ error: err.message });

      const taxCalculation = calculateIndianTax(transactions, year);
      
      // Store tax calculation in database
      const insertTaxQuery = `
        INSERT INTO tax_calculations (year, stcg, ltcg, dividend_income, total_tax, calculation_date)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        stcg = VALUES(stcg),
        ltcg = VALUES(ltcg),
        dividend_income = VALUES(dividend_income),
        total_tax = VALUES(total_tax),
        calculation_date = VALUES(calculation_date)
      `;

      db.query(insertTaxQuery, [
        year,
        taxCalculation.stcg.taxableGain,
        taxCalculation.ltcg.taxableGain,
        taxCalculation.dividend.totalDividend,
        taxCalculation.totalTax
      ], (insertErr) => {
        if (insertErr) console.error('Error storing tax calculation:', insertErr);
      });

      res.json(taxCalculation);
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Calculate Indian tax as per latest rules (AY 2024-25)
function calculateIndianTax(transactions, year) {
  const buyTransactions = [];
  const sellTransactions = [];
  const dividendTransactions = [];

  // Separate transactions by type
  transactions.forEach(txn => {
    switch (txn.txn_type.toLowerCase()) {
      case 'buy':
        buyTransactions.push(txn);
        break;
      case 'sell':
        sellTransactions.push(txn);
        break;
      case 'dividend':
        dividendTransactions.push(txn);
        break;
    }
  });

  // Calculate capital gains using FIFO method
  const capitalGains = calculateCapitalGains(buyTransactions, sellTransactions);
  
  // Calculate dividend income
  const dividendIncome = dividendTransactions
    .filter(txn => new Date(txn.txn_date).getFullYear() === year)
    .reduce((sum, txn) => sum + txn.total_value, 0);

  // Tax rates for AY 2024-25
  const STCG_RATE = 0.15; // 15% for short term capital gains
  const LTCG_RATE = 0.10; // 10% for long term capital gains above 1 lakh
  const LTCG_EXEMPTION = 100000; // 1 lakh exemption

  // Calculate STCG tax
  const stcgTax = Math.max(0, capitalGains.shortTerm * STCG_RATE);

  // Calculate LTCG tax (10% on gains above 1 lakh)
  const ltcgTaxableGain = Math.max(0, capitalGains.longTerm - LTCG_EXEMPTION);
  const ltcgTax = ltcgTaxableGain * LTCG_RATE;

  const totalTax = stcgTax + ltcgTax;

  return {
    year,
    stcg: {
      gain: capitalGains.shortTerm,
      taxableGain: capitalGains.shortTerm,
      taxRate: STCG_RATE,
      tax: stcgTax
    },
    ltcg: {
      gain: capitalGains.longTerm,
      exemption: LTCG_EXEMPTION,
      taxableGain: ltcgTaxableGain,
      taxRate: LTCG_RATE,
      tax: ltcgTax
    },
    dividend: {
      totalDividend: dividendIncome,
      taxNote: 'Taxed as per individual tax slab'
    },
    totalTax,
    transactions: capitalGains.transactions
  };
}

// Calculate capital gains using FIFO method
function calculateCapitalGains(buyTxns, sellTxns) {
  const holdings = new Map(); // symbol -> array of buy transactions
  const transactions = [];
  let shortTermGain = 0;
  let longTermGain = 0;

  // Process buy transactions
  buyTxns.forEach(txn => {
    const symbol = txn.ticker_symbol || 'UNKNOWN';
    if (!holdings.has(symbol)) {
      holdings.set(symbol, []);
    }
    holdings.get(symbol).push({
      date: new Date(txn.txn_date),
      quantity: txn.quantity,
      price: txn.price,
      remainingQty: txn.quantity
    });
  });

  // Process sell transactions using FIFO
  sellTxns.forEach(sellTxn => {
    const symbol = sellTxn.ticker_symbol || 'UNKNOWN';
    const sellDate = new Date(sellTxn.txn_date);
    let remainingSellQty = sellTxn.quantity;
    const sellPrice = sellTxn.price;

    if (!holdings.has(symbol)) return;

    const buyList = holdings.get(symbol);
    
    for (const buy of buyList) {
      if (remainingSellQty <= 0 || buy.remainingQty <= 0) continue;

      const qtyToSell = Math.min(remainingSellQty, buy.remainingQty);
      const holdingPeriod = Math.floor((sellDate - buy.date) / (1000 * 60 * 60 * 24));
      const isLongTerm = holdingPeriod >= 365;

      const buyValue = qtyToSell * buy.price;
      const sellValue = qtyToSell * sellPrice;
      const gain = sellValue - buyValue;

      if (isLongTerm) {
        longTermGain += gain;
      } else {
        shortTermGain += gain;
      }

      transactions.push({
        symbol,
        buyDate: buy.date,
        sellDate,
        quantity: qtyToSell,
        buyPrice: buy.price,
        sellPrice,
        holdingPeriod,
        isLongTerm,
        gain,
        gainType: isLongTerm ? 'LTCG' : 'STCG'
      });

      buy.remainingQty -= qtyToSell;
      remainingSellQty -= qtyToSell;
    }
  });

  return {
    shortTerm: shortTermGain,
    longTerm: longTermGain,
    transactions
  };
}

// Benchmark data controller
exports.getBenchmarkData = async (req, res) => {
  try {
    const indices = ['NSEI', 'BSESN', 'NSEBANK']; // Nifty 50, Sensex, Bank Nifty
    const benchmarkData = {};

    for (const index of indices) {
      const cachedData = await getCachedMarketData(`^${index}`);
      if (cachedData) {
        benchmarkData[index] = cachedData;
      }
    }

    // If no cached data, try to fetch from Alpha Vantage
    const missingIndices = indices.filter(index => !benchmarkData[index]);
    if (missingIndices.length > 0) {
      const symbolsToFetch = missingIndices.map(index => `^${index}`);
      const fetchedData = await fetchFromAlphaVantage(symbolsToFetch);
      
      Object.keys(fetchedData).forEach(symbol => {
        const index = symbol.replace('^', '');
        benchmarkData[index] = fetchedData[symbol];
      });
    }

    res.json(benchmarkData);
  } catch (error) {
    console.error('Benchmark data error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Performance calculation with benchmark comparison
exports.getPerformanceData = async (req, res) => {
  const { period = '1M' } = req.query;
  
  try {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Get portfolio performance data
    const performanceQuery = `
      SELECT DATE(created_at) as date, portfolio_value, benchmark_value
      FROM portfolio_snapshots
      WHERE created_at >= ? AND created_at <= ?
      ORDER BY created_at
    `;

    db.query(performanceQuery, [startDate, endDate], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // If no historical data, calculate current value
      if (results.length === 0) {
        return calculateCurrentPerformance(req, res);
      }

      // Calculate performance metrics
      const performanceData = results.map(row => ({
        date: row.date,
        portfolioValue: parseFloat(row.portfolio_value),
        benchmarkValue: parseFloat(row.benchmark_value) || 0
      }));

      const metrics = calculatePerformanceMetrics(performanceData);

      res.json({
        period,
        data: performanceData,
        metrics
      });
    });
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Calculate current performance if no historical data
function calculateCurrentPerformance(req, res) {
  const portfolioQuery = 'SELECT * FROM portfolio_items';
  
  db.query(portfolioQuery, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const currentValue = results.reduce((total, item) => {
      return total + (item.quantity * (item.current_price || item.avg_cost));
    }, 0);

    const totalCost = results.reduce((total, item) => {
      return total + (item.quantity * item.avg_cost);
    }, 0);

    res.json({
      period: '1D',
      data: [{
        date: new Date().toISOString().split('T')[0],
        portfolioValue: currentValue,
        benchmarkValue: 0
      }],
      metrics: {
        totalReturn: currentValue - totalCost,
        totalReturnPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
        sharpeRatio: 0,
        volatility: 0,
        maxDrawdown: 0,
        beta: 0
      }
    });
  });
}

// Calculate performance metrics
function calculatePerformanceMetrics(data) {
  if (data.length < 2) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      sharpeRatio: 0,
      volatility: 0,
      maxDrawdown: 0,
      beta: 0
    };
  }

  const startValue = data[0].portfolioValue;
  const endValue = data[data.length - 1].portfolioValue;
  const totalReturn = endValue - startValue;
  const totalReturnPercent = startValue > 0 ? (totalReturn / startValue) * 100 : 0;

  // Calculate daily returns
  const dailyReturns = [];
  for (let i = 1; i < data.length; i++) {
    const prevValue = data[i - 1].portfolioValue;
    const currentValue = data[i].portfolioValue;
    if (prevValue > 0) {
      dailyReturns.push((currentValue - prevValue) / prevValue);
    }
  }

  // Calculate volatility (standard deviation of daily returns)
  let volatility = 0;
  if (dailyReturns.length > 1) {
    const mean = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / dailyReturns.length;
    volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
  }

  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = data[0].portfolioValue;
  
  for (const point of data) {
    if (point.portfolioValue > peak) {
      peak = point.portfolioValue;
    }
    const drawdown = (peak - point.portfolioValue) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    totalReturn,
    totalReturnPercent,
    sharpeRatio: volatility > 0 ? (totalReturnPercent - 6) / volatility : 0, // Assuming 6% risk-free rate
    volatility,
    maxDrawdown: maxDrawdown * 100,
    beta: 1.0 // Default beta, requires benchmark comparison for accurate calculation
  };
}
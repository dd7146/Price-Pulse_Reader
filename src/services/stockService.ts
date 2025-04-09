// We're using mock data for demonstration purposes
// In a real application, you would replace this with actual API calls to financial data providers

// Sample historical stock data (date, open, high, low, close, volume)
const stockData = {
    'AAPL': generateStockData('AAPL', 365, 150, 50),
    'GOOGL': generateStockData('GOOGL', 365, 2500, 500),
    'MSFT': generateStockData('MSFT', 365, 300, 80),
    'AMZN': generateStockData('AMZN', 365, 3500, 500),
    'TSLA': generateStockData('TSLA', 365, 1000, 300),
    'META': generateStockData('META', 365, 350, 100),
    'NFLX': generateStockData('NFLX', 365, 600, 150),
    'NVDA': generateStockData('NVDA', 365, 800, 200),
  };
  
  function generateStockData(symbol: string, days: number, basePrice: number, variance: number) {
    const data = [];
    const today = new Date();
    let price = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random price changes with some trend
      const change = (Math.random() - 0.48) * (variance / 50);
      price = Math.max(1, price * (1 + change));
      
      const dailyVariance = variance / 10;
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * 0.02);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
  
      data.push({
        date: date.toISOString().split('T')[0],
        symbol,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
      });
    }
  
    return data;
  }
  
  export interface StockDataPoint {
    date: string;
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface StockMetrics {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    volume: number;
    avgVolume: number;
  }
  
  const stockInfo = {
    'AAPL': { name: 'Apple Inc.' },
    'GOOGL': { name: 'Alphabet Inc.' },
    'MSFT': { name: 'Microsoft Corporation' },
    'AMZN': { name: 'Amazon.com, Inc.' },
    'TSLA': { name: 'Tesla, Inc.' },
    'META': { name: 'Meta Platforms, Inc.' },
    'NFLX': { name: 'Netflix, Inc.' },
    'NVDA': { name: 'NVIDIA Corporation' },
  };
  
  export const fetchStockData = async (symbol: string, days: number = 30): Promise<StockDataPoint[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!stockData[symbol]) {
      throw new Error(`No data available for symbol: ${symbol}`);
    }
    
    // Return the requested number of days
    return stockData[symbol].slice(-days);
  };
  
  export const fetchStockMetrics = async (symbol: string): Promise<StockMetrics> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!stockData[symbol]) {
      throw new Error(`No data available for symbol: ${symbol}`);
    }
    
    const data = stockData[symbol];
    const lastDay = data[data.length - 1];
    const previousDay = data[data.length - 2];
    const yearData = data.slice(-365);
    
    const change = parseFloat((lastDay.close - previousDay.close).toFixed(2));
    const changePercent = parseFloat(((change / previousDay.close) * 100).toFixed(2));
    
    // Calculate market cap (simplified)
    const marketCap = lastDay.close * (Math.random() * 5 + 10) * 1000000000;
    
    // Calculate average volume
    const avgVolume = Math.floor(
      yearData.reduce((sum, item) => sum + item.volume, 0) / yearData.length
    );
    
    return {
      symbol,
      name: stockInfo[symbol]?.name || symbol,
      currentPrice: lastDay.close,
      change,
      changePercent,
      dayHigh: lastDay.high,
      dayLow: lastDay.low,
      yearHigh: Math.max(...yearData.map(item => item.high)),
      yearLow: Math.min(...yearData.map(item => item.low)),
      marketCap,
      volume: lastDay.volume,
      avgVolume,
    };
  };
  
  export const fetchAvailableSymbols = async (): Promise<Array<{ symbol: string, name: string }>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return Object.keys(stockData).map(symbol => ({
      symbol,
      name: stockInfo[symbol]?.name || symbol
    }));
  };
  
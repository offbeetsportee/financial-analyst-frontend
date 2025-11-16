const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const stockAPI = {
  getStockData: async (symbol) => {
    const response = await fetch(`${API_URL}/stocks/${symbol}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stock data');
    }
    return response.json();
  },

  getAllStocks: async () => {
    const response = await fetch(`${API_URL}/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return response.json();
  }
};

export const marketAPI = {
  getIndicators: async () => {
    const response = await fetch(`${API_URL}/market/indicators`);
    if (!response.ok) throw new Error('Failed to fetch market indicators');
    return response.json();
  }
};
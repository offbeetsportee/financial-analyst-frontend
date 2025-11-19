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

  getCompanyInfo: async (symbol) => {
    const response = await fetch(`${API_URL}/stocks/${symbol}/company`);
    if (!response.ok) throw new Error('Failed to fetch company info');
    return response.json();
  },

  getAllStocks: async () => {
    const response = await fetch(`${API_URL}/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return response.json();
  },

  getPriceData: async (symbol, timeframe) => {
    const response = await fetch(`${API_URL}/stocks/${symbol}/prices/${timeframe}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch price data');
    }
    return response.json();
  },

  // NEW: Search stocks by symbol or name
  searchStocks: async (query) => {
    const response = await fetch(`${API_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }
};

export const marketAPI = {
  getFREDIndicators: async () => {
    const response = await fetch(`${API_URL}/market/fred-indicators`);
    if (!response.ok) throw new Error('Failed to fetch FRED indicators');
    return response.json();
  },

  getIndicators: async () => {
    const response = await fetch(`${API_URL}/market/indicators`);
    if (!response.ok) throw new Error('Failed to fetch market indicators');
    return response.json();
  },

  getHistoricalData: async (years = 10) => {
    const response = await fetch(`${API_URL}/market/fred-historical?years=${years}`);
    if (!response.ok) throw new Error('Failed to fetch historical data');
    return response.json();
  },

  getMarketEvents: async () => {
    const response = await fetch(`${API_URL}/market/events`);
    if (!response.ok) throw new Error('Failed to fetch market events');
    return response.json();
  },

  getLiveIndices: async () => {
    const response = await fetch(`${API_URL}/market/indices/key`);
    if (!response.ok) throw new Error('Failed to fetch live market indices');
    return response.json();
  }
};

export const watchlistAPI = {
  getWatchlist: async (userId) => {
    const response = await fetch(`${API_URL}/watchlist`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch watchlist');
    return response.json();
  },

  getWatchlistDetails: async (userId) => {
    const response = await fetch(`${API_URL}/watchlist/details`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch watchlist details');
    return response.json();
  },

  addToWatchlist: async (userId, symbol) => {
    const response = await fetch(`${API_URL}/watchlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ symbol })
    });
    if (!response.ok) throw new Error('Failed to add to watchlist');
    return response.json();
  },

  removeFromWatchlist: async (userId, symbol) => {
    const response = await fetch(`${API_URL}/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to remove from watchlist');
    return response.json();
  },

  checkWatchlist: async (userId, symbol) => {
    const response = await fetch(`${API_URL}/watchlist/check/${symbol}`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to check watchlist');
    return response.json();
  }
};

export const alertsAPI = {
  getAlerts: async (userId) => {
    const response = await fetch(`${API_URL}/alerts`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  createAlert: async (userId, symbol, alertPrice, direction) => {
    const response = await fetch(`${API_URL}/alerts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ symbol, alertPrice, direction })
    });
    if (!response.ok) throw new Error('Failed to create alert');
    return response.json();
  },

  deleteAlert: async (userId, alertId) => {
    const response = await fetch(`${API_URL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to delete alert');
    return response.json();
  },

  toggleAlert: async (userId, alertId) => {
    const response = await fetch(`${API_URL}/alerts/${alertId}/toggle`, {
      method: 'PATCH',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to toggle alert');
    return response.json();
  },

  sendTestEmail: async (userId) => {
    const response = await fetch(`${API_URL}/alerts/test-email`, {
      method: 'POST',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to send test email');
    return response.json();
  },

  sendDailySummary: async (userId) => {
    const response = await fetch(`${API_URL}/alerts/daily-summary`, {
      method: 'POST',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to send daily summary');
    return response.json();
  }
};

export const portfolioAPI = {
  getPortfolios: async (userId) => {
    const response = await fetch(`${API_URL}/portfolio`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolios');
    return response.json();
  },

  createPortfolio: async (userId, name, description) => {
    const response = await fetch(`${API_URL}/portfolio/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) throw new Error('Failed to create portfolio');
    return response.json();
  },

  getPortfolioDetails: async (userId, portfolioId) => {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio details');
    return response.json();
  },

  addTransaction: async (userId, portfolioId, transaction) => {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return response.json();
  },

  deleteTransaction: async (userId, transactionId) => {
    const response = await fetch(`${API_URL}/portfolio/transaction/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  importCSV: async (userId, portfolioId, csvData, brokerFormat) => {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/import-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ csvData, brokerFormat })
    });
    if (!response.ok) throw new Error('Failed to import CSV');
    return response.json();
  },

  getPerformance: async (userId, portfolioId, days = 365) => {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/performance?days=${days}`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch performance');
    return response.json();
  },

  deletePortfolio: async (userId, portfolioId) => {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to delete portfolio');
    return response.json();
  }
};

export const preferencesAPI = {
  getPreferences: async (userId) => {
    const response = await fetch(`${API_URL}/preferences`, {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) throw new Error('Failed to fetch preferences');
    return response.json();
  },

  updatePreferences: async (userId, preferences) => {
    const response = await fetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(preferences)
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  }
};
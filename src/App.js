import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Loader } from 'lucide-react';
import { stockAPI } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockAPI.getStockData(symbol);
      setStockData(data);
    } catch (err) {
      setError(err.message);
      setStockData(getDemoStockData(symbol));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'company') {
      fetchStockData(selectedStock);
    }
  }, [selectedStock, activeTab]);

  const getDemoStockData = (symbol) => {
    return {
      Symbol: symbol,
      Name: `${symbol} Inc.`,
      PERatio: '28.5',
      EPS: '6.26',
      DividendYield: '0.0051',
      MarketCapitalization: '2800000000000',
      ProfitMargin: '0.253',
      QuarterlyRevenueGrowthYOY: '0.095',
      DebtToEquity: '1.73',
      ReturnOnEquityTTM: '1.47',
      CurrentRatio: '0.93'
    };
  };

  const formatMarketCap = (value) => {
    const num = parseFloat(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    return `$${num}`;
  };

  const formatPercent = (value) => {
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid #334155', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart3 size={32} color="#60a5fa" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>InvestorIQ</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Market Analysis</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '2rem' }}>
          {['market', 'company', 'education'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #60a5fa' : 'none',
                color: activeTab === tab ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'market' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Market Overview</h2>
            <p>Federal Reserve data, market indices, and economic indicators will be displayed here.</p>
          </div>
        )}

        {activeTab === 'company' && (
          <div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span>Quick Select:</span>
                {popularStocks.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedStock(symbol)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      background: selectedStock === symbol ? '#2563eb' : '#334155',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {symbol}
                  </button>
                ))}
                <button
                  onClick={() => fetchStockData(selectedStock)}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    background: '#059669',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#fcd34d' }}>⚠️ {error}</p>
              </div>
            )}

            {stockData && (
              <div>
                <div style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>{stockData.Name}</h2>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Market Cap</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatMarketCap(stockData.MarketCapitalization)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>P/E Ratio</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stockData.PERatio}</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Key Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <MetricCard label="EPS" value={`$${stockData.EPS}`} />
                  <MetricCard label="Revenue Growth" value={formatPercent(stockData.QuarterlyRevenueGrowthYOY || 0)} />
                  <MetricCard label="Profit Margin" value={formatPercent(stockData.ProfitMargin || 0)} />
                  <MetricCard label="Debt-to-Equity" value={stockData.DebtToEquity} />
                  <MetricCard label="ROE" value={formatPercent(stockData.ReturnOnEquityTTM || 0)} />
                  <MetricCard label="Dividend Yield" value={formatPercent(stockData.DividendYield || 0)} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Learn Key Indicators</h2>
            <p>Educational content about financial metrics will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
      <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value || 'N/A'}</div>
    </div>
  );
}

export default App;
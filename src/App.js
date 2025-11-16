import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Loader, LogIn, LogOut, User } from 'lucide-react';
import { stockAPI } from './services/api';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import './App.css';

function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
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

  const stockCategories = {
    'Tech Giants': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA'],
    'Finance': ['JPM', 'BAC', 'GS', 'WFC', 'MS', 'V'],
    'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK'],
    'Consumer': ['WMT', 'HD', 'NKE', 'SBUX', 'MCD', 'DIS'],
    'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PSX']
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid #334155', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BarChart3 size={32} color="#60a5fa" />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>InvestorIQ</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Market Analysis</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <User size={18} color="#60a5fa" />
                  <span style={{ fontSize: '0.875rem', color: '#60a5fa' }}>{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#475569',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <LogIn size={16} />
                Login / Sign Up
              </button>
            )}
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
    {/* Federal Reserve & Economic Indicators */}
    <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={28} color="#60a5fa" />
        Federal Reserve & Economic Indicators
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {[
          { name: 'Federal Funds Rate', value: '5.25%', change: '+0.25%', status: 'up', description: 'Target interest rate set by the Federal Reserve' },
          { name: 'Inflation Rate (CPI)', value: '3.2%', change: '-0.3%', status: 'down', description: 'Consumer Price Index year-over-year change' },
          { name: 'Unemployment Rate', value: '3.8%', change: '+0.1%', status: 'up', description: 'Percentage of labor force without jobs' },
          { name: 'GDP Growth', value: '2.4%', change: '+0.2%', status: 'up', description: 'Quarterly economic growth rate (annualized)' },
          { name: '10-Year Treasury', value: '4.35%', change: '-0.15%', status: 'down', description: 'U.S. government 10-year bond yield' },
          { name: 'Consumer Confidence', value: '102.6', change: '+3.2', status: 'up', description: 'Index measuring consumer optimism' }
        ].map((indicator, idx) => (
          <div key={idx} style={{ background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, fontWeight: '500' }}>{indicator.name}</h3>
              {indicator.status === 'up' ? (
                <TrendingUp size={18} color="#f87171" />
              ) : (
                <TrendingDown size={18} color="#34d399" />
              )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{indicator.value}</div>
            <div style={{ fontSize: '0.875rem', color: indicator.status === 'up' ? '#f87171' : '#34d399', marginBottom: '0.75rem', fontWeight: '600' }}>
              {indicator.change}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>{indicator.description}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Major Market Indices */}
    <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp size={28} color="#34d399" />
        Major Market Indices
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { name: 'S&P 500', value: '4,567.89', change: '+1.2%', points: '+54.32', status: 'up' },
          { name: 'Dow Jones', value: '35,421.32', change: '+0.8%', points: '+281.45', status: 'up' },
          { name: 'NASDAQ', value: '14,238.76', change: '+1.5%', points: '+210.89', status: 'up' },
          { name: 'Russell 2000', value: '1,856.43', change: '+0.6%', points: '+11.05', status: 'up' },
          { name: 'VIX (Volatility)', value: '14.2', change: '-2.1%', points: '-0.30', status: 'down' },
          { name: 'Crude Oil', value: '$78.45', change: '+1.8%', points: '+1.39', status: 'up' }
        ].map((index, idx) => (
          <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem', fontWeight: '500' }}>{index.name}</h3>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{index.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: index.status === 'up' ? '#34d399' : '#f87171', fontWeight: '600' }}>
              {index.status === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{index.change}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({index.points})</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Market Summary */}
    <div style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
        <AlertCircle size={24} color="#60a5fa" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
        <div>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.125rem' }}>Market Summary</h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
            Markets are showing positive momentum with all major indices trading higher. 
            The Federal Reserve's current monetary policy stance continues to influence market dynamics. 
            Economic indicators suggest moderate growth with inflation trending downward. 
            Investors should monitor upcoming Fed meetings and economic data releases for potential market-moving events.
          </p>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0 }}>
              💡 <strong>Tip:</strong> Market data updates daily. For real-time integration, we can connect to Federal Reserve Economic Data (FRED) API and market data providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}



        {activeTab === 'company' && (
          <div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #334155' }}>
              {Object.entries(stockCategories).map(([category, stocks]) => (
                <div key={category} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#60a5fa', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {stocks.map(symbol => (
                      <button
                        key={symbol}
                        onClick={() => setSelectedStock(symbol)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.25rem',
                          border: selectedStock === symbol ? '2px solid #60a5fa' : '1px solid #475569',
                          background: selectedStock === symbol ? '#2563eb' : '#334155',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: selectedStock === symbol ? '600' : '400',
                          transition: 'all 0.2s'
                        }}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #475569' }}>
                <button
                  onClick={() => fetchStockData(selectedStock)}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: loading ? '#6b7280' : '#059669',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  {loading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
                  {loading ? 'Loading...' : 'Refresh Data'}
                </button>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Selected: <span style={{ color: '#60a5fa', fontWeight: '600', fontSize: '1rem' }}>{selectedStock}</span>
                </div>
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
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Market Cap</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatMarketCap(stockData.MarketCapitalization)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>P/E Ratio</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stockData.PERatio}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Symbol</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stockData.Symbol}</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={24} color="#fbbf24" />
                  Key Financial Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <MetricCard label="EPS (Earnings Per Share)" value={`$${stockData.EPS}`} />
                  <MetricCard label="Revenue Growth (YoY)" value={formatPercent(stockData.QuarterlyRevenueGrowthYOY || 0)} />
                  <MetricCard label="Profit Margin" value={formatPercent(stockData.ProfitMargin || 0)} />
                  <MetricCard label="Debt-to-Equity Ratio" value={stockData.DebtToEquity} />
                  <MetricCard label="ROE (Return on Equity)" value={formatPercent(stockData.ReturnOnEquityTTM || 0)} />
                  <MetricCard label="Dividend Yield" value={formatPercent(stockData.DividendYield || 0)} />
                  <MetricCard label="Current Ratio" value={stockData.CurrentRatio} />
                  <MetricCard label="Book Value" value={`$${stockData.BookValue || 'N/A'}`} />
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

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
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
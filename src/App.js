import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Loader, LogIn, LogOut, User, Star } from 'lucide-react';
import { stockAPI, marketAPI, watchlistAPI, alertsAPI, portfolioAPI } from './services/api';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import StockChart from './components/StockChart';
import Education from './components/Education';
import MarketDashboard from './components/MarketDashboard';
import SchedulerAdmin from './components/SchedulerAdmin';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import Portfolio from './components/Portfolio';
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
  const [fredData, setFredData] = useState(null);
  const [fredLoading, setFredLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
const [liveIndices, setLiveIndices] = useState(null);  
const [indicesLoading, setIndicesLoading] = useState(false);  
const [inWatchlist, setInWatchlist] = useState(false); 

// Set page title
  useEffect(() => {
    document.title = 'InvestorIQ - Professional Financial Analysis';
  }, []);



 const fetchStockData = async (symbol) => {
  setLoading(true);
  setError(null);
  try {
    // Fetch both price data and company fundamentals
    const [priceData, companyData] = await Promise.all([
      stockAPI.getStockData(symbol),
      stockAPI.getCompanyInfo(symbol)
    ]);
    
    // Merge the data
    const mergedData = {
      ...priceData,
      ...companyData,
      // Map company API fields to what the display expects
Symbol: priceData.symbol,
  CurrentPrice: priceData.currentPrice,
  High: companyData.week52High,  
  Low: companyData.week52Low,    
      MarketCapitalization: companyData.marketCap,
      PERatio: companyData.peRatio,
      EPS: companyData.eps,
      ProfitMargin: companyData.profitMargin,
      DebtToEquity: companyData.debtToEquity,
      ReturnOnEquityTTM: companyData.roe,
      DividendYield: companyData.dividendYield,
      CurrentRatio: companyData.currentRatio,
      BookValue: companyData.bookValue
    };
    
    setStockData(mergedData);
  } catch (err) {
    setError(err.message);
    setStockData(getDemoStockData(symbol));
  } finally {
    setLoading(false);
  }
};

  const fetchFREDData = async () => {
    setFredLoading(true);
    try {
      const data = await marketAPI.getFREDIndicators();
      setFredData(data);
    } catch (err) {
      console.error('Failed to fetch FRED data:', err);
    } finally {
      setFredLoading(false);
    }
  };

  const fetchPriceData = async (symbol, timeframe) => {
    setPriceLoading(true);
    try {
      const data = await stockAPI.getPriceData(symbol, timeframe);
      setPriceData(data);
    } catch (err) {
      console.error('Failed to fetch price data:', err);
      setPriceData(null);
    } finally {
      setPriceLoading(false);
    }
  };

const fetchLiveIndices = async () => {
  setIndicesLoading(true);
  try {
    const data = await marketAPI.getLiveIndices();
    setLiveIndices(data);
  } catch (err) {
    console.error('Failed to fetch live indices:', err);
  } finally {
    setIndicesLoading(false);
  }
};

// ← ADD THESE NEW FUNCTIONS HERE
const checkWatchlist = async (symbol) => {
  if (!isAuthenticated || !user) {
    setInWatchlist(false);
    return;
  }
  
  try {
    const result = await watchlistAPI.checkWatchlist(user.id, symbol);
    setInWatchlist(result.inWatchlist);
  } catch (err) {
    console.error('Failed to check watchlist:', err);
    setInWatchlist(false);
  }
};

const toggleWatchlist = async () => {
  if (!isAuthenticated || !user) {
    alert('Please log in to use the watchlist feature');
    setShowAuth(true);
    return;
  }

  try {
    if (inWatchlist) {
      await watchlistAPI.removeFromWatchlist(user.id, selectedStock);
      setInWatchlist(false);
      alert(`${selectedStock} removed from watchlist`);
    } else {
      await watchlistAPI.addToWatchlist(user.id, selectedStock);
      setInWatchlist(true);
      alert(`${selectedStock} added to watchlist`);
    }
  } catch (err) {
    console.error('Failed to toggle watchlist:', err);
    alert('Failed to update watchlist');
  }
};

 useEffect(() => {
  if (activeTab === 'company') {
    fetchStockData(selectedStock);
    fetchPriceData(selectedStock, selectedTimeframe);
    checkWatchlist(selectedStock);
  }
}, [selectedStock, activeTab, selectedTimeframe, user]);

  useEffect(() => {
  if (activeTab === 'market') {
    if (!fredData) fetchFREDData();
    if (!liveIndices) fetchLiveIndices();
  }
}, [activeTab]);

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
  return `${parseFloat(value).toFixed(2)}%`;
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
      


<div style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid #334155', padding: '0.75rem 1rem' }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Logo and Title Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src="/images/offbeet-logo.jpeg" 
          alt="Offbeet Tech Logo" 
          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>InvestorIQ</h1>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>
            by <span style={{ color: '#60a5fa', fontWeight: '600' }}>Offbeet Media and Tech Inc.</span>
          </p>
        </div>
      </div>
      
      {/* Auth Button Row - Full Width on Mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 0.75rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              flex: 1,
              overflow: 'hidden'
            }}>
              <User size={16} color="#60a5fa" />
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#475569',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#2563eb',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
</div>



      <div style={{ maxWidth: '1200px', margin: '1rem auto', padding: '0 1rem' }}>

        <div className="tabs-container tab-scroll-container" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '2rem' }}>

          {['market', 'company', 'portfolio', 'watchlist', 'education', 'settings'].map(tab => (
           
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
            {/* Market Dashboard */}
            <MarketDashboard currentIndicators={fredData} />

            {/* Federal Reserve & Economic Indicators */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155', marginBottom: '2rem', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={28} color="#60a5fa" />
                Federal Reserve & Economic Indicators
                <button
                  onClick={fetchFREDData}
                  disabled={fredLoading}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.5rem 1rem',
                    background: '#059669',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: fredLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {fredLoading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
                  Refresh
                </button>
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {fredLoading ? (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader size={48} color="#60a5fa" className="spin" />
                  </div>
                ) : fredData ? (
                  <>
                    {[
                      { key: 'Federal Funds Rate', description: 'Target interest rate set by the Federal Reserve', format: (v) => `${v.toFixed(2)}%` },
                      { key: 'Inflation Rate (CPI)', description: 'Consumer Price Index (annual change)', format: (v) => `${v.toFixed(1)}` },
                      { key: 'Unemployment Rate', description: 'Percentage of labor force without jobs', format: (v) => `${v.toFixed(1)}%` },
                      { key: 'GDP Growth', description: 'Quarterly economic growth rate (annualized)', format: (v) => `${v.toFixed(1)}%` },
                      { key: '10-Year Treasury', description: 'U.S. government 10-year bond yield', format: (v) => `${v.toFixed(2)}%` },
                      { key: 'Consumer Confidence', description: 'Index measuring consumer optimism', format: (v) => v.toFixed(1) },
{ key: 'Retail Sales', description: 'Monthly retail and food services sales', format: (v) => `$${(v / 1000).toFixed(0)}B` },
  { key: 'Housing Starts', description: 'New residential construction starts', format: (v) => `${v.toFixed(0)}K` }


                    ].map((config, idx) => {
                      const indicator = fredData[config.key];
                      if (!indicator) return null;
                      
                      return (
                        <div key={idx} style={{ background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, fontWeight: '500' }}>{config.key}</h3>
                            {indicator.status === 'up' ? (
                              <TrendingUp size={18} color="#f87171" />
                            ) : (
                              <TrendingDown size={18} color="#34d399" />
                            )}
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {config.format(indicator.value)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: indicator.status === 'up' ? '#f87171' : '#34d399', marginBottom: '0.75rem', fontWeight: '600' }}>
                            {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>{config.description}</p>
                          <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>
                            Updated: {new Date(indicator.date).toLocaleDateString()}
                          </p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#94a3b8' }}>Unable to load data. Please refresh.</p>
                  </div>
                )}
              </div>
            </div>


{/* Major Market Indices */}
<div style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155', marginBottom: '2rem' }}>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <TrendingUp size={28} color="#34d399" />
    Major Market Indices
    <button
      onClick={fetchLiveIndices}
      disabled={indicesLoading}
      style={{
        marginLeft: 'auto',
        padding: '0.5rem 1rem',
        background: '#059669',
        border: 'none',
        borderRadius: '0.5rem',
        color: 'white',
        cursor: indicesLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem'
      }}
    >
      {indicesLoading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
      Refresh
    </button>
  </h2>
  
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
    {indicesLoading ? (
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader size={48} color="#60a5fa" className="spin" />
      </div>
    ) : liveIndices && Object.keys(liveIndices).length > 0 ? (
      Object.values(liveIndices).map((index, idx) => (
        <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem', fontWeight: '500' }}>{index.name}</h3>
          

<div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
  {['Crude Oil', 'Gold', 'Bitcoin'].includes(index.name) ? `$${index.value}` : index.value}
</div>


          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: index.status === 'up' ? '#34d399' : '#f87171', fontWeight: '600' }}>
            {index.status === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{parseFloat(index.change) > 0 ? '+' : ''}{parseFloat(index.change).toFixed(2)}%</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({index.points})</span>
          </div>
          <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>
            Updated: {index.lastUpdated || 'Live'}
          </p>
        </div>
      ))
    ) : (
      // Fallback to static data if API fails
      [
        { name: 'S&P 500', value: '4,567.89', change: '+1.2%', points: '+54.32', status: 'up' },
        { name: 'Dow Jones', value: '35,421.32', change: '+0.8%', points: '+281.45', status: 'up' },
        { name: 'NASDAQ', value: '14,238.76', change: '+1.5%', points: '+210.89', status: 'up' }
      ].map((index, idx) => (
        <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem', fontWeight: '500' }}>{index.name}</h3>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{index.value}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: index.status === 'up' ? '#34d399' : '#f87171', fontWeight: '600' }}>
            {index.status === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{index.change}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({index.points})</span>
          </div>
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem', margin: 0 }}>
            Static fallback data
          </p>
        </div>
      ))
    )}
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
                    Economic indicators suggest moderate growth with inflation trending. 
                    Investors should monitor upcoming Fed meetings and economic data releases for potential market-moving events.
                  </p>
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0 }}>
                      💡 <strong>Live Data:</strong> Federal Reserve indicators are updated directly from FRED API with real-time economic data.
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>{stockData.Name}</h2>
        <button
          onClick={toggleWatchlist}
          style={{
            padding: '0.75rem',
            background: inWatchlist ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: inWatchlist ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          <Star size={20} color={inWatchlist ? '#fbbf24' : 'white'} fill={inWatchlist ? '#fbbf24' : 'none'} />
          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>
                  <div style={{ display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
  gap: '1.5rem' 
}}>

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
                






                {/* CHART SECTION */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {['daily', 'weekly', 'monthly'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: selectedTimeframe === tf ? '2px solid #60a5fa' : '1px solid #475569',
                          background: selectedTimeframe === tf ? 'rgba(96, 165, 250, 0.2)' : '#334155',
                          color: selectedTimeframe === tf ? '#60a5fa' : '#cbd5e1',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: selectedTimeframe === tf ? '600' : '400',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {priceLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                      <Loader size={48} color="#60a5fa" className="spin" />
                    </div>
                  ) : priceData ? (
                    <StockChart
                      priceData={priceData.data}
                      performance={priceData.performance}
                      symbol={selectedStock}
                      timeframe={selectedTimeframe}
                    />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      Click a timeframe to load price data
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={24} color="#fbbf24" />
                  Key Financial Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <MetricCard label="EPS (Earnings Per Share)" value={`$${stockData.EPS}`} />
                 
<MetricCard label="Revenue Per Share" value={`$${stockData.revenuePerShareTTM || 'N/A'}`} />

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


{activeTab === 'watchlist' && (
  <div>
    <Watchlist 
      user={user} 
      onStockClick={(symbol) => {
        setSelectedStock(symbol);
        setActiveTab('company');
      }}
    />
  </div>
)}

{activeTab === 'portfolio' && (
  <div>
    <Portfolio user={user} />
  </div>
)}

{activeTab === 'education' && (
  <Education fredData={fredData} />
)}

        {activeTab === 'education' && (
          <Education fredData={fredData} />
        )}

        {activeTab === 'settings' && (
  <div>
    <SchedulerAdmin />
    
    {/* Add Email Alerts Section */}
    <div style={{ marginTop: '2rem' }}>
      <Alerts user={user} />
    </div>
  </div>
)}
     </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* Footer */}
      <footer style={{ 
        background: 'rgba(15, 23, 42, 0.95)', 
        borderTop: '1px solid #334155', 
        marginTop: '4rem',
        padding: '2rem 2rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Company Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <img 
                  src="/images/offbeet-logo.jpeg" 
                  alt="Offbeet Tech Logo" 
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>Offbeet Tech</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Media and Technology</p>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                Empowering investors with professional-grade financial analysis tools and real-time market data.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.875rem' }}>
                <span>✉️</span>
                <a href="mailto:info@sportee.us" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                  info@sportee.us
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} Offbeet Media and Tech Inc. All rights reserved.
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>
              Built with ❤️ for informed investors
            </p>
          </div>

          {/* Disclaimer */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.75rem', lineHeight: '1.5' }}>
              <strong>Investment Disclaimer:</strong> This tool is for informational and educational purposes only. 
              It does not constitute financial advice. Always conduct your own research and consult with a qualified 
              financial advisor before making investment decisions. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </footer>
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
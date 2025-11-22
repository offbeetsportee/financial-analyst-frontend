import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Loader, LogIn, LogOut, User, Star, Calculator } from 'lucide-react';
import { stockAPI, marketAPI, watchlistAPI, alertsAPI, portfolioAPI, preferencesAPI } from './services/api';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import StockChart from './components/StockChart';
import Education from './components/Education';
import MarketDashboard from './components/MarketDashboard';
import SchedulerAdmin from './components/SchedulerAdmin';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import Portfolio from './components/Portfolio';
import StockSearch from './components/StockSearch';
import StockComparison from './components/StockComparison';
import Preferences from './components/Preferences';
import StockNews from './components/StockNews';
import TechnicalIndicators from './components/TechnicalIndicators';
import SectorAnalysis from './components/SectorAnalysis';
import SocialSentiment from './components/SocialSentiment';
import AIChat from './components/AIChat';
import OptionsChainExplorer from './components/OptionsChainExplorer';
import OptionsStrategyBuilder from './components/OptionsStrategyBuilder';
import OptionsScreener from './components/OptionsScreener';
import IVCrushPredictor from './components/IVCrushPredictor'; 
import CompanyAnalysis from './components/CompanyAnalysis';  // ✅ FIXED PATH
import './App.css';

function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
 const [activeTab, setActiveTab] = useState(null);  // Start as null
const [preferencesLoaded, setPreferencesLoaded] = useState(false);
const [userPreferences, setUserPreferences] = useState(null);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [optionsSubTab, setOptionsSubTab] = useState('chain');
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
const [portfolioData, setPortfolioData] = useState(null);
const [aiChatData, setAiChatData] = useState({
  stockData: null,
  socialSentiment: null,
  sectorAnalysis: null,
  marketConditions: null
});

  useEffect(() => {
    document.title = 'InvestorIQ - Professional Financial Analysis';
  }, []);

// Load user preferences on login
useEffect(() => {
  const loadPreferences = async () => {
    if (user && isAuthenticated) {
      try {
        const prefs = await preferencesAPI.getPreferences(user.id);
        setUserPreferences(prefs);
        
        // Apply default tab
        if (prefs.default_tab) {
          setActiveTab(prefs.default_tab);
        } else {
          setActiveTab('market');  // Fallback to market
        }
        
        // Apply default timeframe
        if (prefs.default_timeframe) {
          setSelectedTimeframe(prefs.default_timeframe);
        }
        
        setPreferencesLoaded(true);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setActiveTab('market');  // Fallback on error
        setPreferencesLoaded(true);
      }
    } else {
      // Not logged in, default to market
      setActiveTab('market');
      setPreferencesLoaded(true);
    }
  };
  
  loadPreferences();
}, [user?.id, isAuthenticated]);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const [priceData, companyData] = await Promise.all([
        stockAPI.getStockData(symbol),
        stockAPI.getCompanyInfo(symbol)
      ]);
      
      const mergedData = {
        ...priceData,
        ...companyData,
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
  if (activeTab === 'company' && selectedStock) {
    fetchStockData(selectedStock);
    fetchPriceData(selectedStock, selectedTimeframe);
    checkWatchlist(selectedStock);
    
    // Fetch AI context data
    fetchAIChatData(selectedStock);
  }
}, [selectedStock, activeTab, selectedTimeframe, user]);

// Add this new function
const fetchAIChatData = async (symbol) => {
  try {
    const [social, sector, portfolio] = await Promise.all([
      stockAPI.getSocialSentiment(symbol).catch(() => null),
      stockAPI.getSectorData(symbol).catch(() => null),
      fetchPortfolioForAI().catch(() => null)
    ]);
    
    setPortfolioData(portfolio);
    
    setAiChatData({
      stockData: stockData,
      socialSentiment: social,
      sectorAnalysis: sector,
      marketConditions: {
        fedIndicators: fredData,
        indices: liveIndices
      }
    });
  } catch (err) {
    console.error('Failed to fetch AI context:', err);
  }
};

const fetchPortfolioForAI = async () => {
  console.log('🔍 fetchPortfolioForAI called');
  
  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated');
    return null;
  }
  
  try {
    console.log('📡 Fetching portfolios for user:', user.id);
    const portfolios = await portfolioAPI.getPortfolios(user.id);
    console.log('📊 Raw portfolios response:', portfolios);
    
    if (!portfolios || portfolios.length === 0) {
      console.log('❌ No portfolios found');
      return null;
    }
    
    const mainPortfolio = portfolios[0];
    console.log('✅ Main portfolio:', mainPortfolio);
    
    // Fetch FULL portfolio details with holdings
    console.log('📡 Fetching portfolio details for ID:', mainPortfolio.id);
    const portfolioDetails = await portfolioAPI.getPortfolioDetails(user.id, mainPortfolio.id);
    console.log('📊 Portfolio details:', portfolioDetails);
    
    // Extract holdings
    const holdings = portfolioDetails?.holdings || [];
    
    if (!holdings || holdings.length === 0) {
      console.log('❌ No holdings found in portfolio');
      return null;
    }
    
    console.log(`✅ Found ${holdings.length} holdings`);
    
    // Map holdings to AI format
    const mappedHoldings = holdings.map(holding => ({
      symbol: holding.symbol,
      shares: holding.shares,
      purchasePrice: holding.purchase_price || 0,
      currentPrice: holding.current_price || holding.purchase_price || 0,
      currentValue: (holding.current_price || holding.purchase_price || 0) * holding.shares,
      totalCost: (holding.purchase_price || 0) * holding.shares,
      gainLoss: ((holding.current_price || holding.purchase_price || 0) - (holding.purchase_price || 0)) * holding.shares
    }));

    const totalValue = mappedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = mappedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGain = totalValue - totalCost;
    const totalReturn = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    const result = {
      id: mainPortfolio.id,
      name: mainPortfolio.name,
      holdings: mappedHoldings,
      totalValue: totalValue,
      totalCost: totalCost,
      performance: {
        totalGain: totalGain,
        totalReturn: totalReturn
      }
    };
    
    console.log('✅ Portfolio ready for AI:', result);
    return result;
    
  } catch (err) {
    console.error('❌ Portfolio fetch error:', err);
    console.error('Error details:', err.message);
    return null;
  }
};


  useEffect(() => {
    if (activeTab === 'market') {
      if (!fredData) fetchFREDData();
      if (!liveIndices) fetchLiveIndices();
    }
  }, [activeTab]);

// ADD THIS NEW useEffect FOR PORTFOLIO TAB
useEffect(() => {
  if (activeTab === 'portfolio' && isAuthenticated && user) {
    console.log('Fetching portfolio for AI...');
    fetchPortfolioForAI().then(portfolio => {
      console.log('Portfolio fetched:', portfolio);
      setPortfolioData(portfolio);
    }).catch(err => {
      console.error('Portfolio fetch failed:', err);
    });
  }
}, [activeTab, isAuthenticated, user?.id]);  // Add user?.id to dependencies


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
      
      {/* Search Bar Row - NEW! */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <StockSearch 
          onSelectStock={(symbol) => {
            setSelectedStock(symbol);
            setActiveTab('company');
          }}
          placeholder="Search stocks (e.g., AAPL, Tesla)..."
        />
      </div>

      {/* Auth Button Row */}
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

 {/* Mobile Tip - ADD THIS */}
      <div style={{ 
        display: 'block',
        fontSize: '0.7rem', 
        color: '#64748b',
        textAlign: 'center',
        padding: '0.25rem'
      }}>
        <span style={{ display: 'inline-block' }}>
          💡 Swipe tabs left/right
        </span>
      </div>

    </div>
  </div>
</div>

      <div style={{ maxWidth: '1200px', margin: '1rem auto', padding: '0 1rem' }}>
        <div className="tabs-container tab-scroll-container" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '2rem' }}>
         {['market', 'company', 'compare', 'options', 'iv-crush', 'portfolio', 'watchlist', 'education', 'settings'].map(tab => (
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
            {tab === 'iv-crush' ? 'IV Crush' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'market' && (
          <div>
            <MarketDashboard currentIndicators={fredData} />

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
                  Object.values(liveIndices).map((index, idx) => {
                    const isUp = parseFloat(index.changePercent) >= 0;
                    const needsDollar = ['Crude Oil', 'Gold', 'Bitcoin'].includes(index.name);
                    
                    return (
                      <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #475569' }}>
                        <h3 style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem', fontWeight: '500' }}>{index.name}</h3>
                        
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {index.price ? (needsDollar ? `$${index.price.toFixed(2)}` : index.price.toFixed(2)) : 'N/A'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: isUp ? '#34d399' : '#f87171', fontWeight: '600' }}>
                          {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          <span>{isUp ? '+' : ''}{parseFloat(index.changePercent).toFixed(2)}%</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            ({isUp ? '+' : ''}{parseFloat(index.change).toFixed(2)})
                          </span>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>
                          Updated: Live
                        </p>
                      </div>
                    );
                  })
                ) : (
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

        {/* ✅ UPDATED COMPANY TAB - OPTION 1: BEST OF BOTH WORLDS */}
        {activeTab === 'company' && (
          <div>
            {/* Stock Category Selector - KEEP THIS */}
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
            </div>

            {/* ✅ NEW: CompanyAnalysis Component - 5 Comprehensive Tabs (includes Price Chart) */}
            <CompanyAnalysis symbol={selectedStock} />
          </div>
        )}

{activeTab === 'compare' && (
  <div>
    <StockComparison />
  </div>
)}

{activeTab === 'options' && (
  <div>
    {/* Options Sub-tabs */}
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '1.5rem',
      borderBottom: '1px solid #334155',
      paddingBottom: '0.5rem',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      <button
        onClick={() => setOptionsSubTab('chain')}
        style={{
          padding: '0.75rem 1.25rem',
          background: optionsSubTab === 'chain' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
          border: optionsSubTab === 'chain' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #475569',
          borderRadius: '0.5rem',
          color: optionsSubTab === 'chain' ? '#c4b5fd' : '#94a3b8',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => optionsSubTab !== 'chain' && (e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)')}
        onMouseLeave={(e) => optionsSubTab !== 'chain' && (e.currentTarget.style.background = 'transparent')}
      >
        📊 Options Chain
      </button>

       
      {/* ADD THE SCREENER BUTTON HERE ⬇️ RIGHT AFTER THE OPTIONS CHAIN BUTTON */}
      <button
        onClick={() => setOptionsSubTab('screener')}
        style={{
          padding: '0.75rem 1.25rem',
          background: optionsSubTab === 'screener' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
          border: optionsSubTab === 'screener' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #475569',
          borderRadius: '0.5rem',
          color: optionsSubTab === 'screener' ? '#93c5fd' : '#94a3b8',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => optionsSubTab !== 'screener' && (e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)')}
        onMouseLeave={(e) => optionsSubTab !== 'screener' && (e.currentTarget.style.background = 'transparent')}
      >
        🔍 Screener
      </button>
      {/* ⬆️ SCREENER BUTTON ENDS HERE */}
      <button
        onClick={() => setOptionsSubTab('strategy')}
        style={{
          padding: '0.75rem 1.25rem',
          background: optionsSubTab === 'strategy' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
          border: optionsSubTab === 'strategy' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #475569',
          borderRadius: '0.5rem',
          color: optionsSubTab === 'strategy' ? '#c4b5fd' : '#94a3b8',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => optionsSubTab !== 'strategy' && (e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)')}
        onMouseLeave={(e) => optionsSubTab !== 'strategy' && (e.currentTarget.style.background = 'transparent')}
      >
        🧮 Strategy Builder
      </button>
    </div>

{/* Options Content */}
    <>
      {optionsSubTab === 'chain' && !selectedStock && (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <Activity size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
            Select a Stock for Options Analysis
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Use the search bar above to find a stock with options data
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['AAPL', 'TSLA', 'SPY', 'NVDA', 'AMZN', 'GOOGL'].map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  setSelectedStock(symbol);
                  fetchStockData(symbol);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#c4b5fd',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {optionsSubTab === 'chain' && selectedStock && (
        <OptionsChainExplorer 
          symbol={selectedStock}
          underlyingPrice={stockData?.currentPrice || stockData?.CurrentPrice || 0}
        />
      )}

      {optionsSubTab === 'screener' && (
        <OptionsScreener 
          onAddToBuilder={(option) => {
            setOptionsSubTab('strategy');
            setSelectedStock(option.symbol);
            fetchStockData(option.symbol);
          }}
        />
      )}

      {optionsSubTab === 'strategy' && !selectedStock && (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <Calculator size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
            Select a Stock to Build Strategy
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Use the search bar or screener to find options
          </p>
          <button
            onClick={() => setOptionsSubTab('screener')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Go to Screener
          </button>
        </div>
      )}

      {optionsSubTab === 'strategy' && selectedStock && (
        <OptionsStrategyBuilder 
          symbol={selectedStock}
          underlyingPrice={stockData?.currentPrice || stockData?.CurrentPrice || 0}
        />
      )}
    </>
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
  {/* ADD AI CHAT IN PORTFOLIO TAB TOO */}
    {isAuthenticated && (
      <AIChat
        symbol={null}
        portfolio={portfolioData}
        stockData={null}
        socialSentiment={null}
        sectorAnalysis={null}
        marketConditions={{
          fedIndicators: fredData,
          indices: liveIndices
        }}
      />
    )}

{/* Loading message if portfolio not fetched yet */}
    {isAuthenticated && !portfolioData && (
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.9)',
        borderRadius: '0.5rem',
        fontSize: '0.875rem'
      }}>
        Loading AI advisor...
      </div>
    )}

          </div>
        )}
        {activeTab === 'iv-crush' && (
  <div>
    <IVCrushPredictor symbol={selectedStock} />
  </div>
)}



        {activeTab === 'education' && (
          <Education fredData={fredData} />
        )}

       {activeTab === 'settings' && (
  <div>
    <Preferences 
      user={user}
      onPreferencesChange={(prefs) => {
        // Apply preferences immediately
        if (prefs.default_timeframe) {
          setSelectedTimeframe(prefs.default_timeframe);
        }
      }}
    />
    
    <div style={{ marginTop: '2rem' }}>
      <SchedulerAdmin />
    </div>
    
    <div style={{ marginTop: '2rem' }}>
      <Alerts user={user} />
    </div>
  </div>
)}
      
</div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

 {/* AI Chat Assistant - ADD THIS */}
    {isAuthenticated && activeTab === 'company' && (
  <AIChat
    symbol={selectedStock}
    portfolio={portfolioData}  // CHANGE FROM null TO portfolioData
    stockData={aiChatData.stockData || stockData}
    socialSentiment={aiChatData.socialSentiment}
    sectorAnalysis={aiChatData.sectorAnalysis}
    marketConditions={aiChatData.marketConditions}
  />
)}

      <footer style={{ 
        background: 'rgba(15, 23, 42, 0.95)', 
        borderTop: '1px solid #334155', 
        marginTop: '4rem',
        padding: '2rem 2rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
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
import React, { useState, useEffect, useRef } from 'react';
import {
  Filter, Search, TrendingUp, DollarSign, Zap, Clock,
  ChevronDown, ChevronUp, Plus, X, Save, Download,
  RefreshCw, AlertCircle, BarChart3, Activity, Sparkles,
  ArrowUpDown, Eye, Settings, Loader, HelpCircle, MessageCircle
} from 'lucide-react';

const OptionsScreener = ({ onAddToBuilder }) => {
  const [activeScreen, setActiveScreen] = useState(null);
  const [showCustomFilters, setShowCustomFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'premium', direction: 'desc' });
  const [savedScreens, setSavedScreens] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showHelp, setShowHelp] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Custom Filters State
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 1000,
    volumeMin: 100000,
    ivRankMin: 0,
    ivRankMax: 100,
    dteMin: 7,
    dteMax: 90,
    strikeDistance: 'all',
    optionType: 'all',
    premiumMin: 0,
    premiumMax: 50,
    deltaMin: 0,
    deltaMax: 1,
    strategy: 'all'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('savedScreens');
    if (saved) {
      try {
        setSavedScreens(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved screens:', e);
      }
    }
  }, []);

  const PRE_BUILT_SCREENS = {
    'high_iv': {
      name: 'High IV Premium',
      description: 'High implied volatility for premium selling',
      icon: '🔥',
      color: '#ef4444',
      filters: {
        ivRankMin: 70,
        volumeMin: 500000,
        dteMin: 30,
        dteMax: 45,
        premiumMin: 2
      }
    },
    'covered_calls': {
      name: 'Best Covered Calls',
      description: 'High premium OTM calls for income',
      icon: '💰',
      color: '#10b981',
      filters: {
        optionType: 'calls',
        strikeDistance: 'OTM',
        dteMin: 30,
        dteMax: 45,
        premiumMin: 1.5,
        deltaMin: 0.2,
        deltaMax: 0.4
      }
    },
    'cash_secured_puts': {
      name: 'Cash-Secured Puts',
      description: 'Get paid to buy stocks you want',
      icon: '🎯',
      color: '#3b82f6',
      filters: {
        optionType: 'puts',
        strikeDistance: 'OTM',
        dteMin: 30,
        dteMax: 45,
        premiumMin: 1,
        deltaMin: 0.2,
        deltaMax: 0.35
      }
    },
    'cheap_lottery': {
      name: 'Cheap Lottery Tickets',
      description: 'OTM options under $1',
      icon: '🎰',
      color: '#f59e0b',
      filters: {
        premiumMax: 1,
        strikeDistance: 'OTM',
        dteMin: 7,
        dteMax: 30
      }
    },
    'weekly_income': {
      name: 'Weekly Income',
      description: 'Short-term premium collection',
      icon: '⚡',
      color: '#8b5cf6',
      filters: {
        dteMin: 3,
        dteMax: 7,
        premiumMin: 0.5,
        ivRankMin: 50
      }
    },
    'momentum_calls': {
      name: 'Momentum Calls',
      description: 'High delta calls on trending stocks',
      icon: '🚀',
      color: '#ec4899',
      filters: {
        optionType: 'calls',
        deltaMin: 0.6,
        deltaMax: 0.8,
        dteMin: 30,
        dteMax: 60
      }
    },
    'earnings_plays': {
      name: 'Earnings Plays',
      description: 'High IV before earnings',
      icon: '📊',
      color: '#06b6d4',
      filters: {
        ivRankMin: 80,
        dteMin: 7,
        dteMax: 21,
        premiumMin: 2
      }
    },
    'deep_value_puts': {
      name: 'Deep Value Puts',
      description: 'Cheap protective puts',
      icon: '🛡️',
      color: '#14b8a6',
      filters: {
        optionType: 'puts',
        premiumMax: 2,
        strikeDistance: 'OTM',
        dteMin: 45,
        dteMax: 90
      }
    }
  };

  const runScreen = async (screenKey) => {
    setActiveScreen(screenKey);
    setLoading(true);
    
    const screenFilters = PRE_BUILT_SCREENS[screenKey].filters;
    
    try {
      const response = await fetch(`${API_URL}/options/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenFilters)
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setResults(data.results || generateMockResults(screenFilters));
    } catch (error) {
      console.error('Screen error:', error);
      setResults(generateMockResults(screenFilters));
    } finally {
      setLoading(false);
    }
  };

  const runCustomScreen = async () => {
    setActiveScreen('custom');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/options/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setResults(data.results || generateMockResults(filters));
    } catch (error) {
      console.error('Custom screen error:', error);
      setResults(generateMockResults(filters));
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (filterConfig) => {
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'SPY', 'QQQ'];
    const results = [];
    
    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = filterConfig.optionType === 'all' 
        ? (Math.random() > 0.5 ? 'call' : 'put')
        : filterConfig.optionType === 'calls' ? 'call' : 'put';
      
      const strike = 100 + (Math.random() * 200);
      
      // Fix premium calculation - ensure valid range
      const premiumMin = parseFloat(filterConfig.premiumMin) || 0;
      const premiumMax = parseFloat(filterConfig.premiumMax) || 50;
      const premium = premiumMin + (Math.random() * (premiumMax - premiumMin));
      
      const dteMin = parseInt(filterConfig.dteMin) || 7;
      const dteMax = parseInt(filterConfig.dteMax) || 90;
      const dte = dteMin + Math.floor(Math.random() * (dteMax - dteMin));
      
      results.push({
        symbol,
        type,
        strike: strike.toFixed(2),
        premium: premium.toFixed(2),
        dte,
        ivRank: 50 + Math.floor(Math.random() * 50),
        volume: Math.floor(Math.random() * 1000000),
        delta: (Math.random() * 0.5).toFixed(2),
        theta: (Math.random() * -0.5).toFixed(2),
        expiration: new Date(Date.now() + dte * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return results;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const saveCurrentScreen = () => {
    const name = prompt('Enter a name for this screen:');
    if (!name) return;
    
    const newScreen = {
      id: Date.now(),
      name,
      filters: activeScreen === 'custom' ? filters : PRE_BUILT_SCREENS[activeScreen].filters,
      created: new Date().toISOString()
    };
    
    const updated = [...savedScreens, newScreen];
    setSavedScreens(updated);
    localStorage.setItem('savedScreens', JSON.stringify(updated));
    alert(`Screen "${name}" saved successfully!`);
  };

  const exportResults = () => {
    const csv = [
      ['Symbol', 'Type', 'Strike', 'Premium', 'DTE', 'IV Rank', 'Volume', 'Delta', 'Theta', 'Expiration'].join(','),
      ...results.map(r => [r.symbol, r.type, r.strike, r.premium, r.dte, r.ivRank, r.volume, r.delta, r.theta, r.expiration].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `options-screen-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: isMobile ? '1rem' : '0'
    }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{
              fontSize: isMobile ? '1.25rem' : '2rem',
              fontWeight: 'bold',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Filter size={isMobile ? 24 : 32} color="white" />
              Options Screener
            </h2>
            <p style={{ color: '#dbeafe', fontSize: isMobile ? '0.75rem' : '0.875rem', margin: 0 }}>
              Discover opportunities with pre-built and custom screens
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {results.length > 0 && (
              <>
                <button
                  onClick={saveCurrentScreen}
                  style={{
                    padding: isMobile ? '0.5rem' : '0.625rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                  title="Save Screen"
                >
                  <Save size={16} />
                  {!isMobile && <span>Save</span>}
                </button>
                <button
                  onClick={exportResults}
                  style={{
                    padding: isMobile ? '0.5rem' : '0.625rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                  title="Export CSV"
                >
                  <Download size={16} />
                  {!isMobile && <span>Export</span>}
                </button>
              </>
            )}
            <button
              onClick={() => setShowHelp(true)}
              style={{
                padding: isMobile ? '0.5rem' : '0.625rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              title="Help & Guide"
            >
              <HelpCircle size={16} />
              {!isMobile && <span>Help</span>}
            </button>
            <button
              onClick={() => setShowAI(!showAI)}
              style={{
                padding: isMobile ? '0.5rem' : '0.625rem',
                background: showAI ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              title="AI Assistant"
            >
              <Sparkles size={16} />
              {!isMobile && <span>AI</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Built Screens */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: isMobile ? '1rem' : '1.125rem',
          marginBottom: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Zap size={18} color="#f59e0b" />
          Quick Screens
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.75rem'
        }}>
          {Object.entries(PRE_BUILT_SCREENS).map(([key, screen]) => (
            <button
              key={key}
              onClick={() => runScreen(key)}
              disabled={loading}
              style={{
                padding: isMobile ? '1rem 0.75rem' : '1.25rem 1rem',
                background: activeScreen === key 
                  ? `linear-gradient(135deg, ${screen.color}40, ${screen.color}20)`
                  : 'rgba(51, 65, 85, 0.5)',
                border: activeScreen === key 
                  ? `2px solid ${screen.color}` 
                  : '1px solid #475569',
                borderRadius: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                marginBottom: '0.5rem'
              }}>
                {screen.icon}
              </div>
              <div style={{
                fontSize: isMobile ? '0.875rem' : '0.9375rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.25rem'
              }}>
                {screen.name}
              </div>
              <div style={{
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                color: '#94a3b8',
                lineHeight: '1.3'
              }}>
                {screen.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Filters */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setShowCustomFilters(!showCustomFilters)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: showCustomFilters ? '1rem' : 0
          }}
        >
          <h3 style={{
            fontSize: isMobile ? '1rem' : '1.125rem',
            margin: 0,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white'
          }}>
            <Settings size={18} color="#8b5cf6" />
            Custom Filters
          </h3>
          {showCustomFilters ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
        </button>

        {showCustomFilters && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Stock Price Range */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Stock Price Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>to</span>
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Min Volume */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Min Volume
                </label>
                <input
                  type="number"
                  value={filters.volumeMin}
                  onChange={(e) => setFilters({ ...filters, volumeMin: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* IV Rank */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  IV Rank %
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filters.ivRankMin}
                    onChange={(e) => setFilters({ ...filters, ivRankMin: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>to</span>
                  <input
                    type="number"
                    value={filters.ivRankMax}
                    onChange={(e) => setFilters({ ...filters, ivRankMax: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Days to Expiration */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Days to Expiration
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filters.dteMin}
                    onChange={(e) => setFilters({ ...filters, dteMin: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>to</span>
                  <input
                    type="number"
                    value={filters.dteMax}
                    onChange={(e) => setFilters({ ...filters, dteMax: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Premium Range */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Premium Range $
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filters.premiumMin}
                    onChange={(e) => setFilters({ ...filters, premiumMin: parseFloat(e.target.value) || 0 })}
                    step="0.5"
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>to</span>
                  <input
                    type="number"
                    value={filters.premiumMax}
                    onChange={(e) => setFilters({ ...filters, premiumMax: parseFloat(e.target.value) || 0 })}
                    step="0.5"
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Delta Range */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Delta Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={filters.deltaMin}
                    onChange={(e) => setFilters({ ...filters, deltaMin: parseFloat(e.target.value) || 0 })}
                    step="0.05"
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>to</span>
                  <input
                    type="number"
                    value={filters.deltaMax}
                    onChange={(e) => setFilters({ ...filters, deltaMax: parseFloat(e.target.value) || 0 })}
                    step="0.05"
                    style={{
                      width: '100%',
                      padding: '0.625rem',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Option Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Option Type
                </label>
                <select
                  value={filters.optionType}
                  onChange={(e) => setFilters({ ...filters, optionType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="all">All</option>
                  <option value="calls">Calls Only</option>
                  <option value="puts">Puts Only</option>
                </select>
              </div>

              {/* Strike Distance */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Strike Distance
                </label>
                <select
                  value={filters.strikeDistance}
                  onChange={(e) => setFilters({ ...filters, strikeDistance: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="all">All Strikes</option>
                  <option value="ITM">In The Money</option>
                  <option value="ATM">At The Money</option>
                  <option value="OTM">Out of The Money</option>
                </select>
              </div>
            </div>

            <button
              onClick={runCustomScreen}
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '0.75rem' : '1rem',
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? <Loader size={18} className="spin" /> : <Search size={18} />}
              {loading ? 'Screening...' : 'Run Custom Screen'}
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: isMobile ? '1rem' : '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: isMobile ? '1rem' : '1.125rem',
              margin: 0,
              fontWeight: '600'
            }}>
              Results ({results.length} matches)
            </h3>
            <p style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              margin: 0
            }}>
              Click column headers to sort
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #475569' }}>
                  {['Symbol', 'Type', 'Strike', 'Premium', 'DTE', 'IV%', 'Volume', 'Delta', ''].map((header, i) => (
                    <th
                      key={i}
                      onClick={() => header && handleSort(header.toLowerCase().replace('%', 'Rank'))}
                      style={{
                        padding: isMobile ? '0.75rem 0.5rem' : '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#cbd5e1',
                        cursor: header ? 'pointer' : 'default',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {header}
                        {header && <ArrowUpDown size={12} color="#64748b" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #334155',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem', fontWeight: '600', color: '#60a5fa' }}>
                      {result.symbol}
                    </td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        background: result.type === 'call' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: result.type === 'call' ? '#10b981' : '#ef4444'
                      }}>
                        {result.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>${result.strike}</td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem', fontWeight: '600', color: '#34d399' }}>
                      ${result.premium}
                    </td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>{result.dte}d</td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        background: result.ivRank > 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: result.ivRank > 70 ? '#ef4444' : '#94a3b8'
                      }}>
                        {result.ivRank}%
                      </span>
                    </td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem', color: '#94a3b8' }}>
                      {(result.volume / 1000).toFixed(0)}K
                    </td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>{result.delta}</td>
                    <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>
                      <button
                        onClick={() => onAddToBuilder(result)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          gap: '1rem'
        }}>
          <Loader size={48} color="#3b82f6" className="spin" />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Scanning options market...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Filter size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
            No Results Yet
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Select a pre-built screen or create your own custom filters to find options
          </p>
          <button
            onClick={() => setShowCustomFilters(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Open Custom Filters
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && <ScreenerHelpModal onClose={() => setShowHelp(false)} isMobile={isMobile} />}

      {/* AI Assistant */}
      {showAI && (
        <ScreenerAI
          onClose={() => setShowAI(false)}
          results={results}
          activeScreen={activeScreen}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

// Help Modal Component
const ScreenerHelpModal = ({ onClose, isMobile }) => {
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        overflow: 'auto'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: '90vh',
          border: '1px solid #475569',
          overflow: 'auto',
          padding: isMobile ? '1.5rem' : '2rem',
          position: 'relative'
        }}>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(148, 163, 184, 0.1)',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ 
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          marginBottom: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingRight: '2rem'
        }}>
          <HelpCircle size={24} color="#3b82f6" />
          Screener Guide
        </h2>

        <div style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
              🚀 Quick Start
            </h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8', fontSize: '0.875rem' }}>
              <li>Click any pre-built screen (e.g., "Best Covered Calls")</li>
              <li>Review results in the table below</li>
              <li>Click "+ Add" to send option to Strategy Builder</li>
              <li>Or use Custom Filters for advanced screening</li>
            </ol>
          </div>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
            🎯 Pre-Built Screens
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#ef4444' }}>🔥 High IV Premium:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>Best for selling premium (IV Rank 70%+)</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#10b981' }}>💰 Covered Calls:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>Generate income on stock holdings</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#3b82f6' }}>🎯 Cash-Secured Puts:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>Get paid to buy stocks you want</span>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#f59e0b' }}>🎰 Lottery Tickets:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>Cheap options under $1 for speculation</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
            ⚙️ Custom Filters Tips
          </h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', fontSize: '0.875rem' }}>
            <li><strong>IV Rank 70-100%:</strong> Best for premium selling strategies</li>
            <li><strong>DTE 30-45 days:</strong> Optimal balance of premium and theta decay</li>
            <li><strong>Delta 0.3-0.4:</strong> Good for OTM covered calls and cash-secured puts</li>
            <li><strong>Volume 100K+:</strong> Ensures good liquidity for entry/exit</li>
          </ul>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
            💾 Save & Export
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            • <strong>Save:</strong> Keep your custom filter combinations for future use<br/>
            • <strong>Export:</strong> Download results as CSV for further analysis in Excel
          </p>
        </div>
      </div>
    </div>
  );
};

// AI Assistant Component
const ScreenerAI = ({ onClose, results, activeScreen, isMobile }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your Screener AI Assistant. I can help you:\n\n• Understand screening strategies\n• Suggest filter combinations\n• Explain screen results\n• Compare different approaches\n\n${results.length > 0 ? `I see you're screening ${results.length} options.` : 'Run a screen to get started!'} What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "What's a good covered call strategy?",
    "How do I use IV Rank?",
    "Explain these results",
    "Best filters for premium selling?",
    "What's a good DTE range?"
  ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      let response = '';
      
      if (input.toLowerCase().includes('covered call')) {
        response = "**Covered Call Strategy:**\n\nA covered call is when you:\n1. Own 100 shares of stock\n2. Sell a call option against those shares\n\nFor best results, look for:\n• IV Rank 50%+ (higher premium)\n• DTE 30-45 days (balanced time decay)\n• Delta 0.2-0.4 (OTM with ~20-40% chance of assignment)\n• Strike 2-5% above current price\n\nThis generates income while you hold the stock!";
      } else if (input.toLowerCase().includes('iv rank')) {
        response = "**IV Rank Explained:**\n\nIV Rank shows where current volatility sits in the past 52-week range:\n\n• 0-30%: Low volatility (cheaper options)\n• 30-50%: Average volatility\n• 50-70%: Elevated volatility (good for selling)\n• 70-100%: Very high volatility (great for premium selling)\n\nFor premium selling strategies, look for IV Rank 50%+!";
      } else if (input.toLowerCase().includes('dte') || input.toLowerCase().includes('expiration')) {
        response = "**DTE (Days to Expiration) Guide:**\n\n• 0-7 days: Weekly plays, fast theta decay, riskier\n• 7-21 days: Short-term, good for earnings plays\n• 30-45 days: Sweet spot for premium selling\n• 45-90 days: More premium, slower decay\n• 90+ days: LEAPS territory\n\nMost traders prefer 30-45 DTE for covered calls and cash-secured puts!";
      } else {
        response = "I can help with options screening! Try asking about:\n\n• Covered calls\n• Cash-secured puts\n• IV Rank\n• Delta and Greeks\n• DTE strategies\n• Risk management\n\nWhat would you like to learn?";
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '1rem' : '2rem',
      right: isMobile ? '1rem' : '2rem',
      width: isMobile ? 'calc(100vw - 2rem)' : '400px',
      maxWidth: '400px',
      height: isMobile ? 'calc(100vh - 2rem)' : '600px',
      maxHeight: '80vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid #475569',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '1rem',
        borderRadius: '1rem 1rem 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="white" />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>
              Screener Assistant
            </h3>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>
              AI-Powered Help
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <X size={16} color="white" />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem'
      }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              Quick prompts:
            </p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  style={{
                    padding: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#93c5fd',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: msg.role === 'user' ? '#3b82f6' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              flex: 1,
              padding: '0.625rem',
              background: msg.role === 'user' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(51, 65, 85, 0.5)',
              border: `1px solid ${msg.role === 'user' ? '#3b82f6' : '#475569'}`,
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Loader size={14} className="spin" color="#3b82f6" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: '1px solid #475569' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about screening..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.8rem'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem',
              background: loading || !input.trim() ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreener;
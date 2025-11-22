import React, { useState, useEffect, useRef } from 'react';
import {
  Filter, Search, TrendingUp, DollarSign, Zap, Clock,
  ChevronDown, ChevronUp, Plus, X, Save, Download,
  RefreshCw, AlertCircle, BarChart3, Activity, Sparkles,
  ArrowUpDown, Eye, Settings, Loader
} from 'lucide-react';

const OptionsScreener = ({ onAddToBuilder }) => {
  const [activeScreen, setActiveScreen] = useState(null);
  const [showCustomFilters, setShowCustomFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'premium', direction: 'desc' });
  const [savedScreens, setSavedScreens] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Custom Filters State
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 1000,
    volumeMin: 100000,
    ivRankMin: 0,
    ivRankMax: 100,
    dteMin: 7,
    dteMax: 90,
    strikeDistance: 'all', // all, ITM, ATM, OTM
    optionType: 'all', // all, calls, puts
    premiumMin: 0,
    premiumMax: 50,
    deltaMin: 0,
    deltaMax: 1,
    strategy: 'all'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved screens
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

  // Pre-built screens
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
    'cheap_otm': {
      name: 'Cheap Lottery Tickets',
      description: 'OTM options under $1',
      icon: '🎰',
      color: '#f59e0b',
      filters: {
        premiumMax: 1,
        strikeDistance: 'OTM',
        dteMin: 7,
        dteMax: 30,
        volumeMin: 50000
      }
    },
    'weekly_income': {
      name: 'Weekly Income',
      description: 'Short-term premium collection',
      icon: '⚡',
      color: '#8b5cf6',
      filters: {
        dteMin: 3,
        dteMax: 10,
        ivRankMin: 40,
        premiumMin: 0.5,
        volumeMin: 200000
      }
    },
    'momentum_calls': {
      name: 'Momentum Calls',
      description: 'High delta calls on trending stocks',
      icon: '🚀',
      color: '#06b6d4',
      filters: {
        optionType: 'calls',
        deltaMin: 0.6,
        deltaMax: 0.85,
        dteMin: 30,
        dteMax: 60,
        ivRankMin: 30
      }
    },
    'earnings_plays': {
      name: 'Earnings Plays',
      description: 'High IV before earnings',
      icon: '📈',
      color: '#ec4899',
      filters: {
        ivRankMin: 80,
        dteMin: 7,
        dteMax: 21,
        premiumMin: 2,
        volumeMin: 500000
      }
    },
    'deep_value': {
      name: 'Deep Value Puts',
      description: 'Cheap protective puts',
      icon: '🛡️',
      color: '#14b8a6',
      filters: {
        optionType: 'puts',
        premiumMax: 2,
        strikeDistance: 'OTM',
        dteMin: 30,
        dteMax: 90
      }
    }
  };

  const runScreen = async (screenKey) => {
    setActiveScreen(screenKey);
    setLoading(true);
    
    const screenFilters = PRE_BUILT_SCREENS[screenKey].filters;
    setFilters({ ...filters, ...screenFilters });

    try {
      // Call API with filters
      const response = await fetch(`${API_URL}/options/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenFilters)
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        // Demo data if API fails
        setResults(generateDemoResults(screenFilters));
      }
    } catch (error) {
      console.error('Screen error:', error);
      setResults(generateDemoResults(screenFilters));
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

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        setResults(generateDemoResults(filters));
      }
    } catch (error) {
      console.error('Custom screen error:', error);
      setResults(generateDemoResults(filters));
    } finally {
      setLoading(false);
    }
  };

  const generateDemoResults = (filterParams) => {
    const symbols = ['AAPL', 'TSLA', 'SPY', 'QQQ', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD'];
    const results = [];

    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const stockPrice = 100 + Math.random() * 400;
      const isCall = filterParams.optionType === 'all' 
        ? Math.random() > 0.5 
        : filterParams.optionType === 'calls';
      
      const strike = stockPrice * (0.9 + Math.random() * 0.2);
      const premium = filterParams.premiumMin 
        ? filterParams.premiumMin + Math.random() * 5 
        : Math.random() * 10;
      
      const dte = filterParams.dteMin 
        ? filterParams.dteMin + Math.floor(Math.random() * (filterParams.dteMax - filterParams.dteMin))
        : Math.floor(Math.random() * 60);
      
      const iv = filterParams.ivRankMin 
        ? filterParams.ivRankMin + Math.random() * (100 - filterParams.ivRankMin)
        : Math.random() * 100;

      results.push({
        id: `${symbol}-${i}`,
        symbol,
        stockPrice: stockPrice.toFixed(2),
        optionType: isCall ? 'Call' : 'Put',
        strike: strike.toFixed(2),
        premium: premium.toFixed(2),
        dte,
        iv: iv.toFixed(1),
        volume: Math.floor(Math.random() * 50000) + 10000,
        openInterest: Math.floor(Math.random() * 100000) + 50000,
        delta: (isCall ? 0.3 : -0.3) + (Math.random() * 0.4),
        theta: -(Math.random() * 0.1),
        vega: Math.random() * 0.2,
        bid: (premium - 0.1).toFixed(2),
        ask: (parseFloat(premium) + 0.1).toFixed(2),
        impliedMove: (Math.random() * 10).toFixed(1)
      });
    }

    return results;
  };

  const sortResults = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }

    const sorted = [...results].sort((a, b) => {
      const aVal = parseFloat(a[key]) || a[key];
      const bVal = parseFloat(b[key]) || b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setResults(sorted);
    setSortConfig({ key, direction });
  };

  const saveCurrentScreen = () => {
    const screenName = prompt('Enter a name for this screen:');
    if (!screenName) return;

    const newScreen = {
      id: Date.now(),
      name: screenName,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedScreens, newScreen];
    setSavedScreens(updated);
    localStorage.setItem('savedScreens', JSON.stringify(updated));
    alert('Screen saved!');
  };

  const loadSavedScreen = (screen) => {
    setFilters(screen.filters);
    setActiveScreen('custom');
    runCustomScreen();
  };

  const deleteSavedScreen = (id) => {
    const updated = savedScreens.filter(s => s.id !== id);
    setSavedScreens(updated);
    localStorage.setItem('savedScreens', JSON.stringify(updated));
  };

  const exportResults = () => {
    const csv = [
      ['Symbol', 'Type', 'Strike', 'Premium', 'DTE', 'IV', 'Volume', 'Delta', 'Theta'].join(','),
      ...results.map(r => [
        r.symbol, r.optionType, r.strike, r.premium, r.dte, r.iv, r.volume, 
        r.delta.toFixed(2), r.theta.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `options_screen_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ paddingBottom: isMobile ? '4rem' : '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: isMobile ? '0.5rem' : '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !loading && activeScreen !== key && (e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)')}
              onMouseLeave={(e) => !loading && activeScreen !== key && (e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)')}
            >
              <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '0.5rem' }}>
                {screen.icon}
              </div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                {screen.name}
              </div>
              <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
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
        <div 
          onClick={() => setShowCustomFilters(!showCustomFilters)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: showCustomFilters ? '1rem' : '0'
          }}
        >
          <h3 style={{
            fontSize: isMobile ? '1rem' : '1.125rem',
            margin: 0,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Settings size={18} color="#8b5cf6" />
            Custom Filters
          </h3>
          {showCustomFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showCustomFilters && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Price Range */}
              <FilterInput
                label="Stock Price Range"
                type="range"
                min={filters.priceMin}
                max={filters.priceMax}
                onChangeMin={(val) => setFilters({ ...filters, priceMin: val })}
                onChangeMax={(val) => setFilters({ ...filters, priceMax: val })}
              />

              {/* Volume */}
              <FilterInput
                label="Min Volume"
                type="number"
                value={filters.volumeMin}
                onChange={(val) => setFilters({ ...filters, volumeMin: val })}
              />

              {/* IV Rank */}
              <FilterInput
                label="IV Rank %"
                type="range"
                min={filters.ivRankMin}
                max={filters.ivRankMax}
                onChangeMin={(val) => setFilters({ ...filters, ivRankMin: val })}
                onChangeMax={(val) => setFilters({ ...filters, ivRankMax: val })}
              />

              {/* DTE */}
              <FilterInput
                label="Days to Expiration"
                type="range"
                min={filters.dteMin}
                max={filters.dteMax}
                onChangeMin={(val) => setFilters({ ...filters, dteMin: val })}
                onChangeMax={(val) => setFilters({ ...filters, dteMax: val })}
              />

              {/* Premium Range */}
              <FilterInput
                label="Premium Range $"
                type="range"
                min={filters.premiumMin}
                max={filters.premiumMax}
                onChangeMin={(val) => setFilters({ ...filters, premiumMin: val })}
                onChangeMax={(val) => setFilters({ ...filters, premiumMax: val })}
              />

              {/* Delta Range */}
              <FilterInput
                label="Delta Range"
                type="range"
                min={filters.deltaMin}
                max={filters.deltaMax}
                step={0.05}
                onChangeMin={(val) => setFilters({ ...filters, deltaMin: val })}
                onChangeMax={(val) => setFilters({ ...filters, deltaMax: val })}
              />

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

      {/* Saved Screens */}
      {savedScreens.length > 0 && (
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
            <Save size={18} color="#10b981" />
            Saved Screens ({savedScreens.length})
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {savedScreens.map(screen => (
              <div
                key={screen.id}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: isMobile ? '0.75rem' : '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    {screen.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Created {new Date(screen.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => loadSavedScreen(screen)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSavedScreen(screen.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      {loading ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Loader size={48} className="spin" color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Screening options...</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: isMobile ? '0.75rem' : '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h3 style={{
              fontSize: isMobile ? '1rem' : '1.125rem',
              margin: 0,
              fontWeight: '600'
            }}>
              Results ({results.length} matches)
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Click column headers to sort
            </div>
          </div>

          {/* Mobile Card View */}
          {isMobile ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onAddToBuilder={onAddToBuilder}
                />
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #475569' }}>
                    {[
                      { key: 'symbol', label: 'Symbol' },
                      { key: 'optionType', label: 'Type' },
                      { key: 'strike', label: 'Strike' },
                      { key: 'premium', label: 'Premium' },
                      { key: 'dte', label: 'DTE' },
                      { key: 'iv', label: 'IV%' },
                      { key: 'volume', label: 'Volume' },
                      { key: 'delta', label: 'Delta' },
                      { key: 'action', label: '' }
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.key !== 'action' && sortResults(col.key)}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#94a3b8',
                          cursor: col.key !== 'action' ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {col.label}
                          {col.key !== 'action' && sortConfig.key === col.key && (
                            <ArrowUpDown size={12} color={sortConfig.direction === 'asc' ? '#10b981' : '#ef4444'} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={result.id}
                      style={{
                        borderBottom: idx < results.length - 1 ? '1px solid #334155' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: '700', color: '#8b5cf6', fontSize: '0.875rem' }}>
                        {result.symbol}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: result.optionType === 'Call' ? '#10b981' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {result.optionType}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                        ${result.strike}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '700' }}>
                        ${result.premium}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                        {result.dte}d
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                        {result.iv}%
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                        {(result.volume / 1000).toFixed(0)}K
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: result.delta > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {result.delta.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => onAddToBuilder && onAddToBuilder(result)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Add to Strategy Builder"
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
          )}
        </div>
      ) : activeScreen ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            No results found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Filter size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Select a screen above to discover opportunities
          </p>
        </div>
      )}
    </div>
  );
};

// Filter Input Component
const FilterInput = ({ label, type, value, onChange, min, max, step = 1, onChangeMin, onChangeMax }) => {
  if (type === 'range') {
    return (
      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            value={min}
            onChange={(e) => onChangeMin(parseFloat(e.target.value) || 0)}
            step={step}
            style={{
              flex: 1,
              padding: '0.625rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ color: '#64748b' }}>to</span>
          <input
            type="number"
            value={max}
            onChange={(e) => onChangeMax(parseFloat(e.target.value) || 0)}
            step={step}
            style={{
              flex: 1,
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
    );
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '600' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
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
  );
};

// Result Card Component (Mobile)
const ResultCard = ({ result, onAddToBuilder }) => {
  return (
    <div style={{
      background: 'rgba(51, 65, 85, 0.5)',
      border: '1px solid #475569',
      borderRadius: '0.5rem',
      padding: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.25rem' }}>
            {result.symbol}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            background: result.optionType === 'Call' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${result.optionType === 'Call' ? '#10b981' : '#ef4444'}`,
            borderRadius: '0.25rem',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: result.optionType === 'Call' ? '#10b981' : '#ef4444'
          }}>
            {result.optionType}
          </div>
        </div>
        <button
          onClick={() => onAddToBuilder && onAddToBuilder(result)}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '0.375rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: '#94a3b8' }}>Strike:</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600', marginLeft: '0.25rem' }}>${result.strike}</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Premium:</span>
          <span style={{ color: '#cbd5e1', fontWeight: '700', marginLeft: '0.25rem' }}>${result.premium}</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>DTE:</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600', marginLeft: '0.25rem' }}>{result.dte}d</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>IV:</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600', marginLeft: '0.25rem' }}>{result.iv}%</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Volume:</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600', marginLeft: '0.25rem' }}>{(result.volume / 1000).toFixed(0)}K</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Delta:</span>
          <span style={{
            color: result.delta > 0 ? '#10b981' : '#ef4444',
            fontWeight: '600',
            marginLeft: '0.25rem'
          }}>
            {result.delta.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreener;
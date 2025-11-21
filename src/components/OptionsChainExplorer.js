import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Filter, AlertCircle, 
  Calendar, DollarSign, Activity, Zap, RefreshCw, Loader,
  ChevronDown, ChevronUp, Info, BarChart3
} from 'lucide-react';
import MobileTable from './MobileTable';

const OptionsChainExplorer = ({ symbol, underlyingPrice }) => {
  const [optionsData, setOptionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expirations, setExpirations] = useState([]);
  const [selectedExpiration, setSelectedExpiration] = useState(null);
  const [activeTab, setActiveTab] = useState('chain'); // chain, unusual, greeks
  const [selectedType, setSelectedType] = useState('all'); // all, calls, puts
  
  // Filters
  const [filters, setFilters] = useState({
    moneyness: 'all', // all, ITM, ATM, OTM
    minVolume: 0,
    minOpenInterest: 0,
    minIV: 0,
    maxIV: 2,
    minStrike: 0,
    maxStrike: 10000
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [unusualActivity, setUnusualActivity] = useState([]);
  const [chainGreeks, setChainGreeks] = useState(null);

  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (symbol) {
      fetchExpirations();
      fetchOptionsChain();
    }
  }, [symbol]);

  useEffect(() => {
    if (selectedExpiration) {
      fetchOptionsChain();
    }
  }, [selectedExpiration]);

  const fetchExpirations = async () => {
    try {
      const response = await fetch(`${API_URL}/options/${symbol}/expirations`);
      const data = await response.json();
      
      if (data.success) {
        setExpirations(data.expirations);
        if (data.expirations.length > 0) {
          setSelectedExpiration(data.expirations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch expirations:', err);
    }
  };

  const fetchOptionsChain = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedExpiration 
        ? `${API_URL}/options/${symbol}?expiration=${selectedExpiration}`
        : `${API_URL}/options/${symbol}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOptionsData(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch options chain:', err);
      setError('Failed to load options data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnusualActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/options/${symbol}/unusual`);
      const data = await response.json();
      
      if (data.success) {
        setUnusualActivity(data.data.unusual);
      }
    } catch (err) {
      console.error('Failed to fetch unusual activity:', err);
    }
  };

  const fetchGreeks = async () => {
    try {
      const url = selectedExpiration
        ? `${API_URL}/options/${symbol}/greeks?expiration=${selectedExpiration}`
        : `${API_URL}/options/${symbol}/greeks`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setChainGreeks(data.data.greeks);
      }
    } catch (err) {
      console.error('Failed to fetch Greeks:', err);
    }
  };

  const applyFilters = () => {
    // Filter will be applied in rendering
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      moneyness: 'all',
      minVolume: 0,
      minOpenInterest: 0,
      minIV: 0,
      maxIV: 2,
      minStrike: 0,
      maxStrike: 10000
    });
  };

  const filterOptions = (options) => {
    return options.filter(option => {
      if (filters.minVolume > 0 && option.volume < filters.minVolume) return false;
      if (filters.minOpenInterest > 0 && option.openInterest < filters.minOpenInterest) return false;
      if (filters.minIV > 0 && option.impliedVolatility < filters.minIV) return false;
      if (filters.maxIV < 2 && option.impliedVolatility > filters.maxIV) return false;
      if (option.strike < filters.minStrike || option.strike > filters.maxStrike) return false;
      
      if (filters.moneyness !== 'all') {
        if (filters.moneyness === 'ITM' && !option.inTheMoney) return false;
        if (filters.moneyness === 'OTM' && option.inTheMoney) return false;
        if (filters.moneyness === 'ATM') {
          const diff = Math.abs(option.strike - underlyingPrice) / underlyingPrice;
          if (diff > 0.02) return false;
        }
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '4rem' 
      }}>
        <Loader size={48} color="#8b5cf6" className="spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        borderRadius: '0.75rem', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
        <button
          onClick={fetchOptionsChain}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1rem auto 0'
          }}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const filteredCalls = optionsData ? filterOptions(optionsData.calls) : [];
  const filteredPuts = optionsData ? filterOptions(optionsData.puts) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <Activity size={32} color="white" />
              Options Chain - {symbol}
            </h2>
            <p style={{ color: '#e9d5ff', fontSize: '1rem', margin: 0 }}>
              Professional-grade options analysis and trading tools
            </p>
          </div>
          
          <button
            onClick={fetchOptionsChain}
            style={{
              padding: '0.75rem 1.5rem',
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
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {optionsData && (
          <div style={{ 
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <StatCard 
              label="Total Contracts"
              value={optionsData.summary.totalContracts.toLocaleString()}
              icon={<Activity size={20} />}
            />
            <StatCard 
              label="Calls"
              value={optionsData.summary.callsCount.toLocaleString()}
              icon={<TrendingUp size={20} />}
              color="#10b981"
            />
            <StatCard 
              label="Puts"
              value={optionsData.summary.putsCount.toLocaleString()}
              icon={<TrendingDown size={20} />}
              color="#ef4444"
            />
            <StatCard 
              label="Total Volume"
              value={optionsData.summary.totalVolume.toLocaleString()}
              icon={<BarChart3 size={20} />}
            />
            <StatCard 
              label="Put/Call Ratio"
              value={optionsData.summary.putCallRatio.toFixed(2)}
              icon={<Activity size={20} />}
              color={optionsData.summary.putCallRatio > 1 ? '#ef4444' : '#10b981'}
            />
            <StatCard 
              label="Underlying Price"
              value={`$${underlyingPrice.toFixed(2)}`}
              icon={<DollarSign size={20} />}
              color="#60a5fa"
            />
          </div>
        )}
      </div>

      {/* Expiration Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          color: '#cbd5e1', 
          marginBottom: '0.5rem', 
          fontWeight: '600'
        }}>
          <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Expiration Date
        </label>
        <select
          value={selectedExpiration || ''}
          onChange={(e) => setSelectedExpiration(e.target.value)}
          style={{
            padding: '0.75rem',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '1rem',
            minWidth: '200px'
          }}
        >
          {expirations.map(exp => (
            <option key={exp} value={exp}>
              {new Date(exp).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
              {' '}
              ({getDaysToExpiration(exp)} days)
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '2px solid #334155',
        paddingBottom: '0.5rem'
      }}>
        <TabButton
          active={activeTab === 'chain'}
          onClick={() => setActiveTab('chain')}
          icon={<Activity size={18} />}
          label="Options Chain"
        />
        <TabButton
          active={activeTab === 'unusual'}
          onClick={() => {
            setActiveTab('unusual');
            fetchUnusualActivity();
          }}
          icon={<Zap size={18} />}
          label="Unusual Activity"
        />
        <TabButton
          active={activeTab === 'greeks'}
          onClick={() => {
            setActiveTab('greeks');
            fetchGreeks();
          }}
          icon={<TrendingUp size={18} />}
          label="Greeks"
        />
      </div>

      {/* Filters Button */}
      {activeTab === 'chain' && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.75rem 1.5rem',
              background: showFilters ? '#8b5cf6' : '#334155',
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
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Filter Panel */}
          {showFilters && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                Filter Options
              </h4>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {/* Moneyness */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Moneyness
                  </label>
                  <select
                    value={filters.moneyness}
                    onChange={(e) => setFilters({...filters, moneyness: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="all">All</option>
                    <option value="ITM">In The Money</option>
                    <option value="ATM">At The Money</option>
                    <option value="OTM">Out of The Money</option>
                  </select>
                </div>

                {/* Min Volume */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Min Volume
                  </label>
                  <input
                    type="number"
                    value={filters.minVolume}
                    onChange={(e) => setFilters({...filters, minVolume: parseInt(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Min Open Interest */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Min Open Interest
                  </label>
                  <input
                    type="number"
                    value={filters.minOpenInterest}
                    onChange={(e) => setFilters({...filters, minOpenInterest: parseInt(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Min IV */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Min IV (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={filters.minIV * 100}
                    onChange={(e) => setFilters({...filters, minIV: parseFloat(e.target.value) / 100 || 0})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Strike Range */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Min Strike
                  </label>
                  <input
                    type="number"
                    value={filters.minStrike}
                    onChange={(e) => setFilters({...filters, minStrike: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                    Max Strike
                  </label>
                  <input
                    type="number"
                    value={filters.maxStrike}
                    onChange={(e) => setFilters({...filters, maxStrike: parseFloat(e.target.value) || 10000})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={applyFilters}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: '#475569',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'chain' && (
        <OptionsChainTable 
          calls={filteredCalls}
          puts={filteredPuts}
          underlyingPrice={underlyingPrice}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      )}

      {activeTab === 'unusual' && (
        <UnusualActivityTab 
          unusualActivity={unusualActivity}
          loading={loading}
        />
      )}

      {activeTab === 'greeks' && (
        <GreeksTab 
          greeks={chainGreeks}
          loading={loading}
        />
      )}
    </div>
  );
};

// Helper Components

const StatCard = ({ label, value, icon, color = 'white' }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
      {icon}
      <span style={{ fontSize: '0.75rem' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.75rem 1.5rem',
      background: active ? '#8b5cf6' : 'transparent',
      border: 'none',
      borderRadius: '0.5rem 0.5rem 0 0',
      color: active ? 'white' : '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'transparent';
    }}
  >
    {icon}
    {label}
  </button>
);

const OptionsChainTable = ({ calls, puts, underlyingPrice, selectedType, setSelectedType }) => {
  return (
    <div>
      {/* Type Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'calls', 'puts'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '0.5rem 1rem',
              background: selectedType === type ? '#8b5cf6' : '#334155',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {(selectedType === 'all' || selectedType === 'calls') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#10b981', fontWeight: '600' }}>
            <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            CALLS ({calls.length})
          </h3>
          <OptionsTable options={calls} type="call" underlyingPrice={underlyingPrice} />
        </div>
      )}

      {(selectedType === 'all' || selectedType === 'puts') && (
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#ef4444', fontWeight: '600' }}>
            <TrendingDown size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            PUTS ({puts.length})
          </h3>
          <OptionsTable options={puts} type="put" underlyingPrice={underlyingPrice} />
        </div>
      )}
    </div>
  );
};

const OptionsTable = ({ options, type, underlyingPrice }) => {
  if (options.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#94a3b8',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.75rem'
      }}>
        No options match the current filters
      </div>
    );
  }

  return (
    <MobileTable>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
        <thead>
          <tr style={{ background: '#1e293b', borderBottom: '2px solid #334155' }}>
            <th style={headerStyle}>Strike</th>
            <th style={headerStyle}>Last</th>
            <th style={headerStyle}>Bid</th>
            <th style={headerStyle}>Ask</th>
            <th style={headerStyle}>Change</th>
            <th style={headerStyle}>Volume</th>
            <th style={headerStyle}>OI</th>
            <th style={headerStyle}>IV</th>
            <th style={headerStyle}>Delta</th>
            <th style={headerStyle}>Gamma</th>
            <th style={headerStyle}>Theta</th>
            <th style={headerStyle}>Vega</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option, idx) => (
            <tr 
              key={idx}
              style={{ 
                borderBottom: '1px solid #334155',
                background: option.inTheMoney ? 
                  (type === 'call' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 
                  'transparent'
              }}
            >
              <td style={cellStyle}>
                <div style={{ fontWeight: 'bold', color: option.inTheMoney ? '#60a5fa' : '#cbd5e1' }}>
                  ${option.strike.toFixed(2)}
                </div>
                {Math.abs(option.strike - underlyingPrice) / underlyingPrice < 0.02 && (
                  <div style={{ fontSize: '0.65rem', color: '#f59e0b' }}>ATM</div>
                )}
              </td>
              <td style={cellStyle}>${option.lastPrice.toFixed(2)}</td>
              <td style={cellStyle}>${option.bid.toFixed(2)}</td>
              <td style={cellStyle}>${option.ask.toFixed(2)}</td>
              <td style={{...cellStyle, color: option.change >= 0 ? '#10b981' : '#ef4444'}}>
                {option.change >= 0 ? '+' : ''}{option.changePercent.toFixed(2)}%
              </td>
              <td style={cellStyle}>
                {option.volume.toLocaleString()}
                {option.volume > 1000 && (
                  <Zap size={12} color="#f59e0b" style={{ marginLeft: '0.25rem' }} />
                )}
              </td>
              <td style={cellStyle}>{option.openInterest.toLocaleString()}</td>
              <td style={cellStyle}>
                <div style={{ 
                  padding: '0.25rem 0.5rem',
                  background: getIVColor(option.impliedVolatility),
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  display: 'inline-block'
                }}>
                  {(option.impliedVolatility * 100).toFixed(1)}%
                </div>
              </td>
              <td style={cellStyle}>{option.delta.toFixed(3)}</td>
              <td style={cellStyle}>{option.gamma.toFixed(4)}</td>
              <td style={cellStyle}>{option.theta.toFixed(4)}</td>
              <td style={cellStyle}>{option.vega.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MobileTable>
  );
};

const UnusualActivityTab = ({ unusualActivity, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size={32} className="spin" />
      </div>
    );
  }

  if (unusualActivity.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.75rem'
      }}>
        <Zap size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Unusual Activity Detected</h3>
        <p style={{ color: '#94a3b8' }}>Check back later for options flow alerts</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#fbbf24' }}>
          <Zap size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          <strong>Unusual Activity:</strong> Options with significantly higher than normal volume or unusual characteristics
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {unusualActivity.map((option, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: option.type === 'call' ? '#10b981' : '#ef4444' }}>
                  {option.type.toUpperCase()} ${option.strike}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Exp: {new Date(option.expiration).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#fbbf24'
              }}>
                <Zap size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Significance: {option.significance.toFixed(0)}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <MetricBox label="Volume" value={option.volume.toLocaleString()} />
              <MetricBox label="Open Interest" value={option.openInterest.toLocaleString()} />
              <MetricBox label="Volume/OI" value={option.volumeOIRatio.toFixed(2)} />
              <MetricBox label="Last Price" value={`$${option.lastPrice.toFixed(2)}`} />
              <MetricBox label="IV" value={`${(option.impliedVolatility * 100).toFixed(1)}%`} />
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '0.875rem',
              color: '#93c5fd'
            }}>
              <Info size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {option.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GreeksTab = ({ greeks, loading }) => {
  if (loading || !greeks) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size={32} className="spin" />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Chain-wide Greeks Analysis
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem'
        }}>
          <GreekCard
            label="Total Delta"
            value={greeks.totalDelta.toFixed(2)}
            description="Net directional exposure"
            color="#60a5fa"
          />
          <GreekCard
            label="Total Gamma"
            value={greeks.totalGamma.toFixed(4)}
            description="Delta sensitivity"
            color="#10b981"
          />
          <GreekCard
            label="Total Theta"
            value={greeks.totalTheta.toFixed(4)}
            description="Time decay per day"
            color="#ef4444"
          />
          <GreekCard
            label="Total Vega"
            value={greeks.totalVega.toFixed(4)}
            description="IV sensitivity"
            color="#8b5cf6"
          />
          <GreekCard
            label="Avg Call Delta"
            value={greeks.avgCallDelta.toFixed(3)}
            description="Average delta for calls"
            color="#10b981"
          />
          <GreekCard
            label="Avg Put Delta"
            value={greeks.avgPutDelta.toFixed(3)}
            description="Average delta for puts"
            color="#ef4444"
          />
        </div>

        <div style={{
          marginTop: '2rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#93c5fd' }}>
            Understanding Greeks:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            <li><strong>Delta:</strong> Rate of change in option price per $1 move in underlying</li>
            <li><strong>Gamma:</strong> Rate of change in delta per $1 move in underlying</li>
            <li><strong>Theta:</strong> Rate of time decay per day</li>
            <li><strong>Vega:</strong> Sensitivity to 1% change in implied volatility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const GreekCard = ({ label, value, description, color }) => (
  <div style={{
    background: 'rgba(51, 65, 85, 0.5)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    border: '1px solid #475569'
  }}>
    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{description}</div>
  </div>
);

// Helper functions

function getDaysToExpiration(expirationDate) {
  const now = new Date();
  const exp = new Date(expirationDate);
  const diffTime = exp - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getIVColor(iv) {
  if (iv > 1.0) return 'rgba(239, 68, 68, 0.3)'; // Very high
  if (iv > 0.6) return 'rgba(251, 191, 36, 0.3)'; // High
  if (iv > 0.3) return 'rgba(59, 130, 246, 0.3)'; // Medium
  return 'rgba(100, 116, 139, 0.3)'; // Low
}

const headerStyle = {
  padding: '1rem 0.75rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const cellStyle = {
  padding: '0.75rem',
  fontSize: '0.875rem',
  color: '#cbd5e1'
};

export default OptionsChainExplorer;

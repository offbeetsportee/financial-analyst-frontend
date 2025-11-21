import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, X, Save, Download, 
  Calculator, BarChart3, AlertCircle, Info, Zap, DollarSign,
  Loader, RefreshCw, Eye, EyeOff, Copy, Trash2, Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

const OptionsStrategyBuilder = ({ symbol: initialSymbol, underlyingPrice: initialPrice }) => {
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol || '');
  const [currentPrice, setCurrentPrice] = useState(initialPrice || 0);
  const [legs, setLegs] = useState([]);
  const [strategyName, setStrategyName] = useState('Custom Strategy');
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  
  // Options data
  const [optionsData, setOptionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expirations, setExpirations] = useState([]);
  
  // Analysis
  const [plData, setPlData] = useState([]);
  const [greeks, setGreeks] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [breakevens, setBreakevens] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Common strategy templates
  const STRATEGY_TEMPLATES = {
    'Long Call': [
      { type: 'call', position: 'long', quantity: 1, moneyness: 'ATM' }
    ],
    'Long Put': [
      { type: 'put', position: 'long', quantity: 1, moneyness: 'ATM' }
    ],
    'Covered Call': [
      { type: 'stock', position: 'long', quantity: 100 },
      { type: 'call', position: 'short', quantity: 1, moneyness: 'OTM' }
    ],
    'Protective Put': [
      { type: 'stock', position: 'long', quantity: 100 },
      { type: 'put', position: 'long', quantity: 1, moneyness: 'OTM' }
    ],
    'Bull Call Spread': [
      { type: 'call', position: 'long', quantity: 1, moneyness: 'ATM' },
      { type: 'call', position: 'short', quantity: 1, moneyness: 'OTM' }
    ],
    'Bear Put Spread': [
      { type: 'put', position: 'long', quantity: 1, moneyness: 'ATM' },
      { type: 'put', position: 'short', quantity: 1, moneyness: 'OTM' }
    ],
    'Long Straddle': [
      { type: 'call', position: 'long', quantity: 1, moneyness: 'ATM' },
      { type: 'put', position: 'long', quantity: 1, moneyness: 'ATM' }
    ],
    'Short Straddle': [
      { type: 'call', position: 'short', quantity: 1, moneyness: 'ATM' },
      { type: 'put', position: 'short', quantity: 1, moneyness: 'ATM' }
    ],
    'Long Strangle': [
      { type: 'call', position: 'long', quantity: 1, moneyness: 'OTM' },
      { type: 'put', position: 'long', quantity: 1, moneyness: 'OTM' }
    ],
    'Iron Condor': [
      { type: 'put', position: 'long', quantity: 1, moneyness: 'OTM-' },
      { type: 'put', position: 'short', quantity: 1, moneyness: 'OTM' },
      { type: 'call', position: 'short', quantity: 1, moneyness: 'OTM' },
      { type: 'call', position: 'long', quantity: 1, moneyness: 'OTM+' }
    ],
    'Butterfly Spread': [
      { type: 'call', position: 'long', quantity: 1, moneyness: 'ITM' },
      { type: 'call', position: 'short', quantity: 2, moneyness: 'ATM' },
      { type: 'call', position: 'long', quantity: 1, moneyness: 'OTM' }
    ],
    'Calendar Spread': [
      { type: 'call', position: 'short', quantity: 1, moneyness: 'ATM', expiration: 'near' },
      { type: 'call', position: 'long', quantity: 1, moneyness: 'ATM', expiration: 'far' }
    ]
  };

  useEffect(() => {
    if (initialSymbol) {
      setCurrentSymbol(initialSymbol);
    }
    if (initialPrice) {
      setCurrentPrice(initialPrice);
    }
  }, [initialSymbol, initialPrice]);

  useEffect(() => {
    if (currentSymbol) {
      fetchOptionsData();
    }
  }, [currentSymbol]);

  useEffect(() => {
    if (legs.length > 0) {
      calculatePL();
      calculateGreeks();
      calculateMetrics();
    } else {
      setPlData([]);
      setGreeks(null);
      setMetrics(null);
      setBreakevens([]);
    }
  }, [legs, currentPrice]);

  // Load saved strategies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('optionsStrategies');
    if (saved) {
      try {
        setSavedStrategies(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved strategies:', e);
      }
    }
  }, []);

  const fetchOptionsData = async () => {
    setLoading(true);
    try {
      // Fetch expirations
      const expResponse = await fetch(`${API_URL}/options/${currentSymbol}/expirations`);
      const expData = await expResponse.json();
      if (expData.success) {
        setExpirations(expData.expirations);
      }

      // Fetch options chain
      const chainResponse = await fetch(`${API_URL}/options/${currentSymbol}`);
      const chainData = await chainResponse.json();
      if (chainData.success) {
        setOptionsData(chainData.data);
      }

      // Fetch current stock price
      const priceResponse = await fetch(`${API_URL}/stocks/${currentSymbol}`);
      const priceData = await priceResponse.json();
      if (priceData.currentPrice) {
        setCurrentPrice(priceData.currentPrice);
      }
    } catch (error) {
      console.error('Failed to fetch options data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLeg = () => {
    const newLeg = {
      id: Date.now(),
      type: 'call',
      position: 'long',
      strike: currentPrice,
      expiration: expirations[0] || null,
      quantity: 1,
      premium: 5.00,
      delta: 0.5,
      gamma: 0.01,
      theta: -0.05,
      vega: 0.15,
      iv: 0.30
    };
    setLegs([...legs, newLeg]);
  };

  const removeLeg = (id) => {
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const updateLeg = (id, field, value) => {
    setLegs(legs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  const loadTemplate = (templateName) => {
    if (!optionsData || !currentPrice) {
      alert('Please select a stock first');
      return;
    }

    const template = STRATEGY_TEMPLATES[templateName];
    const newLegs = [];

    template.forEach((legTemplate, idx) => {
      if (legTemplate.type === 'stock') {
        newLegs.push({
          id: Date.now() + idx,
          type: 'stock',
          position: legTemplate.position,
          strike: currentPrice,
          expiration: null,
          quantity: legTemplate.quantity,
          premium: 0,
          delta: legTemplate.position === 'long' ? 1 : -1,
          gamma: 0,
          theta: 0,
          vega: 0,
          iv: 0
        });
        return;
      }

      // Find appropriate strike based on moneyness
      let strike = currentPrice;
      const options = legTemplate.type === 'call' ? optionsData.calls : optionsData.puts;
      
      if (options && options.length > 0) {
        const sorted = [...options].sort((a, b) => a.strike - b.strike);
        const atmIdx = sorted.findIndex(o => o.strike >= currentPrice);
        
        switch (legTemplate.moneyness) {
          case 'ITM':
            strike = sorted[Math.max(0, atmIdx - 2)]?.strike || currentPrice;
            break;
          case 'ATM':
            strike = sorted[atmIdx]?.strike || currentPrice;
            break;
          case 'OTM':
            strike = sorted[Math.min(sorted.length - 1, atmIdx + 2)]?.strike || currentPrice;
            break;
          case 'OTM+':
            strike = sorted[Math.min(sorted.length - 1, atmIdx + 4)]?.strike || currentPrice;
            break;
          case 'OTM-':
            strike = sorted[Math.max(0, atmIdx - 4)]?.strike || currentPrice;
            break;
        }

        // Find the option at this strike
        const option = options.find(o => o.strike === strike);
        
        newLegs.push({
          id: Date.now() + idx,
          type: legTemplate.type,
          position: legTemplate.position,
          strike: strike,
          expiration: legTemplate.expiration === 'far' && expirations.length > 1 
            ? expirations[1] 
            : expirations[0] || null,
          quantity: legTemplate.quantity,
          premium: option?.lastPrice || 5.00,
          delta: option?.delta || 0.5,
          gamma: option?.gamma || 0.01,
          theta: option?.theta || -0.05,
          vega: option?.vega || 0.15,
          iv: option?.impliedVolatility || 0.30
        });
      }
    });

    setLegs(newLegs);
    setStrategyName(templateName);
  };

  const calculatePL = () => {
    if (legs.length === 0) return;

    // Calculate P/L across a range of stock prices
    const minPrice = currentPrice * 0.7;
    const maxPrice = currentPrice * 1.3;
    const step = (maxPrice - minPrice) / 100;
    
    const data = [];
    const breakevens = [];
    let prevPL = null;

    for (let price = minPrice; price <= maxPrice; price += step) {
      let totalPL = 0;

      legs.forEach(leg => {
        if (leg.type === 'stock') {
          const stockPL = (price - currentPrice) * leg.quantity;
          totalPL += leg.position === 'long' ? stockPL : -stockPL;
        } else {
          const intrinsic = leg.type === 'call' 
            ? Math.max(0, price - leg.strike)
            : Math.max(0, leg.strike - price);
          
          const contractPL = (intrinsic - leg.premium) * 100 * leg.quantity;
          totalPL += leg.position === 'long' ? contractPL : -contractPL;
        }
      });

      data.push({ price: parseFloat(price.toFixed(2)), pl: totalPL });

      // Detect breakeven points (where P/L crosses zero)
      if (prevPL !== null) {
        if ((prevPL < 0 && totalPL >= 0) || (prevPL >= 0 && totalPL < 0)) {
          breakevens.push(price);
        }
      }
      prevPL = totalPL;
    }

    setPlData(data);
    setBreakevens(breakevens);
  };

  const calculateGreeks = () => {
    if (legs.length === 0) return;

    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;

    legs.forEach(leg => {
      const multiplier = leg.position === 'long' ? 1 : -1;
      const contracts = leg.type === 'stock' ? 1 : leg.quantity;
      
      totalDelta += leg.delta * multiplier * contracts;
      totalGamma += leg.gamma * multiplier * contracts;
      totalTheta += leg.theta * multiplier * contracts;
      totalVega += leg.vega * multiplier * contracts;
    });

    setGreeks({
      delta: totalDelta,
      gamma: totalGamma,
      theta: totalTheta,
      vega: totalVega
    });
  };

  const calculateMetrics = () => {
    if (legs.length === 0 || plData.length === 0) return;

    // Calculate max profit, max loss, initial cost
    let maxProfit = -Infinity;
    let maxLoss = Infinity;
    let initialCost = 0;

    plData.forEach(point => {
      maxProfit = Math.max(maxProfit, point.pl);
      maxLoss = Math.min(maxLoss, point.pl);
    });

    legs.forEach(leg => {
      const cost = leg.premium * leg.quantity * (leg.type === 'stock' ? leg.quantity : 100);
      initialCost += leg.position === 'long' ? cost : -cost;
    });

    // Calculate probability of profit (simplified)
    const profitablePoints = plData.filter(p => p.pl > 0).length;
    const pop = (profitablePoints / plData.length) * 100;

    // Risk/Reward ratio
    const riskRewardRatio = maxProfit !== Infinity && maxLoss !== -Infinity 
      ? Math.abs(maxProfit / maxLoss) 
      : 0;

    setMetrics({
      maxProfit: maxProfit === Infinity ? 'Unlimited' : `$${maxProfit.toFixed(2)}`,
      maxLoss: maxLoss === -Infinity ? 'Unlimited' : `$${Math.abs(maxLoss).toFixed(2)}`,
      initialCost: `$${Math.abs(initialCost).toFixed(2)}`,
      breakevens: breakevens.map(be => `$${be.toFixed(2)}`).join(', ') || 'N/A',
      pop: `${pop.toFixed(1)}%`,
      riskReward: riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : 'N/A'
    });
  };

  const saveStrategy = () => {
    if (legs.length === 0) {
      alert('Add at least one leg to save the strategy');
      return;
    }

    const strategy = {
      id: Date.now(),
      name: strategyName,
      symbol: currentSymbol,
      underlyingPrice: currentPrice,
      legs: legs,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedStrategies, strategy];
    setSavedStrategies(updated);
    localStorage.setItem('optionsStrategies', JSON.stringify(updated));
    alert('Strategy saved!');
  };

  const loadSavedStrategy = (strategy) => {
    setCurrentSymbol(strategy.symbol);
    setCurrentPrice(strategy.underlyingPrice);
    setLegs(strategy.legs);
    setStrategyName(strategy.name);
    setShowSaved(false);
  };

  const deleteSavedStrategy = (id) => {
    const updated = savedStrategies.filter(s => s.id !== id);
    setSavedStrategies(updated);
    localStorage.setItem('optionsStrategies', JSON.stringify(updated));
  };

  const exportStrategy = () => {
    const data = {
      name: strategyName,
      symbol: currentSymbol,
      underlyingPrice: currentPrice,
      legs: legs,
      metrics: metrics,
      greeks: greeks,
      breakevens: breakevens
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${strategyName.replace(/\s+/g, '_')}_${currentSymbol}.json`;
    a.click();
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pl = payload[0].value;
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.75rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            Price: ${payload[0].payload.price.toFixed(2)}
          </p>
          <p style={{ 
            margin: '0.25rem 0 0 0', 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: pl >= 0 ? '#10b981' : '#ef4444' 
          }}>
            P/L: ${pl.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={32} color="white" />
              Options Strategy Builder
            </h2>
            <p style={{ color: '#ddd6fe', fontSize: '1rem', margin: 0 }}>
              Build and analyze multi-leg options strategies
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowSaved(!showSaved)}
              style={{
                padding: '0.75rem 1rem',
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
              {showSaved ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSaved ? 'Hide' : 'View'} Saved ({savedStrategies.length})
            </button>
            {legs.length > 0 && (
              <>
                <button
                  onClick={saveStrategy}
                  style={{
                    padding: '0.75rem 1rem',
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
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={exportStrategy}
                  style={{
                    padding: '0.75rem 1rem',
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
                  <Download size={16} />
                  Export
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Saved Strategies */}
      {showSaved && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
            Saved Strategies
          </h3>
          {savedStrategies.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
              No saved strategies yet
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {savedStrategies.map(strategy => (
                <div
                  key={strategy.id}
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                      {strategy.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {strategy.symbol} @ ${strategy.underlyingPrice.toFixed(2)} • {strategy.legs.length} legs • {new Date(strategy.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => loadSavedStrategy(strategy)}
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
                      onClick={() => deleteSavedStrategy(strategy.id)}
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
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strategy Templates */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#f59e0b" />
          Quick Templates
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
          {Object.keys(STRATEGY_TEMPLATES).map(name => (
            <button
              key={name}
              onClick={() => loadTemplate(name)}
              disabled={!currentSymbol}
              style={{
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '0.5rem',
                color: '#c4b5fd',
                cursor: currentSymbol ? 'pointer' : 'not-allowed',
                fontSize: '0.75rem',
                fontWeight: '600',
                opacity: currentSymbol ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => currentSymbol && (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)')}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Name & Symbol */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
            Strategy Name
          </label>
          <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
            Symbol
          </label>
          <input
            type="text"
            value={currentSymbol}
            onChange={(e) => setCurrentSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
            Current Price
          </label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
            step="0.01"
            style={{
              width: '120px',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Legs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', margin: 0, fontWeight: '600' }}>
            Strategy Legs
          </h3>
          <button
            onClick={addLeg}
            disabled={!currentSymbol}
            style={{
              padding: '0.5rem 1rem',
              background: !currentSymbol ? '#6b7280' : '#10b981',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: !currentSymbol ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            Add Leg
          </button>
        </div>

        {legs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <Calculator size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0 }}>No legs added yet. Add a leg or select a template to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {legs.map((leg, idx) => (
              <StrategyLeg
                key={leg.id}
                leg={leg}
                index={idx}
                onUpdate={updateLeg}
                onRemove={removeLeg}
                expirations={expirations}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analysis */}
      {legs.length > 0 && (
        <>
          {/* P/L Chart */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#60a5fa" />
              Profit/Loss Diagram
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={plData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="price"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <ReferenceLine x={currentPrice} stroke="#60a5fa" strokeDasharray="5 5" label={{ value: 'Current', fill: '#60a5fa', fontSize: 12 }} />
                {breakevens.map((be, idx) => (
                  <ReferenceLine 
                    key={idx} 
                    x={be} 
                    stroke="#f59e0b" 
                    strokeDasharray="5 5"
                    label={{ value: 'BE', fill: '#f59e0b', fontSize: 12 }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="pl"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics & Greeks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Metrics */}
            {metrics && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={20} color="#10b981" />
                  Risk Metrics
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <MetricRow label="Max Profit" value={metrics.maxProfit} positive />
                  <MetricRow label="Max Loss" value={metrics.maxLoss} negative />
                  <MetricRow label="Initial Cost" value={metrics.initialCost} />
                  <MetricRow label="Breakeven(s)" value={metrics.breakevens} />
                  <MetricRow label="Prob. of Profit" value={metrics.pop} />
                  <MetricRow label="Risk/Reward" value={metrics.riskReward} />
                </div>
              </div>
            )}

            {/* Greeks */}
            {greeks && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="#8b5cf6" />
                  Position Greeks
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <GreekRow 
                    label="Delta" 
                    value={greeks.delta.toFixed(2)} 
                    description="Directional exposure"
                    color="#60a5fa"
                  />
                  <GreekRow 
                    label="Gamma" 
                    value={greeks.gamma.toFixed(4)} 
                    description="Delta sensitivity"
                    color="#10b981"
                  />
                  <GreekRow 
                    label="Theta" 
                    value={greeks.theta.toFixed(4)} 
                    description="Daily time decay"
                    color="#ef4444"
                  />
                  <GreekRow 
                    label="Vega" 
                    value={greeks.vega.toFixed(4)} 
                    description="Volatility exposure"
                    color="#8b5cf6"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
              <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#93c5fd' }}>
                  Understanding the Analysis
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <li><strong>P/L Diagram:</strong> Shows profit/loss at expiration across different stock prices</li>
                  <li><strong>Breakeven Points:</strong> Stock prices where the position breaks even (marked in orange)</li>
                  <li><strong>Greeks:</strong> Measure sensitivity to price, time, and volatility changes</li>
                  <li><strong>Max Loss:</strong> Worst-case scenario if the strategy moves against you</li>
                  <li><strong>Risk/Reward:</strong> Ratio of potential profit to potential loss</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StrategyLeg = ({ leg, index, onUpdate, onRemove, expirations }) => {
  return (
    <div style={{
      background: 'rgba(51, 65, 85, 0.5)',
      border: '1px solid #475569',
      borderRadius: '0.5rem',
      padding: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
          Leg {index + 1}
        </div>
        <button
          onClick={() => onRemove(leg.id)}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#ef4444'
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
        {/* Type */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            Type
          </label>
          <select
            value={leg.type}
            onChange={(e) => onUpdate(leg.id, 'type', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.75rem'
            }}
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
            <option value="stock">Stock</option>
          </select>
        </div>

        {/* Position */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            Position
          </label>
          <select
            value={leg.position}
            onChange={(e) => onUpdate(leg.id, 'position', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.375rem',
              color: leg.position === 'long' ? '#10b981' : '#ef4444',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        {/* Strike */}
        {leg.type !== 'stock' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Strike
            </label>
            <input
              type="number"
              value={leg.strike}
              onChange={(e) => onUpdate(leg.id, 'strike', parseFloat(e.target.value) || 0)}
              step="0.5"
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            Quantity
          </label>
          <input
            type="number"
            value={leg.quantity}
            onChange={(e) => onUpdate(leg.id, 'quantity', parseInt(e.target.value) || 1)}
            min="1"
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
        </div>

        {/* Premium */}
        {leg.type !== 'stock' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Premium
            </label>
            <input
              type="number"
              value={leg.premium}
              onChange={(e) => onUpdate(leg.id, 'premium', parseFloat(e.target.value) || 0)}
              step="0.01"
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          </div>
        )}

        {/* Expiration */}
        {leg.type !== 'stock' && expirations.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Expiration
            </label>
            <select
              value={leg.expiration || ''}
              onChange={(e) => onUpdate(leg.id, 'expiration', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.75rem'
              }}
            >
              {expirations.map(exp => (
                <option key={exp} value={exp}>
                  {new Date(exp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Greeks (Display only) */}
        {leg.type !== 'stock' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Delta
              </label>
              <input
                type="number"
                value={leg.delta}
                onChange={(e) => onUpdate(leg.id, 'delta', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.375rem',
                  color: '#60a5fa',
                  fontSize: '0.75rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                IV
              </label>
              <input
                type="number"
                value={(leg.iv * 100).toFixed(1)}
                onChange={(e) => onUpdate(leg.id, 'iv', parseFloat(e.target.value) / 100 || 0)}
                step="1"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.375rem',
                  color: '#8b5cf6',
                  fontSize: '0.75rem'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, positive, negative }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</div>
    <div style={{ 
      fontSize: '1rem', 
      fontWeight: 'bold',
      color: positive ? '#10b981' : negative ? '#ef4444' : '#cbd5e1'
    }}>
      {value}
    </div>
  </div>
);

const GreekRow = ({ label, value, description, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</div>
      <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{description}</div>
  </div>
);

export default OptionsStrategyBuilder;
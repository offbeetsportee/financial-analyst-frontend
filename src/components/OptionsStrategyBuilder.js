import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, X, Save, Download, 
  Calculator, BarChart3, AlertCircle, Info, Zap, DollarSign,
  Loader, RefreshCw, Eye, EyeOff, Trash2, Activity, Search,
  HelpCircle, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const OptionsStrategyBuilder = ({ symbol: initialSymbol, underlyingPrice: initialPrice }) => {
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol || '');
  const [currentPrice, setCurrentPrice] = useState(initialPrice || 0);
  const [legs, setLegs] = useState([]);
  const [strategyName, setStrategyName] = useState('Custom Strategy');
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (initialSymbol) setCurrentSymbol(initialSymbol);
    if (initialPrice) setCurrentPrice(initialPrice);
  }, [initialSymbol, initialPrice]);

  useEffect(() => {
    if (currentSymbol) fetchOptionsData();
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

  // Load saved strategies
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
      const [expResponse, chainResponse, priceResponse] = await Promise.all([
        fetch(`${API_URL}/options/${currentSymbol}/expirations`),
        fetch(`${API_URL}/options/${currentSymbol}`),
        fetch(`${API_URL}/stocks/${currentSymbol}`)
      ]);

      const expData = await expResponse.json();
      if (expData.success) setExpirations(expData.expirations);

      const chainData = await chainResponse.json();
      if (chainData.success) setOptionsData(chainData.data);

      const priceData = await priceResponse.json();
      if (priceData.currentPrice) setCurrentPrice(priceData.currentPrice);
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

    let totalDelta = 0, totalGamma = 0, totalTheta = 0, totalVega = 0;

    legs.forEach(leg => {
      const multiplier = leg.position === 'long' ? 1 : -1;
      const contracts = leg.type === 'stock' ? 1 : leg.quantity;
      
      totalDelta += leg.delta * multiplier * contracts;
      totalGamma += leg.gamma * multiplier * contracts;
      totalTheta += leg.theta * multiplier * contracts;
      totalVega += leg.vega * multiplier * contracts;
    });

    setGreeks({ delta: totalDelta, gamma: totalGamma, theta: totalTheta, vega: totalVega });
  };

  const calculateMetrics = () => {
    if (legs.length === 0 || plData.length === 0) return;

    let maxProfit = -Infinity, maxLoss = Infinity, initialCost = 0;

    plData.forEach(point => {
      maxProfit = Math.max(maxProfit, point.pl);
      maxLoss = Math.min(maxLoss, point.pl);
    });

    legs.forEach(leg => {
      const cost = leg.premium * leg.quantity * (leg.type === 'stock' ? leg.quantity : 100);
      initialCost += leg.position === 'long' ? cost : -cost;
    });

    const profitablePoints = plData.filter(p => p.pl > 0).length;
    const pop = (profitablePoints / plData.length) * 100;
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
    <div style={{ paddingBottom: isMobile ? '4rem' : '2rem' }}>
      {/* Mobile-Optimized Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
        borderRadius: isMobile ? '0.5rem' : '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.25rem' : '2rem',
              fontWeight: 'bold', 
              marginBottom: '0.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <Calculator size={isMobile ? 24 : 32} color="white" />
              <span style={{ wordBreak: 'break-word' }}>Strategy Builder</span>
            </h2>
            <p style={{ color: '#e9d5ff', fontSize: isMobile ? '0.75rem' : '0.875rem', margin: 0 }}>
              Build and analyze options strategies
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowHelp(true)}
              style={{
                padding: '0.625rem',
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
              onClick={() => setShowAIChat(!showAIChat)}
              style={{
                padding: '0.625rem',
                background: showAIChat ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
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
            
            <button
              onClick={() => setShowSaved(!showSaved)}
              style={{
                padding: '0.625rem',
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
              {!isMobile && <span>Saved</span>}
              <span>({savedStrategies.length})</span>
            </button>
            
            {legs.length > 0 && (
              <>
                <button
                  onClick={saveStrategy}
                  style={{
                    padding: '0.625rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Save"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={exportStrategy}
                  style={{
                    padding: '0.625rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Export"
                >
                  <Download size={16} />
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
          padding: isMobile ? '1rem' : '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: isMobile ? '1rem' : '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
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
                    padding: isMobile ? '0.75rem' : '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                      {strategy.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {strategy.symbol} @ ${strategy.underlyingPrice.toFixed(2)} • {strategy.legs.length} legs
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
          Quick Templates
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.5rem' 
        }}>
          {Object.keys(STRATEGY_TEMPLATES).map(name => (
            <button
              key={name}
              onClick={() => loadTemplate(name)}
              disabled={!currentSymbol}
              style={{
                padding: isMobile ? '0.625rem 0.5rem' : '0.75rem',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '0.5rem',
                color: '#c4b5fd',
                cursor: currentSymbol ? 'pointer' : 'not-allowed',
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                fontWeight: '600',
                opacity: currentSymbol ? 1 : 0.5,
                transition: 'all 0.2s',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}
              onMouseEnter={(e) => currentSymbol && (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)')}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Configuration */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
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
          <StockSearchInline 
            currentSymbol={currentSymbol}
            onSelectStock={(symbol) => {
              setCurrentSymbol(symbol);
              fetchOptionsData();
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
              width: isMobile ? '100%' : '120px',
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
      </div>

      {/* Strategy Legs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: isMobile ? '1rem' : '1.125rem', margin: 0, fontWeight: '600' }}>
            Strategy Legs
          </h3>
          <button
            onClick={addLeg}
            disabled={!currentSymbol}
            style={{
              padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
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
            {!isMobile && 'Add Leg'}
          </button>
        </div>

        {legs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '1.5rem 1rem' : '2rem', color: '#94a3b8' }}>
            <Calculator size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontSize: isMobile ? '0.875rem' : '1rem' }}>
              No legs added yet. Add a leg or select a template to get started.
            </p>
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
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analysis Section */}
      {legs.length > 0 && (
        <>
          {/* P/L Chart */}
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
              <BarChart3 size={20} color="#60a5fa" />
              Profit/Loss Diagram
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
              <LineChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="price"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <ReferenceLine 
                  x={currentPrice} 
                  stroke="#60a5fa" 
                  strokeDasharray="5 5" 
                  label={{ value: 'Now', fill: '#60a5fa', fontSize: 12 }} 
                />
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
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics & Greeks */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            {/* Risk Metrics */}
            {metrics && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                padding: isMobile ? '1rem' : '1.5rem'
              }}>
                <h3 style={{ 
                  fontSize: isMobile ? '1rem' : '1.125rem',
                  marginBottom: '1rem', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <DollarSign size={20} color="#10b981" />
                  Risk Metrics
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <MetricRow label="Max Profit" value={metrics.maxProfit} positive />
                  <MetricRow label="Max Loss" value={metrics.maxLoss} negative />
                  <MetricRow label="Initial Cost" value={metrics.initialCost} />
                  <MetricRow label="Breakeven(s)" value={metrics.breakevens} small />
                  <MetricRow label="Prob. of Profit" value={metrics.pop} />
                  <MetricRow label="Risk/Reward" value={metrics.riskReward} />
                </div>
              </div>
            )}

            {/* Position Greeks */}
            {greeks && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                padding: isMobile ? '1rem' : '1.5rem'
              }}>
                <h3 style={{ 
                  fontSize: isMobile ? '1rem' : '1.125rem',
                  marginBottom: '1rem', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <Activity size={20} color="#8b5cf6" />
                  Position Greeks
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
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
        </>
      )}

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} isMobile={isMobile} />}

      {/* AI Assistant */}
      {showAIChat && (
        <AIStrategyAssistant
          currentSymbol={currentSymbol}
          legs={legs}
          metrics={metrics}
          greeks={greeks}
          onClose={() => setShowAIChat(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

// Strategy Leg Component
const StrategyLeg = ({ leg, index, onUpdate, onRemove, expirations, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  return (
    <div style={{
      background: 'rgba(51, 65, 85, 0.5)',
      border: '1px solid #475569',
      borderRadius: '0.5rem',
      padding: isMobile ? '0.75rem' : '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: isMobile ? '0.5rem' : '1rem',
        cursor: isMobile ? 'pointer' : 'default'
      }}
      onClick={() => isMobile && setIsExpanded(!isExpanded)}
      >
        <div style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          Leg {index + 1}
          {isMobile && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(leg.id);
          }}
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

      {(!isMobile || isExpanded) && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: isMobile ? '0.5rem' : '0.75rem' 
        }}>
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
                padding: isMobile ? '0.5rem' : '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: isMobile ? '0.7rem' : '0.75rem'
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
                padding: isMobile ? '0.5rem' : '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: leg.position === 'long' ? '#10b981' : '#ef4444',
                fontSize: isMobile ? '0.7rem' : '0.75rem',
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
                  padding: isMobile ? '0.5rem' : '0.5rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
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
                padding: isMobile ? '0.5rem' : '0.5rem',
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: isMobile ? '0.7rem' : '0.75rem'
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
                  padding: isMobile ? '0.5rem' : '0.5rem',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }}
              />
            </div>
          )}

          {/* Delta */}
          {leg.type !== 'stock' && !isMobile && (
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
          )}

          {/* IV */}
          {leg.type !== 'stock' && !isMobile && (
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                IV %
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
          )}
        </div>
      )}
    </div>
  );
};

// Metric Row Component
const MetricRow = ({ label, value, positive, negative, small }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</div>
    <div style={{ 
      fontSize: small ? '0.75rem' : '1rem',
      fontWeight: 'bold',
      color: positive ? '#10b981' : negative ? '#ef4444' : '#cbd5e1'
    }}>
      {value}
    </div>
  </div>
);

// Greek Row Component
const GreekRow = ({ label, value, description, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</div>
      <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{description}</div>
  </div>
);

// Stock Search Component
const StockSearchInline = ({ currentSymbol, onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://financial-analyst-backend-production-7175.up.railway.app/api';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/stocks/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelectStock(symbol);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: '#1e293b',
        borderRadius: '0.5rem',
        border: '1px solid #334155',
        padding: '0.75rem',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder={currentSymbol || "Search stocks..."}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '0.875rem',
            position: 'relative',
            zIndex: 2
          }}
        />
        {loading && <Loader size={16} className="spin" color="#60a5fa" />}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid #475569',
          borderRadius: '0.5rem',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}>
          {results.map((stock, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(stock.symbol)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: idx < results.length - 1 ? '1px solid #334155' : 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: '600', color: '#8b5cf6', fontSize: '0.875rem' }}>
                {stock.symbol}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.125rem' }}>
                {stock.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.125rem' }}>
                {stock.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Help Modal Component
const HelpModal = ({ onClose, isMobile }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    overview: {
      title: '📊 Overview',
      content: (
        <>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Build, analyze, and save complex options strategies with multiple legs.
          </p>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>Key Features:</h4>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Build unlimited multi-leg strategies</li>
            <li>12 pre-built strategy templates</li>
            <li>Visual profit/loss diagrams</li>
            <li>Real-time Greeks calculations</li>
            <li>Risk metrics analysis</li>
            <li>Save and load strategies</li>
            <li>AI Strategy Assistant</li>
          </ul>
        </>
      )
    },
    quickstart: {
      title: '🚀 Quick Start',
      content: (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>1. Select a Stock</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Use the search field to find a stock (e.g., AAPL, TSLA, SPY).
            </p>

            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>2. Choose a Strategy</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Click a template button or "Add Leg" to build custom.
            </p>

            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>3. Analyze & Save</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              View P/L diagram, adjust strikes, save your strategy!
            </p>
          </div>
        </>
      )
    },
    templates: {
      title: '⚡ Strategy Templates',
      content: (
        <>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <TemplateCard name="Bull Call Spread" desc="Bullish, limited risk" />
            <TemplateCard name="Bear Put Spread" desc="Bearish, limited risk" />
            <TemplateCard name="Long Straddle" desc="Big moves, either direction" />
            <TemplateCard name="Iron Condor" desc="Range-bound, premium collection" />
            <TemplateCard name="Covered Call" desc="Generate income on holdings" />
            <TemplateCard name="Protective Put" desc="Protect stock position" />
          </div>
        </>
      )
    },
    chart: {
      title: '📈 P/L Diagram',
      content: (
        <>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid #60a5fa' }}>
              <strong style={{ color: '#60a5fa' }}>Blue Line:</strong> Current stock price
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid #f59e0b' }}>
              <strong style={{ color: '#f59e0b' }}>Orange Lines:</strong> Breakeven points
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid #10b981' }}>
              <strong style={{ color: '#10b981' }}>Above Zero:</strong> Profit zone
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid #ef4444' }}>
              <strong style={{ color: '#ef4444' }}>Below Zero:</strong> Loss zone
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            💡 Tap/hover chart to see P/L at any price!
          </p>
        </>
      )
    },
    greeks: {
      title: '🔢 Greeks',
      content: (
        <>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <GreekCard name="Delta" desc="Price sensitivity. +0.50 = gain $50 per $1 stock move" color="#60a5fa" />
            <GreekCard name="Gamma" desc="Delta acceleration. How fast delta changes" color="#10b981" />
            <GreekCard name="Theta" desc="Time decay. Value lost per day" color="#ef4444" />
            <GreekCard name="Vega" desc="Volatility sensitivity. Impact of IV changes" color="#8b5cf6" />
          </div>
        </>
      )
    },
    ai: {
      title: '🤖 AI Assistant',
      content: (
        <>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Click the AI button to get personalized help with your strategy!
          </p>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>The AI can:</h4>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Analyze your current strategy</li>
            <li>Suggest improvements</li>
            <li>Explain options concepts</li>
            <li>Answer specific questions</li>
            <li>Compare different approaches</li>
          </ul>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem' }}>
            💡 Try asking: "What's my risk?" or "How can I improve this?"
          </p>
        </>
      )
    },
    tips: {
      title: '💡 Pro Tips',
      content: (
        <>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <TipCard tip="Start with templates to learn how strategies work" />
            <TipCard tip="Always check max loss before trading" />
            <TipCard tip="Watch theta - negative means you lose daily" />
            <TipCard tip="Compare strategies by saving and loading" />
            <TipCard tip="Use AI assistant for personalized advice" />
            <TipCard tip="On mobile: Tap leg headers to expand/collapse" />
          </div>
        </>
      )
    }
  };

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
          maxWidth: isMobile ? '100%' : '800px',
          maxHeight: '90vh',
          border: '1px solid #475569',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden'
        }}>
        
        {/* Sidebar */}
        <div style={{
          width: isMobile ? '100%' : '240px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRight: isMobile ? 'none' : '1px solid #475569',
          borderBottom: isMobile ? '1px solid #475569' : 'none',
          padding: '1.5rem',
          overflowY: 'auto',
          maxHeight: isMobile ? '150px' : 'none'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} color="#8b5cf6" />
            Guide
          </h3>
          <div style={{ display: isMobile ? 'flex' : 'block', gap: isMobile ? '0.5rem' : '0', overflowX: isMobile ? 'auto' : 'visible' }}>
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                style={{
                  width: isMobile ? 'auto' : '100%',
                  padding: '0.75rem',
                  marginBottom: isMobile ? '0' : '0.5rem',
                  background: activeSection === key ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  border: activeSection === key ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  borderRadius: '0.5rem',
                  color: activeSection === key ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textAlign: 'left',
                  whiteSpace: isMobile ? 'nowrap' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: isMobile ? '1.5rem' : '2rem',
          overflowY: 'auto',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
          >
            <X size={20} />
          </button>

          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '1rem', color: '#cbd5e1', paddingRight: '2rem' }}>
            {sections[activeSection].title}
          </h2>
          <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
            {sections[activeSection].content}
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateCard = ({ name, desc }) => (
  <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem', border: '1px solid #475569' }}>
    <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '0.25rem' }}>{name}</div>
    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{desc}</div>
  </div>
);

const GreekCard = ({ name, desc, color }) => (
  <div style={{ padding: '0.75rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem', border: `1px solid ${color}40` }}>
    <strong style={{ color }}>{name}:</strong> <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{desc}</span>
  </div>
);

const TipCard = ({ tip }) => (
  <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '0.5rem' }}>
    <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>• {tip}</span>
  </div>
);

// AI Strategy Assistant Component
const AIStrategyAssistant = ({ currentSymbol, legs, metrics, greeks, onClose, isMobile }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Strategy Assistant. I can help you analyze strategies, suggest improvements, and explain concepts.\n\n${currentSymbol ? `You're building a strategy for ${currentSymbol}.` : 'Select a stock to get started!'}`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    "Analyze my strategy",
    "What's my risk?",
    "How to improve?",
    "Explain Greeks",
    "What if stock moves 10%?"
  ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        symbol: currentSymbol,
        legs: legs,
        metrics: metrics,
        greeks: greeks,
        strategyType: legs.length > 0 ? `${legs.length}-leg strategy` : 'No strategy yet'
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://financial-analyst-backend-production-7175.up.railway.app/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            type: 'options_strategy',
            data: context
          }
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I'm here to help! Ask me about your options strategy.",
        demo: data.demo
      }]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '1rem' : '2rem',
      right: isMobile ? '1rem' : '2rem',
      left: isMobile ? '1rem' : 'auto',
      width: isMobile ? 'auto' : '400px',
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
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        padding: isMobile ? '0.875rem' : '1rem',
        borderRadius: '1rem 1rem 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="white" />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>
              AI Assistant
            </h3>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>
              Strategy Help
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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} color="white" />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '0.875rem' : '1rem',
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
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#c4b5fd',
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
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: msg.role === 'user' ? '#3b82f6' : '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.7rem'
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              flex: 1,
              padding: '0.625rem',
              background: msg.role === 'user' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : msg.error 
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(51, 65, 85, 0.5)',
              border: `1px solid ${msg.role === 'user' ? '#3b82f6' : msg.error ? '#ef4444' : '#475569'}`,
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {msg.content}
              {msg.demo && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.7rem',
                  color: '#fbbf24'
                }}>
                  ⚠️ Demo - Add API key
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem'
            }}>
              🤖
            </div>
            <div style={{
              padding: '0.625rem',
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid #475569',
              borderRadius: '0.75rem'
            }}>
              <Loader size={14} className="spin" color="#8b5cf6" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: isMobile ? '0.875rem' : '1rem',
        borderTop: '1px solid #475569'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your strategy..."
            disabled={loading}
            style={{
              flex: 1,
              padding: isMobile ? '0.625rem' : '0.75rem',
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
              padding: isMobile ? '0.625rem' : '0.75rem',
              background: loading || !input.trim() ? '#475569' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsStrategyBuilder;
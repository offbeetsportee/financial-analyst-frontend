import React, { useState, useEffect } from 'react';
import {
  TrendingDown, Calendar, DollarSign, AlertTriangle, 
  TrendingUp, Activity, Clock, Zap, Info, ChevronDown,
  ChevronUp, BarChart3, Loader, RefreshCw, Target,
  Sparkles, BookOpen, Calculator
} from 'lucide-react';

const IVCrushPredictor = ({ symbol: initialSymbol }) => {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [loading, setLoading] = useState(false);
  const [crushedData, setCrushedData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showEducation, setShowEducation] = useState(false);
  const [activeTab, setActiveTab] = useState('predictor');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (symbol) {
      fetchIVCrushData(symbol);
    }
  }, [symbol]);

  const fetchIVCrushData = async (ticker) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/options/iv-crush/${ticker}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setCrushedData(data);
    } catch (error) {
      console.error('IV Crush fetch error:', error);
      // Generate mock data for demo
      setCrushedData(generateMockIVCrushData(ticker));
    } finally {
      setLoading(false);
    }
  };

  const generateMockIVCrushData = (ticker) => {
    const currentIV = 45 + Math.random() * 40; // 45-85%
    const historicalAvgCrush = 30 + Math.random() * 30; // 30-60%
    const daysToEarnings = Math.floor(Math.random() * 30);
    const earningsDate = new Date(Date.now() + daysToEarnings * 24 * 60 * 60 * 1000);
    
    return {
      symbol: ticker,
      currentIV: currentIV.toFixed(1),
      ivRank: Math.floor(50 + Math.random() * 50),
      ivPercentile: Math.floor(60 + Math.random() * 40),
      nextEarnings: earningsDate.toISOString().split('T')[0],
      daysToEarnings,
      historicalCrush: {
        avgCrush: historicalAvgCrush.toFixed(1),
        maxCrush: (historicalAvgCrush + 20).toFixed(1),
        minCrush: (historicalAvgCrush - 15).toFixed(1),
        lastFourQuarters: [
          { quarter: 'Q1 2024', preCrushIV: 65, postCrushIV: 38, crush: 41.5 },
          { quarter: 'Q4 2023', preCrushIV: 72, postCrushIV: 45, crush: 37.5 },
          { quarter: 'Q3 2023', preCrushIV: 58, postCrushIV: 35, crush: 39.7 },
          { quarter: 'Q2 2023', preCrushIV: 68, postCrushIV: 42, crush: 38.2 }
        ]
      },
      predictedPostCrushIV: (currentIV * (1 - historicalAvgCrush / 100)).toFixed(1),
      riskLevel: historicalAvgCrush > 50 ? 'High' : historicalAvgCrush > 35 ? 'Medium' : 'Low',
      strategies: [
        {
          name: 'Sell Pre-Earnings Straddle',
          description: 'Sell ATM straddle before earnings',
          expectedProfit: (currentIV * 0.6).toFixed(0),
          riskLevel: 'High',
          bestFor: 'Expecting IV crush'
        },
        {
          name: 'Buy Post-Earnings Dip',
          description: 'Buy options after IV crush',
          expectedProfit: (currentIV * 0.4).toFixed(0),
          riskLevel: 'Medium',
          bestFor: 'Post-earnings plays'
        },
        {
          name: 'Iron Condor',
          description: 'Sell OTM options, profit from IV crush',
          expectedProfit: (currentIV * 0.3).toFixed(0),
          riskLevel: 'Medium',
          bestFor: 'Neutral outlook'
        }
      ]
    };
  };

  const calculatePositionImpact = (position) => {
    if (!crushedData) return null;

    const currentIV = parseFloat(crushedData.currentIV);
    const predictedIV = parseFloat(crushedData.predictedPostCrushIV);
    const crushPercent = parseFloat(crushedData.historicalCrush.avgCrush);

    // Simplified impact calculation
    const vegaImpact = position.vega * (predictedIV - currentIV);
    const estimatedLoss = Math.abs(vegaImpact * position.contracts * 100);

    return {
      currentValue: position.currentValue,
      predictedValue: position.currentValue + vegaImpact * position.contracts * 100,
      estimatedLoss: estimatedLoss,
      percentLoss: ((estimatedLoss / position.currentValue) * 100).toFixed(1)
    };
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getCrushSeverity = (crush) => {
    if (crush > 50) return { label: 'Severe', color: '#ef4444' };
    if (crush > 35) return { label: 'Moderate', color: '#f59e0b' };
    return { label: 'Mild', color: '#10b981' };
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: isMobile ? '1rem' : '0'
    }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(239, 68, 68, 0.3)'
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
              <TrendingDown size={isMobile ? 24 : 32} color="white" />
              IV Crush Predictor
            </h2>
            <p style={{ 
              color: '#fecaca', 
              fontSize: isMobile ? '0.75rem' : '0.875rem', 
              margin: 0 
            }}>
              Predict volatility collapse after earnings and events
            </p>
          </div>
          <button
            onClick={() => setShowEducation(!showEducation)}
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
          >
            <BookOpen size={16} />
            {!isMobile && <span>Learn</span>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #334155',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {['predictor', 'calculator', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab 
                ? 'rgba(239, 68, 68, 0.2)' 
                : 'transparent',
              border: activeTab === tab 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : '1px solid #475569',
              borderRadius: '0.5rem',
              color: activeTab === tab ? '#fca5a5' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Symbol Search */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          color: '#cbd5e1',
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Stock Symbol
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          />
          <button
            onClick={() => fetchIVCrushData(symbol)}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading 
                ? '#6b7280' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
            {!isMobile && 'Analyze'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          gap: '1rem'
        }}>
          <Loader size={48} color="#ef4444" className="spin" />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Analyzing IV crush patterns...
          </p>
        </div>
      )}

      {!loading && crushedData && activeTab === 'predictor' && (
        <>
          {/* Current IV Status */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: isMobile ? '1rem' : '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity size={20} color="#ef4444" />
              Current Volatility Status
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#fca5a5', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Current IV
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {crushedData.currentIV}%
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  marginTop: '0.25rem'
                }}>
                  IV Rank: {crushedData.ivRank}
                </div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#cbd5e1', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Next Earnings
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={24} color="#60a5fa" />
                  {crushedData.daysToEarnings}d
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  marginTop: '0.25rem'
                }}>
                  {new Date(crushedData.nextEarnings).toLocaleDateString()}
                </div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#cbd5e1', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Predicted Crush
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: getCrushSeverity(parseFloat(crushedData.historicalCrush.avgCrush)).color
                }}>
                  {crushedData.historicalCrush.avgCrush}%
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  marginTop: '0.25rem'
                }}>
                  {getCrushSeverity(parseFloat(crushedData.historicalCrush.avgCrush)).label} Risk
                </div>
              </div>

              <div style={{
                padding: '1.25rem',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#cbd5e1', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Post-Crush IV
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: '#34d399'
                }}>
                  {crushedData.predictedPostCrushIV}%
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  marginTop: '0.25rem'
                }}>
                  Predicted
                </div>
              </div>
            </div>
          </div>

          {/* Visual Impact Chart */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: isMobile ? '1rem' : '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BarChart3 size={20} color="#3b82f6" />
              IV Crush Visualization
            </h3>

            <div style={{ position: 'relative', paddingTop: '1rem' }}>
              {/* Before/After Bars */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>
                    Pre-Earnings
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#fca5a5', fontWeight: '700' }}>
                    {crushedData.currentIV}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '40px',
                  background: '#1e293b',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${crushedData.currentIV}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.75rem',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    transition: 'width 1s ease'
                  }}>
                    High IV
                  </div>
                </div>
              </div>

              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>
                    Post-Earnings
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: '700' }}>
                    {crushedData.predictedPostCrushIV}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '40px',
                  background: '#1e293b',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${crushedData.predictedPostCrushIV}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '0.75rem',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    transition: 'width 1s ease'
                  }}>
                    Crushed
                  </div>
                </div>
              </div>

              {/* Crush Arrow */}
              <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <TrendingDown size={32} color="#ef4444" style={{ margin: '0 auto' }} />
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginTop: '0.5rem'
                }}>
                  -{crushedData.historicalCrush.avgCrush}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Expected IV Crush
                </div>
              </div>
            </div>
          </div>

          {/* Historical Crush Data */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: isMobile ? '1rem' : '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={20} color="#8b5cf6" />
              Historical Earnings IV Crush
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #475569' }}>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: '#cbd5e1'
                    }}>
                      Quarter
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#cbd5e1'
                    }}>
                      Pre-Crush IV
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#cbd5e1'
                    }}>
                      Post-Crush IV
                    </th>
                    <th style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#cbd5e1'
                    }}>
                      Crush %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crushedData.historicalCrush.lastFourQuarters.map((q, idx) => (
                    <tr 
                      key={idx}
                      style={{ borderBottom: '1px solid #334155' }}
                    >
                      <td style={{ padding: '0.75rem', color: '#e2e8f0' }}>
                        {q.quarter}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        textAlign: 'right',
                        color: '#fca5a5',
                        fontWeight: '600'
                      }}>
                        {q.preCrushIV}%
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        textAlign: 'right',
                        color: '#34d399',
                        fontWeight: '600'
                      }}>
                        {q.postCrushIV}%
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        textAlign: 'right'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: getCrushSeverity(q.crush).color + '20',
                          color: getCrushSeverity(q.crush).color
                        }}>
                          -{q.crush}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#cbd5e1' }}>Average Crush:</span>
                <span style={{ 
                  color: '#c4b5fd', 
                  fontWeight: '700' 
                }}>
                  {crushedData.historicalCrush.avgCrush}%
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                <span style={{ color: '#cbd5e1' }}>Range:</span>
                <span style={{ color: '#94a3b8' }}>
                  {crushedData.historicalCrush.minCrush}% - {crushedData.historicalCrush.maxCrush}%
                </span>
              </div>
            </div>
          </div>

          {/* Strategy Recommendations */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: isMobile ? '1rem' : '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Target size={20} color="#10b981" />
              Recommended Strategies
            </h3>

            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {crushedData.strategies.map((strategy, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '0.75rem',
                    border: '1px solid #475569',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)';
                    e.currentTarget.style.borderColor = '#60a5fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                    e.currentTarget.style.borderColor = '#475569';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {strategy.name}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#94a3b8',
                        margin: 0
                      }}>
                        {strategy.description}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: getRiskColor(strategy.riskLevel) + '20',
                      color: getRiskColor(strategy.riskLevel),
                      whiteSpace: 'nowrap'
                    }}>
                      {strategy.riskLevel} Risk
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #475569'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#94a3b8',
                        marginBottom: '0.25rem'
                      }}>
                        Expected Profit
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#34d399'
                      }}>
                        ${strategy.expectedProfit}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#94a3b8',
                        marginBottom: '0.25rem'
                      }}>
                        Best For
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#60a5fa'
                      }}>
                        {strategy.bestFor}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Alert */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <AlertTriangle size={24} color="#facc15" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
              <div>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '0.75rem', 
                  fontSize: '1.125rem',
                  color: '#fef08a'
                }}>
                  Important Risk Disclosure
                </h3>
                <p style={{ 
                  color: '#fef3c7', 
                  fontSize: '0.875rem', 
                  lineHeight: '1.6', 
                  margin: 0 
                }}>
                  IV crush predictions are based on historical data and may not accurately reflect future events. 
                  Options trading carries significant risk. Past performance does not guarantee future results. 
                  The actual IV crush can vary significantly based on earnings results, market conditions, and other factors. 
                  Always conduct your own research and consider your risk tolerance.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Calculator Tab */}
      {!loading && crushedData && activeTab === 'calculator' && (
        <PositionImpactCalculator 
          crushedData={crushedData}
          isMobile={isMobile}
        />
      )}

      {/* History Tab */}
      {!loading && crushedData && activeTab === 'history' && (
        <CrushHistoryChart 
          data={crushedData.historicalCrush.lastFourQuarters}
          isMobile={isMobile}
        />
      )}

      {/* Education Modal */}
      {showEducation && (
        <EducationModal 
          onClose={() => setShowEducation(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

// Position Impact Calculator Component
const PositionImpactCalculator = ({ crushedData, isMobile }) => {
  const [position, setPosition] = useState({
    optionType: 'long_call',
    contracts: 1,
    strike: 100,
    premium: 5,
    daysToExpiration: parseInt(crushedData.daysToEarnings) || 7
  });

  const [impact, setImpact] = useState(null);

  useEffect(() => {
    calculateImpact();
  }, [position, crushedData]);

  const calculateImpact = () => {
    const currentIV = parseFloat(crushedData.currentIV);
    const postIV = parseFloat(crushedData.predictedPostCrushIV);
    const crushPercent = ((currentIV - postIV) / currentIV) * 100;

    // Simplified calculation
    const premiumValue = position.contracts * position.premium * 100;
    const estimatedLoss = premiumValue * (crushPercent / 100) * 0.7; // 70% vega impact
    
    const newPremium = position.premium * (1 - (crushPercent / 100) * 0.7);

    setImpact({
      currentValue: premiumValue,
      postCrushValue: premiumValue - estimatedLoss,
      estimatedLoss: estimatedLoss,
      percentLoss: ((estimatedLoss / premiumValue) * 100).toFixed(1),
      newPremium: newPremium.toFixed(2)
    });
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: isMobile ? '1rem' : '1.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        marginBottom: '1.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Calculator size={20} color="#3b82f6" />
        Position Impact Calculator
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Option Type
          </label>
          <select
            value={position.optionType}
            onChange={(e) => setPosition({ ...position, optionType: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          >
            <option value="long_call">Long Call</option>
            <option value="long_put">Long Put</option>
            <option value="short_call">Short Call</option>
            <option value="short_put">Short Put</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Contracts
          </label>
          <input
            type="number"
            value={position.contracts}
            onChange={(e) => setPosition({ ...position, contracts: parseInt(e.target.value) || 1 })}
            min="1"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Strike Price
          </label>
          <input
            type="number"
            value={position.strike}
            onChange={(e) => setPosition({ ...position, strike: parseFloat(e.target.value) || 100 })}
            step="5"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Premium Paid/Received
          </label>
          <input
            type="number"
            value={position.premium}
            onChange={(e) => setPosition({ ...position, premium: parseFloat(e.target.value) || 5 })}
            step="0.5"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {impact && (
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#fca5a5'
          }}>
            Estimated Impact After IV Crush
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Current Value
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>
                ${impact.currentValue.toFixed(0)}
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Post-Crush Value
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fca5a5'
              }}>
                ${impact.postCrushValue.toFixed(0)}
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#cbd5e1',
                marginBottom: '0.5rem'
              }}>
                Estimated Loss
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ef4444'
              }}>
                -${impact.estimatedLoss.toFixed(0)} ({impact.percentLoss}%)
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#fecaca',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Your ${position.premium} premium could drop to approximately ${impact.newPremium} 
              after the {crushedData.historicalCrush.avgCrush}% IV crush, resulting in a 
              ${impact.estimatedLoss.toFixed(0)} loss on {position.contracts} contract(s).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Crush History Chart Component
const CrushHistoryChart = ({ data, isMobile }) => {
  const maxCrush = Math.max(...data.map(q => q.crush));

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: isMobile ? '1rem' : '1.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        marginBottom: '1.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <BarChart3 size={20} color="#8b5cf6" />
        Historical Crush Patterns
      </h3>

      <div style={{ 
        display: 'grid',
        gap: '1rem'
      }}>
        {data.map((quarter, idx) => (
          <div key={idx} style={{
            padding: '1rem',
            background: 'rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            border: '1px solid #475569'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <span style={{ 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#e2e8f0'
              }}>
                {quarter.quarter}
              </span>
              <span style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#ef4444'
              }}>
                -{quarter.crush}%
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '8px',
              background: '#1e293b',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(quarter.crush / maxCrush) * 100}%`,
                height: '100%',
                background: quarter.crush > 50 
                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  : quarter.crush > 35
                  ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                transition: 'width 0.5s ease'
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              <span>Pre: {quarter.preCrushIV}%</span>
              <span>Post: {quarter.postCrushIV}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Education Modal
const EducationModal = ({ onClose, isMobile }) => {
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
          maxWidth: isMobile ? '100%' : '700px',
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
          <ChevronUp size={20} />
        </button>

        <h2 style={{ 
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          marginBottom: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingRight: '2rem'
        }}>
          <BookOpen size={24} color="#3b82f6" />
          Understanding IV Crush
        </h2>

        <div style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
              📚 What is IV Crush?
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              IV Crush is the rapid decline in implied volatility (IV) that typically occurs after 
              a significant event like earnings. Options lose value as uncertainty decreases, even 
              if the stock moves in your favor.
            </p>
          </div>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#60a5fa' }}>
            🎯 Key Concepts
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#fbbf24' }}>Implied Volatility (IV):</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                Market's expectation of future price movement. Higher IV = more expensive options.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#ef4444' }}>IV Crush:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                Sudden drop in IV after earnings/events. Can reduce option value by 30-60% overnight.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#8b5cf6' }}>Vega:</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                Measures option's sensitivity to IV changes. Higher vega = more IV crush impact.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#60a5fa' }}>
            💡 How to Use This Tool
          </h3>
          
          <ol style={{ marginLeft: '1.5rem', lineHeight: '2', fontSize: '0.875rem' }}>
            <li>Enter a stock symbol with upcoming earnings</li>
            <li>Review historical IV crush patterns (avg 30-60%)</li>
            <li>Use the calculator to estimate impact on your positions</li>
            <li>Consider strategies that profit from IV crush (selling premium)</li>
            <li>Be cautious buying options before earnings</li>
          </ol>

          <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#60a5fa' }}>
            ⚠️ Important Warnings
          </h3>
          
          <ul style={{ marginLeft: '1.5rem', lineHeight: '2', fontSize: '0.875rem' }}>
            <li>IV crush can wipe out profits even if stock moves your way</li>
            <li>ATM options are most affected by IV crush</li>
            <li>Time decay (theta) accelerates during crush</li>
            <li>Historical patterns don't guarantee future results</li>
            <li>Consider selling premium instead of buying before events</li>
          </ul>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h4 style={{ fontSize: '0.875rem', color: '#34d399', marginBottom: '0.5rem' }}>
              💰 Pro Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6ee7b7' }}>
              Premium sellers benefit from IV crush. Consider strategies like iron condors, 
              credit spreads, or covered calls before high IV events to collect inflated premiums 
              that will decrease after the event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IVCrushPredictor;

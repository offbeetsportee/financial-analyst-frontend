import React, { useState, useEffect } from 'react';
import {
  Calendar, TrendingUp, TrendingDown, Target, Award,
  AlertCircle, BarChart3, Loader, RefreshCw, Check, X,
  Zap, Clock, DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EarningsCalendar = ({ symbol }) => {
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (symbol) {
      fetchEarningsData();
    }
  }, [symbol]);

  const fetchEarningsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, analysisRes] = await Promise.all([
        fetch(`${API_URL}/earnings/history/${symbol}`),
        fetch(`${API_URL}/earnings/analysis/${symbol}`)
      ]);
      
      if (!historyRes.ok || !analysisRes.ok) {
        throw new Error('Failed to fetch earnings data');
      }
      
      const historyData = await historyRes.json();
      const analysisData = await analysisRes.json();
      
      setEarningsData(historyData);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <Loader size={32} className="spin" style={{ color: '#60a5fa', margin: '0 auto' }} />
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading earnings data...</p>
      </div>
    );
  }

  if (error || !earningsData || !analysis) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#f87171' }}>{error || 'No earnings data available'}</p>
        <button
          onClick={fetchEarningsData}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#ef4444',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9' }}>
            Earnings Calendar & Analysis
          </h3>
        </div>
        
        <button
          onClick={fetchEarningsData}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #475569',
            background: '#334155',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#60a5fa';
            e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#475569';
            e.currentTarget.style.background = '#334155';
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #334155',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {['calendar', 'history', 'analysis'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem 0.375rem 0 0',
              border: 'none',
              background: activeTab === tab ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
              color: activeTab === tab ? '#60a5fa' : '#cbd5e1',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? '600' : '400',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div>
          {analysis.upcoming ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock size={20} color="#60a5fa" />
                <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1.125rem', fontWeight: '600' }}>
                  Upcoming Earnings
                </h4>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Report Date
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9' }}>
                    {new Date(analysis.upcoming.reportDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Days Until
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: analysis.upcoming.daysUntil <= 7 ? '#fbbf24' : '#60a5fa'
                  }}>
                    {analysis.upcoming.daysUntil} days
                  </div>
                </div>
                
                {analysis.upcoming.estimate && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Est. EPS
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9' }}>
                      ${analysis.upcoming.estimate}
                    </div>
                  </div>
                )}
              </div>
              
              {analysis.upcoming.daysUntil <= 14 && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <Zap size={20} color="#fbbf24" />
                  <div style={{ fontSize: '0.875rem', color: '#fbbf24' }}>
                    <strong>Earnings Alert!</strong> Report coming in {analysis.upcoming.daysUntil} days.
                    Check IV Crush Predictor for options strategies.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <Calendar size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
              <p style={{ color: '#94a3b8', margin: 0 }}>
                No upcoming earnings date available
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {/* Performance Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Check size={18} color="#10b981" />
                <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                  Beats
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {analysis.performance?.beats || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Last 8 quarters
              </div>
            </div>
            
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <X size={18} color="#ef4444" />
                <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' }}>
                  Misses
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                {analysis.performance?.misses || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Last 8 quarters
              </div>
            </div>
            
            <div style={{
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Target size={18} color="#60a5fa" />
                <span style={{ fontSize: '0.875rem', color: '#60a5fa', fontWeight: '600' }}>
                  Beat Rate
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>
                {analysis.performance?.beatRate || 0}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Success rate
              </div>
            </div>
            
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.875rem', color: '#fbbf24', fontWeight: '600' }}>
                  Beat Streak
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
                {earningsData.analysis?.beatStreak || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Consecutive
              </div>
            </div>
          </div>

          {/* EPS Trend Chart */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#f1f5f9', fontSize: '1rem', fontWeight: '600' }}>
              EPS Trend (Last 8 Quarters)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={earningsData.quarterly.slice(0, 8).reverse()}>
                <XAxis
                  dataKey="quarter"
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reportedEPS"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  name="Reported EPS"
                  dot={{ fill: '#60a5fa', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="estimatedEPS"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Estimated EPS"
                  dot={{ fill: '#94a3b8', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings History Table */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            overflowX: 'auto'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#f1f5f9', fontSize: '1rem', fontWeight: '600' }}>
              Quarterly Earnings History
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>
                    Quarter
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>
                    Reported
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>
                    Estimated
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>
                    Surprise
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsData.quarterly.slice(0, 12).map((q, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '0.75rem', color: '#f1f5f9', fontSize: '0.875rem' }}>
                      {q.quarter}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      ${q.reportedEPS.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.875rem' }}>
                      ${q.estimatedEPS.toFixed(2)}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      textAlign: 'right',
                      color: q.beat ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {q.beat ? '+' : ''}{q.surprisePct}%
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {q.beat ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#10b981'
                        }}>
                          <Check size={14} />
                          Beat
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#ef4444'
                        }}>
                          <X size={14} />
                          Miss
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Quality Score */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#f1f5f9', fontSize: '1rem', fontWeight: '600' }}>
              Earnings Quality Score
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: `8px solid ${
                  analysis.quality?.score >= 80 ? '#10b981' :
                  analysis.quality?.score >= 60 ? '#60a5fa' :
                  analysis.quality?.score >= 40 ? '#f59e0b' : '#ef4444'
                }`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9' }}>
                  {analysis.quality?.score || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Grade {analysis.quality?.grade || 'N/A'}
                </div>
              </div>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Based on earnings consistency, beat rate, and growth trends
                </p>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                      Consistency
                    </span>
                    <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.875rem' }}>
                      {analysis.consistency?.score || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                      Growth Trend
                    </span>
                    <span style={{
                      color: analysis.growth?.direction === 'Growing' ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {analysis.growth?.direction || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                      YoY Growth Rate
                    </span>
                    <span style={{
                      color: parseFloat(analysis.growth?.rate) > 0 ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {analysis.growth?.rate || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={20} color="#10b981" />
                <h5 style={{ margin: 0, color: '#10b981', fontSize: '1rem', fontWeight: '600' }}>
                  EPS Trend
                </h5>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                {analysis.trends?.direction || 'N/A'}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Last 4 quarters
              </div>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={20} color="#60a5fa" />
                <h5 style={{ margin: 0, color: '#60a5fa', fontSize: '1rem', fontWeight: '600' }}>
                  Avg Surprise
                </h5>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                {earningsData.analysis?.avgSurprise || 0}%
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Last 8 quarters
              </div>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BarChart3 size={20} color="#f59e0b" />
                <h5 style={{ margin: 0, color: '#f59e0b', fontSize: '1rem', fontWeight: '600' }}>
                  Consistency
                </h5>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                {earningsData.analysis?.consistencyScore || 0}%
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Beat rate
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsCalendar;
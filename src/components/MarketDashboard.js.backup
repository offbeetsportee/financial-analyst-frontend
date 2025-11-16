import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Calendar, TrendingUp as TrendIcon } from 'lucide-react';
import { marketAPI } from '../services/api';

const MarketDashboard = ({ currentIndicators }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState('Federal Funds Rate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [historical, eventData] = await Promise.all([
        marketAPI.getHistoricalData(10),
        marketAPI.getMarketEvents()
      ]);
      setHistoricalData(historical);
      setEvents(eventData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Investor implications based on current values
  const getInvestorGuidance = (indicator, value) => {
  const guidance = {
    'Federal Funds Rate': {
      high: { threshold: 4, action: 'defensive', message: 'High rates make borrowing expensive. Consider defensive stocks, bonds, and dividend-paying companies.' },
      low: { threshold: 2, action: 'aggressive', message: 'Low rates encourage growth. Good time for growth stocks, real estate, and riskier investments.' },
      rising: { message: 'Rising rates typically hurt growth stocks. Pivot to value stocks and shorter-duration bonds.' },
      falling: { message: 'Falling rates boost stocks, especially tech and growth. Good time to increase equity exposure.' }
    },
    'Inflation Rate (CPI)': {
      high: { threshold: 3, action: 'inflation-hedge', message: 'High inflation erodes purchasing power. Consider commodities, real estate, TIPS, and inflation-resistant stocks.' },
      low: { threshold: 2, action: 'growth', message: 'Low inflation is ideal for growth. Stocks and long-term bonds perform well.' },
      rising: { message: 'Rising inflation pressures the Fed to raise rates. Avoid long-duration bonds, favor commodities and value stocks.' },
      falling: { message: 'Falling inflation allows Fed to ease policy. Bullish for bonds and growth stocks.' }
    },
    'Unemployment Rate': {
      high: { threshold: 6, action: 'defensive', message: 'High unemployment signals recession risk. Stay defensive with consumer staples, utilities, and cash.' },
      low: { threshold: 4, action: 'cyclical', message: 'Low unemployment shows economic strength. Good for cyclical stocks and consumer discretionary.' },
      rising: { message: 'Rising unemployment warns of economic slowdown. Reduce risk, increase cash positions.' },
      falling: { message: 'Falling unemployment indicates recovery. Increase exposure to cyclical and growth stocks.' }
    },
    'GDP Growth': {
      high: { threshold: 3, action: 'cyclical', message: 'Strong GDP growth favors cyclical stocks, industrials, and small caps.' },
      low: { threshold: 1, action: 'defensive', message: 'Weak GDP growth suggests caution. Favor defensive sectors and quality companies.' },
      negative: { message: 'Negative GDP signals recession. Hold cash, defensive stocks, and consider inverse ETFs.' }
    },
    '10-Year Treasury': {
      high: { threshold: 4, action: 'bonds-attractive', message: 'High yields make bonds competitive with stocks. Consider fixed income allocation.' },
      low: { threshold: 2, action: 'stocks-favored', message: 'Low yields push investors to stocks for returns. Bullish for equities.' },
      rising: { message: 'Rising yields pressure stock valuations, especially growth stocks. Favor value and dividend stocks.' },
      falling: { message: 'Falling yields boost stock valuations. Excellent for growth and tech stocks.' }
    },
    'Consumer Confidence': {
      high: { threshold: 90, action: 'consumer-stocks', message: 'High confidence drives spending. Excellent for consumer discretionary, retail, and travel stocks.' },
      low: { threshold: 60, action: 'defensive', message: 'Low confidence suggests consumers will cut spending. Favor staples and defensive sectors.' },
      rising: { message: 'Rising confidence boosts consumer spending. Good for retail, restaurants, and discretionary stocks.' },
      falling: { message: 'Falling confidence warns of spending cuts. Reduce exposure to consumer discretionary, favor necessities.' }
    }
  };

  return guidance[indicator] || {};
};

  const getIndicatorStatus = (indicator, currentValue) => {
    const current = currentIndicators?.[indicator];
    if (!current) return null;

    const guidance = getInvestorGuidance(indicator, currentValue);
    let status = 'neutral';
    let message = '';
    let action = 'hold';

    // Determine status based on thresholds
    if (guidance.high && currentValue >= guidance.high.threshold) {
      status = 'warning';
      message = guidance.high.message;
      action = guidance.high.action;
    } else if (guidance.low && currentValue <= guidance.low.threshold) {
      status = 'positive';
      message = guidance.low.message;
      action = guidance.low.action;
    }

    // Add trend-based guidance
    if (current.status === 'up' && guidance.rising) {
      message = message || guidance.rising.message;
    } else if (current.status === 'down' && guidance.falling) {
      message = message || guidance.falling.message;
    }

    // Check for negative GDP
    if (indicator === 'GDP Growth' && currentValue < 0 && guidance.negative) {
      status = 'critical';
      message = guidance.negative.message;
      action = 'defensive';
    }

    return { status, message, action, current };
  };

  // Prepare chart data with events
  const getChartData = () => {
    if (!historicalData || !historicalData[selectedIndicator]) return [];
    
    return historicalData[selectedIndicator].map(item => ({
      date: item.date,
      value: item.value,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }));
  };

  // Get events in the timeframe
  const getRelevantEvents = () => {
    if (!historicalData || !historicalData[selectedIndicator] || events.length === 0) return [];
    
    const chartData = historicalData[selectedIndicator];
    const startDate = new Date(chartData[0].date);
    const endDate = new Date(chartData[chartData.length - 1].date);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Find events that match this date (with some tolerance)
      const dataDate = new Date(data.date);
      const relevantEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        // Match if within 15 days
        const diffDays = Math.abs((dataDate - eventDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 15;
      });
      
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          maxWidth: '300px'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {data.displayDate}
          </p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa' }}>
            {data.value.toFixed(2)}
          </p>
          {relevantEvents.length > 0 && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #334155' }}>
              {relevantEvents.map((event, idx) => (
                <div key={idx} style={{ marginTop: idx > 0 ? '0.5rem' : 0 }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#fbbf24', fontWeight: 'bold' }}>
                    📌 {event.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Activity size={48} color="#60a5fa" className="spin" />
      </div>
    );
  }

  const chartData = getChartData();
  const relevantEvents = getRelevantEvents();
  const indicators = ['Federal Funds Rate', 'Inflation Rate (CPI)', 'Unemployment Rate', 'GDP Growth', '10-Year Treasury', 'Consumer Confidence'];

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={32} color="white" />
          Market Indicators Dashboard
        </h2>
        <p style={{ color: '#dbeafe', fontSize: '1rem' }}>
          Comprehensive analysis of economic indicators with historical context and investor implications
        </p>
      </div>

      {/* Investor Guidance Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendIcon size={24} color="#60a5fa" />
          Current Market Implications
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {indicators.map((indicator, idx) => {
            const current = currentIndicators?.[indicator];
            if (!current) return null;
            
            const statusInfo = getIndicatorStatus(indicator, current.value);
            if (!statusInfo) return null;

            const statusColors = {
              critical: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5' },
              warning: { bg: 'rgba(251, 191, 36, 0.2)', border: '#f59e0b', text: '#fcd34d' },
              positive: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#86efac' },
              neutral: { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#93c5fd' }
            };

            const colors = statusColors[statusInfo.status];

            return (
              <div key={idx} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1', margin: 0 }}>
                    {indicator}
                  </h4>
                  {statusInfo.current.status === 'up' ? (
                    <TrendingUp size={18} color={colors.text} />
                  ) : (
                    <TrendingDown size={18} color={colors.text} />
                  )}
                </div>
                
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.text }}>
                  {current.value.toFixed(2)}
                  <span style={{ fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    {statusInfo.current.changePercent > 0 ? '+' : ''}{statusInfo.current.changePercent.toFixed(2)}%
                  </span>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#e5e7eb', lineHeight: '1.5' }}>
                    {statusInfo.message}
                  </p>
                </div>

                {statusInfo.action && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Action: {statusInfo.action.replace(/-/g, ' ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Chart */}
      <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
            Historical Analysis (10 Years)
          </h3>
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {indicators.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
              />
              
              {/* Event markers */}
              {relevantEvents.map((event, idx) => (
                <ReferenceLine
                  key={idx}
                  x={new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  stroke={event.impact === 'severe' ? '#ef4444' : event.impact === 'moderate' ? '#f59e0b' : '#22c55e'}
                  strokeDasharray="3 3"
                  label={{
                    value: '📌',
                    position: 'top',
                    fill: '#fbbf24'
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            No historical data available
          </p>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#93c5fd' }}>
            💡 <strong>Chart Guide:</strong> Hover over the line to see exact values. Red/Orange dashed lines mark major market events. 
            Use this to understand how indicators behaved during past crises.
          </p>
        </div>
      </div>

      {/* Major Market Events Timeline */}
      <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="#60a5fa" />
          Major Market Events (Past 10 Years)
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {events.filter(e => new Date(e.date) >= new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8)
            .map((event, idx) => {
              const impactColors = {
                severe: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#fca5a5' },
                moderate: { bg: 'rgba(251, 191, 36, 0.1)', border: '#f59e0b', text: '#fcd34d' },
                positive: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#86efac' },
                recovery: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#86efac' }
              };

              const colors = impactColors[event.impact] || impactColors.moderate;

              return (
                <div key={idx} style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: colors.text, margin: 0 }}>
                      {event.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {event.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
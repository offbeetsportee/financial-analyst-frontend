import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StockChart = ({ priceData, performance, symbol, timeframe }) => {
  if (!priceData || priceData.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        No price data available
      </div>
    );
  }

  // Format data for chart
  const chartData = priceData.map(item => ({
    date: item.date || item.timestamp,
    price: item.close,
    volume: item.volume
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.75rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {payload[0].payload.date}
          </p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#60a5fa' }}>
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Performance Metrics */}
      {performance && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid #475569'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current Price</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${performance.current}</div>
          </div>

          <div style={{
            background: 'rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid #475569'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Change</div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: performance.change >= 0 ? '#34d399' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {performance.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {performance.change >= 0 ? '+' : ''}{performance.changePercent}%
            </div>
          </div>

          <div style={{
            background: 'rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid #475569'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>High</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>${performance.high}</div>
          </div>

          <div style={{
            background: 'rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid #475569'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Low</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>${performance.low}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: '1px solid #334155'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#cbd5e1'
        }}>
          {symbol} Price Chart - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (timeframe === 'intraday') {
                  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#93c5fd' }}>
            💡 <strong>Tip:</strong> Hover over the chart to see detailed price information at any point.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
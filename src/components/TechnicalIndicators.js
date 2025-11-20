import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { SMA, RSI, MACD, BollingerBands } from 'technicalindicators';

const TechnicalIndicators = ({ priceData, symbol }) => {
  const [indicators, setIndicators] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    sma: true,
    rsi: true,
    macd: true,
    bollinger: true
  });

  useEffect(() => {
    if (priceData && priceData.length > 0) {
      calculateIndicators();
    }
  }, [priceData]);

  const calculateIndicators = () => {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);

    // Simple Moving Averages
    const sma20 = SMA.calculate({ period: 20, values: closes });
    const sma50 = SMA.calculate({ period: 50, values: closes });
    const sma200 = SMA.calculate({ period: 200, values: closes });

    // RSI
    const rsiValues = RSI.calculate({ period: 14, values: closes });
    const currentRSI = rsiValues[rsiValues.length - 1];

    // MACD
    const macdValues = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
    const currentMACD = macdValues[macdValues.length - 1];

    // Bollinger Bands
    const bbValues = BollingerBands.calculate({
      period: 20,
      values: closes,
      stdDev: 2
    });
    const currentBB = bbValues[bbValues.length - 1];

    const currentPrice = closes[closes.length - 1];

    setIndicators({
      sma: {
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        sma200: sma200[sma200.length - 1]
      },
      rsi: {
        value: currentRSI,
        signal: currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'
      },
      macd: currentMACD ? {
        macd: currentMACD.MACD,
        signal: currentMACD.signal,
        histogram: currentMACD.histogram,
        trend: currentMACD.MACD > currentMACD.signal ? 'Bullish' : 'Bearish'
      } : null,
      bollinger: currentBB ? {
        upper: currentBB.upper,
        middle: currentBB.middle,
        lower: currentBB.lower,
        position: currentPrice > currentBB.upper ? 'Above Upper Band' :
                  currentPrice < currentBB.lower ? 'Below Lower Band' : 'Within Bands'
      } : null,
      currentPrice
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!indicators) {
    return (
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Activity size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Select a timeframe to view technical indicators
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Activity size={20} color="#3b82f6" />
        Technical Indicators
      </h3>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Moving Averages */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          overflow: 'hidden'
        }}>
          <div
            onClick={() => toggleSection('sma')}
            style={{
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(59, 130, 246, 0.1)',
              borderBottom: expandedSections.sma ? '1px solid #334155' : 'none'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              Simple Moving Averages (SMA)
            </h4>
            {expandedSections.sma ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.sma && (
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <IndicatorCard
                  label="SMA 20"
                  value={indicators.sma.sma20?.toFixed(2)}
                  comparison={indicators.currentPrice > indicators.sma.sma20 ? 'above' : 'below'}
                />
                <IndicatorCard
                  label="SMA 50"
                  value={indicators.sma.sma50?.toFixed(2)}
                  comparison={indicators.currentPrice > indicators.sma.sma50 ? 'above' : 'below'}
                />
                <IndicatorCard
                  label="SMA 200"
                  value={indicators.sma.sma200?.toFixed(2)}
                  comparison={indicators.currentPrice > indicators.sma.sma200 ? 'above' : 'below'}
                />
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#93c5fd'
              }}>
                💡 Price above SMA = bullish trend | Price below SMA = bearish trend
              </div>
            </div>
          )}
        </div>

        {/* RSI */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          overflow: 'hidden'
        }}>
          <div
            onClick={() => toggleSection('rsi')}
            style={{
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(139, 92, 246, 0.1)',
              borderBottom: expandedSections.rsi ? '1px solid #334155' : 'none'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              RSI (Relative Strength Index)
            </h4>
            {expandedSections.rsi ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.rsi && (
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    RSI Value
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a78bfa' }}>
                    {indicators.rsi.value?.toFixed(2)}
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: indicators.rsi.signal === 'Overbought' ? 'rgba(239, 68, 68, 0.2)' :
                             indicators.rsi.signal === 'Oversold' ? 'rgba(16, 185, 129, 0.2)' :
                             'rgba(251, 191, 36, 0.2)',
                  border: `1px solid ${indicators.rsi.signal === 'Overbought' ? '#ef4444' :
                                       indicators.rsi.signal === 'Oversold' ? '#10b981' :
                                       '#f59e0b'}`,
                  borderRadius: '0.5rem',
                  color: indicators.rsi.signal === 'Overbought' ? '#ef4444' :
                         indicators.rsi.signal === 'Oversold' ? '#10b981' :
                         '#f59e0b',
                  fontWeight: '600'
                }}>
                  {indicators.rsi.signal}
                </div>
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#c4b5fd'
              }}>
                💡 RSI &gt; 70 = Overbought (potential sell) | RSI &lt; 30 = Oversold (potential buy)
              </div>
            </div>
          )}
        </div>

        {/* MACD */}
        {indicators.macd && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            <div
              onClick={() => toggleSection('macd')}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(16, 185, 129, 0.1)',
                borderBottom: expandedSections.macd ? '1px solid #334155' : 'none'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                MACD (Moving Average Convergence Divergence)
              </h4>
              {expandedSections.macd ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expandedSections.macd && (
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      MACD Line
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {indicators.macd.macd?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Signal Line
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {indicators.macd.signal?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Histogram
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: indicators.macd.histogram > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {indicators.macd.histogram?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '0.75rem',
                  background: indicators.macd.trend === 'Bullish' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${indicators.macd.trend === 'Bullish' ? '#10b981' : '#ef4444'}`,
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: indicators.macd.trend === 'Bullish' ? '#10b981' : '#ef4444',
                  fontWeight: '600'
                }}>
                  {indicators.macd.trend === 'Bullish' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  {indicators.macd.trend} Signal
                </div>
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#6ee7b7'
                }}>
                  💡 MACD above Signal = Bullish | MACD below Signal = Bearish
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bollinger Bands */}
        {indicators.bollinger && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            <div
              onClick={() => toggleSection('bollinger')}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(251, 191, 36, 0.1)',
                borderBottom: expandedSections.bollinger ? '1px solid #334155' : 'none'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                Bollinger Bands
              </h4>
              {expandedSections.bollinger ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expandedSections.bollinger && (
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Upper Band
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                      ${indicators.bollinger.upper?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Middle (SMA 20)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      ${indicators.bollinger.middle?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                      Lower Band
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                      ${indicators.bollinger.lower?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid #f59e0b',
                  borderRadius: '0.5rem',
                  color: '#fbbf24',
                  fontWeight: '600'
                }}>
                  Current Price: {indicators.bollinger.position}
                </div>
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#fcd34d'
                }}>
                  💡 Price at upper band = potential resistance | Price at lower band = potential support
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const IndicatorCard = ({ label, value, comparison }) => {
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(51, 65, 85, 0.5)',
      borderRadius: '0.5rem',
      border: '1px solid #475569'
    }}>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        ${value || 'N/A'}
      </div>
      {comparison && (
        <div style={{
          fontSize: '0.75rem',
          color: comparison === 'above' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {comparison === 'above' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          Price {comparison}
        </div>
      )}
    </div>
  );
};

export default TechnicalIndicators;

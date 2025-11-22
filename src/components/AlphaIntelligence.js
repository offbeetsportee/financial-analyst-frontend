import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Zap, Users, Briefcase, Scale, RefreshCw, Loader,
  ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';

const AlphaIntelligence = ({ symbol }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (symbol) {
      fetchNews();
    }
  }, [symbol, timeframe]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/news/sentiment/${symbol}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const newsData = await response.json();
      setData(newsData);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label) => {
    if (!label) return '#94a3b8';
    const l = label.toLowerCase();
    if (l.includes('bullish') || l.includes('positive')) return '#10b981';
    if (l.includes('bearish') || l.includes('negative')) return '#ef4444';
    return '#f59e0b';
  };

  const getSentimentIcon = (label) => {
    if (!label) return <Minus size={16} />;
    const l = label.toLowerCase();
    if (l.includes('bullish') || l.includes('positive')) return <TrendingUp size={16} />;
    if (l.includes('bearish') || l.includes('negative')) return <TrendingDown size={16} />;
    return <Minus size={16} />;
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
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading Alpha Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        <p style={{ color: '#f87171' }}>Failed to load news sentiment</p>
        <button onClick={fetchNews} style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#ef4444',
          border: 'none',
          borderRadius: '0.5rem',
          color: 'white',
          cursor: 'pointer'
        }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { aggregate, articles, sentimentShift, specialNews } = data;

  return (
    <div>
      {/* Header with Timeframe Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#f1f5f9' }}>
            Alpha Intelligence™
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['today', 'week', 'month', 'all'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: timeframe === tf ? '2px solid #60a5fa' : '1px solid #475569',
                background: timeframe === tf ? 'rgba(96, 165, 250, 0.2)' : '#334155',
                color: timeframe === tf ? '#60a5fa' : '#cbd5e1',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: timeframe === tf ? '600' : '400',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tf}
            </button>
          ))}
          <button
            onClick={fetchNews}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #475569',
              background: '#334155',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Aggregate Sentiment Card */}
      <div style={{
        background: `linear-gradient(135deg, ${getSentimentColor(aggregate.overall)}15, transparent)`,
        border: `1px solid ${getSentimentColor(aggregate.overall)}40`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {getSentimentIcon(aggregate.overall)}
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: getSentimentColor(aggregate.overall)
              }}>
                {aggregate.overall}
              </span>
            </div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>
              Market Sentiment - {data.totalArticles} articles analyzed
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                {aggregate.bullish}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bullish</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                {aggregate.neutral}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Neutral</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>
                {aggregate.bearish}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bearish</div>
            </div>
          </div>
        </div>
        
        {/* Sentiment Bar */}
        <div style={{
          marginTop: '1rem',
          height: '8px',
          background: '#1e293b',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${aggregate.bullishPct}%`,
            background: '#10b981',
            transition: 'width 0.5s'
          }} />
          <div style={{
            width: `${aggregate.neutralPct}%`,
            background: '#f59e0b',
            transition: 'width 0.5s'
          }} />
          <div style={{
            width: `${aggregate.bearishPct}%`,
            background: '#ef4444',
            transition: 'width 0.5s'
          }} />
        </div>
      </div>

      {/* Sentiment Shift Alert */}
      {sentimentShift && sentimentShift.detected && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={24} color="#fbbf24" />
          <div>
            <div style={{ fontWeight: '600', color: '#fbbf24', marginBottom: '0.25rem' }}>
              Sentiment Shift Detected!
            </div>
            <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              Sentiment shifted from <strong>{sentimentShift.from}</strong> to{' '}
              <strong>{sentimentShift.to}</strong> ({sentimentShift.direction})
            </div>
          </div>
        </div>
      )}

      {/* Special News Highlights */}
      {(specialNews.insiderActivity.length > 0 || specialNews.mergers.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {specialNews.insiderActivity.length > 0 && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Users size={18} color="#a78bfa" />
                <span style={{ fontWeight: '600', color: '#a78bfa' }}>
                  Insider Activity
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                {specialNews.insiderActivity.length} article(s)
              </div>
            </div>
          )}
          
          {specialNews.mergers.length > 0 && (
            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Briefcase size={18} color="#ec4899" />
                <span style={{ fontWeight: '600', color: '#ec4899' }}>
                  M&A Activity
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                {specialNews.mergers.length} article(s)
              </div>
            </div>
          )}
        </div>
      )}

      {/* News Articles */}
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {articles.map((article, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = getSentimentColor(article.sentiment.label);
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => window.open(article.url, '_blank')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  lineHeight: '1.4'
                }}>
                  {article.title}
                </h4>
              </div>
              
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                background: `${getSentimentColor(article.sentiment.label)}20`,
                border: `1px solid ${getSentimentColor(article.sentiment.label)}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: getSentimentColor(article.sentiment.label),
                whiteSpace: 'nowrap'
              }}>
                {getSentimentIcon(article.sentiment.label)}
                {article.sentiment.label}
              </div>
            </div>
            
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              {article.summary.substring(0, 200)}...
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span>{article.source}</span>
                {article.tickerSentiment && (
                  <span>
                    Relevance: {Math.round(article.tickerSentiment.relevance * 100)}%
                  </span>
                )}
              </div>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            
            {article.impactScore > 70 && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Zap size={14} color="#fbbf24" />
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '600' }}>
                  High Impact News (Score: {article.impactScore})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function
function formatDate(dateStr) {
  try {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

export default AlphaIntelligence;
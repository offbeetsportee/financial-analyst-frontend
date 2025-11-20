import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Loader, RefreshCw } from 'lucide-react';
import { stockAPI } from '../services/api';

const StockNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchNews();
    }
  }, [symbol]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockAPI.getNews(symbol);
      setNews(data.articles || []);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      // Alpha Vantage format: YYYYMMDDTHHMMSS
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
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return '#94a3b8';
    const s = sentiment.toLowerCase();
    if (s.includes('bullish') || s.includes('positive')) return '#10b981';
    if (s.includes('bearish') || s.includes('negative')) return '#ef4444';
    return '#f59e0b';
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null;
    const s = sentiment.toLowerCase();
    if (s.includes('bullish') || s.includes('positive')) return <TrendingUp size={14} />;
    if (s.includes('bearish') || s.includes('negative')) return <TrendingDown size={14} />;
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.5)', 
        border: '1px solid #334155', 
        borderRadius: '0.75rem', 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Loader size={32} color="#60a5fa" className="spin" />
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
        <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
        <button
          onClick={fetchNews}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#ef4444',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.5)', 
        border: '1px solid #334155', 
        borderRadius: '0.75rem', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Newspaper size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>No recent news found for {symbol}</p>
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
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          <Newspaper size={20} color="#60a5fa" />
          Latest News
        </h3>
        <button
          onClick={fetchNews}
          style={{
            padding: '0.5rem 1rem',
            background: '#059669',
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
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* News Articles */}
      <div style={{ display: 'grid', gap: '1rem' }}>
       
 {news.slice(0, 10).map((article, idx) => (
<a  
    key={idx}
    href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}

          >
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#60a5fa';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', marginBottom: '0.75rem' }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#cbd5e1', 
                  margin: 0,
                  lineHeight: '1.4',
                  flex: 1
                }}>
                  {article.title}
                </h4>
                <ExternalLink size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
              </div>

              {article.summary && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#94a3b8', 
                  margin: '0 0 0.75rem 0',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.summary}
                </p>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#60a5fa', fontWeight: '600' }}>
                    {article.source}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    {formatDate(article.date)}
                  </span>
                </div>

                {article.sentiment && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: `${getSentimentColor(article.sentiment)}20`,
                    border: `1px solid ${getSentimentColor(article.sentiment)}40`,
                    borderRadius: '0.375rem',
                    color: getSentimentColor(article.sentiment),
                    fontWeight: '600'
                  }}>
                    {getSentimentIcon(article.sentiment)}
                    {article.sentiment}
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default StockNews;

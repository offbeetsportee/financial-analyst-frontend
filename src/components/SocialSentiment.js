import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, TrendingDown, ThumbsUp, Users, Loader, RefreshCw } from 'lucide-react';
import { stockAPI } from '../services/api';

const SocialSentiment = ({ symbol }) => {
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchSocialData();
    }
  }, [symbol]);

  const fetchSocialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockAPI.getSocialSentiment(symbol);
      setSocialData(data);
    } catch (err) {
      console.error('Failed to fetch social sentiment:', err);
      setError('Failed to load social sentiment');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.3) return '#10b981';
    if (score < -0.3) return '#ef4444';
    return '#f59e0b';
  };

  const getSentimentIcon = (label) => {
    if (label === 'Bullish') return <TrendingUp size={16} />;
    if (label === 'Bearish') return <TrendingDown size={16} />;
    return <TrendingUp size={16} style={{ transform: 'rotate(90deg)' }} />;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
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

  if (error || !socialData) {
    return (
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        borderRadius: '0.75rem', 
        padding: '1.5rem'
      }}>
        <p style={{ color: '#f87171', margin: 0 }}>{error || 'No social data available'}</p>
        <button
          onClick={fetchSocialData}
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

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
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
          <MessageCircle size={20} color="#8b5cf6" />
          Social Sentiment
        </h3>
        <button
          onClick={fetchSocialData}
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

      {/* Demo Notice */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#c4b5fd', margin: 0 }}>
          💡 <strong>Demo Data:</strong> Real-time social sentiment from Reddit coming soon. Currently showing sample data.
        </p>
      </div>

      {/* Sentiment Overview */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Mentions (24h)
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {socialData.mentions24h.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              {socialData.mentions7d.toLocaleString()} this week
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Overall Sentiment
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: getSentimentColor(socialData.sentimentScore),
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {getSentimentIcon(socialData.sentimentLabel)}
              {socialData.sentimentLabel}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Score: {socialData.sentimentScore.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Trend
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: socialData.trend === 'up' ? '#10b981' : socialData.trend === 'down' ? '#ef4444' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {socialData.trend === 'up' ? <TrendingUp size={24} /> : 
               socialData.trend === 'down' ? <TrendingDown size={24} /> : 
               <span style={{ fontSize: '1.25rem' }}>→</span>}
              {socialData.trend.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              vs. yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#cbd5e1' }}>
          Recent Community Discussions
        </h4>
        
        {socialData.posts.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            No recent posts available
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {socialData.posts.map((post, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {post.source} • {formatTimestamp(post.timestamp)}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    background: `${getSentimentColor(post.score)}20`,
                    border: `1px solid ${getSentimentColor(post.score)}40`,
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: getSentimentColor(post.score),
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {getSentimentIcon(post.sentiment)}
                    {post.sentiment}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ThumbsUp size={12} />
                  {post.upvotes.toLocaleString()} upvotes
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSentiment;

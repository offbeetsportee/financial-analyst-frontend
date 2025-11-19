import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import { Download } from 'lucide-react';
import { exportToCSV, formatWatchlistForExport } from '../utils/exportCSV';

const Watchlist = ({ user, onStockClick }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await watchlistAPI.getWatchlistDetails(user.id);
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  const handleRemove = async (symbol) => {
    if (!user) return;
    
    try {
      await watchlistAPI.removeFromWatchlist(user.id, symbol);
      setWatchlist(watchlist.filter(item => item.symbol !== symbol));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      alert('Failed to remove from watchlist');
    }
  };

  const formatMarketCap = (value) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    return `$${num}`;
  };

  if (!user) {
    return (
      <div style={{ 
        background: 'rgba(37, 99, 235, 0.1)', 
        border: '1px solid rgba(37, 99, 235, 0.3)', 
        borderRadius: '0.75rem', 
        padding: '3rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#60a5fa" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Login Required</h3>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Please log in to view and manage your watchlist
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={48} color="#60a5fa" className="spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={32} color="white" fill="white" />
            My Watchlist
          </h2>
          <p style={{ color: '#fef3c7', fontSize: '1rem', margin: 0 }}>
            {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'} tracked
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          {refreshing ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Star size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>Your watchlist is empty</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Go to the Company tab and click the star icon to add stocks to your watchlist
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {watchlist.map((item, idx) => {
            const stock = item.data;
            
            return (
              <div 
                key={idx}
                style={{ 
                  background: 'rgba(30, 41, 59, 0.5)', 
                  borderRadius: '0.75rem', 
                  padding: '1.5rem', 
                  border: '1px solid #334155',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
                onClick={() => onStockClick && onStockClick(item.symbol)}
              >
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.symbol);
                  }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.375rem',
                    padding: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remove from watchlist"
                >
                  <Star size={16} color="#ef4444" fill="#ef4444" />
                </button>

                {/* Symbol */}
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#60a5fa' }}>
                  {item.symbol}
                </div>

                {stock ? (
                  <>
                    {/* Company Name */}
                    <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      {stock.Name || 'N/A'}
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Market Cap</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                          {formatMarketCap(stock.MarketCapitalization)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>P/E Ratio</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                          {stock.PERatio || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>EPS</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                          ${stock.EPS || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Div Yield</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                          {stock.DividendYield ? `${(parseFloat(stock.DividendYield) * 100).toFixed(2)}%` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Added Date */}
                    <div style={{ 
                      marginTop: '1rem', 
                      paddingTop: '0.75rem', 
                      borderTop: '1px solid #334155',
                      fontSize: '0.7rem',
                      color: '#64748b'
                    }}>
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    No data available - refresh to load
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
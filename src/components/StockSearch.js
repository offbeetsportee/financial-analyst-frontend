import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { stockAPI } from '../services/api';

const StockSearch = ({ onSelectStock, placeholder = "Search stocks..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await stockAPI.searchStocks(query);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelectStock(symbol);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(51, 65, 85, 0.5)',
        borderRadius: '0.5rem',
        border: '1px solid #475569',
        padding: '0.5rem 0.75rem',
        gap: '0.5rem'
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '0.875rem'
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          left: 0,
          right: 0,
          background: 'rgba(30, 41, 59, 0.98)',
          border: '1px solid #475569',
          borderRadius: '0.5rem',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
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
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <TrendingUp size={16} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#60a5fa', fontSize: '0.875rem' }}>
                        {stock.symbol}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.125rem' }}>
                        {stock.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.125rem' }}>
                        {stock.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;

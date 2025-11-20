import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, BarChart3, Loader, RefreshCw } from 'lucide-react';
import { stockAPI } from '../services/api';

const SectorAnalysis = ({ symbol }) => {
  const [sectorData, setSectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchSectorData();
    }
  }, [symbol]);

  const fetchSectorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockAPI.getSectorData(symbol);
      setSectorData(data);
    } catch (err) {
      console.error('Failed to fetch sector data:', err);
      setError('Failed to load sector analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (value) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(0)}`;
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

  if (error || !sectorData) {
    return (
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        borderRadius: '0.75rem', 
        padding: '1.5rem'
      }}>
        <p style={{ color: '#f87171', margin: 0 }}>{error || 'No sector data available'}</p>
        <button
          onClick={fetchSectorData}
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

  const { company, peers, sectorAverages, sectorPerformance } = sectorData;

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
          <Building2 size={20} color="#f59e0b" />
          Sector & Industry Analysis
        </h3>
        <button
          onClick={fetchSectorData}
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

      {/* Company Sector Info */}
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
              Sector
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {company.sector}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Industry
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#cbd5e1' }}>
              {company.industry}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Sector Performance
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: sectorPerformance === 'Positive' ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {sectorPerformance === 'Positive' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {sectorPerformance}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Averages */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#cbd5e1' }}>
          Sector Averages vs {symbol}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <ComparisonCard
            label="P/E Ratio"
            companyValue={company.peRatio}
            sectorAvg={sectorAverages.peRatio}
          />
          <ComparisonCard
            label="ROE"
            companyValue={company.roe}
            sectorAvg={sectorAverages.roe}
            format={(v) => `${v.toFixed(2)}%`}
          />
          <ComparisonCard
            label="Today's Change"
            companyValue={0}
            sectorAvg={sectorAverages.changePercent}
            format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
          />
        </div>
      </div>

      {/* Peer Companies */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#cbd5e1' }}>
          Peer Companies in {company.sector}
        </h4>
        
        {peers.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            No peer data available
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {peers.map((peer, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#60a5fa' }}>
                    {peer.symbol}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {peer.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Price</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                    ${peer.price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Change</div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    color: peer.changePercent >= 0 ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {peer.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {peer.changePercent >= 0 ? '+' : ''}{peer.changePercent.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Market Cap</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatMarketCap(peer.marketCap)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>P/E</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {peer.peRatio > 0 ? peer.peRatio.toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ROE</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {peer.roe > 0 ? `${peer.roe.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ComparisonCard = ({ label, companyValue, sectorAvg, format = (v) => v.toFixed(2) }) => {
  const isAboveAvg = companyValue > sectorAvg;
  
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(51, 65, 85, 0.5)',
      borderRadius: '0.5rem',
      border: '1px solid #475569'
    }}>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Company</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#60a5fa' }}>
            {companyValue > 0 ? format(companyValue) : 'N/A'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sector Avg</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#94a3b8' }}>
            {sectorAvg > 0 ? format(sectorAvg) : 'N/A'}
          </div>
        </div>
      </div>
      {companyValue > 0 && sectorAvg > 0 && (
        <div style={{
          fontSize: '0.75rem',
          color: isAboveAvg ? '#10b981' : '#f59e0b',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {isAboveAvg ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isAboveAvg ? 'Above' : 'Below'} sector average
        </div>
      )}
    </div>
  );
};

export default SectorAnalysis;

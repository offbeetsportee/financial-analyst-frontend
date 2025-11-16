import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SchedulerAdmin = () => {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSchedulerStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSchedulerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/scheduler/status`);
      const data = await response.json();
      setSchedulerStatus(data);
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerRefresh = async (type) => {
    setTriggering(type);
    try {
      const response = await fetch(`${API_URL}/scheduler/trigger/${type}`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${type === 'fred' ? 'FRED indicators' : 'Historical data'} refreshed successfully!`);
        fetchSchedulerStatus();
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      case 'running':
        return <Activity size={20} color="#3b82f6" className="spin" />;
      default:
        return <Clock size={20} color="#94a3b8" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#86efac' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#fca5a5' };
      case 'running':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#93c5fd' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', border: '#94a3b8', text: '#cbd5e1' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Activity size={32} color="#60a5fa" className="spin" />
      </div>
    );
  }

  if (!schedulerStatus) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        Unable to load scheduler status
      </div>
    );
  }

  const jobs = schedulerStatus.jobs;

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
        borderRadius: '0.75rem', 
        padding: '1.5rem', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={28} color="white" />
          Scheduler Status
        </h3>
        <p style={{ color: '#e0e7ff', fontSize: '0.875rem', margin: 0 }}>
          Automatic data refresh jobs - Monitor and manually trigger updates
        </p>
      </div>

      {/* Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(jobs).map(([key, job]) => {
          const colors = getStatusColor(job.status);
          
          return (
            <div key={key} style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1', margin: 0 }}>
                  {key === 'fredIndicators' ? '📊 FRED Indicators' : 
                   key === 'historicalData' ? '📈 Historical Data' : 
                   '🗂️ Stock Cleanup'}
                </h4>
                {getStatusIcon(job.status)}
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Schedule</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>{job.schedule}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Last Run</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {job.lastRun ? new Date(job.lastRun).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Status</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
                    {job.status}
                  </div>
                </div>
              </div>

              {job.error && (
                <div style={{ 
                  padding: '0.5rem', 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  borderRadius: '0.375rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#fca5a5' }}>Error: {job.error}</div>
                </div>
              )}

              {(key === 'fredIndicators' || key === 'historicalData') && (
                <button
                  onClick={() => triggerRefresh(key === 'fredIndicators' ? 'fred' : 'historical')}
                  disabled={triggering === (key === 'fredIndicators' ? 'fred' : 'historical')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: triggering === (key === 'fredIndicators' ? 'fred' : 'historical') ? '#6b7280' : '#3b82f6',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: triggering === (key === 'fredIndicators' ? 'fred' : 'historical') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {triggering === (key === 'fredIndicators' ? 'fred' : 'historical') ? (
                    <>
                      <Activity size={14} className="spin" />
                      Triggering...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Trigger Now
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        border: '1px solid rgba(59, 130, 246, 0.3)', 
        borderRadius: '0.5rem', 
        padding: '1rem' 
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
          <AlertCircle size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#93c5fd', lineHeight: '1.5' }}>
              <strong>Automatic Refresh:</strong> Jobs run automatically on schedule. Use "Trigger Now" buttons to manually refresh data at any time. 
              FRED indicators refresh hourly, historical data updates daily at 2 AM, and old stock cache is cleaned at 3 AM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerAdmin;
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader, Mail, ToggleLeft, ToggleRight, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { alertsAPI } from '../services/api';

const Alerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    alertPrice: '',
    direction: 'above'
  });

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await alertsAPI.getAlerts(user.id);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await alertsAPI.createAlert(
        user.id,
        formData.symbol,
        parseFloat(formData.alertPrice),
        formData.direction
      );
      
      setFormData({ symbol: '', alertPrice: '', direction: 'above' });
      setShowCreateForm(false);
      fetchAlerts();
      alert('Alert created successfully!');
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!user || !window.confirm('Delete this alert?')) return;

    try {
      await alertsAPI.deleteAlert(user.id, alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('Failed to delete alert');
    }
  };

  const handleToggleAlert = async (alertId) => {
    if (!user) return;

    try {
      await alertsAPI.toggleAlert(user.id, alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      alert('Failed to toggle alert');
    }
  };

  const handleSendTest = async () => {
    if (!user) return;
    
    setSending(true);
    try {
      await alertsAPI.sendTestEmail(user.id);
      alert('Test email sent! Check your inbox.');
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleSendSummary = async () => {
    if (!user) return;
    
    setSending(true);
    try {
      await alertsAPI.sendDailySummary(user.id);
      alert('Daily summary sent! Check your inbox.');
    } catch (error) {
      console.error('Failed to send summary:', error);
      alert('Failed to send summary');
    } finally {
      setSending(false);
    }
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
          Please log in to manage email alerts
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={32} color="white" />
            Email Alerts
          </h2>
          <p style={{ color: '#e0e7ff', fontSize: '1rem', margin: 0 }}>
            Get notified when stocks hit your target prices
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
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
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Test Email Buttons */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.5)', 
        border: '1px solid #334155', 
        borderRadius: '0.75rem', 
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={20} color="#60a5fa" />
          Email Settings
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSendTest}
            disabled={sending}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {sending ? <Loader size={16} className="spin" /> : <Mail size={16} />}
            Send Test Email
          </button>
          <button
            onClick={handleSendSummary}
            disabled={sending}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#059669',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {sending ? <Loader size={16} className="spin" /> : <Mail size={16} />}
            Send Daily Summary
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', margin: '1rem 0 0 0' }}>
          Emails will be sent to: <strong style={{ color: '#60a5fa' }}>{user.email}</strong>
        </p>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Create New Alert</h3>
          <form onSubmit={handleCreateAlert}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g. AAPL"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Target Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alertPrice}
                  onChange={(e) => setFormData({ ...formData, alertPrice: e.target.value })}
                  placeholder="e.g. 150.00"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Direction
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#8b5cf6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#475569',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader size={48} color="#60a5fa" className="spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Bell size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>No alerts yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Create your first price alert to get notified via email
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              style={{ 
                background: 'rgba(30, 41, 59, 0.5)', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                border: alert.is_active ? '1px solid #8b5cf6' : '1px solid #334155',
                opacity: alert.is_active ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#60a5fa' }}>
                      {alert.symbol}
                    </h3>
                    {alert.direction === 'above' ? (
                      <TrendingUp size={24} color="#22c55e" />
                    ) : (
                      <TrendingDown size={24} color="#ef4444" />
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: '0.5rem 0' }}>
                    Alert when price goes <strong>{alert.direction}</strong> ${parseFloat(alert.alert_price).toFixed(2)}
                  </p>
                  {alert.triggered && (
                    <p style={{ fontSize: '0.75rem', color: '#fbbf24', margin: '0.5rem 0' }}>
                      ✅ Triggered on {new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  )}
                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                    Created: {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    disabled={alert.triggered}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(96, 165, 250, 0.1)',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '0.375rem',
                      cursor: alert.triggered ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={alert.is_active ? 'Disable alert' : 'Enable alert'}
                  >
                    {alert.is_active ? (
                      <ToggleRight size={20} color="#60a5fa" />
                    ) : (
                      <ToggleLeft size={20} color="#64748b" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete alert"
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
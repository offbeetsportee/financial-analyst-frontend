import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader, CheckCircle } from 'lucide-react';
import { preferencesAPI } from '../services/api';

const Preferences = ({ user, onPreferencesChange }) => {
  const [preferences, setPreferences] = useState({
    default_timeframe: 'daily',
    default_tab: 'market',
    currency: 'USD',
    email_notifications: true,
    price_alert_emails: true,
    daily_summary_emails: false,
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await preferencesAPI.getPreferences(user.id);
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaved(false);
    try {
      const updated = await preferencesAPI.updatePreferences(user.id, preferences);
      setPreferences(updated);
      setSaved(true);
      
      // Notify parent component about preference changes
      if (onPreferencesChange) {
        onPreferencesChange(updated);
      }

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
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
        <Settings size={48} color="#60a5fa" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Login Required</h3>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Please log in to manage your preferences
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
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={32} color="white" />
          User Preferences
        </h2>
        <p style={{ color: '#e9d5ff', fontSize: '1rem', margin: 0 }}>
          Customize your InvestorIQ experience
        </p>
      </div>

      {/* Preferences Form */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Display Preferences */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Display Preferences</h3>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Default Tab */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                Default Tab on Login
              </label>
              <select
                value={preferences.default_tab}
                onChange={(e) => handleChange('default_tab', e.target.value)}
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
                <option value="market">Market Overview</option>
                <option value="company">Company Analysis</option>
                <option value="compare">Stock Comparison</option>
                <option value="portfolio">Portfolio</option>
                <option value="watchlist">Watchlist</option>
              </select>
            </div>

            {/* Default Timeframe */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                Default Chart Timeframe
              </label>
              <select
                value={preferences.default_timeframe}
                onChange={(e) => handleChange('default_timeframe', e.target.value)}
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
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                Currency Display
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
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
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
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
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode (Coming Soon)</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                Light mode will be available in a future update
              </p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Email Notifications</h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Master Email Toggle */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => handleChange('email_notifications', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  Enable Email Notifications
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Master switch for all email notifications
                </div>
              </div>
            </label>

            {/* Price Alerts */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(51, 65, 85, 0.3)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              opacity: preferences.email_notifications ? 1 : 0.5
            }}>
              <input
                type="checkbox"
                checked={preferences.price_alert_emails}
                onChange={(e) => handleChange('price_alert_emails', e.target.checked)}
                disabled={!preferences.email_notifications}
                style={{ width: '20px', height: '20px', cursor: preferences.email_notifications ? 'pointer' : 'not-allowed' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  Price Alert Notifications
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Get notified when your price alerts trigger
                </div>
              </div>
            </label>

            {/* Daily Summary */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(51, 65, 85, 0.3)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              opacity: preferences.email_notifications ? 1 : 0.5
            }}>
              <input
                type="checkbox"
                checked={preferences.daily_summary_emails}
                onChange={(e) => handleChange('daily_summary_emails', e.target.checked)}
                disabled={!preferences.email_notifications}
                style={{ width: '20px', height: '20px', cursor: preferences.email_notifications ? 'pointer' : 'not-allowed' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  Daily Portfolio Summary
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Receive daily email with your portfolio performance
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              background: saving ? '#6b7280' : '#10b981',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
              <CheckCircle size={18} />
              Saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preferences;

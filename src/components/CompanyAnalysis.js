import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, DollarSign, Percent, Activity,
  BarChart3, PieChart, Calendar, AlertCircle, Loader,
  ChevronDown, ChevronUp, Info, ArrowUpRight, ArrowDownRight,
  Users, FileText, Briefcase, Award, Target, TrendingDown
} from 'lucide-react';

// Import existing components
import StockNews from './StockNews';
import SectorAnalysis from './SectorAnalysis';
import SocialSentiment from './SocialSentiment';

const CompanyAnalysis = ({ symbol: initialSymbol }) => {
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol || '');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [incomeStatements, setIncomeStatements] = useState([]);
  const [balanceSheets, setBalanceSheets] = useState([]);
  const [cashFlows, setCashFlows] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [financialPeriod, setFinancialPeriod] = useState('quarterly');
  
  // Price chart states
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');

  const API_URL = process.env.REACT_APP_API_URL || 'https://financial-analyst-backend-production-7175.up.railway.app/api';

  useEffect(() => {
    if (initialSymbol) {
      setCurrentSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  useEffect(() => {
    if (currentSymbol) {
      fetchCompanyData();
    }
  }, [currentSymbol]);

  useEffect(() => {
    if (currentSymbol && (activeTab === 'financials')) {
      fetchFinancials();
    }
  }, [financialPeriod, activeTab]);

  useEffect(() => {
    if (currentSymbol && activeTab === 'chart') {
      fetchPriceData();
    }
  }, [currentSymbol, activeTab, selectedTimeframe]);

  const fetchPriceData = async () => {
    setPriceLoading(true);
    try {
      // Use the correct endpoint format: /stocks/{symbol}/prices/{timeframe}
      const response = await fetch(`${API_URL}/stocks/${currentSymbol}/prices/${selectedTimeframe}`);
      const data = await response.json();
      
      console.log('📊 Price data received:', data);
      console.log('📊 Data structure:', JSON.stringify(data, null, 2).substring(0, 500));
      
      setPriceData(data);
    } catch (err) {
      console.error('❌ Error fetching price data:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch overview and earnings in parallel
      const [overviewRes, earningsRes] = await Promise.all([
        fetch(`${API_URL}/company/${currentSymbol}/overview`),
        fetch(`${API_URL}/company/${currentSymbol}/earnings`)
      ]);

      const overviewData = await overviewRes.json();
      const earningsData = await earningsRes.json();

      if (overviewData.success) {
        setOverview(overviewData.data);
      } else {
        setError(overviewData.error);
      }

      if (earningsData.success) {
        setEarnings(earningsData.data);
      }

    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancials = async () => {
    try {
      const [incomeRes, balanceRes, cashFlowRes] = await Promise.all([
        fetch(`${API_URL}/company/${currentSymbol}/income-statement?period=${financialPeriod}`),
        fetch(`${API_URL}/company/${currentSymbol}/balance-sheet?period=${financialPeriod}`),
        fetch(`${API_URL}/company/${currentSymbol}/cash-flow?period=${financialPeriod}`)
      ]);

      const incomeData = await incomeRes.json();
      const balanceData = await balanceRes.json();
      const cashFlowData = await cashFlowRes.json();

      if (incomeData.success) setIncomeStatements(incomeData.data.statements);
      if (balanceData.success) setBalanceSheets(balanceData.data.statements);
      if (cashFlowData.success) setCashFlows(cashFlowData.data.statements);

    } catch (err) {
      console.error('Error fetching financials:', err);
    }
  };

  if (!currentSymbol) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.75rem',
        border: '1px solid #334155'
      }}>
        <Building2 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
          Company Analysis
        </h3>
        <p style={{ color: '#94a3b8' }}>
          Select a company to view detailed fundamental analysis
        </p>
      </div>
    );
  }

  if (loading && !overview) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem'
      }}>
        <Loader size={48} color="#8b5cf6" className="spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Popular Stocks by Sector - Fill Empty Space */}
      {!currentSymbol && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#cbd5e1',
            textAlign: 'center'
          }}>
            🔥 Popular Stocks by Sector
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Tech Giants */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#60a5fa',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                TECH GIANTS
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'AMD', 'INTC', 'ADBE', 'CRM', 'ORCL', 'CSCO', 'AVGO'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(96, 165, 250, 0.1)',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#60a5fa',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                      e.currentTarget.style.borderColor = '#60a5fa';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Finance */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#10b981',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                FINANCE
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['JPM', 'BAC', 'GS', 'WFC', 'MS', 'V', 'MA', 'C', 'BLK', 'SCHW', 'AXP', 'USB', 'PNC', 'COF', 'TFC'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#10b981',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Healthcare */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#f472b6',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                HEALTHCARE
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'LLY', 'CVS', 'ABT', 'DHR', 'BMY', 'AMGN', 'GILD', 'CI', 'REGN'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(244, 114, 182, 0.1)',
                      border: '1px solid rgba(244, 114, 182, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#f472b6',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(244, 114, 182, 0.2)';
                      e.currentTarget.style.borderColor = '#f472b6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(244, 114, 182, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(244, 114, 182, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Consumer */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#fbbf24',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                CONSUMER
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['WMT', 'HD', 'NKE', 'SBUX', 'MCD', 'DIS', 'COST', 'PG', 'KO', 'PEP', 'TGT', 'LOW', 'BKNG', 'TJX', 'CMG'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#fbbf24',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#a78bfa',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ENERGY
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PSX', 'VLO', 'OXY', 'MPC', 'PXD', 'KMI', 'WMB', 'HAL', 'BKR', 'DVN'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(167, 139, 250, 0.1)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#a78bfa',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                      e.currentTarget.style.borderColor = '#a78bfa';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Industrials */}
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#fb923c',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                INDUSTRIALS
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['BA', 'CAT', 'HON', 'UPS', 'GE', 'RTX', 'LMT', 'DE', 'MMM', 'UNP', 'FDX', 'NSC', 'CSX', 'EMR', 'ETN'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setCurrentSymbol(sym)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'rgba(251, 146, 60, 0.1)',
                      border: '1px solid rgba(251, 146, 60, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#fb923c',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                      e.currentTarget.style.borderColor = '#fb923c';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        borderRadius: '0.75rem',
        padding: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 4vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <Building2 size={32} color="white" />
              {overview?.name || currentSymbol}
            </h2>
            <div style={{ color: '#e0e7ff', fontSize: '0.875rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>{overview?.symbol}</span>
              <span>•</span>
              <span>{overview?.exchange}</span>
              <span>•</span>
              <span>{overview?.sector}</span>
              <span>•</span>
              <span>{overview?.industry}</span>
            </div>
          </div>

          {overview && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#e0e7ff', marginBottom: '0.25rem' }}>
                Market Cap
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                ${formatLargeNumber(overview.marketCap)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #334155',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin'
      }}>
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={<Info size={18} />}
          label="Overview"
        />
        <TabButton
          active={activeTab === 'financials'}
          onClick={() => {
            setActiveTab('financials');
            if (incomeStatements.length === 0) fetchFinancials();
          }}
          icon={<BarChart3 size={18} />}
          label="Financials"
        />
        <TabButton
          active={activeTab === 'earnings'}
          onClick={() => setActiveTab('earnings')}
          icon={<TrendingUp size={18} />}
          label="Earnings"
        />
        <TabButton
          active={activeTab === 'health'}
          onClick={() => setActiveTab('health')}
          icon={<Activity size={18} />}
          label="Health Score"
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && overview && (
        <OverviewTab overview={overview} symbol={currentSymbol} />
      )}

      {activeTab === 'financials' && (
        <FinancialsTab
          incomeStatements={incomeStatements}
          balanceSheets={balanceSheets}
          cashFlows={cashFlows}
          period={financialPeriod}
          setPeriod={setFinancialPeriod}
        />
      )}

      {activeTab === 'earnings' && earnings && (
        <EarningsTab earnings={earnings} />
      )}

      {activeTab === 'health' && overview && (
        <HealthScoreTab overview={overview} />
      )}
    </div>
  );
};

// ==============================================
// OVERVIEW TAB
// ==============================================
const OverviewTab = ({ overview, symbol }) => {
  const healthScore = calculateHealthScore(overview);
  
  // Price chart state
  const [priceData, setPriceData] = React.useState(null);
  const [priceLoading, setPriceLoading] = React.useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('daily');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://financial-analyst-backend-production-7175.up.railway.app/api';

  // Fetch price data when symbol or timeframe changes
  React.useEffect(() => {
    if (symbol) {
      fetchPriceData();
    }
  }, [symbol, selectedTimeframe]);

  const fetchPriceData = async () => {
    setPriceLoading(true);
    try {
      const response = await fetch(`${API_URL}/stocks/${symbol}/prices/${selectedTimeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
      setPriceData(null);
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div>
      {/* Price Chart Section - AT TOP */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Timeframe Selector */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {['daily', 'weekly', 'monthly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: selectedTimeframe === tf ? '2px solid #60a5fa' : '1px solid #475569',
                background: selectedTimeframe === tf ? 'rgba(96, 165, 250, 0.2)' : '#334155',
                color: selectedTimeframe === tf ? '#60a5fa' : '#cbd5e1',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: selectedTimeframe === tf ? '600' : '400',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedTimeframe !== tf) {
                  e.currentTarget.style.borderColor = '#60a5fa';
                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTimeframe !== tf) {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.background = '#334155';
                }
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Price Chart */}
        {priceLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader size={32} className="spin" style={{ color: '#60a5fa' }} />
            <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading price data...</p>
          </div>
        ) : priceData ? (
          <PriceChart 
            data={priceData.data || priceData.prices || priceData} 
            performance={priceData.performance}
            symbol={symbol}
            timeframe={selectedTimeframe}
          />
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No price data available
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          label="P/E Ratio"
          value={overview.peRatio?.toFixed(2) || 'N/A'}
          icon={<Percent size={20} color="#60a5fa" />}
          change={overview.peRatio > 20 ? 'High' : 'Normal'}
          changeColor={overview.peRatio > 20 ? '#f59e0b' : '#10b981'}
        />
        <MetricCard
          label="EPS"
          value={`$${overview.eps?.toFixed(2) || 'N/A'}`}
          icon={<DollarSign size={20} color="#10b981" />}
        />
        <MetricCard
          label="Dividend Yield"
          value={overview.dividendYield ? `${(overview.dividendYield * 100).toFixed(2)}%` : 'N/A'}
          icon={<TrendingUp size={20} color="#8b5cf6" />}
        />
        <MetricCard
          label="52W High"
          value={`$${overview.week52High?.toFixed(2) || 'N/A'}`}
          icon={<ArrowUpRight size={20} color="#10b981" />}
        />
        <MetricCard
          label="52W Low"
          value={`$${overview.week52Low?.toFixed(2) || 'N/A'}`}
          icon={<ArrowDownRight size={20} color="#ef4444" />}
        />
        <MetricCard
          label="Beta"
          value={overview.beta?.toFixed(2) || 'N/A'}
          icon={<Activity size={20} color="#f59e0b" />}
          change={overview.beta > 1 ? 'Volatile' : 'Stable'}
          changeColor={overview.beta > 1 ? '#ef4444' : '#10b981'}
        />
      </div>

      {/* Profitability Metrics */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#10b981" />
          Profitability Metrics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <SimpleMetric label="Profit Margin" value={`${(overview.profitMargin * 100)?.toFixed(2) || 0}%`} />
          <SimpleMetric label="Operating Margin" value={`${(overview.operatingMargin * 100)?.toFixed(2) || 0}%`} />
          <SimpleMetric label="Return on Equity" value={`${(overview.returnOnEquity * 100)?.toFixed(2) || 0}%`} />
          <SimpleMetric label="Return on Assets" value={`${(overview.returnOnAssets * 100)?.toFixed(2) || 0}%`} />
        </div>
      </div>

      {/* Valuation Metrics */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={20} color="#60a5fa" />
          Valuation Ratios
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <SimpleMetric label="P/E Ratio" value={overview.peRatio?.toFixed(2) || 'N/A'} />
          <SimpleMetric label="PEG Ratio" value={overview.pegRatio?.toFixed(2) || 'N/A'} />
          <SimpleMetric label="Price to Book" value={overview.priceToBook?.toFixed(2) || 'N/A'} />
          <SimpleMetric label="Price to Sales" value={overview.priceToSales?.toFixed(2) || 'N/A'} />
          <SimpleMetric label="EV to Revenue" value={overview.evToRevenue?.toFixed(2) || 'N/A'} />
          <SimpleMetric label="EV to EBITDA" value={overview.evToEbitda?.toFixed(2) || 'N/A'} />
        </div>
      </div>

      {/* Company Description */}
      {overview.description && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#94a3b8" />
            About {overview.name}
          </h3>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.875rem' }}>
            {overview.description}
          </p>
        </div>
      )}

      {/* Revenue & Valuation Breakdown Pie Chart */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          marginBottom: '1.5rem', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <PieChart size={20} color="#8b5cf6" />
          Company Metrics Breakdown
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Key Metrics Pie Visual */}
          <div>
            <h4 style={{ 
              fontSize: '0.875rem', 
              color: '#cbd5e1', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              Market Valuation Distribution
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { label: 'Market Cap', value: overview.marketCap, color: '#10b981' },
                { label: 'Enterprise Value', value: overview.enterpriseValue || overview.marketCap * 1.1, color: '#60a5fa' },
                { label: 'Revenue (TTM)', value: overview.revenue, color: '#8b5cf6' }
              ].map((metric, idx) => {
                const total = overview.marketCap + (overview.enterpriseValue || overview.marketCap * 1.1) + overview.revenue;
                const percentage = ((metric.value / total) * 100).toFixed(1);
                
                return (
                  <div key={idx}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          background: metric.color,
                          borderRadius: '2px'
                        }} />
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#cbd5e1',
                          fontWeight: '600'
                        }}>
                          {metric.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: metric.color,
                        fontWeight: '700'
                      }}>
                        {percentage}%
                      </span>
                    </div>
                    <div style={{
                      height: '24px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: `linear-gradient(to right, ${metric.color}, ${metric.color}cc)`,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '0.75rem',
                        transition: 'width 0.5s ease'
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'white',
                          fontWeight: '700'
                        }}>
                          ${formatLargeNumber(metric.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Ratios */}
          <div>
            <h4 style={{ 
              fontSize: '0.875rem', 
              color: '#cbd5e1', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              Key Financial Ratios
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }}>
              {[
                { label: 'P/E Ratio', value: overview.peRatio?.toFixed(2) || 'N/A', color: '#60a5fa' },
                { label: 'P/B Ratio', value: overview.priceToBook?.toFixed(2) || 'N/A', color: '#10b981' },
                { label: 'Debt/Equity', value: overview.debtToEquity?.toFixed(2) || 'N/A', color: '#f59e0b' },
                { label: 'Current Ratio', value: overview.currentRatio?.toFixed(2) || 'N/A', color: '#8b5cf6' }
              ].map((ratio, idx) => (
                <div key={idx} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${ratio.color}44`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem',
                    fontWeight: '600'
                  }}>
                    {ratio.label}
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    color: ratio.color,
                    fontWeight: '700'
                  }}>
                    {ratio.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ADD: Market Context Section */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1.5rem', 
          fontWeight: '600',
          color: '#60a5fa'
        }}>
          📊 Market Context & Analysis
        </h3>
        
        {/* Sector Analysis - MOVED TO TOP */}
        <SectorAnalysisSection symbol={symbol} />
        
        {/* Social Sentiment */}
        <div style={{ marginTop: '2rem' }}>
          <SocialSentimentSection symbol={symbol} />
        </div>
        
        {/* Stock News - MOVED TO BOTTOM */}
        <div style={{ marginTop: '2rem' }}>
          <StockNewsSection symbol={symbol} />
        </div>
      </div>
    </div>
  );
};

// ==============================================
// FINANCIALS TAB
// ==============================================
const FinancialsTab = ({ incomeStatements, balanceSheets, cashFlows, period, setPeriod }) => {
  if (!incomeStatements || incomeStatements.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size={32} className="spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Period Selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setPeriod('quarterly')}
          style={{
            padding: '0.5rem 1rem',
            background: period === 'quarterly' ? '#8b5cf6' : '#334155',
            border: 'none',
            borderRadius: '0.375rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Quarterly
        </button>
        <button
          onClick={() => setPeriod('annual')}
          style={{
            padding: '0.5rem 1rem',
            background: period === 'annual' ? '#8b5cf6' : '#334155',
            border: 'none',
            borderRadius: '0.375rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Annual
        </button>
      </div>

      {/* Revenue and Net Income Charts - SIDE BY SIDE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Revenue Chart */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            marginBottom: '1rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TrendingUp size={20} color="#10b981" />
            Revenue Trend
          </h3>
          <SimpleBarChart
            data={incomeStatements.slice(0, 8).reverse()}
            dataKey="revenue"
            label="Revenue"
            color="#10b981"
          />
        </div>

        {/* Net Income Chart */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            marginBottom: '1rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <DollarSign size={20} color="#60a5fa" />
            Net Income Trend
          </h3>
          <SimpleBarChart
            data={incomeStatements.slice(0, 8).reverse()}
            dataKey="netIncome"
            label="Net Income"
            color="#60a5fa"
          />
        </div>
      </div>

      {/* Profit Margins Chart */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
          Profit Margins
        </h3>
        <SimpleLineChart
          data={incomeStatements.slice(0, 8).reverse()}
          lines={[
            { dataKey: 'grossProfitMargin', label: 'Gross', color: '#10b981' },
            { dataKey: 'operatingMargin', label: 'Operating', color: '#60a5fa' },
            { dataKey: 'netProfitMargin', label: 'Net', color: '#8b5cf6' }
          ]}
        />
      </div>

      {/* Cash Flow Chart */}
      {cashFlows && cashFlows.length > 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
            Cash Flow Analysis
          </h3>
          <SimpleLineChart
            data={cashFlows.slice(0, 8).reverse()}
            lines={[
              { dataKey: 'operatingCashFlow', label: 'Operating', color: '#10b981' },
              { dataKey: 'investingCashFlow', label: 'Investing', color: '#ef4444' },
              { dataKey: 'financingCashFlow', label: 'Financing', color: '#60a5fa' }
            ]}
          />
        </div>
      )}
    </div>
  );
};

// ==============================================
// EARNINGS TAB
// ==============================================
const EarningsTab = ({ earnings }) => {
  return (
    <div>
      {/* Earnings Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatBox
          label="Beat Rate"
          value={`${earnings.summary.beatRate.toFixed(1)}%`}
          icon={<Award size={24} color="#10b981" />}
          color="#10b981"
        />
        <StatBox
          label="Total Beats"
          value={earnings.summary.beats}
          icon={<TrendingUp size={24} color="#10b981" />}
          color="#10b981"
        />
        <StatBox
          label="Total Misses"
          value={earnings.summary.misses}
          icon={<TrendingDown size={24} color="#ef4444" />}
          color="#ef4444"
        />
        <StatBox
          label="Avg Surprise"
          value={`${earnings.summary.avgSurprise.toFixed(2)}%`}
          icon={<Target size={24} color="#60a5fa" />}
          color="#60a5fa"
        />
      </div>

      {/* EPS Trend Chart */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
          EPS Trend (Quarterly)
        </h3>
        <SimpleLineChart
          data={earnings.quarterly.slice(0, 8).reverse()}
          lines={[
            { dataKey: 'reportedEPS', label: 'Reported', color: '#10b981' },
            { dataKey: 'estimatedEPS', label: 'Estimated', color: '#60a5fa' }
          ]}
        />
      </div>

      {/* Earnings History Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: '600' }}>
          Recent Earnings Reports
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155' }}>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Reported EPS</th>
                <th style={tableHeaderStyle}>Estimated EPS</th>
                <th style={tableHeaderStyle}>Surprise</th>
                <th style={tableHeaderStyle}>Surprise %</th>
                <th style={tableHeaderStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {earnings.quarterly.slice(0, 8).map((earning, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={tableCellStyle}>
                    {new Date(earning.reportedDate || earning.fiscalDate).toLocaleDateString()}
                  </td>
                  <td style={tableCellStyle}>${earning.reportedEPS.toFixed(2)}</td>
                  <td style={tableCellStyle}>${earning.estimatedEPS.toFixed(2)}</td>
                  <td style={{
                    ...tableCellStyle,
                    color: earning.surprise >= 0 ? '#10b981' : '#ef4444'
                  }}>
                    ${earning.surprise.toFixed(2)}
                  </td>
                  <td style={{
                    ...tableCellStyle,
                    color: earning.surprisePercent >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    {earning.surprisePercent >= 0 ? '+' : ''}{earning.surprisePercent.toFixed(2)}%
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: earning.beat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: earning.beat ? '#10b981' : '#ef4444'
                    }}>
                      {earning.beat ? 'BEAT' : 'MISS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// HEALTH SCORE TAB
// ==============================================
const HealthScoreTab = ({ overview }) => {
  const score = calculateHealthScore(overview);
  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      {/* Overall Health Score */}
      <div style={{
        background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}10)`,
        border: `2px solid ${scoreColor}40`,
        borderRadius: '0.75rem',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          Overall Financial Health Score
        </div>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: scoreColor, marginBottom: '0.5rem' }}>
          {score}
        </div>
        <div style={{ fontSize: '1rem', color: '#cbd5e1' }}>
          {score >= 70 ? '🟢 Excellent' : score >= 50 ? '🟡 Good' : '🔴 Needs Improvement'}
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <ScoreCard
          label="Profitability"
          score={calculateProfitabilityScore(overview)}
          metrics={[
            { label: 'Profit Margin', value: `${(overview.profitMargin * 100)?.toFixed(2) || 0}%` },
            { label: 'ROE', value: `${(overview.returnOnEquity * 100)?.toFixed(2) || 0}%` },
            { label: 'ROA', value: `${(overview.returnOnAssets * 100)?.toFixed(2) || 0}%` }
          ]}
        />
        <ScoreCard
          label="Valuation"
          score={calculateValuationScore(overview)}
          metrics={[
            { label: 'P/E Ratio', value: overview.peRatio?.toFixed(2) || 'N/A' },
            { label: 'PEG Ratio', value: overview.pegRatio?.toFixed(2) || 'N/A' },
            { label: 'P/B Ratio', value: overview.priceToBook?.toFixed(2) || 'N/A' }
          ]}
        />
        <ScoreCard
          label="Growth"
          score={calculateGrowthScore(overview)}
          metrics={[
            { label: 'Revenue/Share', value: `$${overview.revenuePerShare?.toFixed(2) || 'N/A'}` },
            { label: 'EPS', value: `$${overview.eps?.toFixed(2) || 'N/A'}` },
            { label: 'Operating Margin', value: `${(overview.operatingMargin * 100)?.toFixed(2) || 0}%` }
          ]}
        />
      </div>
    </div>
  );
};

// Helper Components
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.75rem 1.5rem',
      background: active ? '#8b5cf6' : 'transparent',
      border: 'none',
      borderRadius: '0.5rem 0.5rem 0 0',
      color: active ? 'white' : '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'transparent';
    }}
  >
    {icon}
    {label}
  </button>
);

const MetricCard = ({ label, value, icon, change, changeColor }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '1.25rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      {icon}
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '0.25rem' }}>
      {value}
    </div>
    {change && (
      <div style={{ fontSize: '0.75rem', color: changeColor, fontWeight: '600' }}>
        {change}
      </div>
    )}
  </div>
);

const SimpleMetric = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#e2e8f0' }}>
      {value}
    </div>
  </div>
);

const StatBox = ({ label, value, icon, color }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <div style={{
      padding: '1rem',
      background: `${color}20`,
      borderRadius: '0.5rem'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
        {value}
      </div>
    </div>
  </div>
);

const ScoreCard = ({ label, score, metrics }) => {
  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: scoreColor }}>
          {score}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: '#94a3b8' }}>{metric.label}:</span>
            <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Charts
const SimpleBarChart = ({ data, dataKey, label, color }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));

  return (
    <div style={{ 
      width: '100%',
      height: '280px',
      position: 'relative',
      overflowX: 'auto',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '0.5rem',
      padding: '3rem 0.5rem 3rem 0.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.25rem', // Increased gap for more spacing
        height: '100%',
        minWidth: 'fit-content',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}>
        {data.map((item, idx) => {
          // TRUE percentage from 0-100% based on max value
          const height = ((item[dataKey] || 0) / maxValue) * 100;
          
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                minWidth: '50px', // Reduced from 70px for sleeker look
                maxWidth: '60px', // Added max width to keep bars slim
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Value on top - ABSOLUTE positioning */}
              <div style={{ 
                position: 'absolute',
                top: '-2.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem', // Slightly smaller
                color: '#cbd5e1',
                fontWeight: '600', // Less bold than 700
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}>
                ${formatLargeNumber(item[dataKey])}
              </div>
              
              {/* Bar - using height percentage */}
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(height, 5)}%`,
                  background: `linear-gradient(180deg, ${color}dd 0%, ${color} 100%)`, // Subtle gradient
                  borderRadius: '0.375rem 0.375rem 0 0', // Slightly less rounded
                  boxShadow: `0 -1px 8px ${color}33`, // Softer shadow
                  border: 'none', // Removed border for cleaner look
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: 0.95
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scaleY(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
                title={`${label}: $${formatLargeNumber(item[dataKey])}`}
              >
                {/* Subtle shine effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: '25%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                  borderRadius: '0.25rem'
                }} />
              </div>
              
              {/* Date on bottom - ABSOLUTE positioning */}
              <div style={{ 
                position: 'absolute',
                bottom: '-2.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.65rem', // Slightly smaller
                color: '#94a3b8',
                fontWeight: '500', // Less bold
                whiteSpace: 'nowrap'
              }}>
                {item.fiscalDate?.substring(0, 7) || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, lines }) => {
  if (!data || data.length === 0) return null;

  return (
    <div>
      {/* Legend - matching earnings style */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem', 
        flexWrap: 'wrap'
      }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: line.color, 
              borderRadius: '2px' 
            }} />
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#cbd5e1',
              fontWeight: '600'
            }}>
              {line.label}
            </span>
          </div>
        ))}
      </div>

      {/* Table matching earnings report style */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155' }}>
              <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Period</th>
              {lines.map((line, idx) => (
                <th key={idx} style={{ ...tableHeaderStyle, color: line.color }}>
                  {line.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ ...tableCellStyle, textAlign: 'left', fontWeight: '600' }}>
                  {item.fiscalDate?.substring(0, 7) || ''}
                </td>
                {lines.map((line, lineIdx) => {
                  const value = item[line.dataKey];
                  const displayValue = typeof value === 'number'
                    ? value > 1
                      ? `$${formatLargeNumber(value)}`
                      : `${(value * 100).toFixed(2)}%`
                    : 'N/A';
                  
                  return (
                    <td 
                      key={lineIdx} 
                      style={{ 
                        ...tableCellStyle,
                        color: line.color,
                        fontWeight: '600'
                      }}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Functions
function formatLargeNumber(num) {
  if (!num) return '0';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function calculateHealthScore(overview) {
  if (!overview) return 0;

  let score = 50; // Base score

  // Profitability
  if (overview.profitMargin > 0.2) score += 10;
  else if (overview.profitMargin > 0.1) score += 5;

  if (overview.returnOnEquity > 0.15) score += 10;
  else if (overview.returnOnEquity > 0.1) score += 5;

  // Valuation
  if (overview.peRatio && overview.peRatio < 25 && overview.peRatio > 10) score += 10;
  if (overview.pegRatio && overview.pegRatio < 2) score += 5;

  // Growth
  if (overview.eps > 0) score += 10;
  if (overview.revenuePerShare > 0) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateProfitabilityScore(overview) {
  let score = 50;
  if (overview.profitMargin > 0.2) score += 20;
  else if (overview.profitMargin > 0.1) score += 10;
  if (overview.returnOnEquity > 0.2) score += 20;
  else if (overview.returnOnEquity > 0.1) score += 10;
  if (overview.returnOnAssets > 0.1) score += 10;
  return Math.min(100, score);
}

function calculateValuationScore(overview) {
  let score = 50;
  if (overview.peRatio && overview.peRatio < 20 && overview.peRatio > 10) score += 20;
  if (overview.pegRatio && overview.pegRatio < 1.5) score += 15;
  if (overview.priceToBook && overview.priceToBook < 3) score += 15;
  return Math.min(100, score);
}

function calculateGrowthScore(overview) {
  let score = 50;
  if (overview.eps > 0) score += 20;
  if (overview.revenuePerShare > 0) score += 15;
  if (overview.operatingMargin > 0.15) score += 15;
  return Math.min(100, score);
}

const tableHeaderStyle = {
  padding: '0.75rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase',
  textAlign: 'right'
};

const tableCellStyle = {
  padding: '0.75rem',
  fontSize: '0.875rem',
  color: '#cbd5e1',
  textAlign: 'right'
};

// ==============================================
// WRAPPER COMPONENTS FOR OVERVIEW TAB
// ==============================================
const StockNewsSection = ({ symbol }) => {
  return <StockNews symbol={symbol} />;
};

const SectorAnalysisSection = ({ symbol }) => {
  return <SectorAnalysis symbol={symbol} />;
};

const SocialSentimentSection = ({ symbol }) => {
  return <SocialSentiment symbol={symbol} />;
};

// ==============================================
// PRICE CHART COMPONENT
// ==============================================
const PriceChart = ({ data, performance, symbol, timeframe }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        No price data available
      </div>
    );
  }

  // Calculate min and max for Y-axis
  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const yPadding = priceRange * 0.1;

  // SVG dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 50, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index) => (index / (data.length - 1)) * chartWidth;
  const yScale = (price) => chartHeight - ((price - (minPrice - yPadding)) / (maxPrice - minPrice + 2 * yPadding)) * chartHeight;

  // Create path for line chart
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d.close)}`)
    .join(' ');

  // Create area path
  const areaPath = `${linePath} L ${xScale(data.length - 1)},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div>
      {/* Performance Summary */}
      {performance && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Change</div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: parseFloat(performance.change || 0) >= 0 ? '#10b981' : '#ef4444'
            }}>
              {parseFloat(performance.change || 0) >= 0 ? '+' : ''}{parseFloat(performance.change || 0).toFixed(2)}%
            </div>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>High</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              ${parseFloat(performance.high || 0).toFixed(2)}
            </div>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Low</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
              ${parseFloat(performance.low || 0).toFixed(2)}
            </div>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Volume</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {formatLargeNumber(performance.avgVolume || performance.volume || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        overflowX: 'auto'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          {symbol} - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Price Chart
        </h3>

        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: '100%' }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight * ratio;
              const price = maxPrice - (maxPrice - minPrice) * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="12"
                  >
                    ${price.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#priceGradient)"
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
            />

            {/* Data points - INTERACTIVE */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(d.close)}
                r={hoveredPoint === i ? "6" : "4"}
                fill={hoveredPoint === i ? "#60a5fa" : "#3b82f6"}
                stroke={hoveredPoint === i ? "white" : "none"}
                strokeWidth={hoveredPoint === i ? "2" : "0"}
                opacity={hoveredPoint === i ? 1 : 0.7}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Hover Tooltip */}
            {hoveredPoint !== null && (
              <g>
                {/* Vertical line */}
                <line
                  x1={xScale(hoveredPoint)}
                  y1={0}
                  x2={xScale(hoveredPoint)}
                  y2={chartHeight}
                  stroke="#60a5fa"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                
                {/* Tooltip box */}
                <g transform={`translate(${xScale(hoveredPoint)}, ${yScale(data[hoveredPoint].close) - 60})`}>
                  <rect
                    x="-60"
                    y="0"
                    width="120"
                    height="50"
                    fill="rgba(30, 41, 59, 0.95)"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    rx="8"
                  />
                  <text
                    x="0"
                    y="20"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    ${data[hoveredPoint].close.toFixed(2)}
                  </text>
                  <text
                    x="0"
                    y="38"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    {new Date(data[hoveredPoint].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </text>
                </g>
              </g>
            )}

            {/* X-axis labels */}
            {data
              .filter((_, i) => i % Math.floor(data.length / 5) === 0 || i === data.length - 1)
              .map((d, i, arr) => {
                const index = data.indexOf(d);
                return (
                  <text
                    key={index}
                    x={xScale(index)}
                    y={chartHeight + 25}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="12"
                  >
                    {new Date(d.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </text>
                );
              })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CompanyAnalysis;
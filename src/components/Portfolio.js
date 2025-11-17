import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, TrendingUp, TrendingDown, Trash2, Loader, DollarSign, PieChart, Calendar, Upload } from 'lucide-react';
import { portfolioAPI, stockAPI } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Portfolio = ({ user }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioDetails, setPortfolioDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [currentPrices, setCurrentPrices] = useState({});

  // Form states
  const [portfolioForm, setPortfolioForm] = useState({ name: '', description: '' });
  const [transactionForm, setTransactionForm] = useState({
    symbol: '',
    transactionType: 'buy',
    shares: '',
    pricePerShare: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [brokerFormat, setBrokerFormat] = useState('generic');
  const [importing, setImporting] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceRange, setPerformanceRange] = useState(365);

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioDetails(selectedPortfolio);
    }
  }, [selectedPortfolio]);

  useEffect(() => {
    if (portfolioDetails?.holdings) {
      fetchCurrentPrices();
    }
  }, [portfolioDetails]);

useEffect(() => {
    if (selectedPortfolio && user) {
      fetchPerformance();
    }
  }, [selectedPortfolio, performanceRange, user]);

  const fetchPortfolios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await portfolioAPI.getPortfolios(user.id);
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioDetails = async (portfolioId) => {
    if (!user) return;
    
    setDetailsLoading(true);
    try {
      const data = await portfolioAPI.getPortfolioDetails(user.id, portfolioId);
      setPortfolioDetails(data);
    } catch (error) {
      console.error('Failed to fetch portfolio details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

const fetchCurrentPrices = async () => {
    if (!portfolioDetails?.holdings) return;

    const prices = {};
    for (const holding of portfolioDetails.holdings) {
      try {
        // Use real stock API to get current price
        const data = await stockAPI.getStockData(holding.symbol);
        prices[holding.symbol] = data.currentPrice || parseFloat(holding.average_cost);
      } catch (error) {
        console.error(`Failed to fetch price for ${holding.symbol}:`, error);
        // Fallback to average cost if API fails
        prices[holding.symbol] = parseFloat(holding.average_cost);
      }
    }
    setCurrentPrices(prices);
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await portfolioAPI.createPortfolio(user.id, portfolioForm.name, portfolioForm.description);
      setPortfolioForm({ name: '', description: '' });
      setShowCreateForm(false);
      fetchPortfolios();
      alert('Portfolio created successfully!');
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert('Failed to create portfolio');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!user || !selectedPortfolio) return;

    try {
      await portfolioAPI.addTransaction(user.id, selectedPortfolio, transactionForm);
      setTransactionForm({
        symbol: '',
        transactionType: 'buy',
        shares: '',
        pricePerShare: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowTransactionForm(false);
      fetchPortfolioDetails(selectedPortfolio);
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!user || !window.confirm('Delete this transaction?')) return;

    try {
      await portfolioAPI.deleteTransaction(user.id, transactionId);
      fetchPortfolioDetails(selectedPortfolio);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const lines = csvData.split('\n').slice(0, 6);
        setCsvPreview(lines.join('\n'));
      };
      reader.readAsText(file);
    }
  };

  const handleImportCSV = async () => {
    if (!user || !selectedPortfolio || !importFile) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target.result;
        
        const result = await portfolioAPI.importCSV(user.id, selectedPortfolio, csvData, brokerFormat);
        
        alert(`Successfully imported ${result.imported} of ${result.total} transactions!`);
        
        setImportFile(null);
        setCsvPreview(null);
        setShowImportForm(false);
        
        fetchPortfolioDetails(selectedPortfolio);
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('Failed to import CSV: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

 const fetchPerformance = async () => {
    if (!user || !selectedPortfolio) return;

    setPerformanceLoading(true);
    try {
      const data = await portfolioAPI.getPerformance(user.id, selectedPortfolio, performanceRange);
      setPerformanceData(data.performance);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const calculatePortfolioValue = () => {
    if (!portfolioDetails?.holdings) return 0;
    return portfolioDetails.holdings.reduce((total, holding) => {
      const currentPrice = currentPrices[holding.symbol] || parseFloat(holding.average_cost);
      return total + (parseFloat(holding.total_shares) * currentPrice);
    }, 0);
  };

  const calculateTotalCost = () => {
    if (!portfolioDetails?.holdings) return 0;
    return portfolioDetails.holdings.reduce((total, holding) => {
      return total + parseFloat(holding.total_cost);
    }, 0);
  };

  const calculateProfitLoss = () => {
    return calculatePortfolioValue() - calculateTotalCost();
  };

  const calculateProfitLossPercent = () => {
    const cost = calculateTotalCost();
    if (cost === 0) return 0;
    return ((calculateProfitLoss() / cost) * 100);
  };

const renderPerformanceChart = () => {
    if (!performanceData || performanceData.length === 0) {
      return (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#94a3b8' }}>No performance data available yet</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Performance tracking starts from your first transaction date
          </p>
        </div>
      );
    }

    // If only one data point, show current value as bar chart instead
    if (performanceData.length === 1) {
      const dataPoint = performanceData[0];
      return (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Current Portfolio Status
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              ${dataPoint.value.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
              Cost Basis: ${dataPoint.cost.toFixed(2)}
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: dataPoint.profitLoss >= 0 ? '#10b981' : '#ef4444',
              marginTop: '1rem'
            }}>
              {dataPoint.profitLoss >= 0 ? '+' : ''}${dataPoint.profitLoss.toFixed(2)} 
              ({dataPoint.profitLoss >= 0 ? '+' : ''}{dataPoint.profitLossPercent.toFixed(2)}%)
            </div>
          </div>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#93c5fd'
          }}>
            💡 Historical performance chart will appear after a few days of tracking
          </div>
        </div>
      );
    }

    const chartData = {
      labels: performanceData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Portfolio Value',
          data: performanceData.map(d => d.value),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: performanceData.length < 10 ? 3 : 0,
          pointHoverRadius: 4,
          borderWidth: 2
        },
        {
          label: 'Total Cost',
          data: performanceData.map(d => d.cost),
          borderColor: '#94a3b8',
          backgroundColor: 'rgba(148, 163, 184, 0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#cbd5e1',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#cbd5e1',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += '$' + context.parsed.y.toFixed(2);
              return label;
            },
            afterBody: function(context) {
              if (context[0].dataIndex < performanceData.length) {
                const dataPoint = performanceData[context[0].dataIndex];
                return [
                  '',
                  `P&L: $${dataPoint.profitLoss.toFixed(2)} (${dataPoint.profitLossPercent >= 0 ? '+' : ''}${dataPoint.profitLossPercent.toFixed(2)}%)`
                ];
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            maxTicksLimit: 8
          }
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            callback: function(value) {
              return '$' + value.toFixed(0);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    return (
      <div style={{ height: '400px', position: 'relative' }}>
        {performanceLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader size={32} color="#60a5fa" className="spin" />
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    );
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
        <Briefcase size={48} color="#60a5fa" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Login Required</h3>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Please log in to manage your investment portfolio
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

  const totalValue = calculatePortfolioValue();
  const totalCost = calculateTotalCost();
  const profitLoss = calculateProfitLoss();
  const profitLossPercent = calculateProfitLossPercent();

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={32} color="white" />
              My Portfolios
            </h2>
            <p style={{ color: '#d1fae5', fontSize: '1rem', margin: 0 }}>
              Track your investments and performance
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
            New Portfolio
          </button>
        </div>
      </div>

      {/* Create Portfolio Form */}
      {showCreateForm && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Create New Portfolio</h3>
          <form onSubmit={handleCreatePortfolio}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={portfolioForm.name}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                  placeholder="e.g. Retirement, Growth"
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
                  Description (optional)
                </label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="e.g. Long-term retirement holdings"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Create Portfolio
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

      {/* Portfolio Selector */}
      {portfolios.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setSelectedPortfolio(portfolio.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: selectedPortfolio === portfolio.id ? '2px solid #10b981' : '1px solid #475569',
                  background: selectedPortfolio === portfolio.id ? 'rgba(16, 185, 129, 0.2)' : '#334155',
                  color: selectedPortfolio === portfolio.id ? '#10b981' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: selectedPortfolio === portfolio.id ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                {portfolio.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      {portfolioDetails && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Value</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${totalValue.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Cost</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${totalCost.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Profit/Loss</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: profitLoss >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {profitLoss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                ${Math.abs(profitLoss).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.875rem', color: profitLoss >= 0 ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>
                {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>


{/* ⭐ ADD THE ENTIRE PERFORMANCE CHART SECTION HERE ⭐ */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid #334155', 
              borderRadius: '0.75rem', 
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="#10b981" />
                  Performance
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '1M', days: 30 },
                    { label: '3M', days: 90 },
                    { label: '6M', days: 180 },
                    { label: '1Y', days: 365 },
                    { label: 'All', days: 3650 }
                  ].map(range => (
                    <button
                      key={range.label}
                      onClick={() => setPerformanceRange(range.days)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: performanceRange === range.days ? '#10b981' : '#334155',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: performanceRange === range.days ? '600' : '400',
                        transition: 'all 0.2s'
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              {renderPerformanceChart()}
            </div>
          </div>


          {/* Add Transaction & Import CSV Buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowTransactionForm(!showTransactionForm)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
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
                <Plus size={16} />
                Add Transaction
              </button>
              
              <button
                onClick={() => setShowImportForm(!showImportForm)}
                style={{
                  padding: '0.75rem 1.5rem',
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
                <Upload size={16} />
                Import CSV
              </button>
            </div>
          </div>

          {/* Import CSV Form */}
          {showImportForm && (
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid #334155', 
              borderRadius: '0.75rem', 
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Import Transactions from CSV</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Broker Format
                </label>
                <select
                  value={brokerFormat}
                  onChange={(e) => setBrokerFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <option value="generic">Generic CSV (Symbol, Type, Shares, Price, Date)</option>
                  <option value="fidelity">Fidelity</option>
                  <option value="schwab">Charles Schwab</option>
                  <option value="robinhood">Robinhood</option>
                </select>
                
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#93c5fd', margin: 0 }}>
                    💡 <strong>How to export from your broker:</strong>
                  </p>
                  <ul style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li><strong>Fidelity:</strong> Accounts → History → Download</li>
                    <li><strong>Schwab:</strong> Accounts → History → Export</li>
                    <li><strong>Robinhood:</strong> Account → Statements → Export History</li>
                    <li><strong>Generic:</strong> Create CSV with columns: Symbol, Type, Shares, Price, Date</li>
                  </ul>
                </div>

                <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
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

              {csvPreview && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Preview (first 5 rows):
                  </label>
                  <pre style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {csvPreview}
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleImportCSV}
                  disabled={!importFile || importing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: importing || !importFile ? '#475569' : '#059669',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: importing || !importFile ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {importing ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                  {importing ? 'Importing...' : 'Import Transactions'}
                </button>
                <button
                  onClick={() => {
                    setShowImportForm(false);
                    setImportFile(null);
                    setCsvPreview(null);
                  }}
                  disabled={importing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#475569',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: importing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Transaction Form */}
          {showTransactionForm && (
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid #334155', 
              borderRadius: '0.75rem', 
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Add Transaction</h3>
              <form onSubmit={handleAddTransaction}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                      Symbol *
                    </label>
                    <input
                      type="text"
                      value={transactionForm.symbol}
                      onChange={(e) => setTransactionForm({ ...transactionForm, symbol: e.target.value.toUpperCase() })}
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
                      Type *
                    </label>
                    <select
                      value={transactionForm.transactionType}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transactionType: e.target.value })}
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
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                      Shares *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={transactionForm.shares}
                      onChange={(e) => setTransactionForm({ ...transactionForm, shares: e.target.value })}
                      placeholder="e.g. 10"
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
                      Price per Share *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.pricePerShare}
                      onChange={(e) => setTransactionForm({ ...transactionForm, pricePerShare: e.target.value })}
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
                      Date *
                    </label>
                    <input
                      type="date"
                      value={transactionForm.transactionDate}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transactionDate: e.target.value })}
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
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                    placeholder="e.g. Dollar cost averaging"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
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

          {/* Holdings */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} color="#10b981" />
              Current Holdings
            </h3>
            {portfolioDetails.holdings.length === 0 ? (
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.5)', 
                border: '1px solid #334155', 
                borderRadius: '0.75rem', 
                padding: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8' }}>No holdings yet. Add your first transaction!</p>
              </div>
            ) : (
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '0.75rem', overflow: 'hidden' }}>
                

<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ background: '#1e293b' }}>
      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Symbol</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Shares</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Avg Cost</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Current Price</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Total Cost</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Market Value</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Gain/Loss $</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Gain/Loss %</th>
      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>% of Portfolio</th>
    </tr>
  </thead>
  <tbody>
    {portfolioDetails.holdings.map((holding) => {
      const currentPrice = currentPrices[holding.symbol] || parseFloat(holding.average_cost);
      const shares = parseFloat(holding.total_shares);
      const avgCost = parseFloat(holding.average_cost);
      const totalCost = parseFloat(holding.total_cost);
      const marketValue = shares * currentPrice;
      const gainLoss = marketValue - totalCost;
      const gainLossPercent = (gainLoss / totalCost) * 100;
      const percentOfPortfolio = (marketValue / totalValue) * 100;

      return (
        <tr key={holding.id} style={{ borderTop: '1px solid #334155' }}>
          <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#60a5fa' }}>
            {holding.symbol}
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
            {shares.toFixed(6)}
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
            ${avgCost.toFixed(2)}
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
            ${currentPrice.toFixed(2)}
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
            ${totalCost.toFixed(2)}
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
            ${marketValue.toFixed(2)}
          </td>
          <td style={{ 
            padding: '1rem', 
            textAlign: 'right', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: gainLoss >= 0 ? '#10b981' : '#ef4444' 
          }}>
            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
          </td>
          <td style={{ 
            padding: '1rem', 
            textAlign: 'right', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: gainLoss >= 0 ? '#10b981' : '#ef4444' 
          }}>
            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
          </td>
          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
            {percentOfPortfolio.toFixed(2)}%
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
            </div>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#60a5fa" />
              Transaction History
            </h3>
            {portfolioDetails.transactions.length === 0 ? (
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.5)', 
                border: '1px solid #334155', 
                borderRadius: '0.75rem', 
                padding: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8' }}>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {portfolioDetails.transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    style={{ 
                      background: 'rgba(30, 41, 59, 0.5)', 
                      border: '1px solid #334155', 
                      borderRadius: '0.5rem', 
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <div style={{ 
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        background: transaction.transaction_type === 'buy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${transaction.transaction_type === 'buy' ? '#10b981' : '#ef4444'}`
                      }}>
                        {transaction.transaction_type === 'buy' ? (
                          <TrendingUp size={16} color="#10b981" />
                        ) : (
                          <TrendingDown size={16} color="#ef4444" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#60a5fa' }}>{transaction.symbol}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {transaction.transaction_type.toUpperCase()} {parseFloat(transaction.shares).toFixed(6)} @ ${parseFloat(transaction.price_per_share).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>${parseFloat(transaction.total_amount).toFixed(2)}</div>
                        {transaction.notes && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{transaction.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete transaction"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {portfolios.length === 0 && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Briefcase size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>No portfolios yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Create your first portfolio to start tracking your investments
          </p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

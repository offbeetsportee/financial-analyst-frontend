import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, X, TrendingUp, TrendingDown, Loader, DollarSign } from 'lucide-react';
import { stockAPI } from '../services/api';
import StockSearch from './StockSearch';
import { Bar } from 'react-chartjs-2';
import MobileTable from './MobileTable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const StockComparison = () => {

 console.log('🔍 COMPARE TAB IS RENDERING!');

  const [selectedStocks, setSelectedStocks] = useState([]);
  const [stocksData, setStocksData] = useState({});
  const [loading, setLoading] = useState({});
  const [showSearch, setShowSearch] = useState(false);

  // Load stock data when stocks are selected
  useEffect(() => {
    selectedStocks.forEach(symbol => {
      if (!stocksData[symbol] && !loading[symbol]) {
        fetchStockData(symbol);
      }
    });
  }, [selectedStocks]);

  const fetchStockData = async (symbol) => {
    setLoading(prev => ({ ...prev, [symbol]: true }));
    try {
      const [priceData, companyData] = await Promise.all([
        stockAPI.getStockData(symbol),
        stockAPI.getCompanyInfo(symbol)
      ]);

      setStocksData(prev => ({
        ...prev,
        [symbol]: {
          ...priceData,
          ...companyData
        }
      }));
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }));
    }
  };

  const handleAddStock = (symbol) => {
    if (selectedStocks.length >= 4) {
      alert('Maximum 4 stocks can be compared at once');
      return;
    }
    if (selectedStocks.includes(symbol)) {
      alert('Stock already added');
      return;
    }
    setSelectedStocks([...selectedStocks, symbol]);
    setShowSearch(false);
  };

  const handleRemoveStock = (symbol) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    const newData = { ...stocksData };
    delete newData[symbol];
    setStocksData(newData);
  };

  const metrics = [
    { key: 'currentPrice', label: 'Current Price', format: (v) => `$${v?.toFixed(2) || 'N/A'}`, type: 'price' },
    { key: 'marketCap', label: 'Market Cap', format: (v) => v ? `$${(v / 1e9).toFixed(2)}B` : 'N/A', type: 'number' },
    { key: 'peRatio', label: 'P/E Ratio', format: (v) => v?.toFixed(2) || 'N/A', type: 'number' },
    { key: 'eps', label: 'EPS', format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', type: 'number' },
    { key: 'dividendYield', label: 'Dividend Yield', format: (v) => v ? `${v.toFixed(2)}%` : 'N/A', type: 'percent' },
    { key: 'profitMargin', label: 'Profit Margin', format: (v) => v ? `${v.toFixed(2)}%` : 'N/A', type: 'percent' },
    { key: 'roe', label: 'ROE', format: (v) => v ? `${v.toFixed(2)}%` : 'N/A', type: 'percent' },
    { key: 'debtToEquity', label: 'Debt/Equity', format: (v) => v?.toFixed(2) || 'N/A', type: 'number' },
    { key: 'week52High', label: '52-Week High', format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', type: 'price' },
    { key: 'week52Low', label: '52-Week Low', format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', type: 'price' }
  ];

  const renderComparisonChart = () => {
    if (selectedStocks.length < 2) return null;

    const chartMetrics = ['peRatio', 'profitMargin', 'roe', 'dividendYield'];
    const datasets = chartMetrics.map((metricKey, idx) => {
      const metric = metrics.find(m => m.key === metricKey);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      
      return {
        label: metric.label,
        data: selectedStocks.map(symbol => {
          const value = stocksData[symbol]?.[metricKey];
          return value || 0;
        }),
        backgroundColor: colors[idx],
        borderColor: colors[idx],
        borderWidth: 2
      };
    });

    const chartData = {
      labels: selectedStocks,
      datasets: datasets
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
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#cbd5e1',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8'
          }
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8'
          }
        }
      }
    };

    return (
      <div style={{ height: '400px', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="#60a5fa" />
          Visual Comparison
        </h3>
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          height: '350px'
        }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={32} color="white" />
              Stock Comparison
            </h2>
            <p style={{ color: '#dbeafe', fontSize: '1rem', margin: 0 }}>
              Compare up to 4 stocks side-by-side
            </p>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            disabled={selectedStocks.length >= 4}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedStocks.length >= 4 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: selectedStocks.length >= 4 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            Add Stock {selectedStocks.length > 0 && `(${selectedStocks.length}/4)`}
          </button>
        </div>
      </div>

      {/* Search Box */}
      {showSearch && (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Search for a stock</h3>
          <StockSearch 
            onSelectStock={handleAddStock}
            placeholder="Search by symbol or company name..."
          />
        </div>
      )}

      {/* Selected Stocks */}
      {selectedStocks.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selectedStocks.map(symbol => (
              <div
                key={symbol}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontWeight: '600', color: '#60a5fa' }}>{symbol}</span>
                <button
                  onClick={() => handleRemoveStock(symbol)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#ef4444'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedStocks.length >= 2 ? (
        <>
          

<MobileTable>
  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                

<thead>
                  <tr style={{ background: '#1e293b' }}>
                    <th style={{ 
                      padding: '1rem', 
                      textAlign: 'left', 
                      fontSize: '0.875rem', 
                      color: '#94a3b8', 
                      fontWeight: '600',
                      position: 'sticky',
                      left: 0,
                      background: '#1e293b',
                      zIndex: 10
                    }}>
                      Metric
                    </th>
                    {selectedStocks.map(symbol => (
                      <th key={symbol} style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        fontSize: '0.875rem', 
                        color: '#60a5fa', 
                        fontWeight: '600' 
                      }}>
                        {symbol}
                        {loading[symbol] && (
                          <Loader size={12} className="spin" style={{ marginLeft: '0.5rem' }} />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, idx) => (
                    <tr key={metric.key} style={{ borderTop: '1px solid #334155' }}>
                      <td style={{ 
                        padding: '1rem', 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        color: '#cbd5e1',
                        position: 'sticky',
                        left: 0,
                        background: 'rgba(30, 41, 59, 0.95)',
                        zIndex: 5
                      }}>
                        {metric.label}
                      </td>
                      {selectedStocks.map(symbol => {
                        const value = stocksData[symbol]?.[metric.key];
                        return (
                          <td key={symbol} style={{ 
                            padding: '1rem', 
                            textAlign: 'right', 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {loading[symbol] ? (
                              <Loader size={14} className="spin" style={{ margin: '0 auto' }} />
                            ) : (
                              metric.format(value)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                            </table>
            </MobileTable>

          {/* Chart */}
          {renderComparisonChart()}
        </>
      ) : selectedStocks.length === 1 ? (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <BarChart3 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>
            Add one more stock to compare
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Select at least 2 stocks to see the comparison
          </p>
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          border: '1px solid #334155', 
          borderRadius: '0.75rem', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <BarChart3 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>
            No stocks selected
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Click "Add Stock" to start comparing stocks
          </p>
        </div>
      )}
    </div>
  );
};

export default StockComparison;

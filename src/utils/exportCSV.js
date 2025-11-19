// Utility to export data as CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format portfolio data for export
export const formatPortfolioForExport = (holdings) => {
  return holdings.map(holding => ({
    Symbol: holding.symbol,
    Shares: holding.total_shares,
    'Average Cost': holding.average_cost.toFixed(2),
    'Total Cost': holding.total_cost.toFixed(2),
    'Current Price': holding.currentPrice?.toFixed(2) || 'N/A',
    'Market Value': holding.marketValue?.toFixed(2) || 'N/A',
    'Gain/Loss': holding.gainLoss?.toFixed(2) || 'N/A',
    'Gain/Loss %': holding.gainLossPercent?.toFixed(2) || 'N/A',
    'Portfolio %': holding.portfolioPercent?.toFixed(2) || 'N/A'
  }));
};

// Format watchlist data for export
export const formatWatchlistForExport = (watchlist) => {
  return watchlist.map(item => ({
    Symbol: item.symbol,
    Name: item.name || item.symbol,
    'Current Price': item.currentPrice?.toFixed(2) || 'N/A',
    Change: item.change?.toFixed(2) || 'N/A',
    'Change %': item.changePercent?.toFixed(2) || 'N/A',
    'Added Date': new Date(item.added_at).toLocaleDateString()
  }));
};

// Format alerts data for export
export const formatAlertsForExport = (alerts) => {
  return alerts.map(alert => ({
    Symbol: alert.symbol,
    'Alert Price': alert.alert_price,
    Direction: alert.direction,
    Status: alert.is_active ? 'Active' : 'Inactive',
    Triggered: alert.triggered ? 'Yes' : 'No',
    'Created Date': new Date(alert.created_at).toLocaleDateString(),
    'Triggered Date': alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString() : 'N/A'
  }));
};

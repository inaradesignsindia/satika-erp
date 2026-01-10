import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import '../styles/Dashboard.css';

function Dashboard({ inventory, bills, returns, getFilteredData }) {
  const [timeFilter, setTimeFilter] = useState('12months');

  const filteredData = getFilteredData(timeFilter);
  
  const stats = useMemo(() => {
    const totalSales = Object.values(filteredData).reduce((sum, item) => sum + (item.sales || 0), 0);
    const totalReturns = Object.values(filteredData).reduce((sum, item) => sum + (item.returns || 0), 0);
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
    const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStockItems = inventory.filter(item => (item.quantity || 0) < 5).length;
    const outOfStockItems = inventory.filter(item => (item.quantity || 0) === 0).length;

    return {
      totalSales,
      totalReturns,
      netSales: totalSales - totalReturns,
      totalInventoryValue,
      totalItems,
      lowStockItems,
      outOfStockItems,
    };
  }, [filteredData, inventory]);

  const chartData = useMemo(() => {
    return Object.entries(filteredData).map(([period, data]) => ({
      period,
      sales: data.sales || 0,
      returns: data.returns || 0,
    }));
  }, [filteredData]);

  const topProducts = useMemo(() => {
    return inventory
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 5);
  }, [inventory]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="dashboard-subtitle">Overview of your ERP system performance</div>
      </div>

      {/* Time Filter */}
      <div className="filter-section">
        <label className="filter-label">📅 Filter by:</label>
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="1month">Last 1 Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
          <option value="quarter">Quarterly</option>
          <option value="halfyear">Half Yearly</option>
        </select>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats">
        <div className="stat-card sales">
          <div className="stat-icon">💰</div>
          <h3>Total Sales</h3>
          <p className="stat-value">₹{stats.totalSales.toFixed(0)}</p>
          <p className="stat-change">+12.5% vs last period</p>
        </div>

        <div className="stat-card returns">
          <div className="stat-icon">↩️</div>
          <h3>Total Returns</h3>
          <p className="stat-value">₹{stats.totalReturns.toFixed(0)}</p>
          <p className="stat-change">-8.2% vs last period</p>
        </div>

        <div className="stat-card net">
          <div className="stat-icon">✓</div>
          <h3>Net Sales</h3>
          <p className="stat-value">₹{stats.netSales.toFixed(0)}</p>
          <p className="stat-change">+15.3% vs last period</p>
        </div>

        <div className="stat-card inventory">
          <div className="stat-icon">📦</div>
          <h3>Inventory Value</h3>
          <p className="stat-value">₹{stats.totalInventoryValue.toFixed(0)}</p>
          <p className="stat-change">{stats.totalItems} items in stock</p>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="alert-section">
        <div className="alert-card warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h4>Low Stock Alert</h4>
            <p>{stats.lowStockItems} products have low stock (&lt; 5 items)</p>
          </div>
        </div>

        <div className="alert-card danger">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <h4>Out of Stock</h4>
            <p>{stats.outOfStockItems} products are out of stock</p>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="dashboard-content">
        <div className="chart-container">
          <h3>📈 Sales & Returns Trend</h3>
          <div className="table-wrapper">
            <table className="trend-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Sales</th>
                  <th>Returns</th>
                  <th>Net</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => {
                  const net = item.sales - item.returns;
                  const margin = item.sales > 0 ? ((net / item.sales) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.period} className="trend-row">
                      <td className="period-cell">{item.period}</td>
                      <td className="sales-cell">₹{item.sales.toFixed(0)}</td>
                      <td className="returns-cell">₹{item.returns.toFixed(0)}</td>
                      <td className="net-cell">₹{net.toFixed(0)}</td>
                      <td className="margin-cell">
                        <span className={`margin-badge ${parseFloat(margin) >= 50 ? 'high' : parseFloat(margin) >= 30 ? 'medium' : 'low'}`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-container">
          <h3>🏆 Top Products by Stock</h3>
          <div className="products-list">
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="product-row">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-sku">SKU: {product.sku}</p>
                  </div>
                  <div className="product-stats">
                    <div className="stat-item">
                      <span className="label">Stock</span>
                      <span className="value">{product.quantity || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Value</span>
                      <span className="value">₹{((product.quantity || 0) * (product.price || 0)).toFixed(0)}</span>
                    </div>
                    <div className="status-indicator">
                      <span className={`status-badge ${(product.quantity || 0) > 10 ? 'good' : (product.quantity || 0) > 5 ? 'medium' : 'low'}`}>
                        {(product.quantity || 0) > 10 ? '✓ Healthy' : (product.quantity || 0) > 5 ? '⚠ Low' : '❌ Critical'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No inventory data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-section">
        <h3>📊 Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Avg. Sales per Period</span>
            <span className="metric-value">₹{(stats.totalSales / Math.max(chartData.length, 1)).toFixed(0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Return Rate</span>
            <span className="metric-value">{stats.totalSales > 0 ? ((stats.totalReturns / stats.totalSales) * 100).toFixed(1) : '0'}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Products</span>
            <span className="metric-value">{inventory.length}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Bills</span>
            <span className="metric-value">{bills.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

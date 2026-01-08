import React, { useState } from 'react';
import '../styles/Dashboard.css';

function Dashboard({ inventory, bills, returns, getFilteredData }) {
  const [timeFilter, setTimeFilter] = useState('12months');

  const filteredData = getFilteredData(timeFilter);
  const totalSales = Object.values(filteredData).reduce((sum, item) => sum + (item.sales || 0), 0);
  const totalReturns = Object.values(filteredData).reduce((sum, item) => sum + (item.returns || 0), 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="time-filter">
        <label>Filter by: </label>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="1month">Last 1 Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
          <option value="quarter">Quarterly</option>
          <option value="halfyear">Half Yearly</option>
        </select>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">₹{totalSales.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Returns</h3>
          <p className="stat-value">₹{totalReturns.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Net Sales</h3>
          <p className="stat-value">₹{(totalSales - totalReturns).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Inventory Value</h3>
          <p className="stat-value">₹{totalInventoryValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Sales & Returns Trend</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Sales</th>
                <th>Returns</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(filteredData).map(([period, data]) => (
                <tr key={period}>
                  <td>{period}</td>
                  <td>₹{data.sales.toFixed(2)}</td>
                  <td>₹{data.returns.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
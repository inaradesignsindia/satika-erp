import React, { useState } from 'react';

function Reports({ inventory, bills, returns }) {
  const [reportType, setReportType] = useState('sales');
  const [dateFilter, setDateFilter] = useState('all');

  const filterByDate = (items) => {
    if (dateFilter === 'all') return items;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return items;
    }
    
    return items.filter(item => new Date(item.date) >= startDate);
  };

  const getSalesReport = () => {
    const filteredBills = filterByDate(bills);
    const totalSales = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalBills = filteredBills.length;
    const averageBill = totalBills > 0 ? (totalSales / totalBills).toFixed(2) : 0;

    return {
      data: filteredBills,
      totalSales: totalSales.toFixed(2),
      totalBills,
      averageBill
    };
  };

  const getReturnsReport = () => {
    const filteredReturns = filterByDate(returns);
    const totalReturns = filteredReturns.reduce((sum, ret) => sum + (ret.totalAmount || 0), 0);
    const totalReturnCount = filteredReturns.length;
    const averageReturn = totalReturnCount > 0 ? (totalReturns / totalReturnCount).toFixed(2) : 0;

    return {
      data: filteredReturns,
      totalReturns: totalReturns.toFixed(2),
      totalReturnCount,
      averageReturn
    };
  };

  const getInventoryReport = () => {
    const totalProducts = inventory.length;
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    ).toFixed(2);
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity < 10 && item.quantity > 0);
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    return {
      data: inventory,
      totalProducts,
      totalValue,
      totalItems,
      lowStockItems,
      outOfStockItems
    };
  };

  const renderSalesReport = () => {
    const report = getSalesReport();
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p className="summary-value">₹{report.totalSales}</p>
          </div>
          <div className="summary-card">
            <h3>Total Bills</h3>
            <p className="summary-value">{report.totalBills}</p>
          </div>
          <div className="summary-card">
            <h3>Average Bill</h3>
            <p className="summary-value">₹{report.averageBill}</p>
          </div>
        </div>

        <div className="report-table">
          <h3>Sales Details</h3>
          {report.data.length === 0 ? (
            <p className="empty-message">No sales data available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.date}</td>
                    <td>{bill.customerName}</td>
                    <td>{bill.items?.length || 0}</td>
                    <td>₹{bill.totalAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const renderReturnsReport = () => {
    const report = getReturnsReport();
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Returns</h3>
            <p className="summary-value">₹{report.totalReturns}</p>
          </div>
          <div className="summary-card">
            <h3>Return Count</h3>
            <p className="summary-value">{report.totalReturnCount}</p>
          </div>
          <div className="summary-card">
            <h3>Average Return</h3>
            <p className="summary-value">₹{report.averageReturn}</p>
          </div>
        </div>

        <div className="report-table">
          <h3>Returns Details</h3>
          {report.data.length === 0 ? (
            <p className="empty-message">No returns data available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill Number</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map(ret => (
                  <tr key={ret.id}>
                    <td>{ret.date}</td>
                    <td>{ret.billNumber}</td>
                    <td>{ret.customerName}</td>
                    <td>{ret.items?.length || 0}</td>
                    <td>₹{ret.totalAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    const report = getInventoryReport();
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Products</h3>
            <p className="summary-value">{report.totalProducts}</p>
          </div>
          <div className="summary-card">
            <h3>Total Items</h3>
            <p className="summary-value">{report.totalItems}</p>
          </div>
          <div className="summary-card">
            <h3>Total Value</h3>
            <p className="summary-value">₹{report.totalValue}</p>
          </div>
          <div className="summary-card warning">
            <h3>Low Stock</h3>
            <p className="summary-value">{report.lowStockItems.length}</p>
          </div>
          <div className="summary-card danger">
            <h3>Out of Stock</h3>
            <p className="summary-value">{report.outOfStockItems.length}</p>
          </div>
        </div>

        <div className="report-table">
          <h3>Inventory Details</h3>
          {report.data.length === 0 ? (
            <p className="empty-message">No inventory data available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map(item => (
                  <tr key={item.id} className={item.quantity === 0 ? 'out-of-stock' : item.quantity < 10 ? 'low-stock' : ''}>
                    <td>{item.name}</td>
                    <td>{item.category || 'General'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <span className={`status ${item.quantity === 0 ? 'out' : item.quantity < 10 ? 'low' : 'in'}`}>
                        {item.quantity === 0 ? 'Out of Stock' : item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="reports">
      <h2>Reports</h2>
      
      <div className="report-filters">
        <div className="filter-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="sales">Sales Report</option>
            <option value="returns">Returns Report</option>
            <option value="inventory">Inventory Report</option>
          </select>
        </div>
        
        {reportType !== 'inventory' && (
          <div className="filter-group">
            <label>Date Filter:</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        )}
      </div>

      {reportType === 'sales' && renderSalesReport()}
      {reportType === 'returns' && renderReturnsReport()}
      {reportType === 'inventory' && renderInventoryReport()}
    </div>
  );
}

export default Reports;

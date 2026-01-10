import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import '../styles/BillingSales.css';

function BillingSales({ inventory, bills, onAddBill, onDeleteBill }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.productId === product.id);
    
    if (existing) {
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === product.id
          ? { ...p, quantity: Math.min(p.quantity + 1, product.quantity) }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const numQuantity = parseInt(newQuantity) || 0;
    if (numQuantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    } else {
      const product = inventory.find(p => p.id === productId);
      const maxQuantity = product ? product.quantity : numQuantity;
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === productId
          ? { ...p, quantity: Math.min(numQuantity, maxQuantity) }
          : p
      ));
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    onAddBill({
      customerName,
      customerPhone,
      items: selectedProducts,
      totalAmount: calculateTotal()
    });

    // Reset form
    setSelectedProducts([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="billing-sales">
      <div className="billing-header">
        <h1>💳 Billing & Sales</h1>
        <p className="header-subtitle">Manage customer bills and sales transactions</p>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Bill
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Bill History ({bills.length})
        </button>
      </div>
      
      {activeTab === 'create' ? (
        <div className="sales-container">
          {/* Product Selection */}
          <div className="product-selection">
            <h3>📦 Available Products</h3>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <div className="product-list">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(product => (
                  <div key={product.id} className={`product-item ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                    <div className="product-info">
                      <strong>{product.name}</strong>
                      <p className="product-sku">SKU: {product.sku}</p>
                      <p className="product-stock">Stock: <span className={product.quantity > 10 ? 'good' : product.quantity > 0 ? 'warning' : 'danger'}>{product.quantity}</span></p>
                      <p className="product-price">Price: <span className="price">₹{product.price}</span></p>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      disabled={product.quantity === 0}
                      className="add-btn"
                    >
                      {product.quantity === 0 ? '❌ Out of Stock' : '➕ Add'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No products found matching your search</p>
              )}
            </div>
          </div>

          {/* Bill Form */}
          <div className="bill-form">
            <h3>💰 Create New Bill</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Customer Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="selected-products">
                <h4>✓ Selected Products ({selectedProducts.length})</h4>
                {selectedProducts.length === 0 ? (
                  <p className="empty-message">No products selected. Add products from the list on the left.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map(item => (
                          <tr key={item.productId}>
                            <td className="product-name">{item.name}</td>
                            <td className="price">₹{item.price}</td>
                            <td className="quantity-cell">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                className="quantity-input"
                              />
                            </td>
                            <td className="total">₹{(item.price * item.quantity).toFixed(2)}</td>
                            <td className="action">
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(item.productId)}
                                className="remove-btn"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bill-summary">
                <div className="summary-item">
                  <span>Items:</span>
                  <span className="value">{selectedProducts.length}</span>
                </div>
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span className="value">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span className="value">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={selectedProducts.length === 0}
              >
                Generate Bill
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bills-history">
          <h3>📋 Bill History</h3>
          {bills.length === 0 ? (
            <p className="empty-message">No bills created yet. Start by creating a new bill.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.id}>
                      <td className="bill-number">{bill.billNumber}</td>
                      <td>{bill.date}</td>
                      <td className="customer-name">{bill.customerName}</td>
                      <td className="items-count">{bill.items.length}</td>
                      <td className="amount">₹{(bill.totalAmount || 0).toFixed(2)}</td>
                      <td className="action">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this bill?')) {
                              onDeleteBill(bill.id);
                            }
                          }}
                          className="delete-btn"
                          title="Delete bill"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BillingSales;

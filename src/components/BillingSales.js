import React, { useState } from 'react';
import '../styles/BillingSales.css';

function BillingSales({ inventory, onAddBill }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.productId === product.id);
    
    if (existing) {
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === product.id
          ? { ...p, quantity: p.quantity + 1 }
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
    if (newQuantity <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === productId
          ? { ...p, quantity: parseInt(newQuantity) }
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
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="billing-sales">
      <h2>Billing Sales</h2>
      
      <div className="sales-container">
        {/* Product Selection */}
        <div className="product-selection">
          <h3>Available Products</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="product-list">
            {filteredInventory.map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <p>Stock: {product.quantity}</p>
                  <p>Price: ₹{product.price}</p>
                </div>
                <button
                  onClick={() => handleAddProduct(product)}
                  disabled={product.quantity === 0}
                  className="add-btn"
                >
                  {product.quantity === 0 ? 'Out of Stock' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Form */}
        <div className="bill-form">
          <h3>Create Bill</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Customer Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="selected-products">
              <h4>Selected Products</h4>
              {selectedProducts.length === 0 ? (
                <p className="empty-message">No products selected</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map(item => (
                      <tr key={item.productId}>
                        <td>{item.name}</td>
                        <td>₹{item.price}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            className="quantity-input"
                          />
                        </td>
                        <td>₹{item.price * item.quantity}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="total-section">
              <h3>Total Amount: ₹{calculateTotal()}</h3>
            </div>

            <button type="submit" className="submit-btn">
              Generate Bill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BillingSales;
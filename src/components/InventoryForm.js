import React, { useState } from 'react';

function InventoryForm({ inventory, onAddInventory }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter product name');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      alert('Please enter valid quantity');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter valid price');
      return;
    }

    onAddInventory({
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      category: formData.category || 'General',
      description: formData.description
    });

    // Reset form
    setFormData({
      name: '',
      quantity: '',
      price: '',
      category: '',
      description: ''
    });

    alert('Product added to inventory successfully!');
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTotalValue = () => {
    return inventory.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    ).toFixed(2);
  };

  const getTotalItems = () => {
    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="inventory-form">
      <h2>Inventory Management</h2>
      
      <div className="inventory-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{inventory.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">{getTotalItems()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <p className="stat-value">₹{getTotalValue()}</p>
        </div>
      </div>

      <div className="inventory-container">
        {/* Add Product Form */}
        <div className="add-product-section">
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category (optional)"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description (optional)"
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn">
              Add to Inventory
            </button>
          </form>
        </div>

        {/* Current Inventory */}
        <div className="current-inventory">
          <h3>Current Inventory</h3>
          
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {filteredInventory.length === 0 ? (
            <p className="empty-message">
              {searchTerm ? 'No products found' : 'No products in inventory. Add your first product!'}
            </p>
          ) : (
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(item => (
                    <tr key={item.id} className={item.quantity === 0 ? 'out-of-stock' : ''}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryForm;

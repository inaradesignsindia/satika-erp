import React, { useState } from 'react';

function BillingForm({ inventory, onAddBill }) {
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    onAddBill({
      customerName,
      customerPhone,
      items: items.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      totalAmount
    });

    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
  };

  return (
    <div className="billing-form">
      <h2>Billing Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name:</label>
          <input 
            type="text" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Customer Phone:</label>
          <input 
            type="text" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="items-section">
          <h3>Items</h3>
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <select 
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
              >
                <option value="">Select Product</option>
                {inventory.map(prod => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} - ₹{prod.price}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                placeholder="Quantity"
              />
              <input 
                type="number" 
                step="0.01"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                placeholder="Price"
              />
              <button 
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            type="button"
            onClick={handleAddItem}
            className="add-item-btn"
          >
            Add Item
          </button>
        </div>

        <button type="submit" className="submit-btn">Create Bill</button>
      </form>
    </div>
  );
}

export default BillingForm;
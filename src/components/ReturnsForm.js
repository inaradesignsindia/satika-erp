import React, { useState } from 'react';

function ReturnsForm({ inventory, bills, onAddReturn }) {
  const [billNumber, setBillNumber] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [errors, setErrors] = useState({});

  const handleBillNumberChange = (e) => {
    const value = e.target.value;
    setBillNumber(value);
    
    // Find matching bill
    const bill = bills.find(b => b.billNumber === value);
    if (bill) {
      setSelectedBill(bill);
      setReturnItems([]);
      setErrors({});
    } else {
      setSelectedBill(null);
      setReturnItems([]);
    }
  };

  const handleAddReturnItem = () => {
    setReturnItems([...returnItems, { productId: '', quantity: 0 }]);
  };

  const handleRemoveReturnItem = (index) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const handleReturnItemChange = (index, field, value) => {
    const updatedItems = [...returnItems];
    updatedItems[index][field] = value;
    setReturnItems(updatedItems);
  };

  const validateReturn = () => {
    const newErrors = {};

    if (!billNumber.trim()) {
      newErrors.billNumber = 'Bill number is required';
      return newErrors;
    }

    if (!selectedBill) {
      newErrors.billNumber = 'Bill number does not exist';
      return newErrors;
    }

    if (returnItems.length === 0) {
      newErrors.items = 'At least one return item is required';
      return newErrors;
    }

    returnItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_productId`] = 'Product must be selected';
      } else {
        // Check if product exists in the bill
        const billItem = selectedBill.items.find(bi => bi.productId === item.productId);
        if (!billItem) {
          newErrors[`item_${index}_productId`] = 'Product does not exist in this bill';
        } else if (item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        } else if (item.quantity > billItem.quantity) {
          newErrors[`item_${index}_quantity`] = `Cannot return more than ${billItem.quantity} units (original bill quantity)`;
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateReturn();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const totalReturnAmount = returnItems.reduce((sum, item) => {
      const billItem = selectedBill.items.find(bi => bi.productId === item.productId);
      return sum + (billItem ? billItem.price * item.quantity : 0);
    }, 0);

    onAddReturn({
      billNumber,
      items: returnItems.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity)
      })),
      totalAmount: totalReturnAmount
    });

    setBillNumber('');
    setReturnItems([]);
    setSelectedBill(null);
    setErrors({});
  };

  const getReturnableProducts = () => {
    if (!selectedBill) return [];
    return selectedBill.items.map(item => {
      const product = inventory.find(p => p.id === item.productId);
      return {
        ...item,
        productName: product ? product.name : 'Unknown Product'
      };
    });
  };

  return (
    <div className="returns-form">
      <h2>Process Returns</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bill Number:</label>
          <input
            type="text"
            value={billNumber}
            onChange={handleBillNumberChange}
            placeholder="Enter bill number"
            disabled={bills.length === 0}
          />
          {errors.billNumber && <span className="error">{errors.billNumber}</span>}
          {selectedBill && <span className="success">✓ Bill found</span>}
        </div>

        {selectedBill && (
          <div className="bill-details">
            <h3>Bill Details</h3>
            <p><strong>Customer:</strong> {selectedBill.customerName}</p>
            <p><strong>Date:</strong> {selectedBill.date}</p>
            <div className="bill-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, idx) => {
                    const product = inventory.find(p => p.id === item.productId);
                    return (
                      <tr key={idx}>
                        <td>{product ? product.name : 'Unknown'}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedBill && (
          <div className="return-items-section">
            <h3>Return Items</h3>
            {errors.items && <span className="error">{errors.items}</span>}
            {returnItems.map((item, index) => {
              const billItem = selectedBill.items.find(bi => bi.productId === item.productId);
              return (
                <div key={index} className="return-item-row">
                  <select
                    value={item.productId}
                    onChange={(e) => handleReturnItemChange(index, 'productId', e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {getReturnableProducts().map((prod) => (
                      <option key={prod.productId} value={prod.productId}>
                        {prod.productName} (Max: {prod.quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={billItem ? billItem.quantity : 0}
                    value={item.quantity}
                    onChange={(e) => handleReturnItemChange(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                  />
                  {billItem && <span className="price-info">@ ₹{billItem.price}</span>}
                  <button
                    type="button"
                    onClick={() => handleRemoveReturnItem(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                  {errors[`item_${index}_productId`] && (
                    <span className="error">{errors[`item_${index}_productId`]}</span>
                  )}
                  {errors[`item_${index}_quantity`] && (
                    <span className="error">{errors[`item_${index}_quantity`]}</span>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddReturnItem}
              className="add-item-btn"
              disabled={!selectedBill}
            >
              Add Return Item
            </button>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={!selectedBill}>
          Process Return
        </button>
      </form>
    </div>
  );
}

export default ReturnsForm;
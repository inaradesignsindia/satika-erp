import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import BillingForm from './components/BillingForm';
import BillingSales from './components/BillingSales';
import ReturnsForm from './components/ReturnsForm';
import InventoryForm from './components/InventoryForm';
import Reports from './components/Reports';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Confirm Action</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="loading" style={{ marginRight: '8px' }}></div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Show confirmation dialog
  const showConfirmDialog = useCallback((message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedInventory = localStorage.getItem('inventory');
      const savedBills = localStorage.getItem('bills');
      const savedReturns = localStorage.getItem('returns');

      if (savedInventory) setInventory(JSON.parse(savedInventory));
      if (savedBills) setBills(JSON.parse(savedBills));
      if (savedReturns) setReturns(JSON.parse(savedReturns));

      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading saved data', 'error');
      setIsLoading(false);
    }
  }, [showToast]);

  // Save inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
      showToast('Error saving inventory data', 'error');
    }
  }, [inventory, showToast]);

  // Save bills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bills', JSON.stringify(bills));
    } catch (error) {
      console.error('Error saving bills:', error);
      showToast('Error saving bills data', 'error');
    }
  }, [bills, showToast]);

  // Save returns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('returns', JSON.stringify(returns));
    } catch (error) {
      console.error('Error saving returns:', error);
      showToast('Error saving returns data', 'error');
    }
  }, [returns, showToast]);

  const handleAddInventory = useCallback((product) => {
    try {
      const existingProduct = inventory.find(p => p.id === product.id);

      if (existingProduct) {
        setInventory(inventory.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        ));
        showToast(`Updated ${product.name} quantity`, 'success');
      } else {
        setInventory([...inventory, { ...product, id: Date.now().toString() }]);
        showToast(`Added ${product.name} to inventory`, 'success');
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
      showToast('Error adding product to inventory', 'error');
    }
  }, [inventory, showToast]);

  const handleAddBill = useCallback((billData) => {
    try {
      const newBill = {
        ...billData,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        billNumber: `BILL-${Date.now()}`,
      };

      // Validate that all items have stock
      const insufficientStock = billData.items.some(item => {
        const inventoryItem = inventory.find(inv => inv.id === item.productId);
        return !inventoryItem || inventoryItem.quantity < item.quantity;
      });

      if (insufficientStock) {
        showToast('Insufficient stock for one or more items', 'error');
        return;
      }

      // Validate bill has items
      if (!billData.items || billData.items.length === 0) {
        showToast('Please add at least one item to the bill', 'error');
        return;
      }

      // Update inventory
      const updatedInventory = inventory.map(invItem => {
        const billItem = billData.items.find(item => item.productId === invItem.id);
        if (billItem) {
          return { ...invItem, quantity: Math.max(0, invItem.quantity - billItem.quantity) };
        }
        return invItem;
      });

      setInventory(updatedInventory);
      setBills([...bills, newBill]);
      showToast(`Bill ${newBill.billNumber} created successfully!`, 'success');
    } catch (error) {
      console.error('Error creating bill:', error);
      showToast('Error creating bill. Please try again.', 'error');
    }
  }, [inventory, bills, showToast]);

  const handleAddReturn = useCallback((returnData) => {
    try {
      // Validate bill number is provided
      if (!returnData.billNumber || returnData.billNumber.trim() === '') {
        showToast('Bill number is required for returns', 'error');
        return;
      }

      // Validate bill number exists
      const matchingBill = bills.find(bill => bill.billNumber === returnData.billNumber);
      if (!matchingBill) {
        showToast('Bill number does not exist. Please enter a valid bill number.', 'error');
        return;
      }

      // Validate return has items
      if (!returnData.items || returnData.items.length === 0) {
        showToast('Please add at least one item to return', 'error');
        return;
      }

      // Validate that returned items exist in the selected bill
      const invalidItems = returnData.items.some(item => {
        return !matchingBill.items.some(billItem => billItem.productId === item.productId);
      });

      if (invalidItems) {
        showToast('One or more items do not exist in the selected bill', 'error');
        return;
      }

      // Validate returned quantities don't exceed original bill quantities
      const excessiveQuantities = returnData.items.some(item => {
        const billItem = matchingBill.items.find(billItem => billItem.productId === item.productId);
        return billItem && item.quantity > billItem.quantity;
      });

      if (excessiveQuantities) {
        showToast('Return quantity exceeds the quantity in the original bill', 'error');
        return;
      }

      const newReturn = {
        ...returnData,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
      };

      // Update inventory by adding back returned quantities
      const updatedInventory = inventory.map(invItem => {
        const returnItem = returnData.items.find(item => item.productId === invItem.id);
        if (returnItem) {
          return { ...invItem, quantity: invItem.quantity + returnItem.quantity };
        }
        return invItem;
      });

      setInventory(updatedInventory);
      setReturns([...returns, newReturn]);
      showToast('Return processed successfully!', 'success');
    } catch (error) {
      console.error('Error processing return:', error);
      showToast('Error processing return. Please try again.', 'error');
    }
  }, [inventory, bills, returns, showToast]);

  const getDashboardData = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    const getMonthsData = (monthsBack) => {
      const data = {};
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        data[monthYear] = { sales: 0, returns: 0 };
      }
      return data;
    };

    const getQuarterData = () => {
      const data = {};
      for (let i = 3; i > 0; i--) {
        const quarter = currentQuarter - (3 - i);
        const year = currentYear + Math.floor(quarter / 4);
        const q = (quarter % 4) + 1;
        data[`Q${q} ${year}`] = { sales: 0, returns: 0 };
      }
      return data;
    };

    const getHalfYearData = () => {
      const data = {};
      for (let i = 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - (i * 6), 1);
        const half = Math.floor(date.getMonth() / 6) + 1;
        const year = date.getFullYear();
        data[`H${half} ${year}`] = { sales: 0, returns: 0 };
      }
      return data;
    };

    return {
      monthly: getMonthsData(12),
      quarterly: getQuarterData(),
      halfYearly: getHalfYearData(),
    };
  }, []);

  const getFilteredData = useCallback((timeFilter) => {
    const dashboardData = getDashboardData();
    let filteredData = {};

    if (timeFilter === '1month') {
      filteredData = dashboardData.monthly;
      const lastMonth = Object.keys(filteredData)[Object.keys(filteredData).length - 1];
      filteredData = { [lastMonth]: filteredData[lastMonth] };
    } else if (timeFilter === '3months') {
      const monthlyData = dashboardData.monthly;
      filteredData = Object.fromEntries(
        Object.entries(monthlyData).slice(-3)
      );
    } else if (timeFilter === 'quarter') {
      filteredData = dashboardData.quarterly;
    } else if (timeFilter === 'halfyear') {
      filteredData = dashboardData.halfYearly;
    } else if (timeFilter === '6months') {
      const monthlyData = dashboardData.monthly;
      filteredData = Object.fromEntries(
        Object.entries(monthlyData).slice(-6)
      );
    } else {
      filteredData = dashboardData.monthly;
    }

    // Populate data from bills and returns
    bills.forEach(bill => {
      const billDate = new Date(bill.date);
      const monthYear = billDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const quarter = Math.floor(billDate.getMonth() / 3) + 1;
      const quarterLabel = `Q${quarter} ${billDate.getFullYear()}`;
      const half = Math.floor(billDate.getMonth() / 6) + 1;
      const halfLabel = `H${half} ${billDate.getFullYear()}`;

      if (filteredData[monthYear]) filteredData[monthYear].sales += bill.totalAmount || 0;
      if (filteredData[quarterLabel]) filteredData[quarterLabel].sales += bill.totalAmount || 0;
      if (filteredData[halfLabel]) filteredData[halfLabel].sales += bill.totalAmount || 0;
    });

    returns.forEach(returnItem => {
      const returnDate = new Date(returnItem.date);
      const monthYear = returnDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const quarter = Math.floor(returnDate.getMonth() / 3) + 1;
      const quarterLabel = `Q${quarter} ${returnDate.getFullYear()}`;
      const half = Math.floor(returnDate.getMonth() / 6) + 1;
      const halfLabel = `H${half} ${returnDate.getFullYear()}`;

      if (filteredData[monthYear]) filteredData[monthYear].returns += returnItem.totalAmount || 0;
      if (filteredData[quarterLabel]) filteredData[quarterLabel].returns += returnItem.totalAmount || 0;
      if (filteredData[halfLabel]) filteredData[halfLabel].returns += returnItem.totalAmount || 0;
    });

    return filteredData;
  }, [bills, returns, getDashboardData]);

  const handleDeleteBill = useCallback((billId) => {
    showConfirmDialog('Are you sure you want to delete this bill?', () => {
      try {
        const billToDelete = bills.find(b => b.id === billId);
        if (billToDelete) {
          // Restore inventory
          const updatedInventory = inventory.map(invItem => {
            const billItem = billToDelete.items.find(item => item.productId === invItem.id);
            if (billItem) {
              return { ...invItem, quantity: invItem.quantity + billItem.quantity };
            }
            return invItem;
          });
          setInventory(updatedInventory);
          setBills(bills.filter(b => b.id !== billId));
          showToast('Bill deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
        showToast('Error deleting bill', 'error');
      }
    });
  }, [bills, inventory, showToast, showConfirmDialog]);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">Satika ERP</h1>
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentPage === 'billing' ? 'active' : ''}`}
                onClick={() => setCurrentPage('billing')}
              >
                Billing Form
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentPage === 'sales' ? 'active' : ''}`}
                onClick={() => setCurrentPage('sales')}
              >
                Billing Sales
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentPage === 'returns' ? 'active' : ''}`}
                onClick={() => setCurrentPage('returns')}
              >
                Returns
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
                onClick={() => setCurrentPage('inventory')}
              >
                Inventory
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentPage === 'reports' ? 'active' : ''}`}
                onClick={() => setCurrentPage('reports')}
              >
                Reports
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {isLoading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <LoadingSpinner />
            <span style={{ marginLeft: '8px', color: '#667eea' }}>Loading data...</span>
          </div>
        ) : (
          <>
            {currentPage === 'dashboard' && (
              <Dashboard
                inventory={inventory}
                bills={bills}
                returns={returns}
                getFilteredData={getFilteredData}
              />
            )}
            {currentPage === 'billing' && (
              <BillingForm inventory={inventory} onAddBill={handleAddBill} />
            )}
            {currentPage === 'sales' && (
              <BillingSales
                inventory={inventory}
                bills={bills}
                onAddBill={handleAddBill}
                onDeleteBill={handleDeleteBill}
              />
            )}
            {currentPage === 'returns' && (
              <ReturnsForm
                inventory={inventory}
                bills={bills}
                onAddReturn={handleAddReturn}
              />
            )}
            {currentPage === 'inventory' && (
              <InventoryForm
                inventory={inventory}
                onAddInventory={handleAddInventory}
              />
            )}
            {currentPage === 'reports' && (
              <Reports inventory={inventory} bills={bills} returns={returns} />
            )}
          </>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        isOpen={confirmDialog.isOpen}
      />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import BillingForm from './components/BillingForm';
import BillingSales from './components/BillingSales';
import ReturnsForm from './components/ReturnsForm';
import InventoryForm from './components/InventoryForm';
import Reports from './components/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);
  const [returns, setReturns] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    const savedBills = localStorage.getItem('bills');
    const savedReturns = localStorage.getItem('returns');

    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedBills) setBills(JSON.parse(savedBills));
    if (savedReturns) setReturns(JSON.parse(savedReturns));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('returns', JSON.stringify(returns));
  }, [returns]);

  const handleAddInventory = (product) => {
    const existingProduct = inventory.find(p => p.id === product.id);
    
    if (existingProduct) {
      setInventory(inventory.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + product.quantity }
          : p
      ));
    } else {
      setInventory([...inventory, { ...product, id: Date.now().toString() }]);
    }
  };

  const handleAddBill = (billData) => {
    const newBill = {
      ...billData,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      billNumber: `BILL-${Date.now()}`
    };

    // Validate that all items have stock
    const insufficientStock = billData.items.some(item => {
      const inventoryItem = inventory.find(inv => inv.id === item.productId);
      return !inventoryItem || inventoryItem.quantity < item.quantity;
    });

    if (insufficientStock) {
      alert('Error: One or more items have insufficient stock. Please reduce quantities.');
      return;
    }

    // Update inventory
    const updatedInventory = inventory.map(invItem => {
      const billItem = billData.items.find(item => item.productId === invItem.id);
      if (billItem) {
        return { ...invItem, quantity: invItem.quantity - billItem.quantity };
      }
      return invItem;
    });

    setInventory(updatedInventory);
    setBills([...bills, newBill]);
    alert('Bill created successfully!');
  };

  const handleAddReturn = (returnData) => {
    // Validate bill number is provided
    if (!returnData.billNumber || returnData.billNumber.trim() === '') {
      alert('Error: Bill number is mandatory for returns.');
      return;
    }

    // Validate bill number exists
    const matchingBill = bills.find(bill => bill.billNumber === returnData.billNumber);
    if (!matchingBill) {
      alert('Error: Bill number does not exist. Please enter a valid bill number.');
      return;
    }

    // Validate that returned items exist in the selected bill
    const invalidItems = returnData.items.some(item => {
      return !matchingBill.items.some(billItem => billItem.productId === item.productId);
    });

    if (invalidItems) {
      alert('Error: One or more items do not exist in the selected bill. Only items from the selected bill can be returned.');
      return;
    }

    // Validate returned quantities don't exceed original bill quantities
    const excessiveQuantities = returnData.items.some(item => {
      const billItem = matchingBill.items.find(billItem => billItem.productId === item.productId);
      return billItem && item.quantity > billItem.quantity;
    });

    if (excessiveQuantities) {
      alert('Error: Return quantity exceeds the quantity in the original bill.');
      return;
    }

    const newReturn = {
      ...returnData,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString()
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
    alert('Return processed successfully!');
  };

  const getDashboardData = () => {
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
      halfYearly: getHalfYearData()
    };
  };

  const getFilteredData = (timeFilter) => {
    const dashboardData = getDashboardData();
    let filteredData = {};

    if (timeFilter === '1month') {
      filteredData = getDashboardData().monthly;
      const lastMonth = Object.keys(filteredData)[Object.keys(filteredData).length - 1];
      filteredData = { [lastMonth]: filteredData[lastMonth] };
    } else if (timeFilter === '3months') {
      const monthlyData = getDashboardData().monthly;
      filteredData = Object.fromEntries(
        Object.entries(monthlyData).slice(-3)
      );
    } else if (timeFilter === 'quarter') {
      filteredData = getDashboardData().quarterly;
    } else if (timeFilter === 'halfyear') {
      filteredData = getDashboardData().halfYearly;
    } else if (timeFilter === '6months') {
      const monthlyData = getDashboardData().monthly;
      filteredData = Object.fromEntries(
        Object.entries(monthlyData).slice(-6)
      );
    } else if (timeFilter === '12months') {
      filteredData = getDashboardData().monthly;
    } else {
      filteredData = getDashboardData().monthly;
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
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">Satika ERP</h1>
          <ul className="nav-menu">
            <li><button 
              className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button></li>
            <li><button 
              className={`nav-button ${currentPage === 'billing' ? 'active' : ''}`}
              onClick={() => setCurrentPage('billing')}
            >
              Billing Form
            </button></li>
            <li><button 
              className={`nav-button ${currentPage === 'sales' ? 'active' : ''}`}
              onClick={() => setCurrentPage('sales')}
            >
              Billing Sales
            </button></li>
            <li><button 
              className={`nav-button ${currentPage === 'returns' ? 'active' : ''}`}
              onClick={() => setCurrentPage('returns')}
            >
              Returns
            </button></li>
            <li><button 
              className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
              onClick={() => setCurrentPage('inventory')}
            >
              Inventory
            </button></li>
            <li><button 
              className={`nav-button ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reports')}
            >
              Reports
            </button></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard 
            inventory={inventory} 
            bills={bills} 
            returns={returns}
            getFilteredData={getFilteredData}
          />
        )}
        {currentPage === 'billing' && (
          <BillingForm 
            inventory={inventory}
            onAddBill={handleAddBill}
          />
        )}
        {currentPage === 'sales' && (
          <BillingSales 
            inventory={inventory}
            onAddBill={handleAddBill}
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
          <Reports 
            inventory={inventory}
            bills={bills}
            returns={returns}
          />
        )}
      </main>
    </div>
  );
}

export default App;

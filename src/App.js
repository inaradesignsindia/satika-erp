import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Package, Settings, Plus, Search, Menu, X, TrendingUp,
  AlertCircle, FileText, Upload, Instagram, Facebook, Store, DollarSign,
  CheckCircle, RotateCcw, Wallet, PieChart, Download, Globe, Users, Lock,
  ArrowRightLeft, Coins, ShoppingCart, Trash2, Link, Truck, MapPin, RefreshCw, Mail, Calendar, Building
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, collection, addDoc, query, onSnapshot, deleteDoc, doc,
  serverTimestamp, writeBatch, orderBy, setDoc
} from "firebase/firestore";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCTrenpSXNMR78_5r3zXAmD5aXO7jFxxD4",
  authDomain: "satika-cc4c3.firebaseapp.com",
  projectId: "satika-cc4c3",
  storageBucket: "satika-cc4c3.firebasestorage.app",
  messagingSenderId: "370343505568",
  appId: "1:370343505568:web:551fa56872706a0a8463c5"
};

const APP_ID = 'satika-erp-v1'; 
const COMPANY_ID = 'satika_main_store_01'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- BRANDING (Adapted from paste-2.txt) ---
const BRAND = {
  primary: "bg-purple-600", 
  primaryHover: "hover:bg-purple-700",
  primaryText: "text-purple-700",
  light: "bg-purple-50",
  accent: "text-purple-600",
  gradient: "bg-gradient-to-r from-purple-600 to-purple-800",
  bg: "bg-gray-50",
  card: "bg-white rounded-2xl shadow-xl border-0"
};

// --- UTILITY COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`${BRAND.card} p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    primary: "bg-purple-100 text-purple-700",
    info: "bg-blue-100 text-blue-700"
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || styles.default}`}>{children}</span>;
};

const Button = ({ children, onClick, variant = "primary", icon: Icon, className = "", disabled = false }) => {
  const variants = {
    primary: `${BRAND.primary} text-white ${BRAND.primaryHover} shadow-lg shadow-purple-600/30`,
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
    ghost: "text-gray-500 hover:bg-gray-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}{children}
    </button>
  );
};

const downloadCSV = (data, filename) => {
  if (!data || !data.length) return alert("No data to export");
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(","));
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")));
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- 1. DASHBOARD ---
const Dashboard = ({ inventory, invoices, expenses, currentUser }) => {
  const [timeFilter, setTimeFilter] = useState('month'); 

  const filteredData = useMemo(() => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    let daysToSubtract = 30;
    if (timeFilter === 'week') daysToSubtract = 7;
    if (timeFilter === '3months') daysToSubtract = 90;
    if (timeFilter === '6months') daysToSubtract = 180;
    if (timeFilter === 'year') daysToSubtract = 365;

    const cutoff = now.getTime() - (daysToSubtract * msInDay);
    return {
      invoices: invoices.filter(inv => new Date(inv.date).getTime() >= cutoff && inv.status !== 'Returned'),
      expenses: expenses.filter(exp => new Date(exp.date).getTime() >= cutoff)
    };
  }, [invoices, expenses, timeFilter]);

  const metrics = useMemo(() => {
    let sales = 0, costOfGoods = 0, expenseTotal = 0;
    let channelData = { Store: 0, Instagram: 0, Facebook: 0, Website: 0 };

    filteredData.invoices.forEach(inv => {
      sales += parseFloat(inv.total || 0);
      costOfGoods += inv.items?.reduce((c, i) => c + ((i.cost || i.price * 0.7) * i.qty), 0) || 0;
      const channel = inv.channel || 'Store';
      channelData[channel] = (channelData[channel] || 0) + parseFloat(inv.total || 0);
    });

    filteredData.expenses.forEach(e => expenseTotal += parseFloat(e.amount || 0));
    return { sales, profit: sales - costOfGoods - expenseTotal, expenseTotal, channelData };
  }, [filteredData]);

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.name}</h2>
          <p className="text-gray-500 mt-1">Performance overview for: <span className="font-semibold capitalize text-purple-600">{timeFilter}</span></p>
        </div>
        <div className="flex bg-white rounded-xl border p-1 shadow-sm">
            {['week', 'month', '3months', '6months', 'year'].map(t => (
              <button key={t} onClick={() => setTimeFilter(t)} className={`px-4 py-2 text-sm rounded-lg transition-all font-medium capitalize ${timeFilter === t ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                {t === '3months' ? 'Quarter' : t === '6months' ? 'Half Year' : t}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${BRAND.gradient} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold">₹{metrics.sales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><TrendingUp size={24} className="text-white" /></div>
          </div>
        </Card>
        {currentUser.role !== 'Worker' && (
          <>
            <Card>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Net Profit</p>
                  <h3 className="text-3xl font-bold text-emerald-600">₹{metrics.profit.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl"><Wallet size={24} className="text-emerald-600" /></div>
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Expenses</p>
                  <h3 className="text-3xl font-bold text-gray-700">₹{metrics.expenseTotal.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-rose-100 rounded-xl"><DollarSign size={24} className="text-rose-600" /></div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-purple-600"/> Sales Channels</h3>
           <div className="space-y-5">
             {Object.entries(metrics.channelData).map(([channel, amount]) => (
               <div key={channel}>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-medium text-gray-700">{channel}</span>
                   <span className="font-bold text-gray-900">₹{amount.toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5">
                   <div className="h-2.5 rounded-full bg-purple-600 transition-all duration-1000" style={{ width: `${metrics.sales > 0 ? (amount / metrics.sales) * 100 : 0}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.status === 'Returned' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
                    {inv.status === 'Returned' ? <RotateCcw size={18}/> : <CheckCircle size={18}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{inv.customerName || 'Walk-in'} <span className="text-xs font-normal text-gray-400 ml-1">via {inv.channel}</span></p>
                    <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${inv.status === 'Returned' ? 'text-rose-600 line-through' : 'text-gray-800'}`}>₹{inv.total}</div>
                  <div className="text-xs text-gray-400 capitalize">{inv.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- 2. PARTIES & OUTLETS ---
const PartiesModule = () => {
  const [outlets, setOutlets] = useState([]);
  const [parties, setParties] = useState([]);
  const [newOutlet, setNewOutlet] = useState({ name: '', type: 'Store' });
  const [newParty, setNewParty] = useState({ name: '', type: 'Vendor', contact: '' });

  useEffect(() => {
    const unsubOut = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'outlets'), s => setOutlets(s.docs.map(d=>({id:d.id, ...d.data()}))));
    const unsubParties = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'parties'), s => setParties(s.docs.map(d=>({id:d.id, ...d.data()}))));
    return () => { unsubOut(); unsubParties(); };
  }, []);

  const addOutlet = async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'outlets'), newOutlet); setNewOutlet({ name: '', type: 'Store' }); };
  const addParty = async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'parties'), newParty); setNewParty({ name: '', type: 'Vendor', contact: '' }); };
  const handleDelete = async (coll, id) => { if(window.confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', COMPANY_ID, coll, id)); }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Parties, Vendors & Outlets</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-700"><Store size={20}/> Sales Channels</h3>
          <Card>
            <form onSubmit={addOutlet} className="flex gap-3">
              <input className="flex-1 p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-purple-200" placeholder="Outlet Name" value={newOutlet.name} onChange={e=>setNewOutlet({...newOutlet, name: e.target.value})} required />
              <select className="p-3 border rounded-xl bg-gray-50 outline-none" value={newOutlet.type} onChange={e=>setNewOutlet({...newOutlet, type: e.target.value})}><option>Store</option><option>Warehouse</option><option>Online</option></select>
              <Button>Add</Button>
            </form>
          </Card>
          <div className="space-y-3">{outlets.map(o => <div key={o.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div><div className="font-bold text-gray-800">{o.name}</div><div className="text-xs text-gray-500">{o.type}</div></div><button onClick={()=>handleDelete('outlets', o.id)} className="text-gray-400 hover:text-rose-600"><Trash2 size={18}/></button></div>)}</div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-700"><Truck size={20}/> Vendors & Parties</h3>
          <Card>
            <form onSubmit={addParty} className="space-y-3">
              <div className="flex gap-3"><input className="flex-1 p-3 border rounded-xl bg-gray-50" placeholder="Name" value={newParty.name} onChange={e=>setNewParty({...newParty, name: e.target.value})} required /><select className="p-3 border rounded-xl bg-gray-50" value={newParty.type} onChange={e=>setNewParty({...newParty, type: e.target.value})}><option>Vendor</option><option>Owner</option><option>Manager</option></select></div>
              <div className="flex gap-3"><input className="flex-1 p-3 border rounded-xl bg-gray-50" placeholder="Contact Info" value={newParty.contact} onChange={e=>setNewParty({...newParty, contact: e.target.value})} /><Button>Add</Button></div>
            </form>
          </Card>
          <div className="space-y-3">{parties.map(p => <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div><div className="font-bold text-gray-800">{p.name}</div><div className="text-xs text-gray-500">{p.type} • {p.contact}</div></div><button onClick={()=>handleDelete('parties', p.id)} className="text-gray-400 hover:text-rose-600"><Trash2 size={18}/></button></div>)}</div>
        </div>
      </div>
    </div>
  );
};

// --- 3. INVENTORY ---
const InventoryManager = ({ inventory, outlets }) => {
  const [item, setItem] = useState({ name: "", sku: "", quantity: 0, price: 0, cost: 0, location: "" });
  const [showBulk, setShowBulk] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [search, setSearch] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory'), { 
      ...item, quantity: parseInt(item.quantity), price: parseFloat(item.price), cost: parseFloat(item.cost), location: item.location || 'Unassigned' 
    });
    setItem({ name: "", sku: "", quantity: 0, price: 0, cost: 0, location: "" });
  };

  const handleBulkUpload = async () => {
    const lines = bulkData.trim().split('\n');
    let count = 0; const batch = writeBatch(db); 
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
        const line = lines[i];
        const [name, sku, quantity, price, loc] = line.split(',');
        if (name && price) {
            const ref = doc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory'));
            batch.set(ref, {
                name: name.trim(), sku: sku?.trim() || `SKU-${Math.floor(Math.random()*1000)}`,
                quantity: parseInt(quantity) || 0, price: parseFloat(price) || 0,
                cost: parseFloat(price) * 0.7 || 0, location: loc?.trim() || "Main Warehouse", createdAt: serverTimestamp()
            });
            count++;
        }
    }
    await batch.commit(); setShowBulk(false); setBulkData(""); alert(`Uploaded ${count} items!`);
  };

  const handleDelete = async (id) => { if(window.confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory', id)); };
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
         <Button variant="secondary" onClick={() => setShowBulk(true)} icon={Upload}>Bulk Import</Button>
      </div>

      <Card>
        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">Item Name</label><input placeholder="Product Name" className="w-full p-3 border rounded-xl bg-gray-50" required value={item.name} onChange={e => setItem({...item, name: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 mb-1 block">SKU</label><input placeholder="SKU-001" className="w-full p-3 border rounded-xl bg-gray-50" value={item.sku} onChange={e => setItem({...item, sku: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 mb-1 block">Qty</label><input type="number" placeholder="0" className="w-full p-3 border rounded-xl bg-gray-50" required value={item.quantity} onChange={e => setItem({...item, quantity: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 mb-1 block">Price</label><input type="number" placeholder="0.00" className="w-full p-3 border rounded-xl bg-gray-50" required value={item.price} onChange={e => setItem({...item, price: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500 mb-1 block">Location</label>
            <select className="w-full p-3 border rounded-xl bg-gray-50" value={item.location} onChange={e => setItem({...item, location: e.target.value})}>
              <option value="">Select Location</option>
              {outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-1"><Button className="w-full">Add Item</Button></div>
        </form>
      </Card>

      {showBulk && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <Card className="w-full max-w-lg h-96 flex flex-col relative">
              <div className="flex justify-between mb-4 font-bold text-lg"><span>Bulk Upload (CSV)</span><button onClick={()=>setShowBulk(false)}><X/></button></div>
              <p className="text-xs text-gray-500 mb-2">Format: Name, SKU, Quantity, Price, Location</p>
              <textarea className="flex-1 border p-4 rounded-xl bg-gray-50 font-mono text-sm" placeholder={`Silk Saree, SKU-99, 10, 2500, Shelf A\nCotton Suit, SKU-100, 5, 1200, Shelf B`} value={bulkData} onChange={e => setBulkData(e.target.value)}></textarea>
              <Button className="mt-4" onClick={handleBulkUpload}>Process Upload</Button>
           </Card>
         </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
        <input className="w-full pl-12 p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-purple-200 outline-none" placeholder="Search inventory..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4 font-bold text-gray-600">Name</th><th className="p-4 font-bold text-gray-600">SKU</th><th className="p-4 font-bold text-gray-600">Location</th><th className="p-4 font-bold text-gray-600">Stock</th><th className="p-4 font-bold text-gray-600">Price</th><th className="p-4 text-center">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{filtered.map(i => <tr key={i.id} className="hover:bg-purple-50 transition-colors"><td className="p-4 font-medium text-gray-800">{i.name}</td><td className="p-4 text-gray-500">{i.sku}</td><td className="p-4"><Badge>{i.location}</Badge></td><td className="p-4 font-bold">{i.quantity}</td><td className="p-4">₹{i.price}</td><td className="p-4 text-center"><button onClick={()=>handleDelete(i.id)}><Trash2 size={18} className="text-gray-300 hover:text-rose-500"/></button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

// --- 4. BILLING & SALES ---
const InvoiceModal = ({ invoice, onClose, org }) => {
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white print:shadow-none print:border-0">
        <div className="text-center mb-4">
          {org.logo && <img src={org.logo} alt="Logo" className="h-16 mx-auto mb-2" />}
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p>{org.address}</p>
          <p>Phone: {org.phone}</p>
          <p>Email: {org.email}</p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} icon={Download}>Print</Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">Bill Number: {invoice.id}</p>
              <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
              <p>Customer: {invoice.customerName}</p>
              <p>Channel: {invoice.channel}</p>
            </div>
          </div>
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Item</th>
                <th className="border border-gray-300 p-2">Qty</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">{item.qty}</td>
                  <td className="border border-gray-300 p-2">₹{item.price}</td>
                  <td className="border border-gray-300 p-2">₹{item.price * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-xl">
            Total: ₹{invoice.total}
          </div>
        </div>
      </Card>
      {showInvoice && <InvoiceModal invoice={showInvoice} onClose={() => setShowInvoice(null)} org={org} />}
    </div>
  );
};

const BillingSales = ({ inventory, invoices, currentUser, org }) => {
  const [cart, setCart] = useState([]);
  const [meta, setMeta] = useState({ customerName: '', channel: 'Store', returnReason: '', billNumber: '', date: new Date().toISOString().split('T')[0] });
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(null);

  const handleTransaction = async () => {
    if(cart.length === 0) return;
    if(isReturnMode && !meta.returnReason) return alert("Please enter a reason for return.");

    if (!isReturnMode) {
      for (const item of cart) {
        const currentQty = inventory.find(i => i.id === item.id)?.quantity || 0;
        if (currentQty < item.qty) {
          alert(`Insufficient stock for ${item.name}`);
          return;
        }
      }
    }

    if (isReturnMode) {
      if (!meta.billNumber) {
        alert("Please enter a bill number.");
        return;
      }
      const bill = invoices.find(inv => inv.id === meta.billNumber && inv.status !== 'Returned');
      if (!bill) {
        alert("Invalid bill number.");
        return;
      }
      for (const item of cart) {
        if (!bill.items.some(i => i.id === item.id)) {
          alert(`Item ${item.name} not in the bill.`);
          return;
        }
      }
    }

    const batch = writeBatch(db);
    const invRef = doc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'invoices'));
    const absTotal = cart.reduce((a,b)=>a+(b.price*b.qty),0);
    const finalTotal = isReturnMode ? -absTotal : absTotal;
    const invoiceDate = meta.date + 'T' + new Date().toISOString().split('T')[1];

    batch.set(invRef, {
      items: cart, total: finalTotal, date: invoiceDate,
      status: isReturnMode ? 'Returned' : 'Paid', type: isReturnMode ? 'Credit Note' : 'Invoice',
      reason: meta.returnReason || '', ...meta
    });

    cart.forEach(item => {
      const ref = doc(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory', item.id);
      const currentQty = inventory.find(i=>i.id===item.id)?.quantity || 0;
      const newQty = isReturnMode ? currentQty + item.qty : currentQty - item.qty;
      batch.update(ref, { quantity: newQty });
    });

    const moveRef = doc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'stock_moves'));
    batch.set(moveRef, {
      type: isReturnMode ? 'in' : 'out',
      items: cart,
      date: new Date().toISOString(),
      reason: isReturnMode ? 'Return' : 'Sale',
      invoiceId: invRef.id
    });

    await batch.commit(); setCart([]); setMeta({ customerName: '', channel: 'Store', returnReason: '', billNumber: '', date: new Date().toISOString().split('T')[0] });
    if (!isReturnMode) {
      setShowInvoice({ id: invRef.id, items: cart, total: finalTotal, customerName: meta.customerName || 'Walk-in', channel: meta.channel, date: new Date().toISOString(), type });
    } else {
      alert("Return Processed & Stock Updated");
    }
  };

  const filteredProducts = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
           <div className="relative flex-1 max-w-md mr-4"><Search className="absolute left-3 top-2.5 text-gray-400" size={20}/><input className="w-full pl-10 p-2.5 border rounded-xl bg-gray-50 focus:bg-white" placeholder="Scan or Search products..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
           <div className="flex items-center gap-3">
             <span className={`text-sm font-bold ${isReturnMode ? 'text-rose-600' : 'text-gray-400'}`}>Return Mode</span>
             <button onClick={() => {setIsReturnMode(!isReturnMode); setCart([])}} className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${isReturnMode ? 'bg-rose-600' : 'bg-gray-300'}`}>
               <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isReturnMode ? 'left-7' : 'left-1'}`}></div>
             </button>
           </div>
        </div>
        <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start pb-20">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className={`p-4 rounded-xl border text-left transition-all shadow-sm ${isReturnMode ? 'bg-rose-50 border-rose-200 hover:shadow-rose-100' : 'bg-white border-gray-100 hover:border-purple-300 hover:shadow-md'}`}>
              <div className="font-bold text-gray-800 line-clamp-1">{p.name}</div>
              <div className={`font-bold mt-1 ${isReturnMode ? 'text-rose-600' : 'text-purple-600'}`}>₹{p.price}</div>
              <div className="text-xs text-gray-400 mt-2 flex justify-between"><span>Stock: {p.quantity}</span><span>{p.location}</span></div>
            </button>
          ))}
        </div>
      </div>

      <Card className={`w-full md:w-96 flex flex-col h-full shadow-2xl ${isReturnMode ? 'border-2 border-rose-500' : 'border-0'}`}>
        <h3 className={`font-bold text-xl mb-4 flex items-center gap-2 ${isReturnMode ? 'text-rose-600' : 'text-purple-700'}`}>{isReturnMode ? <RotateCcw/> : <ShoppingCart/>} {isReturnMode ? 'Return' : 'Cart'}</h3>
        <div className="flex-1 overflow-auto mb-4 space-y-2">
          {cart.map((i, idx) => (<div key={idx} className="text-sm flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="font-medium">{i.name}</span>
            <span className={`font-bold ${isReturnMode ? 'text-rose-600' : 'text-gray-800'}`}>{isReturnMode ? '-' : ''}₹{i.price}</span>
          </div>))}
          {cart.length === 0 && <div className="text-center text-gray-400 mt-10 italic">Empty</div>}
        </div>
        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between font-bold text-2xl text-gray-800"><span>Total</span><span className={isReturnMode ? 'text-rose-600' : 'text-purple-600'}>{isReturnMode ? '-' : ''}₹{cart.reduce((a,b)=>a+b.price,0)}</span></div>
          <input placeholder="Customer Name" className="w-full p-3 border rounded-xl bg-gray-50" value={meta.customerName} onChange={e => setMeta({...meta, customerName: e.target.value})} />
          {currentUser.role === 'Owner' && <input type="date" className="w-full p-3 border rounded-xl bg-gray-50" value={meta.date} onChange={e => setMeta({...meta, date: e.target.value})} />}
          {isReturnMode && <input placeholder="Bill Number" className="w-full p-3 border rounded-xl bg-gray-50" value={meta.billNumber} onChange={e => setMeta({...meta, billNumber: e.target.value})} required />}
          {isReturnMode && (<textarea placeholder="Reason for Return (Required)" className="w-full p-3 border rounded-xl border-rose-200 bg-rose-50" rows="2" value={meta.returnReason} onChange={e => setMeta({...meta, returnReason: e.target.value})} />)}
          <Button className={`w-full py-4 text-lg shadow-xl ${isReturnMode ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : ''}`} onClick={handleTransaction}>{isReturnMode ? 'Confirm Refund' : 'Pay & Print'}</Button>
        </div>
      </Card>
    </div>
  );
};

// --- 5. EXPENSE MANAGER ---
const ExpenseManager = ({ expenses, outlets, parties }) => {
  const [newExp, setNewExp] = useState({ title: '', amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], frequency: 'One-time', assignTo: '' });
  
  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'expenses'), { ...newExp, amount: parseFloat(newExp.amount), createdAt: serverTimestamp() });
    setNewExp({ title: '', amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], frequency: 'One-time', assignTo: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Expense Tracker</h2>
      <Card>
        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
           <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">Description</label><input className="w-full p-3 border rounded-xl bg-gray-50" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} /></div>
           <div><label className="text-xs font-bold text-gray-500 mb-1 block">Amount</label><input type="number" className="w-full p-3 border rounded-xl bg-gray-50" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} /></div>
           <div><label className="text-xs font-bold text-gray-500 mb-1 block">Category</label><select className="w-full p-3 border rounded-xl bg-gray-50" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})}><option>Rent</option><option>Salaries</option><option>Utilities</option><option>Stock</option><option>Marketing</option></select></div>
           <div><label className="text-xs font-bold text-gray-500 mb-1 block">Frequency</label><select className="w-full p-3 border rounded-xl bg-gray-50" value={newExp.frequency} onChange={e => setNewExp({...newExp, frequency: e.target.value})}><option>One-time</option><option>Recurring</option></select></div>
           <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">Assign to</label><select className="w-full p-3 border rounded-xl bg-gray-50" value={newExp.assignTo} onChange={e => setNewExp({...newExp, assignTo: e.target.value})}><option value="">-- Select Entity --</option><optgroup label="Outlets">{outlets.map(o=><option key={o.id} value={o.name}>{o.name}</option>)}</optgroup><optgroup label="Vendors">{parties.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</optgroup></select></div>
           <Button>Save Expense</Button>
        </form>
      </Card>
      <div className="overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-4 font-bold text-gray-600">Date</th><th className="p-4 font-bold text-gray-600">Desc</th><th className="p-4 font-bold text-gray-600">Assigned</th><th className="p-4 font-bold text-gray-600 text-right">Amt</th></tr></thead><tbody className="divide-y divide-gray-100">{expenses.map(e => <tr key={e.id} className="hover:bg-gray-50"><td className="p-4">{e.date}</td><td className="p-4">{e.title} <Badge>{e.category}</Badge></td><td className="p-4 text-xs text-gray-500">{e.assignTo}</td><td className="p-4 font-bold text-rose-600 text-right">₹{e.amount}</td></tr>)}</tbody></table></div>
    </div>
  );
};

// --- 6. EXTRAS ---
const IntegrationsModule = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Integrations</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[{ name: 'Instagram Shop', icon: Instagram, color: 'text-pink-600', status: 'Connect' }, { name: 'Facebook Business', icon: Facebook, color: 'text-blue-600', status: 'Connect' }, { name: 'Shopify', icon: ShoppingCart, color: 'text-green-600', status: 'Coming Soon' }].map((tool, i) => (
        <Card key={i} className="text-center p-8 hover:shadow-2xl transition-all"><tool.icon size={56} className={`mx-auto mb-4 ${tool.color}`} /><h3 className="font-bold text-lg text-gray-800">{tool.name}</h3><Button variant="secondary" className="w-full mt-6 rounded-full">Connect</Button></Card>
      ))}
    </div>
  </div>
);

const OrgSettings = ({ org, setOrg }) => {
  const [form, setForm] = useState(org);
  const handleSave = async () => {
    const ref = doc(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'organization', 'main');
    await setDoc(ref, form);
    setOrg(form);
    alert('Saved');
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Organization Settings</h2>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Organization Name" className="p-3 border rounded-xl bg-gray-50" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Logo URL" className="p-3 border rounded-xl bg-gray-50" value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} />
          <input placeholder="Location" className="p-3 border rounded-xl bg-gray-50" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input placeholder="Address" className="p-3 border rounded-xl bg-gray-50" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <input placeholder="Phone" className="p-3 border rounded-xl bg-gray-50" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input placeholder="Fax" className="p-3 border rounded-xl bg-gray-50" value={form.fax} onChange={e => setForm({...form, fax: e.target.value})} />
          <input placeholder="Billing Address" className="p-3 border rounded-xl bg-gray-50" value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} />
          <input placeholder="Website URL" className="p-3 border rounded-xl bg-gray-50" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
          <input placeholder="Instagram" className="p-3 border rounded-xl bg-gray-50" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} />
          <input placeholder="Facebook" className="p-3 border rounded-xl bg-gray-50" value={form.facebook} onChange={e => setForm({...form, facebook: e.target.value})} />
          <input placeholder="Primary Contact" className="p-3 border rounded-xl bg-gray-50" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <input placeholder="Email" className="p-3 border rounded-xl bg-gray-50" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <Button onClick={handleSave} className="mt-4">Save</Button>
      </Card>
    </div>
  );
};

const UserSettings = ({ appId }) => {
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', role: 'Worker', userId: '', password: '' });
  useEffect(() => onSnapshot(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'team'), s => setTeam(s.docs.map(d => ({id:d.id, ...d.data()})))), [appId]);
  const handleAdd = async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'team'), { ...newMember, createdAt: serverTimestamp() }); setNewMember({ name: '', role: 'Worker', userId: '', password: '' }); };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Settings</h2>
      <Card><form onSubmit={handleAdd} className="flex gap-3"><input placeholder="Name" className="p-3 border rounded-xl bg-gray-50" required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} /><input placeholder="User ID" className="p-3 border rounded-xl bg-gray-50" required value={newMember.userId} onChange={e => setNewMember({...newMember, userId: e.target.value})} /><input placeholder="Password" type="password" className="p-3 border rounded-xl bg-gray-50" required value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} /><select className="p-3 border rounded-xl bg-gray-50" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}><option>Worker</option><option>Admin</option></select><Button>Add</Button></form></Card>
      <div className="grid gap-4 md:grid-cols-3">{team.map(m => <Card key={m.id} className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xl">{m.name[0]}</div><div><h3 className="font-bold text-gray-800">{m.name}</h3><p className="text-sm text-gray-500">@{m.userId} • {m.role}</p></div></Card>)}</div>
    </div>
  );
};

const ReportsModule = ({ invoices, expenses }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Reports</h2><Button onClick={() => downloadCSV(invoices, `satika_sales.csv`)} icon={Download}>Export CSV</Button></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card><h3 className="font-bold mb-4 text-gray-800">Recent Sales</h3><div className="overflow-auto h-64"><table className="w-full text-sm text-left"><thead><tr><th>Date</th><th>Customer</th><th>Amount</th></tr></thead><tbody>{invoices.slice(0,20).map(inv => <tr key={inv.id} className="border-b"><td className="p-2">{new Date(inv.date).toLocaleDateString()}</td><td className="p-2">{inv.customerName}</td><td className="p-2 font-bold">₹{inv.total}</td></tr>)}</tbody></table></div></Card><Card><h3 className="font-bold mb-4 text-gray-800">Recent Expenses</h3><div className="overflow-auto h-64"><table className="w-full text-sm text-left"><thead><tr><th>Date</th><th>Cat</th><th>Amt</th></tr></thead><tbody>{expenses.slice(0,20).map(e => <tr key={e.id} className="border-b"><td className="p-2">{e.date}</td><td className="p-2">{e.category}</td><td className="p-2 font-bold text-rose-600">₹{e.amount}</td></tr>)}</tbody></table></div></Card></div>
  </div>
);

const StockMovesModule = ({ }) => {
  const [moves, setMoves] = useState([]);
  useEffect(() => onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'stock_moves'), s => setMoves(s.docs.map(d => ({id:d.id, ...d.data()})))), []);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Stock Moves</h2>
      <div className="overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-600">Date</th>
              <th className="p-4 font-bold text-gray-600">Type</th>
              <th className="p-4 font-bold text-gray-600">Reason</th>
              <th className="p-4 font-bold text-gray-600">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {moves.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-4">{new Date(m.date).toLocaleDateString()}</td>
                <td className="p-4 capitalize">{m.type}</td>
                <td className="p-4">{m.reason}</td>
                <td className="p-4">{m.items.map(i => i.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const SatikaApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [team, setTeam] = useState([]);
  const [outlets, setOutlets] = useState([]); 
  const [parties, setParties] = useState([]); 

  useEffect(() => {
    signInAnonymously(auth); 
    const unsubTeam = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'team'), s => setTeam(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubInv = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory'), s => setInventory(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubBill = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'invoices'), s => setInvoices(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubExp = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'expenses'), s => setExpenses(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubOut = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'outlets'), s => setOutlets(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubParty = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'parties'), s => setParties(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubOrg = onSnapshot(doc(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'organization', 'main'), s => {
      if (s.exists()) setOrg(s.data());
    });
    return () => { unsubTeam(); unsubInv(); unsubBill(); unsubExp(); unsubOut(); unsubParty(); unsubOrg(); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (team.length === 0) {
      const admin = { name: "Owner", role: "Owner", userId: loginId.toLowerCase(), password: loginPass, createdAt: serverTimestamp() };
      await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'team'), admin);
      setCurrentUser(admin); return;
    }
    const member = team.find(m => m.userId === loginId.toLowerCase() && m.password === loginPass);
    member ? setCurrentUser(member) : alert("Invalid Credentials");
  };

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-purple-900 p-4">
      <Card className="w-full max-w-md p-10 space-y-6 text-center shadow-2xl">
        <h1 className="text-4xl font-extrabold text-purple-800">{org.name} ERP</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Heritage & Elegance</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none" required value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="User ID" />
          <input type="password" className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none" required value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" />
          <Button className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg">{team.length === 0 ? 'Create Company Account' : 'Login'}</Button>
        </form>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-slate-800">
      <div className="md:hidden bg-purple-800 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md"><span className="font-bold text-lg tracking-wide">{org.name}</span><button onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu/></button></div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-40 w-full md:w-72 bg-white h-full border-r border-gray-100 flex flex-col shadow-xl`}>
        <div className="p-8 bg-purple-800 text-white hidden md:block"><h1 className="text-3xl font-extrabold tracking-wide">{org.name}</h1><p className="text-purple-200 text-xs mt-1">ERP v5.0</p></div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'billing', icon: ShoppingCart, label: 'Billing & Sales' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'expenses', icon: DollarSign, label: 'Expenses' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'stockmoves', icon: ArrowRightLeft, label: 'Stock Moves' },
            { id: 'org', icon: Building, label: 'Organization', admin: true },
            { id: 'parties', icon: Store, label: 'Parties & Outlets', admin: true },
            { id: 'integrations', icon: Link, label: 'Integrations', admin: true },
            { id: 'team', icon: Settings, label: 'User Settings', admin: true },
          ].map(i => (!i.admin || currentUser.role !== 'Worker') && (
            <button key={i.id} onClick={() => {setActiveTab(i.id); setIsMenuOpen(false)}} className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all font-medium ${activeTab === i.id ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-purple-600'}`}><i.icon size={20} />{i.label}</button>
          ))}
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-4 p-3.5 text-rose-500 mt-auto hover:bg-rose-50 rounded-xl transition-colors"><Lock size={20}/> Logout</button>
        </nav>
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">{currentUser.name[0]}</div>
            <div><div className="font-bold text-sm text-gray-800">{currentUser.name}</div><div className="text-xs text-gray-500">{currentUser.role}</div></div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10 overflow-auto h-[calc(100vh-60px)] md:h-screen bg-gray-50">
        {activeTab === 'dashboard' && <Dashboard inventory={inventory} invoices={invoices} expenses={expenses} currentUser={currentUser} />}
        {activeTab === 'org' && <OrgSettings org={org} setOrg={setOrg} />}
        {activeTab === 'team' && <UserSettings appId={APP_ID} />}
        {activeTab === 'parties' && <PartiesModule />}
        {activeTab === 'integrations' && <IntegrationsModule />}
        {activeTab === 'inventory' && <InventoryManager inventory={inventory} outlets={outlets} />}
        {activeTab === 'billing' && <BillingSales inventory={inventory} invoices={invoices} currentUser={currentUser} org={org} />}
        {activeTab === 'expenses' && <ExpenseManager expenses={expenses} outlets={outlets} parties={parties} />}
        {activeTab === 'reports' && <ReportsModule invoices={invoices} expenses={expenses} />}
        {activeTab === 'stockmoves' && <StockMovesModule />}
      </main>
    </div>
  );
};

export default SatikaApp;

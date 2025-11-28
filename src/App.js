import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Package, Settings, Plus, Search, Menu, X, TrendingUp, 
  AlertCircle, FileText, Upload, Instagram, Facebook, Store, DollarSign, 
  CheckCircle, RotateCcw, Wallet, PieChart, Download, Globe, Users, Lock, 
  ArrowRightLeft, Coins, ShoppingCart, Trash2
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, collection, addDoc, query, onSnapshot, deleteDoc, doc, 
  serverTimestamp, writeBatch
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

// CRITICAL FIX: Shared Company ID ensures all devices see the same data
const COMPANY_ID = "satika_main_store_01"; 
const APP_ID = 'satika-erp-v1';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- BRANDING ---
const BRAND = {
  primary: "bg-[#800020]", primaryText: "text-[#800020]",
  accent: "bg-[#D4AF37]", accentText: "text-[#D4AF37]",
  gradient: "bg-gradient-to-r from-[#800020] to-[#500010]",
  light: "bg-[#fcf5f5]"
};

// --- UTILITY COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 ${className}`}>{children}</div>
);
const Badge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-slate-100 text-slate-600", success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700", danger: "bg-rose-100 text-rose-700",
    maroon: "bg-[#800020]/10 text-[#800020]", gold: "bg-[#D4AF37]/20 text-[#856d1e]"
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[type] || styles.default}`}>{children}</span>;
};
const Button = ({ children, onClick, variant = "primary", icon: Icon, className = "", disabled = false }) => {
  const variants = {
    primary: `${BRAND.primary} text-white hover:opacity-90 shadow-md`,
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}>
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

// --- MODULES ---
const Dashboard = ({ inventory, invoices, expenses, currentUser }) => {
  const metrics = useMemo(() => {
    const sales = invoices.filter(i => i.status !== 'Returned').reduce((a, b) => a + parseFloat(b.total || 0), 0);
    const expenseTotal = expenses.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
    const cost = invoices.filter(i => i.status !== 'Returned').reduce((a, inv) => a + (inv.items?.reduce((c, i) => c + ((i.cost || i.price * 0.7) * i.qty), 0) || 0), 0);
    return { sales, profit: sales - cost - expenseTotal, expenseTotal };
  }, [invoices, expenses]);

  return (
    <div className="space-y-6 pb-20">
      <h2 className={`text-2xl font-serif font-bold ${BRAND.primaryText}`}>Welcome, {currentUser?.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${BRAND.gradient} text-white border-none`}>
          <p className="text-[#D4AF37] text-sm font-medium mb-1">Total Sales</p>
          <h3 className="text-2xl font-bold">₹{metrics.sales.toLocaleString()}</h3>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium mb-1">Low Stock</p>
          <h3 className="text-2xl font-bold text-amber-600">{inventory.filter(i => i.quantity < 5).length}</h3>
        </Card>
        {currentUser.role !== 'Worker' && (
          <>
            <Card>
              <p className="text-slate-500 text-sm font-medium mb-1">Net Profit</p>
              <h3 className="text-2xl font-bold text-emerald-600">₹{metrics.profit.toLocaleString()}</h3>
            </Card>
            <Card>
              <p className="text-slate-500 text-sm font-medium mb-1">Expenses</p>
              <h3 className="text-2xl font-bold text-slate-700">₹{metrics.expenseTotal.toLocaleString()}</h3>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

const TeamModule = ({ appId }) => {
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', role: 'Worker', userId: '', password: '' });
  
  useEffect(() => onSnapshot(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'team'), s => setTeam(s.docs.map(d => ({id:d.id, ...d.data()})))), [appId]);
  
  const handleAdd = async (e) => {
    e.preventDefault();
    if (team.find(m => m.userId === newMember.userId)) return alert("ID Exists");
    await addDoc(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'team'), { ...newMember, createdAt: serverTimestamp() });
    setNewMember({ name: '', role: 'Worker', userId: '', password: '' });
  };

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold ${BRAND.primaryText}`}>Team</h2>
      <Card>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2">
          <input placeholder="Name" className="p-2 border rounded" required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
          <input placeholder="User ID" className="p-2 border rounded" required value={newMember.userId} onChange={e => setNewMember({...newMember, userId: e.target.value.toLowerCase()})} />
          <input placeholder="Password" type="password" className="p-2 border rounded" required value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} />
          <select className="p-2 border rounded" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}><option>Worker</option><option>Admin</option></select>
          <Button>Add</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">{team.map(m => <Card key={m.id}><h3 className="font-bold">{m.name}</h3><p className="text-sm">@{m.userId} • {m.role}</p></Card>)}</div>
    </div>
  );
};

const InventoryManager = ({ inventory, appId }) => {
  const [item, setItem] = useState({ name: "", sku: "", quantity: 0, price: 0, cost: 0 });
  
  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'inventory'), { ...item, quantity: parseInt(item.quantity), price: parseFloat(item.price), cost: parseFloat(item.cost) });
    setItem({ name: "", sku: "", quantity: 0, price: 0, cost: 0 });
  };

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold ${BRAND.primaryText}`}>Inventory</h2>
      <Card>
        <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
          <div className="col-span-2"><input placeholder="Name" className="w-full p-2 border rounded" required value={item.name} onChange={e => setItem({...item, name: e.target.value})} /></div>
          <input placeholder="SKU" className="w-full p-2 border rounded" value={item.sku} onChange={e => setItem({...item, sku: e.target.value})} />
          <input type="number" placeholder="Qty" className="w-full p-2 border rounded" required value={item.quantity} onChange={e => setItem({...item, quantity: e.target.value})} />
          <input type="number" placeholder="Price" className="w-full p-2 border rounded" required value={item.price} onChange={e => setItem({...item, price: e.target.value})} />
          <Button>Add</Button>
        </form>
      </Card>
      <div className="overflow-auto bg-white rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Name</th><th className="p-3">Stock</th><th className="p-3">Price</th></tr></thead><tbody>{inventory.map(i => <tr key={i.id} className="border-t"><td className="p-3">{i.name}</td><td className="p-3">{i.quantity}</td><td className="p-3">₹{i.price}</td></tr>)}</tbody></table></div>
    </div>
  );
};

const POSSystem = ({ inventory, appId, user }) => {
  const [cart, setCart] = useState([]);
  const [checkoutMeta, setCheckoutMeta] = useState({ customerName: '', channel: 'Store' });

  const handleCheckout = async () => {
    if(cart.length === 0) return;
    const batch = writeBatch(db);
    const invRef = doc(collection(db, 'artifacts', appId, 'users', COMPANY_ID, 'invoices'));
    batch.set(invRef, { 
      items: cart, total: cart.reduce((a,b)=>a+(b.price*b.qty),0), date: new Date().toISOString(), status: 'Paid', ...checkoutMeta 
    });
    cart.forEach(item => {
      const ref = doc(db, 'artifacts', appId, 'users', COMPANY_ID, 'inventory', item.id);
      batch.update(ref, { quantity: (inventory.find(i=>i.id===item.id)?.quantity || 0) - item.qty });
    });
    await batch.commit();
    setCart([]); alert("Sale Complete!");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-100px)]">
      <div className="flex-1 overflow-auto grid grid-cols-2 gap-2 content-start">
        {inventory.map(p => <button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="bg-white p-3 rounded border hover:border-red-800 text-left">
          <div className="font-bold">{p.name}</div><div>₹{p.price}</div><div className="text-xs text-slate-500">Stock: {p.quantity}</div>
        </button>)}
      </div>
      <Card className="w-full md:w-80 flex flex-col">
        <h3 className="font-bold mb-2">Cart ({cart.length})</h3>
        <div className="flex-1 overflow-auto mb-2 space-y-1">{cart.map((i, idx) => <div key={idx} className="text-sm flex justify-between"><span>{i.name}</span><span>₹{i.price}</span></div>)}</div>
        <div className="border-t pt-2 space-y-2">
          <div className="flex justify-between font-bold text-xl"><span>Total</span><span>₹{cart.reduce((a,b)=>a+b.price,0)}</span></div>
          <input placeholder="Customer Name" className="w-full p-2 border rounded" value={checkoutMeta.customerName} onChange={e => setCheckoutMeta({...checkoutMeta, customerName: e.target.value})} />
          <Button className="w-full" onClick={handleCheckout}>Complete Sale</Button>
        </div>
      </Card>
    </div>
  );
};

// --- MAIN APP ---
const SatikaApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [team, setTeam] = useState([]);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. Auth & Data Sync
  useEffect(() => {
    signInAnonymously(auth); // Just ensures connection
    // Sync Data using FIXED COMPANY ID
    const unsubTeam = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'team'), s => setTeam(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubInv = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'inventory'), s => setInventory(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubBill = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'invoices'), s => setInvoices(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsubExp = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'expenses'), s => setExpenses(s.docs.map(d => ({id:d.id, ...d.data()}))));
    return () => { unsubTeam(); unsubInv(); unsubBill(); unsubExp(); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (team.length === 0) {
      const admin = { name: "Owner", role: "Owner", userId: loginId.toLowerCase(), password: loginPass, createdAt: serverTimestamp() };
      await addDoc(collection(db, 'artifacts', APP_ID, 'users', COMPANY_ID, 'team'), admin);
      setCurrentUser(admin); alert("Admin Account Created! You can now login on any device."); return;
    }
    const member = team.find(m => m.userId === loginId.toLowerCase() && m.password === loginPass);
    member ? setCurrentUser(member) : alert("Invalid Credentials");
  };

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[#800020] p-4">
      <Card className="w-full max-w-md p-8 space-y-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-[#800020]">SATIKA ERP</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input className="w-full p-3 border rounded bg-slate-50" required value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="User ID" />
          <input type="password" className="w-full p-3 border rounded bg-slate-50" required value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" />
          <Button className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#500010]">{team.length === 0 ? 'Create Company Account' : 'Login'}</Button>
        </form>
        <p className="text-xs text-slate-400">v4.1 • Cloud Sync Enabled</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#800020] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <span className="font-serif font-bold text-lg">SATIKA</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu/></button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-40 w-full md:w-64 bg-white h-full border-r flex flex-col`}>
        <div className="p-6 bg-[#800020] text-white hidden md:block"><h1 className="text-2xl font-serif font-bold">SATIKA</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'billing', icon: ShoppingCart, label: 'POS & Billing' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'team', icon: Users, label: 'Team', admin: true },
          ].map(i => (!i.admin || currentUser.role !== 'Worker') && (
            <button key={i.id} onClick={() => {setActiveTab(i.id); setIsMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab === i.id ? 'bg-slate-100 font-bold text-[#800020]' : 'text-slate-500'}`}>
              <i.icon size={20} />{i.label}
            </button>
          ))}
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 p-3 text-rose-600 mt-auto"><Lock size={20}/> Logout</button>
        </nav>
      </div>

      <main className="flex-1 p-4 overflow-auto h-[calc(100vh-60px)] md:h-screen">
        {activeTab === 'dashboard' && <Dashboard inventory={inventory} invoices={invoices} expenses={expenses} currentUser={currentUser} />}
        {activeTab === 'team' && <TeamModule appId={APP_ID} />}
        {activeTab === 'inventory' && <InventoryManager inventory={inventory} appId={APP_ID} />}
        {activeTab === 'billing' && <POSSystem inventory={inventory} appId={APP_ID} user={currentUser} />}
      </main>
    </div>
  );
};

export default SatikaApp;

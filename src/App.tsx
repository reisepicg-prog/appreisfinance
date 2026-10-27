import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';

// --- Auto-Injeção do Tailwind CSS ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-script')) {
  const script = document.createElement('script');
  script.id = 'tailwind-script';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// --- Inicialização do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBBM1n7doAL_Hn7sN7Da0e-Mz05SYKVW2A",
  authDomain: "reisfinance.firebaseapp.com",
  projectId: "reisfinance",
  storageBucket: "reisfinance.firebasestorage.app",
  messagingSenderId: "85211553400",
  appId: "1:85211553400:web:c1db7faeb9ad97cac1d78d"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Ícones (SVGs inline) ---
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Message: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Cloud: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
  Wallet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
};

// --- Funções de Máscara de Moeda ---
const formatCurrencyInput = (value: number | string): string => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
};

const parseCurrencyToNumber = (formattedValue: string): number => {
  const digits = String(formattedValue).replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
};

// --- Modal da Calculadora Rápida ---
const CalculatorModal = ({ isOpen, onClose, onApply }: { isOpen: boolean; onClose: () => void; onApply: (val: number) => void }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  if (!isOpen) return null;

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Erro') setDisplay(num);
    else setDisplay(display + num);
  };
  const handleOp = (op: string) => { setHistory(`${display} ${op} `); setDisplay('0'); };
  const handleClear = () => { setDisplay('0'); setHistory(''); };
  const handleBackspace = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  const handleCalculate = () => {
    try {
      const fullExpression = (history + display).replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
      const sanitized = fullExpression.replace(/[^0-9+\-*/.]/g, '');
      const calcResult = Function(`'use strict'; return (${sanitized})`)();
      if (!isFinite(calcResult) || isNaN(calcResult)) setDisplay('Erro');
      else { setDisplay(String(Math.round(calcResult * 100) / 100).replace('.', ',')); setHistory(''); }
    } catch { setDisplay('Erro'); }
  };
  const handleApply = () => {
    let finalValue = parseFloat(display.replace(',', '.'));
    if (isNaN(finalValue)) finalValue = 0;
    onApply(finalValue);
    onClose();
  };

  const btnClass = "h-11 rounded-xl font-semibold text-lg flex items-center justify-center active:scale-95 transition-all select-none";

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1"><span>🧮</span> Calculadora</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold px-2 py-1">✕</button>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 mb-4 text-right">
          <div className="text-xs text-gray-400 h-4 font-mono">{history}</div>
          <div className="text-2xl font-bold text-gray-800 font-mono overflow-x-auto">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button type="button" onClick={handleClear} className={`${btnClass} bg-red-100 text-red-600 hover:bg-red-200`}>C</button>
          <button type="button" onClick={handleBackspace} className={`${btnClass} bg-gray-200 text-gray-700 hover:bg-gray-300`}>⌫</button>
          <button type="button" onClick={() => handleOp('÷')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>÷</button>
          <button type="button" onClick={() => handleOp('×')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>×</button>
          <button type="button" onClick={() => handleNum('7')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>7</button>
          <button type="button" onClick={() => handleNum('8')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>8</button>
          <button type="button" onClick={() => handleNum('9')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>9</button>
          <button type="button" onClick={() => handleOp('-')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>-</button>
          <button type="button" onClick={() => handleNum('4')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>4</button>
          <button type="button" onClick={() => handleNum('5')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>5</button>
          <button type="button" onClick={() => handleNum('6')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>6</button>
          <button type="button" onClick={() => handleOp('+')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>+</button>
          <button type="button" onClick={() => handleNum('1')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>1</button>
          <button type="button" onClick={() => handleNum('2')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>2</button>
          <button type="button" onClick={() => handleNum('3')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>3</button>
          <button type="button" onClick={handleCalculate} className={`${btnClass} row-span-2 bg-blue-600 text-white hover:bg-blue-700 h-[96px]`}>=</button>
          <button type="button" onClick={() => handleNum('0')} className={`${btnClass} col-span-2 bg-gray-100 hover:bg-gray-200`}>0</button>
          <button type="button" onClick={() => handleNum(',')} className={`${btnClass} bg-gray-100 hover:bg-gray-200`}>,</button>
        </div>
        <button type="button" onClick={handleApply} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md text-sm">Aplicar Valor</button>
      </div>
    </div>
  );
};

export default function FinanceApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  
  // Novos estados para aba de Investimentos
  const [investments, setInvestments] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loginError, setLoginError] = useState('');

  // --- Autenticação ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoginError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login:", error);
      setLoginError("Erro ao fazer login. Tente novamente.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // --- Buscar Dados Principais do Firestore ---
  useEffect(() => {
    if (!user) return;

    const txQuery = query(collection(db, 'users', user.uid, 'transactions'));
    const unsubscribeTxs = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txs);
      setIsLoading(false);
    }, console.error);

    const cardsQuery = query(collection(db, 'users', user.uid, 'cards'));
    const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
      const cds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(cds);
    }, console.error);

    const invQuery = query(collection(db, 'users', user.uid, 'investments'));
    const unsubscribeInv = onSnapshot(invQuery, (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    const salesQuery = query(collection(db, 'users', user.uid, 'salesHistory'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      setSalesHistory(sales);
    }, console.error);

    return () => { unsubscribeTxs(); unsubscribeCards(); unsubscribeInv(); unsubscribeSales(); };
  }, [user]);

  const handleDeleteDoc = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
    } catch(e) { console.error(e) }
  };

  // ==========================================
  // COMPONENTES DAS ABAS
  // ==========================================

  const Dashboard = () => {
    const availableMonths = [...new Set(transactions.map(tx => {
        const d = new Date(tx.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const [viewMode, setViewMode] = useState('month'); 
    const [selectedMonth, setSelectedMonth] = useState(
        availableMonths.includes(currentMonthStr) ? currentMonthStr : (availableMonths[0] || currentMonthStr)
    );

    const filteredTxs = viewMode === 'all' 
        ? transactions 
        : transactions.filter(tx => tx.date.startsWith(selectedMonth));

    const totalIncomes = filteredTxs.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
    const totalExpenses = filteredTxs.filter(tx => tx.type !== 'income').reduce((acc, curr) => acc + (parseFloat(curr.myAmount) || 0), 0);
    const totalReceivables = filteredTxs.filter(tx => tx.type !== 'income').reduce((acc, curr) => {
      const splitTotal = (curr.splits || []).reduce((sAcc: number, sCurr: any) => sAcc + (sCurr.paid ? 0 : (parseFloat(sCurr.amount) || 0)), 0);
      return acc + splitTotal;
    }, 0);

    const saldo = totalIncomes - totalExpenses;

    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Por Mês
            </button>
            <button onClick={() => setViewMode('all')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Geral
            </button>
          </div>
        </div>

        {viewMode === 'month' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Mês de Referência:</span>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableMonths.length === 0 && <option value={selectedMonth}>{selectedMonth}</option>}
              {availableMonths.map(month => {
                  const [y, m] = month.split('-');
                  return <option key={month} value={month}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
            <h3 className="text-emerald-800 text-sm font-medium mb-1">Minhas Receitas (Ganhos)</h3>
            <p className="text-3xl font-bold text-emerald-600">R$ {totalIncomes.toFixed(2)}</p>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icons.Wallet size={100} />
            </div>
          </div>

          <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
            <h3 className="text-red-800 text-sm font-medium mb-1">Minhas Despesas (Gasto)</h3>
            <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icons.CreditCard size={100} />
            </div>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden md:col-span-2">
            <div className="flex justify-between items-center z-10 relative">
               <div>
                  <h3 className="text-blue-800 text-sm font-medium mb-1">A Receber de Terceiros</h3>
                  <p className="text-2xl font-bold text-blue-700">R$ {totalReceivables.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 mt-1">Valores divididos aguardando pagamento</p>
               </div>
               <div className="text-right">
                  <h3 className="text-blue-800 text-sm font-medium mb-1">Saldo do Período</h3>
                  <p className={`text-xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    R$ {saldo.toFixed(2)}
                  </p>
               </div>
            </div>
            <div className="absolute -right-4 -bottom-8 opacity-5">
              <Icons.Users size={120} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CardsManagement = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCard, setNewCard] = useState({ name: '', brand: 'Mastercard', closingDay: '', dueDay: '', limit: '', cashbackPct: '' });

    const handleSaveCard = async (e: any) => {
      e.preventDefault();
      if (!user) return;
      try {
        const cardData = {
          ...newCard,
          limit: parseFloat(newCard.limit) || 0,
          cashbackPct: parseFloat(newCard.cashbackPct) || 0
        };
        await setDoc(doc(collection(db, 'users', user.uid, 'cards')), cardData);
        setIsAdding(false);
        setNewCard({ name: '', brand: 'Mastercard', closingDay: '', dueDay: '', limit: '', cashbackPct: '' });
      } catch (err) { console.error(err); }
    };

    const handleDeleteCard = async (id: string) => {
      if (!user) return;
      try { await deleteDoc(doc(db, 'users', user.uid, 'cards', id)); } 
      catch (err) { console.error(err); }
    };

    return (
      <div className="animate-fadeIn pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Meus Cartões</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            {isAdding ? 'Cancelar' : '+ Novo Cartão'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSaveCard} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Cartão</label>
                <input required type="text" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} placeholder="Ex: Nubank, Itaú..." className="w-full p-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Bandeira</label>
                <select value={newCard.brand} onChange={e => setNewCard({...newCard, brand: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="Mastercard">Mastercard</option>
                  <option value="Visa">Visa</option>
                  <option value="Elo">Elo</option>
                  <option value="Amex">Amex</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dia de Fechamento</label>
                <input required type="number" min="1" max="31" value={newCard.closingDay} onChange={e => setNewCard({...newCard, closingDay: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dia de Vencimento</label>
                <input required type="number" min="1" max="31" value={newCard.dueDay} onChange={e => setNewCard({...newCard, dueDay: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Limite (R$)</label>
                <input required type="number" step="0.01" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: e.target.value})} placeholder="Ex: 5000.00" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cashback (%)</label>
                <input type="number" step="0.01" value={newCard.cashbackPct} onChange={e => setNewCard({...newCard, cashbackPct: e.target.value})} placeholder="Ex: 1.5" className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium mt-4">Salvar Cartão</button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {cards.map(c => {
            const usedLimit = transactions
              .filter(tx => tx.methodId === c.id && tx.status !== 'paid')
              .reduce((acc, tx) => acc + tx.totalAmount, 0);
            const cardLimit = parseFloat(c.limit) || 0;
            const availableLimit = cardLimit - usedLimit;
            const availablePct = cardLimit > 0 ? (availableLimit / cardLimit) * 100 : 0;

            return (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <Icons.CreditCard />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{c.name} <span className="text-xs text-gray-500 font-normal">({c.brand})</span></h3>
                      <p className="text-sm text-gray-500">Fecha dia {c.closingDay} • Vence dia {c.dueDay}</p>
                      {c.cashbackPct > 0 && <p className="text-xs text-green-600 font-medium">{c.cashbackPct}% de Cashback</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCard(c.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Icons.Trash />
                  </button>
                </div>
                
                {cardLimit > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Limite Disponível</span>
                      <span className={`font-bold ${availableLimit < 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {availableLimit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full ${availableLimit < (cardLimit*0.2) ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, Math.max(0, availablePct))}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Utilizado: R$ {usedLimit.toFixed(2)}</span>
                      <span>Total: R$ {cardLimit.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {cards.length === 0 && !isAdding && (
            <p className="text-gray-500 text-center py-10 bg-white rounded-xl border border-gray-200">Nenhum cartão cadastrado ainda.</p>
          )}
        </div>
      </div>
    );
  };

  const TransactionForm = () => {
    const [txType, setTxType] = useState('expense');
    const [desc, setDesc] = useState('');
    
    // --- ESTADOS DA MÁSCARA E CALCULADORA ---
    const [amount, setAmount] = useState<number | ''>(''); 
    const [displayAmount, setDisplayAmount] = useState('');
    const [isCalcOpen, setIsCalcOpen] = useState(false);

    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [firstInstallmentDate, setFirstInstallmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [methodId, setMethodId] = useState('pix');
    const [installments, setInstallments] = useState(1);
    const [expenseType, setExpenseType] = useState('installment');
    
    const [isSplit, setIsSplit] = useState(false);
    const [autoSplit, setAutoSplit] = useState(true);
    const [includeMe, setIncludeMe] = useState(true);
    const [splits, setSplits] = useState([{ name: '', amount: '', paid: false }]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if (txType === 'income' || methodId === 'pix' || cards.length === 0) {
        setFirstInstallmentDate(purchaseDate);
        return;
      }
      
      const card = cards.find(c => c.id === methodId);
      if (card) {
        const pDate = new Date(purchaseDate + 'T12:00:00'); 
        let targetMonth = pDate.getMonth();
        let targetYear = pDate.getFullYear();
        
        const pd = pDate.getDate();
        const cd = parseInt(card.closingDay);
        const dd = parseInt(card.dueDay);

        if (pd >= cd) targetMonth += 1;
        if (dd < cd) targetMonth += 1;

        const firstDate = new Date(targetYear, targetMonth, dd);
        setFirstInstallmentDate(firstDate.toISOString().split('T')[0]);
      }
    }, [methodId, purchaseDate, cards, txType]);

    useEffect(() => {
      if (isSplit && autoSplit && amount) {
        const total = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
        const numPeople = splits.length + (includeMe ? 1 : 0);
        if (numPeople > 0) {
            const equalShare = (total / numPeople).toFixed(2);
            setSplits(prev => prev.map(s => ({ ...s, amount: equalShare })));
        }
      }
    }, [amount, splits.length, isSplit, autoSplit, includeMe]);

    const handleAddSplit = () => setSplits([...splits, { name: '', amount: '', paid: false }]);
    const handleRemoveSplit = (index: number) => setSplits(splits.filter((_, i) => i !== index));
    const handleSplitChange = (index: number, field: string, value: any) => {
      const newSplits = [...splits];
      (newSplits as any)[index][field] = value;
      setSplits(newSplits);
      if (field === 'amount') setAutoSplit(false);
    };

    const totalSplits = splits.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const parsedTotalAmount = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
    const myShare = includeMe ? parsedTotalAmount - totalSplits : 0;

    const handleSubmit = async (e: any) => {
      e.preventDefault();
      if (!user) return;
      
      if (!desc || !amount) {
        setErrorMsg("Preencha descrição e valor total."); return;
      }
      
      if (txType === 'expense') {
        if (installments < 1) {
          setErrorMsg("Preencha a quantidade de parcelas."); return;
        }
        if (isSplit && includeMe && myShare < -0.05) {
          setErrorMsg("A soma das divisões não pode ser maior que o valor total."); return;
        }
        if (isSplit && !includeMe && Math.abs(parsedTotalAmount - totalSplits) > 0.05) {
          setErrorMsg("Como você não participa da compra, a soma das divisões deve ser exatamente igual ao valor total."); return;
        }
      }

      setIsSaving(true);
      setErrorMsg('');

      try {
        const groupId = Date.now().toString();
        
        const numPeriods = installments;
        const isRecurring = txType === 'income' || expenseType === 'fixed';
        const cardName = txType === 'income' ? 'Conta / Pix' : (methodId === 'pix' ? 'Pix/Débito' : cards.find(c => c.id === methodId)?.name || 'Cartão');
        const finalMethodId = txType === 'income' ? 'pix' : methodId;

        for (let i = 0; i < numPeriods; i++) {
            let formattedDate;
            if (txType === 'income' || methodId === 'pix') {
                const d = new Date(purchaseDate + 'T12:00:00');
                d.setMonth(d.getMonth() + i);
                formattedDate = d.toISOString().split('T')[0];
            } else {
                const d = new Date(firstInstallmentDate + 'T12:00:00');
                d.setMonth(d.getMonth() + i);
                formattedDate = d.toISOString().split('T')[0];
            }

            const suffix = numPeriods > 1 ? ` (${i + 1}/${numPeriods})` : '';
            const instTotalAmt = isRecurring ? parsedTotalAmount : (parsedTotalAmount / numPeriods);
            const instMyAmt = isRecurring ? (isSplit ? myShare : parsedTotalAmount) : ((isSplit ? myShare : parsedTotalAmount) / numPeriods);
            
            const instSplits = isSplit 
              ? splits.filter(s => s.name).map(s => ({
                  name: s.name,
                  amount: isRecurring ? (parseFloat(s.amount) || 0) : ((parseFloat(s.amount) || 0) / numPeriods),
                  paid: s.paid || false
                }))
              : [];

            const isFuture = formattedDate > new Date().toISOString().split('T')[0];
            const initialStatus = txType === 'income' ? (isFuture ? 'pending' : 'paid') : 'pending';

            const newTx = {
              type: txType,
              desc: desc + suffix,
              totalAmount: instTotalAmt,
              myAmount: instMyAmt,
              purchaseDate: purchaseDate,
              date: formattedDate,
              method: cardName,
              methodId: finalMethodId,
              splits: instSplits,
              groupId,
              status: initialStatus,
              createdAt: new Date().toISOString()
            };

            await setDoc(doc(collection(db, 'users', user.uid, 'transactions')), newTx);
        }
        
        setDesc(''); setAmount(''); setDisplayAmount(''); setInstallments(1); setIsSplit(false); setSplits([{ name: '', amount: '', paid: false }]); setExpenseType('installment');
        setActiveTab('history');
      } catch (err) {
        console.error(err);
        setErrorMsg("Erro ao salvar.");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="animate-fadeIn max-w-2xl mx-auto pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Lançamento</h2>
        
        <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setTxType('expense')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'expense' ? 'bg-white text-red-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Despesa (Gasto)
          </button>
          <button 
            onClick={() => setTxType('income')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'income' ? 'bg-white text-emerald-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Receita (Ganho)
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-sm border ${txType === 'income' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-200'} space-y-5`}>
          {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder={txType === 'income' ? "Ex: Salário, Venda" : "Ex: Mercado"} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  value={displayAmount} 
                  onChange={e => {
                    const fmt = formatCurrencyInput(e.target.value);
                    setDisplayAmount(fmt);
                    setAmount(parseCurrencyToNumber(fmt));
                  }} 
                  placeholder="R$ 0,00" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-gray-800" 
                />
                <button 
                  type="button" 
                  onClick={() => setIsCalcOpen(true)} 
                  className="px-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-xl"
                  title="Abrir Calculadora"
                >
                  🧮
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{txType === 'income' ? 'Data de Recebimento' : 'Data da Compra'}</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            
            {txType === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select value={methodId} onChange={e => setMethodId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="pix">Pix / Débito / Dinheiro</option>
                  <optgroup label="Meus Cartões de Crédito">
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{txType === 'income' ? 'Repetir Receita?' : 'Qtd. de Parcelas / Meses'}</label>
              <select value={installments} onChange={e => setInstallments(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value={1}>Não repetir (Mês único)</option>
                {[...Array(35)].map((_, i) => (
                  <option key={i+2} value={i+2}>{i+2} meses</option>
                ))}
              </select>
            </div>
            
            {txType === 'expense' && installments > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comportamento do Valor</label>
                <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="installment">Parcelado (Divide os {displayAmount || 'R$ 0,00'} em {installments}x)</option>
                  <option value="fixed">Fixo (Repete os {displayAmount || 'R$ 0,00'} em todos os {installments} meses)</option>
                </select>
              </div>
            )}

            {txType === 'expense' && methodId !== 'pix' && (
              <div className={installments > 1 ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento (1ª Parcela)</label>
                <input type="date" value={firstInstallmentDate} onChange={e => setFirstInstallmentDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white" />
                <p className="text-[10px] text-gray-500 mt-1">Calculado pelo dia de fechamento.</p>
              </div>
            )}
          </div>

          {txType === 'expense' && (
            <>
              {/* SESSÃO DE DIVISÃO */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="font-bold text-gray-800">Dividir esta compra?</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" checked={includeMe} onChange={e => setIncludeMe(e.target.checked)} />
                    Eu também pago uma parte
                  </label>
                </div>

                {isSplit && (
                  <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                    {splits.map((split, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <input type="text" placeholder="Nome (Ex: Mãe)" value={split.name} onChange={e => handleSplitChange(index, 'name', e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none" />
                          </div>
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-3 text-gray-500 text-sm">R$</span>
                            <input type="number" step="0.01" placeholder="Valor" value={split.amount} onChange={e => handleSplitChange(index, 'amount', e.target.value)} className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg text-sm outline-none" />
                          </div>
                          <button type="button" onClick={() => handleRemoveSplit(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Icons.Trash />
                          </button>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer w-max pl-1">
                          <input type="checkbox" checked={split.paid || false} onChange={e => handleSplitChange(index, 'paid', e.target.checked)} className="rounded w-3.5 h-3.5 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer" />
                          Esta pessoa já me pagou este valor (ex: via Pix)
                        </label>
                      </div>
                    ))}
                    
                    <button type="button" onClick={handleAddSplit} className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Icons.Plus /> Adicionar Pessoa
                    </button>

                    <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Terceiros assumem:</span>
                         <strong>R$ {totalSplits.toFixed(2)}</strong>
                      </div>
                      {includeMe ? (
                        <div className="flex justify-between">
                           <span className="text-gray-600">Sua parte:</span>
                           <strong className={`text-base ${myShare < 0 ? 'text-red-600' : 'text-blue-700'}`}>R$ {Math.max(0, myShare).toFixed(2)}</strong>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                           <span className="text-gray-600">Sua parte:</span>
                           <strong className="text-base text-gray-400">R$ 0.00 (Isento)</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <button type="submit" disabled={isSaving} className={`w-full text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 ${txType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}>
            {isSaving ? 'Processando...' : (txType === 'income' ? 'Salvar Receita' : 'Salvar Despesa')}
          </button>
        </form>

        <CalculatorModal 
          isOpen={isCalcOpen} 
          onClose={() => setIsCalcOpen(false)} 
          onApply={(val) => {
            const fmt = formatCurrencyInput(Math.round(val * 100));
            setDisplayAmount(fmt);
            setAmount(val);
          }} 
        />
      </div>
    );
  };

  const CollectionsTab = () => {
    const availableMonths = [...new Set(transactions.map(tx => {
        const d = new Date(tx.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))].sort();

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(
        availableMonths.includes(currentMonthStr) ? currentMonthStr : (availableMonths[availableMonths.length - 1] || currentMonthStr)
    );
    
    const [filterPerson, setFilterPerson] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const debtsByPerson: any = {};
    
    const filteredTransactions = transactions.filter(tx => {
        const d = new Date(tx.date);
        const txMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (selectedMonth !== 'all' && txMonthStr !== selectedMonth) return false;
        return true;
    });

    filteredTransactions.forEach(tx => {
      if(tx.splits) {
        tx.splits.forEach((split: any, splitIndex: number) => {
          if (!debtsByPerson[split.name]) debtsByPerson[split.name] = [];
          debtsByPerson[split.name].push({ 
            txId: tx.id,
            splitIndex: splitIndex,
            desc: tx.desc, 
            amount: split.amount, 
            date: tx.date,
            paid: split.paid || false
          });
        });
      }
    });

    const allPeopleNames = Object.keys(debtsByPerson).sort();
    const peopleToRender = allPeopleNames.filter(name => filterPerson === 'all' || name === filterPerson);

    const toggleSplitPaid = async (txId: string, splitIndex: number, currentStatus: boolean) => {
      if (!user) return;
      try {
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return;
        const updatedSplits = [...tx.splits];
        updatedSplits[splitIndex].paid = !currentStatus;
        await updateDoc(doc(db, 'users', user.uid, 'transactions', txId), {
          splits: updatedSplits
        });
      } catch (err) { console.error(err); }
    };

    const handleWhatsApp = (name: string, items: any[]) => {
      const unpaidItems = items.filter(i => !i.paid);
      if (unpaidItems.length === 0) return;

      const total = unpaidItems.reduce((acc, curr) => acc + curr.amount, 0);
      let text = `Olá, aqui é o resumo das suas contas comigo:\n\n`;
      unpaidItems.forEach(item => {
        const dateFormatted = new Date(item.date).toLocaleDateString('pt-BR');
        text += `- ${item.desc} (Venc: ${dateFormatted}): R$ ${item.amount.toFixed(2)}\n`;
      });
      text += `\n*Total a pagar: R$ ${total.toFixed(2)}*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="animate-fadeIn pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fechamento e Cobranças</h2>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Mês</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os Meses</option>
              {availableMonths.map(month => {
                  const [y, m] = month.split('-');
                  return <option key={month} value={month}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Pessoa</label>
            <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todas as Pessoas</option>
              {allPeopleNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="pending">Só Pendentes</option>
              <option value="paid">Só Pagos</option>
            </select>
          </div>
        </div>
        
        {peopleToRender.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <p className="text-gray-500 font-medium">Nenhum valor encontrado com estes filtros.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {peopleToRender.map(name => {
              const items = debtsByPerson[name];
              const filteredItems = items.filter((i: any) => {
                if (filterStatus === 'pending') return !i.paid;
                if (filterStatus === 'paid') return i.paid;
                return true;
              });

              if (filteredItems.length === 0) return null;

              const unpaidItems = filteredItems.filter((i: any) => !i.paid);
              const totalOwed = unpaidItems.reduce((acc: number, curr: any) => acc + curr.amount, 0);
              const isAllPaid = filteredItems.length > 0 && unpaidItems.length === 0;

              return (
                <div key={name} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-3 mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                    {isAllPaid ? (
                      <span className="font-bold text-sm bg-green-100 text-green-700 px-2 py-1 rounded-lg">Tudo Pago!</span>
                    ) : (
                      <span className="font-bold text-blue-600">Restante: R$ {totalOwed.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {filteredItems.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded-lg ${item.paid ? 'bg-gray-50 opacity-60' : 'bg-blue-50/30'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <input 
                            type="checkbox" 
                            checked={item.paid} 
                            onChange={() => toggleSplitPaid(item.txId, item.splitIndex, item.paid)}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer flex-shrink-0"
                          />
                          <span className={`truncate ${item.paid ? 'line-through text-gray-500' : 'text-gray-700 font-medium'}`}>
                            {item.desc}
                          </span>
                        </div>
                        <span className={`${item.paid ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                          R$ {item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!isAllPaid && (
                    <button onClick={() => handleWhatsApp(name, filteredItems)} className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors">
                      <Icons.Message /> Cobrar Pendentes no WhatsApp
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const History = () => {
    const [editingTx, setEditingTx] = useState<any>(null);
    const [editForm, setEditForm] = useState({ desc: '', totalAmount: '', date: '' });
    const [updateScope, setUpdateScope] = useState('single');
    const [isUpdating, setIsUpdating] = useState(false);

    const [filterMonth, setFilterMonth] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterPerson, setFilterPerson] = useState('all');

    const availableMonths = [...new Set(transactions.map(t => t.date.substring(0,7)))].sort().reverse();
    const availablePersons = [...new Set(transactions.flatMap(t => t.splits?.map((s: any) => s.name) || []))].filter(Boolean).sort();

    const groupedInvoices: any = {};
    
    const filteredTxsForHistory = transactions.filter(tx => {
      if (filterMonth !== 'all' && !tx.date.startsWith(filterMonth)) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterPerson !== 'all') {
        const hasPerson = tx.splits?.some((s: any) => s.name === filterPerson);
        if (!hasPerson) return false;
      }
      return true;
    });

    filteredTxsForHistory.forEach(tx => {
      const date = new Date(tx.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const key = `${monthYear}|${tx.methodId}`;
      
      if (!groupedInvoices[key]) {
        groupedInvoices[key] = {
          id: key,
          monthYear,
          dateLabel: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
          methodId: tx.methodId,
          methodName: tx.method,
          card: cards.find(c => c.id === tx.methodId) || null,
          transactions: [],
          totalAmount: 0,
          myAmount: 0,
          isFullyPaid: true
        };
      }
      
      groupedInvoices[key].transactions.push(tx);
      groupedInvoices[key].totalAmount += tx.totalAmount;
      groupedInvoices[key].myAmount += tx.myAmount;
      
      if (tx.status !== 'paid') {
        groupedInvoices[key].isFullyPaid = false;
      }
    });

    const invoicesArray = Object.values(groupedInvoices).sort((a: any, b: any) => b.monthYear.localeCompare(a.monthYear));

    const handlePayInvoice = async (invoice: any) => {
      if (!user) return;
      try {
        const updatePromises = invoice.transactions
          .filter((tx: any) => tx.status !== 'paid')
          .map((tx: any) => updateDoc(doc(db, 'users', user.uid, 'transactions', tx.id), { status: 'paid' }));
        
        await Promise.all(updatePromises);
      } catch (err) {
        console.error("Erro ao pagar fatura", err);
      }
    };

    const handleToggleStatus = async (tx: any) => {
      if (!user) return;
      try {
        const newStatus = tx.status === 'paid' ? 'pending' : 'paid';
        await updateDoc(doc(db, 'users', user.uid, 'transactions', tx.id), { status: newStatus });
      } catch (err) { console.error(err); }
    };

    const openEditModal = (tx: any) => {
      setEditingTx(tx);
      setEditForm({ desc: tx.desc, totalAmount: tx.totalAmount, date: tx.date });
      setUpdateScope('single');
    };

    const handleSaveEdit = async (e: any) => {
      e.preventDefault();
      if (!user || !editingTx) return;
      setIsUpdating(true);
      try {
        const newTotal = parseFloat(editForm.totalAmount) || 0;
        let targets = [editingTx];
        
        if (updateScope === 'future' && editingTx.groupId) {
          targets = transactions.filter(t => t.groupId === editingTx.groupId && t.date >= editingTx.date && t.status !== 'paid');
        }

        const promises = targets.map(t => {
          const ratio = t.totalAmount > 0 ? (t.myAmount / t.totalAmount) : 1;
          const newMyAmount = newTotal * ratio;
          return updateDoc(doc(db, 'users', user.uid, 'transactions', t.id), {
            desc: updateScope === 'future' ? t.desc : editForm.desc, 
            totalAmount: newTotal,
            myAmount: newMyAmount,
            date: updateScope === 'single' ? editForm.date : t.date
          });
        });

        await Promise.all(promises);
        setEditingTx(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="animate-fadeIn pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Faturas e Lançamentos</h2>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Mês</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os Meses</option>
              {availableMonths.map(month => {
                  const [y, m] = month.split('-');
                  return <option key={month} value={month}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Tipo</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="income">Receitas (+)</option>
              <option value="expense">Despesas (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Envolvidos</label>
            <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos / Apenas Eu</option>
              {availablePersons.map(name => <option key={name as string} value={name as string}>{name as string}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Sincronizando...</p>
        ) : (
          <div className="space-y-6">
            {invoicesArray.length === 0 ? (
               <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500">Nenhum lançamento encontrado para estes filtros.</div>
            ) : (
              invoicesArray.map((invoice: any) => {
                const cashbackPct = invoice.card ? parseFloat(invoice.card.cashbackPct) || 0 : 0;
                const cashbackAmount = (invoice.totalAmount * (cashbackPct / 100));

                return (
                  <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className={`p-4 border-b ${invoice.isFullyPaid ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'} flex justify-between items-center`}>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          {invoice.methodName} 
                          {invoice.isFullyPaid && <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full">PAGA</span>}
                        </h3>
                        <p className="text-xs text-gray-500">Vencimento: {invoice.dateLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">R$ {invoice.totalAmount.toFixed(2)}</p>
                        {cashbackAmount > 0 && (
                          <p className="text-xs text-green-600 font-medium">+ R$ {cashbackAmount.toFixed(2)} de Cashback</p>
                        )}
                      </div>
                    </div>

                    <ul className="divide-y divide-gray-100">
                      {invoice.transactions.map((tx: any) => (
                        <li key={tx.id} className={`p-4 relative group hover:bg-gray-50 ${tx.type === 'income' ? 'bg-emerald-50/20' : ''} ${tx.status === 'paid' ? 'opacity-60' : ''}`}>
                          <div className="flex justify-between items-start pr-24">
                            <div>
                              <p className={`font-medium text-sm ${tx.type === 'income' ? 'text-emerald-700' : 'text-gray-800'} ${tx.status === 'paid' ? 'line-through text-opacity-70' : ''}`}>
                                {tx.type === 'income' && <span className="font-bold mr-1">+</span>}
                                {tx.desc}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {tx.type === 'income' ? 'Recebido em: ' : 'Compra: '} 
                                {tx.purchaseDate ? new Date(tx.purchaseDate).toLocaleDateString('pt-BR') : tx.date ? new Date(tx.date).toLocaleDateString('pt-BR') : '-'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm ${tx.type === 'income' ? 'text-emerald-600 font-bold' : 'text-gray-800'}`}>
                                R$ {tx.totalAmount.toFixed(2)}
                              </p>
                              {tx.type !== 'income' && tx.myAmount !== tx.totalAmount && (
                                <p className="text-[10px] text-blue-600 font-medium">Sua parte: R$ {tx.myAmount.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                          
                          {tx.splits?.length > 0 && (
                            <div className="mt-2 bg-blue-50/50 rounded p-1.5 text-[10px]">
                              {tx.splits.map((s: any, i: number) => (
                                <div key={i} className="flex justify-between text-gray-500">
                                  <span>{s.name}</span>
                                  <span>R$ {parseFloat(s.amount).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 bg-white/90 p-1 rounded-lg shadow-sm border border-gray-100">
                            <button onClick={() => handleToggleStatus(tx)} title="Marcar como Efetivado/Pendente" className={`p-1.5 rounded-md transition-colors ${tx.status === 'paid' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                              <Icons.CheckCircle />
                            </button>
                            <button onClick={() => openEditModal(tx)} disabled={tx.status === 'paid'} title="Editar Lançamento (Apenas Pendentes)" className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent">
                              <Icons.Edit />
                            </button>
                            <button onClick={() => handleDeleteDoc(tx.id)} title="Excluir" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                              <Icons.Trash />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {!invoice.isFullyPaid && invoice.card && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button onClick={() => handlePayInvoice(invoice)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          Marcar Fatura como Paga (Liberar Limite)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {editingTx && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Lançamento</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                  <input type="text" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                  <input type="number" step="0.01" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} className="w-full p-2 border rounded-lg" required />
                </div>
                {updateScope === 'single' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                    <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full p-2 border rounded-lg" required />
                  </div>
                )}
                
                {editingTx.groupId && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <label className="block text-xs font-bold text-blue-800 mb-2">Este é um lançamento recorrente. Deseja alterar:</label>
                    <div className="space-y-2 text-sm text-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="single" checked={updateScope === 'single'} onChange={() => setUpdateScope('single')} className="text-blue-600" />
                        Apenas este mês
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="future" checked={updateScope === 'future'} onChange={() => setUpdateScope('future')} className="text-blue-600" />
                        Este e os próximos meses pendentes
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium">Cancelar</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 py-2 text-white bg-blue-600 rounded-lg font-medium disabled:opacity-50">
                    {isUpdating ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ABA 5: INVESTIMENTOS (B3) ---
  const InvestmentsTab = () => {
    const [prices, setPrices] = useState<any>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [sellingAsset, setSellingAsset] = useState<any>(null);

    const [tickerInput, setTickerInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('');
    const [displayUnitPrice, setDisplayUnitPrice] = useState('');
    const [brokerInput, setBrokerInput] = useState('');
    const [buyDateInput, setBuyDateInput] = useState(new Date().toISOString().substring(0, 10));

    const [sellQuantity, setSellQuantity] = useState('');
    const [displaySellUnitPrice, setDisplaySellUnitPrice] = useState('');
    const [displaySellFees, setDisplaySellFees] = useState('');
    const [sellDate, setSellDate] = useState(new Date().toISOString().substring(0, 10));

    const refreshQuotes = async () => {
      if (investments.length === 0) return;
      setIsRefreshing(true);
      const tickers = Array.from(new Set(investments.map((i: any) => i.ticker.toUpperCase()))).join(',');
      try {
        const res = await fetch(`https://brapi.dev/api/quote/${tickers}`);
        const data = await res.json();
        if (data && data.results) {
          const map: any = {};
          data.results.forEach((r: any) => { map[r.symbol] = r.regularMarketPrice; });
          setPrices(map);
        }
      } catch (err) { console.error(err); } finally { setIsRefreshing(false); }
    };

    useEffect(() => {
      if (investments.length > 0) refreshQuotes();
    }, [investments.length]);

    const handleSaveAsset = async (e: any) => {
      e.preventDefault();
      if (!user) return;

      const tickerClean = tickerInput.trim().toUpperCase();
      const qty = parseFloat(quantityInput);
      const price = parseCurrencyToNumber(displayUnitPrice);

      if (!tickerClean || qty <= 0 || price <= 0) return;

      const newAsset = {
        ticker: tickerClean,
        type: tickerClean.endsWith('11') ? 'FII' : 'Ação',
        quantity: qty,
        unitPrice: price,
        broker: brokerInput.trim() || 'Principal',
        buyDate: buyDateInput,
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'users', user.uid, 'investments'), newAsset);
        setTickerInput(''); setQuantityInput(''); setDisplayUnitPrice(''); setBrokerInput(''); setIsAddOpen(false);
      } catch (err) { console.error(err); }
    };

    const handleConfirmSale = async (e: any) => {
      e.preventDefault();
      if (!user || !sellingAsset) return;

      const qty = parseFloat(sellQuantity);
      const price = parseCurrencyToNumber(displaySellUnitPrice);
      const fees = parseCurrencyToNumber(displaySellFees);

      if (qty <= 0 || qty > sellingAsset.quantity || price <= 0) return;

      const totalSaleGross = qty * price;
      const totalCostBasis = qty * sellingAsset.unitPrice;
      const netProfit = (totalSaleGross - totalCostBasis) - fees;
      const isDayTrade = sellDate === sellingAsset.buyDate;
      
      let taxPayable = 0;
      let taxRule = '';

      if (netProfit > 0) {
        if (isDayTrade) {
          taxPayable = netProfit * 0.20;
          taxRule = 'Day Trade (20% s/ lucro, sem isenção)';
        } else if (sellingAsset.type === 'FII') {
          taxPayable = netProfit * 0.20;
          taxRule = 'FII Swing Trade (20% s/ lucro)';
        } else {
          if (totalSaleGross <= 20000) {
            taxPayable = 0;
            taxRule = 'Ações Swing Trade (Isento: vendas ≤ R$ 20k/mês)';
          } else {
            taxPayable = netProfit * 0.15;
            taxRule = 'Ações Swing Trade (15% s/ lucro)';
          }
        }
      }

      const saleRecord = {
        ticker: sellingAsset.ticker, type: sellingAsset.type, broker: sellingAsset.broker,
        buyDate: sellingAsset.buyDate, saleDate, quantitySold: qty, unitSalePrice: price,
        unitCostBasis: sellingAsset.unitPrice, totalSaleAmount: totalSaleGross, fees,
        netProfit, isDayTrade, taxPayable, taxRule, createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'users', user.uid, 'salesHistory'), saleRecord);
        const remainingQty = sellingAsset.quantity - qty;
        if (remainingQty <= 0) await deleteDoc(doc(db, 'users', user.uid, 'investments', sellingAsset.id));
        else await updateDoc(doc(db, 'users', user.uid, 'investments', sellingAsset.id), { quantity: remainingQty });

        setSellingAsset(null); setSellQuantity(''); setDisplaySellUnitPrice(''); setDisplaySellFees('');
      } catch (err) { console.error(err); }
    };

    let totalInvested = 0;
    let totalMarketValue = 0;
    investments.forEach((inv: any) => {
      const invested = inv.quantity * inv.unitPrice;
      const currentPrice = prices[inv.ticker] || inv.unitPrice;
      totalInvested += invested;
      totalMarketValue += (inv.quantity * currentPrice);
    });
    const totalProfit = totalMarketValue - totalInvested;
    const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return (
      <div className="p-4 space-y-4 pb-28 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs text-blue-200">Patrimônio B3</span>
              <p className="text-3xl font-extrabold mt-0.5">R$ {totalMarketValue.toFixed(2)}</p>
            </div>
            <button onClick={refreshQuotes} className={`p-2 rounded-xl bg-white/10 ${isRefreshing ? 'animate-spin' : ''}`}><Icons.Refresh /></button>
          </div>
          <div className="flex justify-between items-end text-xs border-t border-white/10 pt-3 mt-3">
            <div>
              <span className="text-blue-300">Total Investido</span>
              <p className="font-semibold text-sm">R$ {totalInvested.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-blue-300">Lucro / Prejuízo</span>
              <p className={`font-bold text-sm ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}R$ {totalProfit.toFixed(2)} ({totalProfitPct.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-base">Meus Ativos</h3>
          <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
            <Icons.Plus /> Novo Ativo
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-gray-400 text-sm">Nenhum ativo cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv: any) => {
              const currentPrice = prices[inv.ticker] || inv.unitPrice;
              const investedVal = inv.quantity * inv.unitPrice;
              const currentVal = inv.quantity * currentPrice;
              const profitVal = currentVal - investedVal;
              const profitPct = inv.unitPrice > 0 ? ((currentPrice - inv.unitPrice) / inv.unitPrice) * 100 : 0;

              return (
                <div key={inv.id} className="bg-white p-4 rounded-2xl border shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{inv.ticker}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{inv.type}</span>
                        <span className="text-xs text-gray-400 font-medium">{inv.broker}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{inv.quantity} cotas • PM: R$ {inv.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">R$ {currentVal.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${profitVal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {profitVal >= 0 ? '+' : ''}{profitPct.toFixed(2)}% (R$ {profitVal.toFixed(2)})
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-50 pt-2 text-xs">
                    <span className="text-gray-400">Cotação: <b className="text-gray-700">R$ {currentPrice.toFixed(2)}</b></span>
                    <button onClick={() => setSellingAsset(inv)} className="text-blue-600 font-semibold px-2 py-1 bg-blue-50 rounded-lg">Registrar Venda</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {salesHistory.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-bold text-gray-800 text-sm">Histórico de Vendas & IR</h4>
            {salesHistory.map((s: any) => (
              <div key={s.id} className="bg-white p-3.5 rounded-2xl border shadow-sm text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span>{s.ticker} ({s.quantitySold} cotas)</span>
                  <span className={s.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>Resultado: R$ {s.netProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Venda em {s.saleDate}</span>
                  <span className="font-semibold text-gray-700">
                    {s.taxPayable > 0 ? `DARF a Pagar: R$ ${s.taxPayable.toFixed(2)}` : 'Isento de IR'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 italic">{s.taxRule}</p>
              </div>
            ))}
          </div>
        )}

        {isAddOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-gray-800">Adicionar Ativo</h3><button onClick={() => setIsAddOpen(false)}>✕</button></div>
              <form onSubmit={handleSaveAsset} className="space-y-3 text-sm">
                <input type="text" placeholder="Ticker (Ex: PETR4)" value={tickerInput} onChange={(e) => setTickerInput(e.target.value.toUpperCase())} className="w-full p-2.5 bg-gray-50 border rounded-xl font-bold uppercase" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" placeholder="Qtd" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                  <input type="text" inputMode="numeric" placeholder="Preço Médio" value={displayUnitPrice} onChange={(e) => setDisplayUnitPrice(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Corretora" value={brokerInput} onChange={(e) => setBrokerInput(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  <input type="date" value={buyDateInput} onChange={(e) => setBuyDateInput(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-xl text-xs" required />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-2">Salvar na Carteira</button>
              </form>
            </div>
          </div>
        )}

        {sellingAsset && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-gray-800">Registrar Venda</h3><button onClick={() => setSellingAsset(null)}>✕</button></div>
              <form onSubmit={handleConfirmSale} className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Qtd. Venda</label>
                    <input type="number" step="any" max={sellingAsset.quantity} placeholder={`Max: ${sellingAsset.quantity}`} value={sellQuantity} onChange={(e) => setSellQuantity(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Preço Unitário</label>
                    <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displaySellUnitPrice} onChange={(e) => setDisplaySellUnitPrice(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Taxas B3</label>
                    <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displaySellFees} onChange={(e) => setDisplaySellFees(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Data da Venda</label>
                    <input type="date" value={sellDate} onChange={(e) => setSellDate(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold rounded-xl mt-2">Confirmar Venda & Apurar IR</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SettingsTab = () => {
    const [importMsg, setImportMsg] = useState({ text: '', type: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExportJSON = () => {
      const data = { transactions, cards, investments, salesHistory };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `financas_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
      setImportMsg({ text: 'Backup exportado com sucesso!', type: 'success' });
    };

    const handleImportJSON = async (event: any) => {
      const file = event.target.files[0];
      if (!file || !user) return;
      setIsProcessing(true);
      setImportMsg({ text: 'Restaurando backup...', type: 'info' });
      
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.cards) for (const card of data.cards) await setDoc(doc(db, 'users', user.uid, 'cards', card.id), card);
          if (data.transactions) for (const tx of data.transactions) await setDoc(doc(db, 'users', user.uid, 'transactions', tx.id), tx);
          if (data.investments) for (const inv of data.investments) await setDoc(doc(db, 'users', user.uid, 'investments', inv.id), inv);
          if (data.salesHistory) for (const sale of data.salesHistory) await setDoc(doc(db, 'users', user.uid, 'salesHistory', sale.id), sale);
          setImportMsg({ text: 'Backup restaurado com sucesso!', type: 'success' });
        } catch (err) { setImportMsg({ text: 'Erro ao importar.', type: 'error' }); } 
        finally { setIsProcessing(false); event.target.value = ''; }
      };
      reader.readAsText(file);
    };

    const handleExportCSV = () => {
      let csvContent = "ID;Tipo;Descricao;Data;ValorTotal;MetodoID;Status\n";
      transactions.forEach(tx => {
        const row = [tx.id, tx.type, (tx.desc || '').replace(/;/g, ''), tx.date, tx.totalAmount, tx.methodId, tx.status];
        csvContent += row.join(";") + "\n";
      });
      const dataStr = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);
      const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `planilha_lancamentos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
      setImportMsg({ text: 'Planilha CSV gerada!', type: 'success' });
    };

    const handleImportCSV = async (event: any) => {
      const file = event.target.files[0];
      if (!file || !user) return;
      setIsProcessing(true);
      setImportMsg({ text: 'Lendo planilha...', type: 'info' });

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          let importCount = 0;
          for(let i = 1; i < lines.length; i++) {
            if(!lines[i].trim()) continue;
            const cols = lines[i].split(';');
            if(cols.length < 5) continue;
            const id = cols[0].trim(), type = cols[1].trim(), desc = cols[2].trim(), date = cols[3].trim();
            const val = parseFloat(cols[4].trim().replace(',', '.')) || 0;
            const methodId = cols[5]?.trim() || 'pix';
            const status = cols[6]?.trim() || 'pending';

            if(id) await updateDoc(doc(db, 'users', user.uid, 'transactions', id), { type, desc, date, totalAmount: val, methodId, status });
            else await setDoc(doc(collection(db, 'users', user.uid, 'transactions')), { type, desc, date, totalAmount: val, myAmount: val, methodId, status, method: 'Via Planilha', createdAt: new Date().toISOString()});
            importCount++;
          }
          setImportMsg({ text: `${importCount} lançamentos importados!`, type: 'success' });
        } catch (err) { setImportMsg({ text: 'Erro ao ler a planilha.', type: 'error' }); } 
        finally { setIsProcessing(false); event.target.value = ''; }
      };
      reader.readAsText(file);
    };

    return (
      <div className="animate-fadeIn pb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações e Dados</h2>
        
        {importMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${importMsg.type === 'success' ? 'bg-green-100 text-green-700' : importMsg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {importMsg.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-gray-800 mb-1">Minha Conta</h3>
                   <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg font-medium transition-colors">Sair</button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Icons.Calendar /> Editar via Planilha (CSV)</h3>
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button onClick={handleExportCSV} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium"><Icons.Download /> Baixar Planilha</button>
              <label className={`flex-1 ${isProcessing ? 'bg-gray-400' : 'bg-white border border-green-600 text-green-700 hover:bg-green-50 cursor-pointer'} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium inline-flex`}>
                <Icons.Upload /> {isProcessing ? 'Enviando...' : 'Importar Planilha'}
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={isProcessing} />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Icons.Cloud /> Backup do Sistema (JSON)</h3>
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button onClick={handleExportJSON} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium"><Icons.Download /> Baixar Backup</button>
              <label className={`flex-1 ${isProcessing ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900 text-white cursor-pointer'} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium inline-flex`}>
                <Icons.Upload /> {isProcessing ? 'Enviando...' : 'Restaurar Backup'}
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" disabled={isProcessing} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Rotinas de Autenticação Visual ---
  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">Carregando...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Icons.Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Finanças Inteligentes</h1>
            <p className="text-gray-500 mb-8 text-sm">Faça login com o Google para sincronizar seus dados de forma segura em todos os seus dispositivos.</p>
            {loginError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{loginError}</div>}
            <button onClick={handleGoogleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2">
               Entrar com o Google
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-blue-700 text-white pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-sm relative z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finanças Inteligentes</h1>
            <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
              <Icons.Cloud /> Sincronizado
            </p>
          </div>
          <button onClick={() => setActiveTab('settings')} title="Configurações e Backup" className={`p-2.5 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-blue-800 text-white' : 'bg-blue-600 text-blue-100 hover:bg-blue-500 hover:text-white'}`}>
            <Icons.Settings />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 relative z-0">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cards' && <CardsManagement />}
        {activeTab === 'add' && <TransactionForm />}
        {activeTab === 'collections' && <CollectionsTab />}
        {activeTab === 'investments' && <InvestmentsTab />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-1 py-1">
          
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 w-12 sm:w-14 ${activeTab === 'dashboard' ? 'text-blue-700' : 'text-gray-400'}`}>
            <Icons.Home /> <span className="text-[9px] font-medium mt-1">Início</span>
          </button>

          <button onClick={() => setActiveTab('cards')} className={`flex flex-col items-center p-2 w-12 sm:w-14 ${activeTab === 'cards' ? 'text-blue-700' : 'text-gray-400'}`}>
            <Icons.Wallet /> <span className="text-[9px] font-medium mt-1">Cartões</span>
          </button>
          
          <div className="relative -top-6">
            <button onClick={() => setActiveTab('add')} className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white ${activeTab === 'add' ? 'bg-blue-800 scale-110' : 'bg-blue-600'}`}>
              <Icons.Plus />
            </button>
          </div>

          <button onClick={() => setActiveTab('collections')} className={`flex flex-col items-center p-2 w-12 sm:w-14 ${activeTab === 'collections' ? 'text-blue-700' : 'text-gray-400'}`}>
            <Icons.Message /> <span className="text-[9px] font-medium mt-1">Cobrar</span>
          </button>

          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-2 w-12 sm:w-14 ${activeTab === 'investments' ? 'text-blue-700' : 'text-gray-400'}`}>
            <Icons.TrendingUp /> <span className="text-[9px] font-medium mt-1">Ativos</span>
          </button>

          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-2 w-12 sm:w-14 ${activeTab === 'history' ? 'text-blue-700' : 'text-gray-400'}`}>
            <Icons.Calendar /> <span className="text-[9px] font-medium mt-1">Faturas</span>
          </button>

        </div>
      </nav>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .pb-safe { padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
      `}} />
    </div>
  );
}

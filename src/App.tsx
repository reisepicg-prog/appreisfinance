import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBBM1n7doAL_Hn7sN7Da0e-Mz05SYKVW2A",
  authDomain: "reisfinance.firebaseapp.com",
  projectId: "reisfinance",
  storageBucket: "reisfinance.firebasestorage.app",
  messagingSenderId: "85211553400",
  appId: "1:85211553400:web:c1db7faeb9ad97cac1d78d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- ÍCONES SVG ---
const Icons = {
  Wallet: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
  ),
  Users: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  CreditCard: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  TrendingUp: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  Plus: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Calendar: ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Trash: ({ size = 18, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
  ),
  Refresh: ({ size = 16, className = "" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
  )
};

// --- MÁSCARA MONETÁRIA AUTOMÁTICA ---
const formatCurrencyInput = (value: number | string): string => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

const parseCurrencyToNumber = (formattedValue: string): number => {
  const digits = String(formattedValue).replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
};

// --- CALCULADORA TRADICIONAL ---
const CalculatorModal = ({ isOpen, onClose, onApply }: { isOpen: boolean; onClose: () => void; onApply: (val: number) => void }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  if (!isOpen) return null;

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Erro') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setHistory(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpression = (history + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.');
      const sanitized = fullExpression.replace(/[^0-9+\-*/.]/g, '');
      const calcResult = Function(`'use strict'; return (${sanitized})`)();
      
      if (!isFinite(calcResult) || isNaN(calcResult)) {
        setDisplay('Erro');
      } else {
        const rounded = Math.round(calcResult * 100) / 100;
        setDisplay(String(rounded).replace('.', ','));
        setHistory('');
      }
    } catch {
      setDisplay('Erro');
    }
  };

  const handleApply = () => {
    let finalValue = parseFloat(display.replace(',', '.'));
    if (isNaN(finalValue)) finalValue = 0;
    onApply(finalValue);
    onClose();
  };

  const btnClass = "h-11 rounded-xl font-semibold text-lg flex items-center justify-center active:scale-95 transition-all select-none";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
            <span>🧮</span> Calculadora
          </h3>
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

          <button type="button" onClick={() => handleNum('7')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>7</button>
          <button type="button" onClick={() => handleNum('8')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>8</button>
          <button type="button" onClick={() => handleNum('9')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>9</button>
          <button type="button" onClick={() => handleOp('-')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>-</button>

          <button type="button" onClick={() => handleNum('4')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>4</button>
          <button type="button" onClick={() => handleNum('5')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>5</button>
          <button type="button" onClick={() => handleNum('6')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>6</button>
          <button type="button" onClick={() => handleOp('+')} className={`${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`}>+</button>

          <button type="button" onClick={() => handleNum('1')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>1</button>
          <button type="button" onClick={() => handleNum('2')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>2</button>
          <button type="button" onClick={() => handleNum('3')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>3</button>
          <button type="button" onClick={handleCalculate} className={`${btnClass} row-span-2 bg-blue-600 text-white hover:bg-blue-700 h-[96px]`}>=</button>

          <button type="button" onClick={() => handleNum('0')} className={`${btnClass} col-span-2 bg-gray-100 text-gray-800 hover:bg-gray-200`}>0</button>
          <button type="button" onClick={() => handleNum(',')} className={`${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}>,</button>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md active:scale-98 transition-all text-sm"
        >
          Aplicar Valor ao Lançamento
        </button>
      </div>
    </div>
  );
};

// --- APLICAÇÃO PRINCIPAL ---
export default function FinanceApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  // Sincronização Firestore em Tempo Real
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCards([]);
      setInvestments([]);
      setSalesHistory([]);
      return;
    }

    const unsubTxs = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(data);
    });

    const unsubCards = onSnapshot(query(collection(db, 'users', user.uid, 'cards')), (s) => {
      setCards(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubInv = onSnapshot(query(collection(db, 'users', user.uid, 'investments')), (s) => {
      setInvestments(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSales = onSnapshot(query(collection(db, 'users', user.uid, 'salesHistory')), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      setSalesHistory(data);
    });

    return () => {
      unsubTxs();
      unsubCards();
      unsubInv();
      unsubSales();
    };
  }, [user]);

  // --- ABA 1: DASHBOARD ---
  const Dashboard = () => {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const filtered = transactions.filter((tx: any) => tx.date.startsWith(selectedMonth));
    const totalIncomes = filtered.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);
    const totalExpenses = filtered.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);
    const balance = totalIncomes - totalExpenses;

    return (
      <div className="p-4 space-y-4 pb-24">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <span className="text-xs text-gray-400 font-medium">Mês Atual</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-sm mt-1 outline-none"
            />
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Saldo do Período</span>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Receitas</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">R$ {totalIncomes.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-red-600 uppercase">Despesas</span>
            <p className="text-2xl font-bold text-red-700 mt-1">R$ {totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Últimas Transações</h3>
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Nenhum lançamento registrado neste mês.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {filtered.slice(0, 6).map((tx: any) => (
                <li key={tx.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <span className="text-xs text-gray-400">{tx.date} • {tx.method} • {tx.splits?.[0]?.name || 'Geral'}</span>
                  </div>
                  <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  // --- ABA 2: DIVISÃO DE CONTAS & COBRANÇAS ---
  const CollectionsTab = () => {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const filteredTxs = transactions.filter((t: any) => t.date.startsWith(selectedMonth));

    // Agrupar débitos por pessoa
    const personBreakdown: any = {};
    filteredTxs.forEach((t: any) => {
      if (t.type === 'expense' && t.splits && Array.isArray(t.splits)) {
        t.splits.forEach((s: any) => {
          if (!personBreakdown[s.name]) {
            personBreakdown[s.name] = { total: 0, items: [] };
          }
          const itemVal = parseFloat(s.amount) || 0;
          personBreakdown[s.name].total += itemVal;
          personBreakdown[s.name].items.push({
            desc: t.description,
            date: t.date,
            amount: itemVal
          });
        });
      }
    });

    const generateWhatsAppText = (personName: string, data: any) => {
      let msg = `*Resumo de Contas - ${selectedMonth}*\nOlá ${personName}, seguem suas despesas:\n\n`;
      data.items.forEach((it: any) => {
        msg += `• ${it.desc} (${it.date}): R$ ${it.amount.toFixed(2)}\n`;
      });
      msg += `\n*Total a acertar: R$ ${data.total.toFixed(2)}*`;
      return encodeURIComponent(msg);
    };

    return (
      <div className="p-4 space-y-4 pb-28">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">Cobranças & Divisão</h2>
            <p className="text-xs text-gray-400">Total rateado por pessoa</p>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-1.5 border rounded-lg text-xs font-semibold bg-gray-50 outline-none"
          />
        </div>

        {Object.keys(personBreakdown).length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
            Nenhuma despesa dividida registrada no mês selecionado.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(personBreakdown).map(([name, data]: any) => (
              <div key={name} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base">{name}</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                      {data.items.length} {data.items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <span className="font-extrabold text-gray-900 text-lg">
                    R$ {data.total.toFixed(2)}
                  </span>
                </div>

                {/* Lista de Itens da Pessoa */}
                <ul className="text-xs divide-y divide-gray-50 space-y-1">
                  {data.items.map((it: any, idx: number) => (
                    <li key={idx} className="pt-1 flex justify-between text-gray-600">
                      <span>{it.desc} <span className="text-[10px] text-gray-400">({it.date})</span></span>
                      <span className="font-medium text-gray-800">R$ {it.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão de Cobrança WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${generateWhatsAppText(name, data)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm mt-2"
                >
                  💬 Enviar Cobrança via WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- ABA 3: NOVO LANÇAMENTO (COM CALCULADORA E MÁSCARA) ---
  const AddTab = () => {
    const [type, setType] = useState('expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [displayAmount, setDisplayAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [method, setMethod] = useState('pix');
    const [person, setPerson] = useState('Eu');
    const [isCalcOpen, setIsCalcOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || amount <= 0) return;

      const newTx = {
        type,
        description,
        amount,
        date,
        method,
        splits: [{ name: person.trim() || 'Eu', amount }],
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), newTx);
        setDescription('');
        setAmount(0);
        setDisplayAmount('');
        setPerson('Eu');
        setActiveTab('dashboard');
      } catch (err) {
        console.error("Erro ao salvar lançamento:", err);
      }
    };

    return (
      <div className="p-4 max-w-lg mx-auto pb-28">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Novo Lançamento</h2>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600'}`}
            >
              Receita
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Valor</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={displayAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setDisplayAmount(formatted);
                    setAmount(parseCurrencyToNumber(formatted));
                  }}
                  className="flex-1 text-2xl font-bold text-gray-800 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  title="Abrir Calculadora"
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 flex items-center justify-center text-xl transition-all active:scale-95"
                >
                  🧮
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Mercado, Combustível, Salário"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none text-sm focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Forma de Pagamento</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none"
                >
                  <option value="pix">PIX / Dinheiro</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  {cards.map((c: any) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Referente a quem? (Para divisão)</label>
              <input
                type="text"
                placeholder="Ex: Eu, Mãe, Carlos, Amigo"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none text-sm focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98"
            >
              Salvar Lançamento
            </button>
          </form>
        </div>

        <CalculatorModal
          isOpen={isCalcOpen}
          onClose={() => setIsCalcOpen(false)}
          onApply={(calcVal) => {
            const formatted = formatCurrencyInput(Math.round(calcVal * 100));
            setDisplayAmount(formatted);
            setAmount(calcVal);
          }}
        />
      </div>
    );
  };

  // --- ABA 4: INVESTIMENTOS (B3, COTAÇÃO, VENDA E IR) ---
  const InvestmentsTab = () => {
    const [prices, setPrices] = useState<any>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [sellingAsset, setSellingAsset] = useState<any>(null);

    // Formulário de Cadastro
    const [tickerInput, setTickerInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('');
    const [displayUnitPrice, setDisplayUnitPrice] = useState('');
    const [brokerInput, setBrokerInput] = useState('');
    const [buyDateInput, setBuyDateInput] = useState(new Date().toISOString().substring(0, 10));

    // Formulário de Venda
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
          data.results.forEach((r: any) => {
            map[r.symbol] = r.regularMarketPrice;
          });
          setPrices(map);
        }
      } catch (err) {
        console.error("Erro ao buscar cotações:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      if (investments.length > 0) {
        refreshQuotes();
      }
    }, [investments.length]);

    const handleSaveAsset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      const tickerClean = tickerInput.trim().toUpperCase();
      const qty = parseFloat(quantityInput);
      const price = parseCurrencyToNumber(displayUnitPrice);

      if (!tickerClean || qty <= 0 || price <= 0) return;

      const isFII = tickerClean.endsWith('11');
      const assetType = isFII ? 'FII' : 'Ação';

      const newAsset = {
        ticker: tickerClean,
        type: assetType,
        quantity: qty,
        unitPrice: price,
        broker: brokerInput.trim() || 'Principal',
        buyDate: buyDateInput,
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'users', user.uid, 'investments'), newAsset);
        setTickerInput('');
        setQuantityInput('');
        setDisplayUnitPrice('');
        setBrokerInput('');
        setIsAddOpen(false);
      } catch (err) {
        console.error("Erro ao salvar ativo:", err);
      }
    };

    const handleConfirmSale = async (e: React.FormEvent) => {
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
        ticker: sellingAsset.ticker,
        type: sellingAsset.type,
        broker: sellingAsset.broker,
        buyDate: sellingAsset.buyDate,
        saleDate,
        quantitySold: qty,
        unitSalePrice: price,
        unitCostBasis: sellingAsset.unitPrice,
        totalSaleAmount: totalSaleGross,
        fees,
        netProfit,
        isDayTrade,
        taxPayable,
        taxRule,
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'users', user.uid, 'salesHistory'), saleRecord);

        const remainingQty = sellingAsset.quantity - qty;
        if (remainingQty <= 0) {
          await deleteDoc(doc(db, 'users', user.uid, 'investments', sellingAsset.id));
        } else {
          await updateDoc(doc(db, 'users', user.uid, 'investments', sellingAsset.id), {
            quantity: remainingQty
          });
        }

        setSellingAsset(null);
        setSellQuantity('');
        setDisplaySellUnitPrice('');
        setDisplaySellFees('');
      } catch (err) {
        console.error("Erro ao registrar venda:", err);
      }
    };

    let totalInvested = 0;
    let totalMarketValue = 0;

    investments.forEach((inv: any) => {
      const invested = inv.quantity * inv.unitPrice;
      const currentPrice = prices[inv.ticker] || inv.unitPrice;
      const market = inv.quantity * currentPrice;

      totalInvested += invested;
      totalMarketValue += market;
    });

    const totalProfit = totalMarketValue - totalInvested;
    const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return (
      <div className="p-4 space-y-4 pb-28">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs text-blue-200">Patrimônio em Ativos</span>
              <p className="text-3xl font-extrabold mt-0.5">R$ {totalMarketValue.toFixed(2)}</p>
            </div>
            <button
              onClick={refreshQuotes}
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Atualizar cotações B3"
            >
              <Icons.Refresh size={18} className="text-white" />
            </button>
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
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Icons.Plus size={16} /> Novo Ativo
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
            Nenhum ativo cadastrado. Toque no botão acima para incluir ações ou fundos imobiliários.
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv: any) => {
              const currentPrice = prices[inv.ticker] || inv.unitPrice;
              const investedVal = inv.quantity * inv.unitPrice;
              const currentVal = inv.quantity * currentPrice;
              const profitVal = currentVal - investedVal;
              const profitPct = inv.unitPrice > 0 ? ((currentPrice - inv.unitPrice) / inv.unitPrice) * 100 : 0;

              return (
                <div key={inv.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{inv.ticker}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {inv.type}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{inv.broker}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {inv.quantity} cotas • PM: R$ {inv.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">R$ {currentVal.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${profitVal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {profitVal >= 0 ? '+' : ''}{profitPct.toFixed(2)}% (R$ {profitVal.toFixed(2)})
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-50 pt-2 text-xs">
                    <span className="text-gray-400">
                      Cotação: <b className="text-gray-700">R$ {currentPrice.toFixed(2)}</b>
                    </span>
                    <button
                      onClick={() => setSellingAsset(inv)}
                      className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded-lg active:scale-95"
                    >
                      Registrar Venda
                    </button>
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
              <div key={s.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span>{s.ticker} ({s.quantitySold} cotas)</span>
                  <span className={s.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    Resultado: R$ {s.netProfit.toFixed(2)}
                  </span>
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

        {/* Modal: Adicionar Ativo */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Adicionar Ativo B3</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveAsset} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Código do Ativo (Ticker)</label>
                  <input
                    type="text"
                    placeholder="Ex: PETR4, MXRF11, VALE3"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold uppercase outline-none focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Quantidade</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 100"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Preço Médio Unitário</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={displayUnitPrice}
                      onChange={(e) => setDisplayUnitPrice(formatCurrencyInput(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-semibold focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Corretora</label>
                    <input
                      type="text"
                      placeholder="Ex: Inter, Nu, XP"
                      value={brokerInput}
                      onChange={(e) => setBrokerInput(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Data da Compra</label>
                    <input
                      type="date"
                      value={buyDateInput}
                      onChange={(e) => setBuyDateInput(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md"
                >
                  Salvar na Carteira
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Registrar Venda */}
        {sellingAsset && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Registrar Venda: {sellingAsset.ticker}</h3>
                <button onClick={() => setSellingAsset(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500">
                Disponível em carteira: <b className="text-gray-800">{sellingAsset.quantity} cotas</b><br/>
                Preço Médio de Compra: <b className="text-gray-800">R$ {sellingAsset.unitPrice.toFixed(2)}</b><br/>
                Comprado em: <b className="text-gray-800">{sellingAsset.buyDate}</b>
              </div>

              <form onSubmit={handleConfirmSale} className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Qtd. a Vender</label>
                    <input
                      type="number"
                      step="any"
                      max={sellingAsset.quantity}
                      placeholder={`Max: ${sellingAsset.quantity}`}
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Preço Unitário</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={displaySellUnitPrice}
                      onChange={(e) => setDisplaySellUnitPrice(formatCurrencyInput(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Taxas B3 / Custos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={displaySellFees}
                      onChange={(e) => setDisplaySellFees(formatCurrencyInput(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Data da Venda</label>
                    <input
                      type="date"
                      value={sellDate}
                      onChange={(e) => setSellDate(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                {sellDate === sellingAsset.buyDate && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg font-medium">
                    ⚠️ Operação identificada como <b>Day Trade</b> (Alíquota de 20% sobre eventual lucro).
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md"
                >
                  Confirmar Venda & Apurar IR
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ABA 5: HISTÓRICO GERAL & EXTRATO ---
  const HistoryTab = () => {
    return (
      <div className="p-4 space-y-3 pb-24">
        <h2 className="font-bold text-gray-800 text-lg">Histórico Completo</h2>
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Nenhum registro encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx: any) => (
              <li key={tx.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{tx.description}</p>
                  <p className="text-xs text-gray-400">{tx.date} • {tx.method} • {tx.splits?.[0]?.name || 'Geral'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2)}
                  </span>
                  <button onClick={() => deleteDoc(doc(db, 'users', user.uid, 'transactions', tx.id))} className="text-gray-300 hover:text-red-500">
                    <Icons.Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // --- CONTROLE DE TELAS (AUTH) ---
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Finanças & Carteira</h1>
          <p className="text-gray-500 mb-6 text-sm">Acesse com sua conta Google para sincronizar seu controle financeiro e investimentos.</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
          >
            Entrar com o Google
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col font-sans">
      <header className="p-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user.displayName ? user.displayName.charAt(0) : 'U'}
          </div>
          <span className="font-bold text-gray-800 text-sm truncate max-w-[180px]">{user.displayName || 'Minha Carteira'}</span>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 font-semibold">
          Sair
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'collections' && <CollectionsTab />}
        {activeTab === 'add' && <AddTab />}
        {activeTab === 'investments' && <InvestmentsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </main>

      {/* Navegação Inferior (5 Ícones Restaurados) */}
      <nav className

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, addDoc, setDoc, deleteDoc, updateDoc, doc, query 
} from 'firebase/firestore';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
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

// --- ÍCONES ---
const Icons = {
  Wallet: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Users: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  CreditCard: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  TrendingUp: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Plus: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Calendar: ({ size = 20, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Trash: ({ size = 18, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Refresh: ({ size = 16, className = "" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
};

// --- MÁSCARA MONETÁRIA AUTOMÁTICA ---
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

// --- CALCULADORA TRADICIONAL ---
const CalculatorModal = ({ isOpen, onClose, onApply }: { isOpen: boolean; onClose: () => void; onApply: (val: number) => void }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  if (!isOpen) return null;

  const handleNum = (num: string) => setDisplay(display === '0' || display === 'Erro' ? num : display + num);
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
    onApply(isNaN(finalValue) ? 0 : finalValue);
    onClose();
  };

  const btnClass = "h-11 rounded-xl font-semibold text-lg flex items-center justify-center active:scale-95 transition-all select-none";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
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
          <button type="button" onClick={handleClear} className={`${btnClass} bg-red-100 text-red-600`}>C</button>
          <button type="button" onClick={handleBackspace} className={`${btnClass} bg-gray-200 text-gray-700`}>⌫</button>
          <button type="button" onClick={() => handleOp('÷')} className={`${btnClass} bg-blue-100 text-blue-600`}>÷</button>
          <button type="button" onClick={() => handleOp('×')} className={`${btnClass} bg-blue-100 text-blue-600`}>×</button>
          <button type="button" onClick={() => handleNum('7')} className={`${btnClass} bg-gray-100`}>7</button>
          <button type="button" onClick={() => handleNum('8')} className={`${btnClass} bg-gray-100`}>8</button>
          <button type="button" onClick={() => handleNum('9')} className={`${btnClass} bg-gray-100`}>9</button>
          <button type="button" onClick={() => handleOp('-')} className={`${btnClass} bg-blue-100 text-blue-600`}>-</button>
          <button type="button" onClick={() => handleNum('4')} className={`${btnClass} bg-gray-100`}>4</button>
          <button type="button" onClick={() => handleNum('5')} className={`${btnClass} bg-gray-100`}>5</button>
          <button type="button" onClick={() => handleNum('6')} className={`${btnClass} bg-gray-100`}>6</button>
          <button type="button" onClick={() => handleOp('+')} className={`${btnClass} bg-blue-100 text-blue-600`}>+</button>
          <button type="button" onClick={() => handleNum('1')} className={`${btnClass} bg-gray-100`}>1</button>
          <button type="button" onClick={() => handleNum('2')} className={`${btnClass} bg-gray-100`}>2</button>
          <button type="button" onClick={() => handleNum('3')} className={`${btnClass} bg-gray-100`}>3</button>
          <button type="button" onClick={handleCalculate} className={`${btnClass} row-span-2 bg-blue-600 text-white h-[96px]`}>=</button>
          <button type="button" onClick={() => handleNum('0')} className={`${btnClass} col-span-2 bg-gray-100`}>0</button>
          <button type="button" onClick={() => handleNum(',')} className={`${btnClass} bg-gray-100`}>,</button>
        </div>
        <button type="button" onClick={handleApply} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-md">Aplicar Valor</button>
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
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setIsAuthChecking(false); });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (err) { console.error(err); }
  };
  const handleLogout = () => signOut(auth);

  useEffect(() => {
    if (!user) return;
    const unsubTxs = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(data);
    });
    const unsubCards = onSnapshot(query(collection(db, 'users', user.uid, 'cards')), (s) => setCards(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubInv = onSnapshot(query(collection(db, 'users', user.uid, 'investments')), (s) => setInvestments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSales = onSnapshot(query(collection(db, 'users', user.uid, 'salesHistory')), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      setSalesHistory(data);
    });
    return () => { unsubTxs(); unsubCards(); unsubInv(); unsubSales(); };
  }, [user]);

  // --- ABA 1: DASHBOARD ---
  const Dashboard = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    const filtered = transactions.filter((tx: any) => tx.date.startsWith(selectedMonth));
    const totalIncomes = filtered.filter((t: any) => t.type === 'income').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalExpenses = filtered.filter((t: any) => t.type === 'expense').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const balance = totalIncomes - totalExpenses;

    return (
      <div className="p-4 space-y-4 pb-24">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <span className="text-xs text-gray-400 font-medium">Mês Atual</span>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="block font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-sm mt-1 outline-none"/>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Saldo do Período</span>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>R$ {balance.toFixed(2)}</p>
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
          {filtered.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">Sem lançamentos.</p> : (
            <ul className="divide-y divide-gray-100 text-sm">
              {filtered.slice(0, 6).map((tx: any) => (
                <li key={tx.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <span className="text-xs text-gray-400">{tx.date} • {tx.method}</span>
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

  // --- ABA 2: DIVISÃO & COBRANÇAS ---
  const CollectionsTab = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    const filteredTxs = transactions.filter((t: any) => t.date.startsWith(selectedMonth));

    const personBreakdown: any = {};
    filteredTxs.forEach((t: any) => {
      if (t.type === 'expense' && t.splits) {
        t.splits.forEach((s: any) => {
          if (!personBreakdown[s.name]) personBreakdown[s.name] = { total: 0, items: [] };
          const itemVal = parseFloat(s.amount) || 0;
          personBreakdown[s.name].total += itemVal;
          personBreakdown[s.name].items.push({ desc: t.description, date: t.date, amount: itemVal });
        });
      }
    });

    const getWhatsAppLink = (name: string, data: any) => {
      let msg = `*Resumo - ${selectedMonth}*\nOlá ${name}, seguem suas despesas:\n\n`;
      data.items.forEach((it: any) => msg += `• ${it.desc} (${it.date}): R$ ${it.amount.toFixed(2)}\n`);
      msg += `\n*Total a acertar: R$ ${data.total.toFixed(2)}*`;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    };

    return (
      <div className="p-4 space-y-4 pb-28">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div><h2 className="font-bold text-gray-800 text-sm">Divisão de Contas</h2><p className="text-xs text-gray-400">Rateio por pessoa</p></div>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-1.5 border rounded-lg text-xs font-semibold bg-gray-50"/>
        </div>
        {Object.keys(personBreakdown).length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">Sem rateios no mês.</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(personBreakdown).map(([name, data]: any) => (
              <div key={name} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-2">
                  <span className="font-bold text-gray-900">{name}</span>
                  <span className="font-extrabold text-gray-900 text-lg">R$ {data.total.toFixed(2)}</span>
                </div>
                <ul className="text-xs divide-y divide-gray-50 space-y-1">
                  {data.items.map((it: any, idx: number) => (
                    <li key={idx} className="pt-1 flex justify-between text-gray-600">
                      <span>{it.desc} <span className="text-[10px] text-gray-400">({it.date})</span></span>
                      <span className="font-medium text-gray-800">R$ {it.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <a href={getWhatsAppLink(name, data)} target="_blank" rel="noreferrer" className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center mt-3">💬 Cobrar via WhatsApp</a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- ABA 3: NOVO LANÇAMENTO (RECORRÊNCIAS, MÁSCARA, CALCULADORA) ---
  const AddTab = () => {
    const [type, setType] = useState('expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [displayAmount, setDisplayAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [method, setMethod] = useState('pix');
    const [person, setPerson] = useState('Eu');
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    
    // Lógica de Recorrência (Fixa, Variável, Parcelada)
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringType, setRecurringType] = useState('installment');
    const [recurringCount, setRecurringCount] = useState(2);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || amount <= 0) return;

      try {
        const loopCount = isRecurring ? recurringCount : 1;
        const promises = [];

        for (let i = 0; i < loopCount; i++) {
          const d = new Date(date);
          d.setMonth(d.getMonth() + i);
          const dateStr = d.toISOString().substring(0, 10);
          
          let desc = description;
          if (isRecurring && recurringType === 'installment') {
            desc = `${description} (${i + 1}/${recurringCount})`;
          } else if (isRecurring && (recurringType === 'fixed' || recurringType === 'variable')) {
            desc = `${description} (Mês ${i + 1})`;
          }

          const newTx = {
            type,
            description: desc,
            amount: amount,
            date: dateStr,
            method,
            isRecurring,
            recurringType,
            splits: [{ name: person.trim() || 'Eu', amount }],
            createdAt: new Date().toISOString()
          };
          
          promises.push(addDoc(collection(db, 'users', user.uid, 'transactions'), newTx));
        }

        await Promise.all(promises);
        setDescription(''); setAmount(0); setDisplayAmount(''); setPerson('Eu'); setIsRecurring(false);
        setActiveTab('dashboard');
      } catch (err) { console.error(err); }
    };

    return (
      <div className="p-4 max-w-lg mx-auto pb-28">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Novo Lançamento</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-600'}`}>Despesa</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}>Receita</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Valor</label>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displayAmount} onChange={(e) => { const fmt = formatCurrencyInput(e.target.value); setDisplayAmount(fmt); setAmount(parseCurrencyToNumber(fmt)); }} className="flex-1 text-2xl font-bold p-3 bg-gray-50 border rounded-xl" required />
                <button type="button" onClick={() => setIsCalcOpen(true)} className="px-4 bg-gray-100 text-xl border rounded-xl">🧮</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Data</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Pagamento</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl text-sm">
                  <option value="pix">PIX / Dinheiro</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Referente a quem? (Divisão)</label>
              <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Ex: Eu, Carlos" className="w-full p-3 bg-gray-50 border rounded-xl text-sm" required />
            </div>

            {/* CONTROLE DE REPETIÇÃO (PARCELAS, FIXAS, VARIÁVEIS) */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded text-blue-600"/>
                Repetir este lançamento?
              </label>
              {isRecurring && (
                <div className="space-y-3 pt-2 border-t border-blue-200">
                  <div className="flex gap-2 text-xs">
                    <label className="flex items-center gap-1"><input type="radio" name="recType" value="installment" checked={recurringType === 'installment'} onChange={(e) => setRecurringType(e.target.value)} /> Parcelado</label>
                    <label className="flex items-center gap-1"><input type="radio" name="recType" value="fixed" checked={recurringType === 'fixed'} onChange={(e) => setRecurringType(e.target.value)} /> Fixo</label>
                    <label className="flex items-center gap-1"><input type="radio" name="recType" value="variable" checked={recurringType === 'variable'} onChange={(e) => setRecurringType(e.target.value)} /> Variável</label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      {recurringType === 'installment' ? 'Quantas parcelas no total?' : 'Projetar por quantos meses?'}
                    </label>
                    <input type="number" min="2" max="120" value={recurringCount} onChange={(e) => setRecurringCount(parseInt(e.target.value) || 2)} className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm" required />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl">Salvar Lançamento</button>
          </form>
        </div>
        <CalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} onApply={(val) => { const f = formatCurrencyInput(Math.round(val * 100)); setDisplayAmount(f); setAmount(val); }} />
      </div>
    );
  };

  // --- ABA 4: INVESTIMENTOS (B3) ---
  const InvestmentsTab = () => {
    const [prices, setPrices] = useState<any>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [tickerInput, setTickerInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('');
    const [displayUnitPrice, setDisplayUnitPrice] = useState('');
    const [buyDateInput, setBuyDateInput] = useState(new Date().toISOString().substring(0, 10));

    const refreshQuotes = async () => {
      if (investments.length === 0) return;
      setIsRefreshing(true);
      const tickers = Array.from(new Set(investments.map((i: any) => i.ticker.toUpperCase()))).join(',');
      try {
        const res = await fetch(`https://brapi.dev/api/quote/${tickers}`);
        const data = await res.json();
        if (data?.results) {
          const map: any = {};
          data.results.forEach((r: any) => map[r.symbol] = r.regularMarketPrice);
          setPrices(map);
        }
      } catch (err) { console.error(err); } finally { setIsRefreshing(false); }
    };

    useEffect(() => { if (investments.length > 0) refreshQuotes(); }, [investments.length]);

    const handleSaveAsset = async (e: React.FormEvent) => {
      e.preventDefault();
      const tickerClean = tickerInput.trim().toUpperCase();
      const qty = parseFloat(quantityInput);
      const price = parseCurrencyToNumber(displayUnitPrice);
      if (!tickerClean || qty <= 0 || price <= 0) return;

      await addDoc(collection(db, 'users', user.uid, 'investments'), {
        ticker: tickerClean, type: tickerClean.endsWith('11') ? 'FII' : 'Ação', quantity: qty, unitPrice: price, buyDate: buyDateInput
      });
      setTickerInput(''); setQuantityInput(''); setDisplayUnitPrice(''); setIsAddOpen(false);
    };

    let totalInvested = 0; let totalMarketValue = 0;
    investments.forEach((inv: any) => {
      const invested = inv.quantity * inv.unitPrice;
      const currentPrice = prices[inv.ticker] || inv.unitPrice;
      totalInvested += invested; totalMarketValue += (inv.quantity * currentPrice);
    });
    const profit = totalMarketValue - totalInvested;

    return (
      <div className="p-4 space-y-4 pb-28">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-3xl shadow-lg relative">
          <div className="flex justify-between items-start mb-2">
            <div><span className="text-xs text-blue-200">Patrimônio Atual</span><p className="text-3xl font-extrabold">R$ {totalMarketValue.toFixed(2)}</p></div>
            <button onClick={refreshQuotes} className={`p-2 rounded-xl bg-white/10 ${isRefreshing ? 'animate-spin' : ''}`}><Icons.Refresh size={18} className="text-white" /></button>
          </div>
          <div className="flex justify-between text-xs mt-3 pt-3 border-t border-white/10">
            <div><span className="text-blue-300">Investido</span><p className="font-semibold">R$ {totalInvested.toFixed(2)}</p></div>
            <div className="text-right"><span className="text-blue-300">Lucro</span><p className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {profit.toFixed(2)}</p></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-base">Ativos</h3>
          <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">+ Novo Ativo</button>
        </div>

        {investments.map((inv: any) => {
          const currentPrice = prices[inv.ticker] || inv.unitPrice;
          const currentVal = inv.quantity * currentPrice;
          return (
            <div key={inv.id} className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-900">{inv.ticker} <span className="text-[10px] bg-gray-100 px-1 rounded">{inv.type}</span></span>
                  <p className="text-xs text-gray-400 mt-1">{inv.quantity} cotas • PM: R$ {inv.unitPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {currentVal.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Cot: R$ {currentPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {isAddOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4">
              <div className="flex justify-between"><h3 className="font-bold">Adicionar Ativo B3</h3><button onClick={() => setIsAddOpen(false)}>✕</button></div>
              <form onSubmit={handleSaveAsset} className="space-y-3 text-sm">
                <input type="text" placeholder="Ticker (Ex: PETR4)" value={tickerInput} onChange={(e) => setTickerInput(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl uppercase" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Qtd" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                  <input type="text" placeholder="Preço Médio" value={displayUnitPrice} onChange={(e) => setDisplayUnitPrice(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-gray-50 border rounded-xl" required />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-2">Salvar Ativo</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ABA 5: HISTÓRICO & EXTRATO ---
  const HistoryTab = () => (
    <div className="p-4 space-y-3 pb-24">
      <h2 className="font-bold text-gray-800 text-lg">Histórico & Faturas</h2>
      <ul className="space-y-2">
        {transactions.map((tx: any) => (
          <li key={tx.id} className="bg-white p-3.5 rounded-2xl border shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{tx.description}</p>
              <p className="text-xs text-gray-400">{tx.date} • {tx.method} {tx.isRecurring ? `• ${tx.recurringType}` : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'income' ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2)}</span>
              <button onClick={() => deleteDoc(doc(db, 'users', user.uid, 'transactions', tx.id))} className="text-gray-300 hover:text-red-500"><Icons.Trash size={16} /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full"><Icons.Wallet size={32} className="mx-auto text-blue-600 mb-4"/>
        <h1 className="text-2xl font-bold mb-6">Finanças & Carteira</h1>
        <button onClick={handleGoogleLogin} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Entrar com Google</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col font-sans">
      <header className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">{user.displayName?.charAt(0)}</div><span className="font-bold text-sm truncate">{user.displayName}</span></div>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 font-semibold">Sair</button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'collections' && <CollectionsTab />}
        {activeTab === 'add' && <AddTab />}
        {activeTab === 'investments' && <InvestmentsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around items-center h-16 px-1 z-20">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center w-12 ${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}><Icons.Wallet size={19} /><span className="text-[9px] mt-1">Início</span></button>
        <button onClick={() => setActiveTab('collections')} className={`flex flex-col items-center w-12 ${activeTab === 'collections' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}><Icons.Users size={19} /><span className="text-[9px] mt-1">Divisão</span></button>
        <div className="relative -top-4">
          <button onClick={() => setActiveTab('add')} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><Icons.Plus size={22} /></button>
        </div>
        <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center w-12 ${activeTab === 'investments' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}><Icons.TrendingUp size={19} /><span className="text-[9px] mt-1">Ativos</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center w-12 ${activeTab === 'history' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}><Icons.Calendar size={19} /><span className="text-[9px] mt-1">Extrato</span></button>
      </nav>
    </div>
  );
}

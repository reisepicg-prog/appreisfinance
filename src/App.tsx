import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';

// --- Auto-Injeção do Tailwind CSS e Configuração do Modo Escuro ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-script')) {
  const configScript = document.createElement('script');
  configScript.innerHTML = `tailwind.config = { darkMode: 'class' }`;
  document.head.appendChild(configScript);
  
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
  Home: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Plus: ({ size = 24, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  CreditCard: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Calendar: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Trash: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  CheckCircle: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Message: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Cloud: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
  Wallet: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Settings: ({ size = 24, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Download: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Upload: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  TrendingUp: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Refresh: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>,
  ChevronDown: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronUp: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  Filter: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Check: ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  QrCode: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Sun: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
};

// --- Gerador Oficial de PIX BR Code (Copia e Cola) ---
const generatePixPayload = (pixKey: string, amount: number, merchantName: string = 'Recebedor') => {
  const formatLen = (id: string, value: string) => {
      const valStr = String(value);
      return id + String(valStr.length).padStart(2, '0') + valStr;
  };
  const cleanName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").substring(0, 25).trim();
  const payloadFormat = formatLen('00', '01');
  const gui = formatLen('00', 'br.gov.bcb.pix');
  const key = formatLen('01', pixKey);
  const merchantAccount = formatLen('26', gui + key);
  const merchantCategory = formatLen('52', '0000');
  const currency = formatLen('53', '986');
  const amountStr = amount ? formatLen('54', amount.toFixed(2)) : '';
  const country = formatLen('58', 'BR');
  const name = formatLen('59', cleanName || 'Recebedor');
  const city = formatLen('60', 'Cidade');
  const additionalData = formatLen('62', formatLen('05', '***'));
  
  let payload = payloadFormat + merchantAccount + merchantCategory + currency + amountStr + country + name + city + additionalData + '6304';
  
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
          else crc = crc << 1;
      }
  }
  const crcStr = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return payload + crcStr;
};

// --- Funções de Formatação ---
const formatCurrencyInput = (value: number | string): string => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
};

const parseCurrencyToNumber = (formattedValue: string): number => {
  const digits = String(formattedValue || '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
};

const formatBRL = (value: number | string): string => {
  return (Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Lista Estática Inteligente para Autocomplete (B3) ---
const POPULAR_TICKERS = ["AAPL34", "ABEV3", "ALOS3", "ARZZ3", "ASAI3", "AZUL4", "B3SA3", "BBAS3", "BBDC3", "BBDC4", "BBSE3", "BPAC11", "BRAP4", "BRFS3", "BRKM5", "CCRO3", "CIEL3", "CMIG4", "COGN3", "CPFE3", "CPLE6", "CRFB3", "CSAN3", "CSNA3", "CVCB3", "CYRE3", "ELET3", "ELET6", "EMBR3", "ENEV3", "ENGI11", "EQTL3", "EZTC3", "FLRY3", "GGBR4", "GOAU4", "GOLL4", "HAPV3", "HGLG11", "HYPE3", "IGTI11", "IRBR3", "ITSA4", "ITUB4", "JBSS3", "KLBN11", "KNRI11", "LREN3", "LWSA3", "MGLU3", "MRFG3", "MRVE3", "MULT3", "MXRF11", "NTCO3", "PCAR3", "PETR3", "PETR4", "PETZ3", "PRIO3", "RADL3", "RAIL3", "RDOR3", "RENT3", "RRRP3", "SANB11", "SBSP3", "SIMH3", "SLCE3", "SOMA3", "SUZB3", "TAEE11", "TIMS3", "TOTS3", "UGPA3", "USIM5", "VALE3", "VAMO3", "VBBR3", "VILG11", "VISC11", "VIVT3", "WEGE3", "XPLG11", "XPML11", "YDUQ3"];

// --- Modal da Calculadora Rápida ---
const CalculatorModal = ({ isOpen, onClose, onApply }: { isOpen: boolean; onClose: () => void; onApply: (val: number) => void }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999] overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1"><span>🧮</span> Calculadora</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold px-2 py-1">✕</button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-3 mb-4 text-right">
          <div className="text-xs text-gray-400 h-4 font-mono">{history}</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-mono overflow-x-auto">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button type="button" onClick={handleClear} className={`${btnClass} bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50`}>C</button>
          <button type="button" onClick={handleBackspace} className={`${btnClass} bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600`}>⌫</button>
          <button type="button" onClick={() => handleOp('÷')} className={`${btnClass} bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/50`}>÷</button>
          <button type="button" onClick={() => handleOp('×')} className={`${btnClass} bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/50`}>×</button>
          <button type="button" onClick={() => handleNum('7')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>7</button>
          <button type="button" onClick={() => handleNum('8')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>8</button>
          <button type="button" onClick={() => handleNum('9')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>9</button>
          <button type="button" onClick={() => handleOp('-')} className={`${btnClass} bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/50`}>-</button>
          <button type="button" onClick={() => handleNum('4')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>4</button>
          <button type="button" onClick={() => handleNum('5')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>5</button>
          <button type="button" onClick={() => handleNum('6')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>6</button>
          <button type="button" onClick={() => handleOp('+')} className={`${btnClass} bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/50`}>+</button>
          <button type="button" onClick={() => handleNum('1')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>1</button>
          <button type="button" onClick={() => handleNum('2')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>2</button>
          <button type="button" onClick={() => handleNum('3')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>3</button>
          <button type="button" onClick={handleCalculate} className={`${btnClass} row-span-2 bg-blue-600 text-white hover:bg-blue-700 h-[96px]`}>=</button>
          <button type="button" onClick={() => handleNum('0')} className={`${btnClass} col-span-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>0</button>
          <button type="button" onClick={() => handleNum(',')} className={`${btnClass} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600`}>,</button>
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
  const [investments, setInvestments] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loginError, setLoginError] = useState('');

  // --- MODO ESCURO ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
     if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
     return false;
  });
  
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = theme;
    document.body.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(current => !current);
  };

  // --- Estados de Memória (Persistência dos Filtros nas Abas) ---
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [filtersColl, setFiltersColl] = useState({ month: currentMonthStr, person: 'all', status: 'all' });
  const [filtersHist, setFiltersHist] = useState({ month: 'all', type: 'all', person: 'all' });

  // --- Listas Inteligentes de Memória (Autocomplete) ---
  const allDescriptions = Array.from(new Set((transactions || []).map(t => {
      let d = String(t?.desc || '');
      d = d.replace(/\s\(\d+\/\d+\)$/, ''); 
      d = d.replace(/\s\(Mês\s\d+\)$/, ''); 
      return d.trim();
  }))).filter(Boolean).sort() as string[];
  
  const allSplitNames = Array.from(new Set((transactions || []).flatMap(t => t?.splits?.map((s: any) => String(s?.name || '')) || []))).filter(Boolean).sort() as string[];
  const allBrokers = Array.from(new Set((investments || []).map((i: any) => String(i?.broker || '')))).filter(Boolean).sort() as string[];
  const allOwnedTickers = Array.from(new Set((investments || []).map((i: any) => String(i?.ticker || '').toUpperCase()))).filter(Boolean) as string[];
  const mergedTickersForSearch = Array.from(new Set([...allOwnedTickers, ...POPULAR_TICKERS])).sort() as string[];

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
    try { await signInWithPopup(auth, provider); } 
    catch (error) { console.error("Erro no login:", error); setLoginError("Erro ao fazer login. Tente novamente."); }
  };

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    if (!user) return;

    const txQuery = query(collection(db, 'users', user.uid, 'transactions'));
    const unsubscribeTxs = onSnapshot(txQuery, (snapshot) => {
      const txs: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txs.sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
      setTransactions(txs);
      setIsLoading(false);
    }, console.error);

    const cardsQuery = query(collection(db, 'users', user.uid, 'cards'));
    const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    const invQuery = query(collection(db, 'users', user.uid, 'investments'));
    const unsubscribeInv = onSnapshot(invQuery, (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, console.error);

    const salesQuery = query(collection(db, 'users', user.uid, 'salesHistory'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const sales: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sales.sort((a, b) => new Date(b?.saleDate || 0).getTime() - new Date(a?.saleDate || 0).getTime());
      setSalesHistory(sales);
    }, console.error);

    return () => { unsubscribeTxs(); unsubscribeCards(); unsubscribeInv(); unsubscribeSales(); };
  }, [user]);

  const handleDeleteDoc = async (id: string) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'users', user.uid, 'transactions', id)); } 
    catch(e) { console.error(e) }
  };

  // ==========================================
  // COMPONENTES DAS ABAS
  // ==========================================

  const Dashboard = () => {
    const availableMonths = Array.from(new Set((transactions || []).map(tx => {
        const d = new Date(tx?.date || '');
        if (isNaN(d.getTime())) return '';
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).filter(m => m !== '').sort().reverse() as string[];

    const [viewMode, setViewMode] = useState('month'); 
    const [selectedMonth, setSelectedMonth] = useState(
        availableMonths.includes(currentMonthStr) ? currentMonthStr : (availableMonths[0] || currentMonthStr)
    );

    const filteredTxs = viewMode === 'all' 
        ? transactions 
        : (transactions || []).filter(tx => String(tx?.date || '').startsWith(selectedMonth));

    const incomes = filteredTxs.filter(tx => String(tx?.type) === 'income');
    const expenses = filteredTxs.filter(tx => String(tx?.type) !== 'income');

    // Cálculos de Planejado e Executado
    const plannedIncomes = incomes.reduce((acc, curr) => acc + (parseFloat(curr?.totalAmount) || 0), 0);
    const paidIncomes = incomes.filter(tx => tx?.status === 'paid').reduce((acc, curr) => acc + (parseFloat(curr?.totalAmount) || 0), 0);
    const incomeProgress = plannedIncomes > 0 ? (paidIncomes / plannedIncomes) * 100 : 0;

    const plannedExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr?.myAmount) || 0), 0);
    const paidExpenses = expenses.filter(tx => tx?.status === 'paid').reduce((acc, curr) => acc + (parseFloat(curr?.myAmount) || 0), 0);
    const expenseProgress = plannedExpenses > 0 ? (paidExpenses / plannedExpenses) * 100 : 0;

    const saldoAtual = paidIncomes - paidExpenses;
    const saldoProjetado = plannedIncomes - plannedExpenses;

    const totalReceivables = expenses.reduce((acc, curr) => {
      const splitTotal = (curr?.splits || []).reduce((sAcc: number, sCurr: any) => sAcc + (sCurr?.paid ? 0 : (parseFloat(sCurr?.amount) || 0)), 0);
      return acc + splitTotal;
    }, 0);

    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Visão Geral</h2>
          <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Por Mês</button>
            <button onClick={() => setViewMode('all')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'all' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Geral</button>
          </div>
        </div>

        {viewMode === 'month' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mês de Referência:</span>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 px-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableMonths.length === 0 && <option value={selectedMonth}>{selectedMonth}</option>}
              {availableMonths.map(month => {
                  const [y, m] = (month as string).split('-');
                  return <option key={month as string} value={month as string}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
        )}
        
        {/* Painéis de Saldo Real x Projetado */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-blue-600 p-5 rounded-xl text-white shadow-md relative overflow-hidden">
              <span className="text-xs text-blue-200 font-medium">Saldo Atual (Efetivado)</span>
              <p className="text-2xl font-bold mt-1">R$ {formatBRL(saldoAtual)}</p>
              <Icons.Wallet size={20} className="hidden" />
              <div className="absolute -right-3 -bottom-3 text-blue-500 opacity-30 transform scale-[4]">
                <Icons.Wallet size={20} />
              </div>
           </div>
           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm relative overflow-hidden">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Projeção do Mês</span>
              <p className={`text-2xl font-bold mt-1 ${saldoProjetado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>R$ {formatBRL(saldoProjetado)}</p>
              <Icons.TrendingUp size={20} className="hidden" />
              <div className="absolute -right-3 -bottom-3 text-gray-100 dark:text-gray-700 transform scale-[4]">
                <Icons.TrendingUp size={20} />
              </div>
           </div>
        </div>

        {/* Barras de Progresso */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-end mb-2">
             <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Receitas</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recebido <strong className="text-emerald-600 dark:text-emerald-400">R$ {formatBRL(paidIncomes)}</strong> de R$ {formatBRL(plannedIncomes)}</p>
             </div>
             <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{isNaN(incomeProgress) ? 0 : incomeProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
             <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, incomeProgress || 0))}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-end mb-2">
             <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Despesas</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pago <strong className="text-red-600 dark:text-red-400">R$ {formatBRL(paidExpenses)}</strong> de R$ {formatBRL(plannedExpenses)}</p>
             </div>
             <span className="text-sm font-bold text-red-600 dark:text-red-400">{isNaN(expenseProgress) ? 0 : expenseProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
             <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, expenseProgress || 0))}%` }}></div>
          </div>
        </div>

        {/* Divisões a Receber */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm flex justify-between items-center">
           <div>
              <h3 className="text-blue-800 dark:text-blue-300 text-sm font-bold mb-1">A Receber de Terceiros</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400">Aguardando pagamento / Pix</p>
           </div>
           <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">R$ {formatBRL(totalReceivables)}</p>
        </div>
      </div>
    );
  };

  const CardsManagement = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [cardForm, setCardForm] = useState({ name: '', brand: 'Conta/Pix', closingDay: '', dueDay: '', limit: 0, cashbackPct: 0, obs: '', pixKey: '', isDefaultPix: false });
    const [displayLimit, setDisplayLimit] = useState('');

    const handleSaveCard = async (e: any) => {
      e.preventDefault();
      if (!user) return;
      try {
        const cardData = {
          name: cardForm.name, brand: cardForm.brand, closingDay: cardForm.closingDay || '', dueDay: cardForm.dueDay || '',
          limit: parseCurrencyToNumber(displayLimit) || 0, cashbackPct: parseFloat(cardForm.cashbackPct as any) || 0,
          obs: cardForm.obs || '', pixKey: cardForm.pixKey || '', isDefaultPix: cardForm.isDefaultPix
        };

        if (cardData.isDefaultPix) {
           const others = cards.filter(c => c.isDefaultPix && c.id !== editingId);
           for (const o of others) {
              await updateDoc(doc(db, 'users', user.uid, 'cards', o.id), { isDefaultPix: false });
           }
        }

        if (editingId) {
           await updateDoc(doc(db, 'users', user.uid, 'cards', editingId), cardData);
        } else {
           await addDoc(collection(db, 'users', user.uid, 'cards'), cardData);
        }

        setIsAdding(false); setEditingId(null); setDisplayLimit('');
        setCardForm({ name: '', brand: 'Conta/Pix', closingDay: '', dueDay: '', limit: 0, cashbackPct: 0, obs: '', pixKey: '', isDefaultPix: false });
      } catch (err) { console.error(err); }
    };

    const handleDeleteCard = async (id: string) => {
      if (!user) return;
      if (window.confirm("Deseja realmente excluir este cartão/conta?")) {
         try { await deleteDoc(doc(db, 'users', user.uid, 'cards', id)); } 
         catch (err) { console.error(err); }
      }
    };

    const openEditCard = (c: any) => {
       setEditingId(c.id);
       setCardForm({
          name: c.name || '', brand: c.brand || 'Conta/Pix', closingDay: c.closingDay || '', dueDay: c.dueDay || '',
          limit: c.limit || 0, cashbackPct: c.cashbackPct || 0, obs: c.obs || '', pixKey: c.pixKey || '', isDefaultPix: c.isDefaultPix || false
       });
       setDisplayLimit(formatCurrencyInput(Math.round((c.limit || 0) * 100)));
       setIsAdding(true);
       window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
       setIsAdding(false); setEditingId(null); setDisplayLimit('');
       setCardForm({ name: '', brand: 'Conta/Pix', closingDay: '', dueDay: '', limit: 0, cashbackPct: 0, obs: '', pixKey: '', isDefaultPix: false });
    };

    return (
      <div className="animate-fadeIn pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contas e Cartões</h2>
          <button onClick={() => isAdding ? cancelEdit() : setIsAdding(true)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isAdding ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
            {isAdding ? 'Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSaveCard} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2">{editingId ? 'Editar Conta/Cartão' : 'Nova Conta ou Cartão'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome (Instituição)</label>
                <input required type="text" value={cardForm.name} onChange={e => setCardForm({...cardForm, name: e.target.value})} placeholder="Ex: Nubank, Itaú..." className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Limite (0 = Conta)</label>
                <input type="text" inputMode="numeric" value={displayLimit} onChange={e => setDisplayLimit(formatCurrencyInput(e.target.value))} placeholder="R$ 0,00" className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bandeira / Tipo</label>
                <select value={cardForm.brand} onChange={e => setCardForm({...cardForm, brand: e.target.value})} className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100">
                  <option value="Conta/Pix">Somente Conta</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Visa">Visa</option>
                  <option value="Elo">Elo</option>
                  <option value="Amex">Amex</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dia Fechamento</label>
                <input type="number" min="1" max="31" value={cardForm.closingDay} onChange={e => setCardForm({...cardForm, closingDay: e.target.value})} placeholder="Opcional" className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dia Vencimento</label>
                <input type="number" min="1" max="31" value={cardForm.dueDay} onChange={e => setCardForm({...cardForm, dueDay: e.target.value})} placeholder="Opcional" className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
              </div>
              <div className="col-span-2 border-t dark:border-gray-700 pt-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Chave Pix da Instituição</label>
                <input type="text" value={cardForm.pixKey} onChange={e => setCardForm({...cardForm, pixKey: e.target.value})} placeholder="CPF, Email..." className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
                <label className="flex items-center gap-2 mt-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                   <input type="checkbox" checked={cardForm.isDefaultPix} onChange={e => setCardForm({...cardForm, isDefaultPix: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                   Chave Pix Padrão para cobranças
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cashback (%)</label>
                <input type="number" step="0.01" value={cardForm.cashbackPct} onChange={e => setCardForm({...cardForm, cashbackPct: e.target.value as any})} placeholder="Ex: 1.5" className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea rows={2} value={cardForm.obs} onChange={e => setCardForm({...cardForm, obs: e.target.value})} placeholder="Detalhes..." className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 dark:text-gray-100"></textarea>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors">Salvar</button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {cards.map(c => {
            const usedLimit = (transactions || [])
              .filter(tx => tx?.methodId === c.id && tx?.status !== 'paid')
              .reduce((acc, tx) => acc + (parseFloat(tx?.totalAmount) || 0), 0);
            const cardLimit = parseFloat(c.limit) || 0;
            const availableLimit = cardLimit - usedLimit;
            const availablePct = cardLimit > 0 ? (availableLimit / cardLimit) * 100 : 0;
            const isCard = cardLimit > 0;

            return (
              <div key={c.id} className={`bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-sm flex flex-col group transition-colors ${c.isDefaultPix ? 'border-blue-400 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCard ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {isCard ? <Icons.CreditCard size={20} /> : <Icons.Wallet size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                         {c.name} 
                         {c.isDefaultPix && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1"><Icons.Check size={16} /> Pix Padrão</span>}
                      </h3>
                      {isCard ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fecha {c.closingDay} • Vence {c.dueDay} {c.brand !== 'Conta/Pix' && `(${c.brand})`}</p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Conta Bancária / Corretora</p>
                      )}
                      {(parseFloat(c.cashbackPct) || 0) > 0 && <p className="text-xs text-green-600 dark:text-green-400 font-medium">{c.cashbackPct}% de Cashback</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => openEditCard(c)} className="p-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Icons.Edit size={16} /></button>
                     <button onClick={() => handleDeleteCard(c.id)} className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Icons.Trash size={16} /></button>
                  </div>
                </div>

                {c.pixKey && (
                  <div className="text-xs bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 mb-3 flex items-center gap-2">
                     <span className="font-bold text-gray-600 dark:text-gray-400">Pix:</span> <span className="text-gray-800 dark:text-gray-200">{c.pixKey}</span>
                  </div>
                )}
                {c.obs && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-200 dark:border-gray-600 pl-2 mb-3">
                     {c.obs}
                  </div>
                )}

                {isCard && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Limite Disponível</span>
                      <span className={`font-bold ${availableLimit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>R$ {formatBRL(availableLimit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full ${availableLimit < (cardLimit*0.2) ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, Math.max(0, availablePct))}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Utilizado: R$ {formatBRL(usedLimit)}</span>
                      <span>Total: R$ {formatBRL(cardLimit)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {cards.length === 0 && !isAdding && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">Nenhum registro cadastrado ainda.</p>
          )}
        </div>
      </div>
    );
  };

  const TransactionForm = () => {
    const [txType, setTxType] = useState('expense');
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState<number | ''>(''); 
    const [displayAmount, setDisplayAmount] = useState('');
    const [calcTarget, setCalcTarget] = useState<any>(null);

    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [firstInstallmentDate, setFirstInstallmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [methodId, setMethodId] = useState('pix');
    const [installments, setInstallments] = useState(1);
    const [expenseType, setExpenseType] = useState('installment');
    
    const [isSplit, setIsSplit] = useState(false);
    const [autoSplit, setAutoSplit] = useState(true);
    const [includeMe, setIncludeMe] = useState(true);
    const [splits, setSplits] = useState<any[]>([{ name: '', amount: 0, displayAmount: '', paid: false }]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if (txType === 'income' || methodId === 'pix' || cards.length === 0) {
        setFirstInstallmentDate(purchaseDate);
        return;
      }
      const card = cards.find(c => c.id === methodId);
      if (card && (card.limit || 0) > 0) {
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
      } else {
        setFirstInstallmentDate(purchaseDate);
      }
    }, [methodId, purchaseDate, cards, txType]);

    useEffect(() => {
      if (isSplit && autoSplit && amount) {
        const total = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
        const numPeople = splits.length + (includeMe ? 1 : 0);
        if (numPeople > 0) {
            const equalShare = total / numPeople;
            setSplits(prev => prev.map(s => ({ 
              ...s, 
              amount: equalShare, 
              displayAmount: formatCurrencyInput(Math.round(equalShare * 100)) 
            })));
        }
      }
    }, [amount, splits.length, isSplit, autoSplit, includeMe]);

    const handleAddSplit = () => setSplits([...splits, { name: '', amount: 0, displayAmount: '', paid: false }]);
    const handleRemoveSplit = (index: number) => setSplits(splits.filter((_, i) => i !== index));
    
    const handleSplitChange = (index: number, field: string, value: any) => {
      const newSplits = [...splits];
      if (field === 'displayAmount') {
         const fmt = formatCurrencyInput(value);
         newSplits[index].displayAmount = fmt;
         newSplits[index].amount = parseCurrencyToNumber(fmt);
         setAutoSplit(false);
      } else {
         newSplits[index][field] = value;
      }
      setSplits(newSplits);
    };

    const totalSplits = splits.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const parsedTotalAmount = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
    const myShare = includeMe ? parsedTotalAmount - totalSplits : 0;

    const handleSubmit = async (e: any) => {
      e.preventDefault();
      if (!user) return;
      if (!desc || !amount) { setErrorMsg("Preencha descrição e valor total."); return; }
      
      if (txType === 'expense') {
        if (installments < 1) { setErrorMsg("Preencha a quantidade de parcelas."); return; }
        if (isSplit && includeMe && myShare < -0.05) { setErrorMsg("A soma das divisões não pode ser maior que o valor total."); return; }
        if (isSplit && !includeMe && Math.abs(parsedTotalAmount - totalSplits) > 0.05) {
          setErrorMsg("Como você não participa da compra, a soma das divisões deve ser exatamente igual ao valor total."); return;
        }
      }

      setIsSaving(true); setErrorMsg('');

      try {
        const groupId = Date.now().toString();
        const numPeriods = installments;
        const isRecurring = txType === 'income' || expenseType === 'fixed';
        const selectedCard = cards.find(c => c.id === methodId);
        
        let cardName = 'Pix/Débito';
        if (txType === 'income') cardName = 'Conta / Pix';
        else if (selectedCard) cardName = selectedCard.name;
        
        const finalMethodId = txType === 'income' ? 'pix' : methodId;

        for (let i = 0; i < numPeriods; i++) {
            let formattedDate;
            if (txType === 'income' || methodId === 'pix' || (selectedCard && !(selectedCard.limit > 0))) {
                const d = new Date(purchaseDate + 'T12:00:00'); d.setMonth(d.getMonth() + i); formattedDate = d.toISOString().split('T')[0];
            } else {
                const d = new Date(firstInstallmentDate + 'T12:00:00'); d.setMonth(d.getMonth() + i); formattedDate = d.toISOString().split('T')[0];
            }

            const suffix = numPeriods > 1 ? ` (${i + 1}/${numPeriods})` : '';
            const instTotalAmt = isRecurring ? parsedTotalAmount : (parsedTotalAmount / numPeriods);
            const instMyAmt = isRecurring ? (isSplit ? myShare : parsedTotalAmount) : ((isSplit ? myShare : parsedTotalAmount) / numPeriods);
            
            const instSplits = isSplit 
              ? splits.filter(s => s.name).map(s => ({
                  name: String(s.name || ''),
                  amount: isRecurring ? (parseFloat(s.amount) || 0) : ((parseFloat(s.amount) || 0) / numPeriods),
                  paid: s.paid || false
                }))
              : [];

            const isFuture = formattedDate > new Date().toISOString().split('T')[0];
            const initialStatus = txType === 'income' ? (isFuture ? 'pending' : 'paid') : 'pending';

            const newTx = {
              type: txType, desc: desc + suffix, totalAmount: instTotalAmt, myAmount: instMyAmt, purchaseDate: purchaseDate,
              date: formattedDate, method: cardName, methodId: finalMethodId, splits: instSplits, groupId, status: initialStatus,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(collection(db, 'users', user.uid, 'transactions')), newTx);
        }
        
        setDesc(''); setAmount(''); setDisplayAmount(''); setInstallments(1); setIsSplit(false); setSplits([{ name: '', amount: 0, displayAmount: '', paid: false }]); setExpenseType('installment');
        setActiveTab('history');
      } catch (err) { console.error(err); setErrorMsg("Erro ao salvar."); } finally { setIsSaving(false); }
    };

    return (
      <div className="animate-fadeIn max-w-2xl mx-auto pb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Novo Lançamento</h2>
        
        <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl mb-6">
          <button onClick={() => setTxType('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'expense' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Despesa (Gasto)</button>
          <button onClick={() => setTxType('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'income' ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Receita (Ganho)</button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-sm border ${txType === 'income' ? 'bg-emerald-50/30 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} space-y-5`}>
          {errorMsg && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">{errorMsg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <input 
                 type="text" 
                 value={desc} 
                 onChange={e => setDesc(e.target.value)} 
                 placeholder={txType === 'income' ? "Ex: Salário, Venda" : "Ex: Mercado"} 
                 className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                 list="desc-suggestions"
              />
              <datalist id="desc-suggestions">
                {allDescriptions.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total</label>
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
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                />
                <button type="button" onClick={() => setCalcTarget('main')} className="px-4 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-xl" title="Calculadora">🧮</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{txType === 'income' ? 'Data de Recebimento' : 'Data da Compra'}</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            {txType === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento / Conta</label>
                <select value={methodId} onChange={e => setMethodId(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="pix">Pix / Débito / Dinheiro</option>
                  <optgroup label="Minhas Contas e Cartões">
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{txType === 'income' ? 'Repetir Receita?' : 'Qtd. de Parcelas / Meses'}</label>
              <select value={installments} onChange={e => setInstallments(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm">
                <option value={1}>Não repetir (Mês único)</option>
                {[...Array(35)].map((_, i) => (
                  <option key={i+2} value={i+2}>{i+2} meses</option>
                ))}
              </select>
            </div>
            
            {txType === 'expense' && installments > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comportamento do Valor</label>
                <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm">
                  <option value="installment">Parcelado (Divide os {displayAmount || 'R$ 0,00'} em {installments}x)</option>
                  <option value="fixed">Fixo (Repete os {displayAmount || 'R$ 0,00'} em todos os {installments} meses)</option>
                </select>
              </div>
            )}

            {txType === 'expense' && methodId !== 'pix' && (cards.find(c => c.id === methodId)?.limit || 0) > 0 && (
              <div className={installments > 1 ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vencimento (1ª Parcela)</label>
                <input type="date" value={firstInstallmentDate} onChange={e => setFirstInstallmentDate(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Calculado pelo dia de fechamento.</p>
              </div>
            )}
          </div>

          {txType === 'expense' && (
            <>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="font-bold text-gray-800 dark:text-gray-100">Dividir esta compra?</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded cursor-pointer">
                    <input type="checkbox" checked={includeMe} onChange={e => setIncludeMe(e.target.checked)} />
                    Eu também pago uma parte
                  </label>
                </div>

                {isSplit && (
                  <div className="p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-4">
                    <datalist id="split-names-suggestions">
                      {allSplitNames.map(n => <option key={n} value={n} />)}
                    </datalist>
                    {splits.map((split, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <input 
                               type="text" 
                               placeholder="Nome (Ex: Mãe)" 
                               value={split.name} 
                               onChange={e => handleSplitChange(index, 'name', e.target.value)} 
                               className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm outline-none" 
                               list="split-names-suggestions"
                            />
                          </div>
                          <div className="flex-1 flex gap-1 relative">
                            <input 
                              type="text" 
                              inputMode="numeric" 
                              placeholder="R$ 0,00" 
                              value={split.displayAmount || ''} 
                              onChange={e => handleSplitChange(index, 'displayAmount', e.target.value)} 
                              className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm outline-none font-medium" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setCalcTarget(index)} 
                              className="px-2.5 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-lg flex items-center justify-center"
                              title="Calculadora para Divisão"
                            >
                              🧮
                            </button>
                          </div>
                          <button type="button" onClick={() => handleRemoveSplit(index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer w-max pl-1">
                          <input type="checkbox" checked={split.paid || false} onChange={e => handleSplitChange(index, 'paid', e.target.checked)} className="rounded w-3.5 h-3.5 text-green-600 dark:text-green-500 border-gray-300 dark:border-gray-600 focus:ring-green-500 cursor-pointer" />
                          Esta pessoa já me pagou este valor (ex: via Pix)
                        </label>
                      </div>
                    ))}
                    
                    <button type="button" onClick={handleAddSplit} className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                      <Icons.Plus size={20} /> Adicionar Pessoa
                    </button>

                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Terceiros assumem:</span>
                         <strong className="text-gray-800 dark:text-gray-100">R$ {formatBRL(totalSplits)}</strong>
                      </div>
                      {includeMe ? (
                        <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">Sua parte:</span>
                           <strong className={`text-base ${myShare < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>R$ {formatBRL(Math.max(0, myShare))}</strong>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">Sua parte:</span>
                           <strong className="text-base text-gray-400 dark:text-gray-500">R$ 0,00 (Isento)</strong>
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
          isOpen={calcTarget !== null} 
          onClose={() => setCalcTarget(null)} 
          onApply={(val) => {
            const fmt = formatCurrencyInput(Math.round(val * 100));
            if (calcTarget === 'main') {
              setDisplayAmount(fmt);
              setAmount(val);
            } else if (typeof calcTarget === 'number') {
              handleSplitChange(calcTarget, 'displayAmount', fmt);
            }
          }} 
        />
      </div>
    );
  };

  const CollectionsTab = () => {
    const [qrCodeModal, setQrCodeModal] = useState<any>(null);
    const myPixKey = String(cards.find((card: any) => card.isDefaultPix)?.pixKey || '').trim();

    const availableMonths = Array.from(new Set((transactions || []).map(tx => {
        if (!tx?.date) return '';
        const d = new Date(tx.date);
        if (isNaN(d.getTime())) return '';
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).filter(m => m !== '').sort() as string[];

    const defaultCollectionsMonth = availableMonths.includes(currentMonthStr)
      ? currentMonthStr
      : (availableMonths[availableMonths.length - 1] || currentMonthStr);

    const selectedMonth = filtersColl.month;
    const setSelectedMonth = (month: string) => setFiltersColl(prev => ({ ...prev, month }));
    const filterPerson = filtersColl.person;
    const setFilterPerson = (person: string) => setFiltersColl(prev => ({ ...prev, person }));
    const filterStatus = filtersColl.status;
    const setFilterStatus = (status: string) => setFiltersColl(prev => ({ ...prev, status }));

    useEffect(() => {
      if (filtersColl.month === currentMonthStr && defaultCollectionsMonth !== currentMonthStr) {
        setFiltersColl(prev => prev.month === currentMonthStr ? { ...prev, month: defaultCollectionsMonth } : prev);
      }
    }, [filtersColl.month, currentMonthStr, defaultCollectionsMonth]);

    const debtsByPerson: any = {};
    
    const filteredTransactions = (transactions || []).filter(tx => {
        if (!tx?.date) return false;
        const d = new Date(tx.date);
        if (isNaN(d.getTime())) return false;
        const txMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (selectedMonth !== 'all' && txMonthStr !== selectedMonth) return false;
        return true;
    });

    filteredTransactions.forEach(tx => {
      if(tx.splits) {
        tx.splits.forEach((split: any, splitIndex: number) => {
          if (!split?.name) return;
          if (!debtsByPerson[split.name]) debtsByPerson[split.name] = [];
          debtsByPerson[split.name].push({ 
            txId: tx.id,
            splitIndex: splitIndex,
            desc: tx.desc || '', 
            amount: split.amount || 0, 
            date: tx.date || '',
            paid: split.paid || false
          });
        });
      }
    });

    filteredTransactions.forEach(tx => {
      if (tx.type === 'expense' && (parseFloat(tx.myAmount) || 0) > 0) {
        if (!debtsByPerson['Eu']) debtsByPerson['Eu'] = [];
        debtsByPerson['Eu'].push({
          txId: tx.id,
          splitIndex: -1,
          desc: tx.desc || '',
          amount: parseFloat(tx.myAmount) || 0,
          date: tx.date || '',
          paid: tx.myPaid || false
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
        if (splitIndex === -1) {
          await updateDoc(doc(db, 'users', user.uid, 'transactions', txId), { myPaid: !currentStatus });
          return;
        }
        const updatedSplits = [...(tx.splits || [])];
        updatedSplits[splitIndex].paid = !currentStatus;
        await updateDoc(doc(db, 'users', user.uid, 'transactions', txId), {
          splits: updatedSplits
        });
      } catch (err) { console.error(err); }
    };

    const handleMarkPersonPaid = async (name: string, items: any[]) => {
      if (!user) return;
      try {
        const updatesByTransaction = new Map<string, any>();
        items.filter(item => !item.paid).forEach(item => {
          const tx = transactions.find(t => t.id === item.txId);
          if (!tx) return;
          if (item.splitIndex === -1) {
            updatesByTransaction.set(tx.id, { myPaid: true });
            return;
          }
          const changes = updatesByTransaction.get(tx.id) || { splits: [...(tx.splits || [])] };
          if (changes.splits[item.splitIndex]) changes.splits[item.splitIndex].paid = true;
          updatesByTransaction.set(tx.id, changes);
        });
        await Promise.all(Array.from(updatesByTransaction.entries()).map(([txId, changes]) =>
          updateDoc(doc(db, 'users', user.uid, 'transactions', txId), changes)
        ));
      } catch (err) { console.error(err); }
    };

    const handleWhatsApp = (name: string, items: any[]) => {
      const unpaidItems = items.filter(i => !i.paid);
      if (unpaidItems.length === 0) return;

      const total = unpaidItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      let text = `Olá, aqui é o resumo das suas contas comigo:\n\n`;
      unpaidItems.forEach(item => {
        const dateFormatted = new Date(item.date).toLocaleDateString('pt-BR');
        text += `- ${item.desc} (Venc: ${dateFormatted}): R$ ${formatBRL(item.amount)}\n`;
      });
      text += `\n*Total a pagar: R$ ${formatBRL(total)}*`;

      if (myPixKey) {
         text += `\n\n*Minha chave Pix:* ${myPixKey}`;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const openQrCode = (name: string, items: any[]) => {
      const unpaidItems = items.filter(i => !i.paid);
      const total = unpaidItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      
      if (!myPixKey) {
         alert("Configure uma Chave Pix Padrão na aba Cartões para gerar o QR Code.");
         return;
      }
      
      if (total > 0) {
        const payloadStr = generatePixPayload(myPixKey, total, user?.displayName || 'Recebedor');
        setQrCodeModal({ name, total, payload: payloadStr });
      }
    };

    return (
      <div className="animate-fadeIn pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fechamento e Cobranças</h2>
          {(filtersColl.month !== defaultCollectionsMonth || filtersColl.person !== 'all' || filtersColl.status !== 'all') && (
            <button onClick={() => setFiltersColl({ month: defaultCollectionsMonth, person: 'all', status: 'all' })} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg font-medium transition-colors">Limpar Filtros</button>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Mês</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os Meses</option>
              {availableMonths.map(month => {
                  const [y, m] = (month as string).split('-');
                  return <option key={month as string} value={month as string}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Pessoa</label>
            <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todas as Pessoas</option>
              {allPeopleNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="pending">Só Pendentes</option>
              <option value="paid">Só Pagos</option>
            </select>
          </div>
        </div>
        
        {peopleToRender.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum valor encontrado com estes filtros.</p>
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
              const totalOwed = unpaidItems.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
              const isAllPaid = filteredItems.length > 0 && unpaidItems.length === 0;

              return (
                <div key={name} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-3">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{name}</h3>
                    {isAllPaid ? (
                      <span className="font-bold text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg">Tudo Pago!</span>
                    ) : (
                      <span className="font-bold text-blue-600 dark:text-blue-400">Restante: R$ {formatBRL(totalOwed)}</span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {filteredItems.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded-lg ${item.paid ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/20'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <input 
                            type="checkbox" 
                            checked={item.paid} 
                            onChange={() => toggleSplitPaid(item.txId, item.splitIndex, item.paid)}
                            className="w-4 h-4 text-green-600 dark:text-green-500 rounded border-gray-300 dark:border-gray-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                          />
                          <span className={`truncate ${item.paid ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                            {item.desc}
                          </span>
                        </div>
                        <span className={`${item.paid ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100 font-medium'}`}>
                          R$ {formatBRL(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!isAllPaid && (
                    <div className="flex gap-2">
                       <button onClick={() => handleWhatsApp(name, filteredItems)} className="flex-1 bg-[#25D366] hover:bg-[#20b858] text-white py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors">
                         <Icons.Message size={20} /> Cobrar
                       </button>
                       <button onClick={() => openQrCode(name, filteredItems)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors">
                          <Icons.QrCode size={20} />
                       </button>
                       <button onClick={() => handleMarkPersonPaid(name, filteredItems)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors text-xs">
                          <Icons.Check size={18} /> Marcar tudo como pago
                       </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {qrCodeModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999] overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">Cobrar {qrCodeModal.name}</h3>
                  <button onClick={() => setQrCodeModal(null)} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-bold px-2 py-1">✕</button>
               </div>
               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">R$ {formatBRL(qrCodeModal.total)}</p>
               
               <div className="bg-gray-50 dark:bg-gray-100 p-4 rounded-xl flex justify-center mb-4 border border-gray-100 dark:border-gray-200">
                  <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeModal.payload)}`} 
                     alt="QR Code Pix" 
                     className="w-48 h-48"
                  />
               </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Chave: <b className="text-gray-800 dark:text-gray-200">{myPixKey}</b></p>
               
               <button 
                  onClick={() => {
                     navigator.clipboard.writeText(qrCodeModal.payload);
                     alert("Pix Copia e Cola copiado para a área de transferência!");
                  }} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
               >
                  Copiar Pix Copia e Cola
               </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InvestmentsTab = () => {
    const [prices, setPrices] = useState<any>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState('');
    const [filterBroker, setFilterBroker] = useState('Geral');
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [sellingAsset, setSellingAsset] = useState<any>(null);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [expandedTickers, setExpandedTickers] = useState<string[]>([]);

    const [isSavingAsset, setIsSavingAsset] = useState(false);
    const [assetError, setAssetError] = useState('');

    const [tickerInput, setTickerInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('');
    const [displayUnitPrice, setDisplayUnitPrice] = useState('');
    const [brokerInput, setBrokerInput] = useState('');
    const [buyDateInput, setBuyDateInput] = useState(new Date().toISOString().substring(0, 10));

    const [sellQuantity, setSellQuantity] = useState('');
    const [displaySellUnitPrice, setDisplaySellUnitPrice] = useState('');
    const [displaySellFees, setDisplaySellFees] = useState('');
    const [sellDate, setSellDate] = useState(new Date().toISOString().substring(0, 10));

    useEffect(() => {
      if (isAddOpen || editingAsset || sellingAsset) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
    }, [isAddOpen, editingAsset, sellingAsset]);

    const investmentsToRender = filterBroker === 'Geral' ? investments : investments.filter(inv => inv.broker === filterBroker);

    const groupedInvestments = Object.values(investmentsToRender.reduce((acc: any, inv: any) => {
      if (!acc[inv.ticker]) {
        acc[inv.ticker] = {
          ticker: inv.ticker, type: inv.type, companyName: inv.companyName || inv.ticker,
          totalQuantity: 0, totalInvested: 0, lots: []
        };
      }
      acc[inv.ticker].totalQuantity += inv.quantity;
      acc[inv.ticker].totalInvested += (inv.quantity * inv.unitPrice);
      acc[inv.ticker].lots.push(inv);
      return acc;
    }, {})).map((g: any) => {
      g.averagePM = g.totalQuantity > 0 ? (g.totalInvested / g.totalQuantity) : 0;
      g.lots.sort((a: any, b: any) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime());
      return g;
    });

    const CACHE_KEY = 'brapi_quotes';
    const CACHE_TTL = 15 * 60 * 1000; 

    const refreshQuotes = async (force = false) => {
      if (investments.length === 0) return;
      
      const tickers = Array.from(new Set(investments.map((i: any) => i.ticker.toUpperCase()))).join(',');
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const now = Date.now();

      if (!force && cached.timestamp && (now - cached.timestamp < CACHE_TTL)) {
         setPrices(cached.prices || {});
         setLastSync(cached.lastSync + ' (Cache)');
         return;
      }

      setIsRefreshing(true);
      setLastSync('Atualizando...');
      try {
        const res = await fetch(`https://brapi.dev/api/quote/${tickers}`);
        if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'api_error');
        const data = await res.json();
        
        if (data && data.results) {
          const map: any = {};
          data.results.forEach((r: any) => { map[r.symbol] = r.regularMarketPrice; });
          setPrices(map);
          const syncTime = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          setLastSync(syncTime);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now, prices: map, lastSync: syncTime }));
        } else {
           throw new Error('invalid_data');
        }
      } catch (err: any) { 
        console.error("Brapi fetch error:", err);
        if (cached.prices) {
           setPrices(cached.prices);
           setLastSync(cached.lastSync + (err.message === 'rate_limit' ? ' (Limite da API)' : ' (Offline)'));
        } else {
           setLastSync(err.message === 'rate_limit' ? "Erro (Limite de consultas da API)" : "Erro de conexão com B3");
        }
      } finally { setIsRefreshing(false); }
    };

    useEffect(() => {
      if (groupedInvestments.length > 0 && Object.keys(prices).length === 0 && !isRefreshing) {
        refreshQuotes();
      }
    }, [investments.length]); 

    const handleSaveAsset = async (e: any) => {
      e.preventDefault();
      if (!user) return;
      setAssetError('');
      setIsSavingAsset(true);

      const tickerClean = tickerInput.trim().toUpperCase();
      const qty = parseFloat(quantityInput);
      const price = parseCurrencyToNumber(displayUnitPrice);

      if (!tickerClean || qty <= 0 || price <= 0) {
         setAssetError('Preencha todos os campos corretamente.');
         setIsSavingAsset(false); return;
      }

      const tickerRegex = /^[A-Z0-9]{4}[0-9]{1,2}F?$/i;
      if (!tickerRegex.test(tickerClean)) {
          setAssetError('Código inválido. Digite um ticker oficial (ex: VALE3, MXRF11).');
          setIsSavingAsset(false); return;
      }

      try {
        const newAsset = {
          ticker: tickerClean,
          type: tickerClean.endsWith('11') ? 'FII' : 'Ação',
          quantity: qty,
          unitPrice: price,
          broker: brokerInput.trim() || 'Principal',
          buyDate: buyDateInput,
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'users', user.uid, 'investments'), newAsset);
        setTickerInput(''); setQuantityInput(''); setDisplayUnitPrice(''); setBrokerInput(''); setIsAddOpen(false); setAssetError('');
        refreshQuotes(true);
      } catch (err) { 
        console.error(err); setAssetError('Erro ao salvar o ativo.');
      } finally { setIsSavingAsset(false); }
    };

    const handleDeleteAsset = async (id: string) => {
      if (window.confirm("Deseja excluir esta compra específica?")) {
        try { await deleteDoc(doc(db, 'users', user.uid, 'investments', id)); } 
        catch (err) { console.error(err); }
      }
    };

    const openEditAsset = (lot: any) => {
      setEditingAsset(lot);
      setTickerInput(lot.ticker);
      setQuantityInput(lot.quantity.toString());
      setDisplayUnitPrice(formatCurrencyInput(Math.round(lot.unitPrice * 100)));
      setBrokerInput(lot.broker || '');
      setBuyDateInput(lot.buyDate || '');
    };

    const handleSaveEditAsset = async (e: any) => {
      e.preventDefault();
      if (!user || !editingAsset) return;
      setIsSavingAsset(true);
      try {
        const price = parseCurrencyToNumber(displayUnitPrice);
        await updateDoc(doc(db, 'users', user.uid, 'investments', editingAsset.id), {
          ticker: tickerInput.toUpperCase(),
          quantity: parseFloat(quantityInput),
          unitPrice: price,
          broker: brokerInput,
          buyDate: buyDateInput
        });
        setEditingAsset(null); setTickerInput(''); setQuantityInput(''); setDisplayUnitPrice(''); setBrokerInput('');
      } catch (err) { console.error(err); } 
      finally { setIsSavingAsset(false); }
    };

    const handleConfirmSale = async (e: any) => {
      e.preventDefault();
      if (!user || !sellingAsset) return;

      const qtyToSell = parseFloat(sellQuantity);
      const price = parseCurrencyToNumber(displaySellUnitPrice);
      const fees = parseCurrencyToNumber(displaySellFees);

      if (qtyToSell <= 0 || qtyToSell > sellingAsset.totalQuantity || price <= 0) return;

      const totalSaleGross = qtyToSell * price;
      const totalCostBasis = qtyToSell * sellingAsset.averagePM;
      const netProfit = (totalSaleGross - totalCostBasis) - fees;
      
      const isDayTrade = sellingAsset.lots.some((lot: any) => lot.buyDate === sellDate);
      
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
        ticker: sellingAsset.ticker, type: sellingAsset.type, broker: 'Múltiplas/Calculado',
        buyDate: 'Preço Médio Global', saleDate: sellDate, quantitySold: qtyToSell, unitSalePrice: price,
        unitCostBasis: sellingAsset.averagePM, totalSaleAmount: totalSaleGross, fees,
        netProfit, isDayTrade, taxPayable, taxRule, createdAt: new Date().toISOString()
      };

      try {
        let remainingToSell = qtyToSell;
        const promises = [];

        for (const lot of sellingAsset.lots) {
            if (remainingToSell <= 0) break;
            
            if (remainingToSell >= lot.quantity) {
                promises.push(deleteDoc(doc(db, 'users', user.uid, 'investments', lot.id)));
                remainingToSell -= lot.quantity;
            } else {
                promises.push(updateDoc(doc(db, 'users', user.uid, 'investments', lot.id), {
                    quantity: lot.quantity - remainingToSell
                }));
                remainingToSell = 0;
            }
        }
        promises.push(addDoc(collection(db, 'users', user.uid, 'salesHistory'), saleRecord));
        
        await Promise.all(promises);

        setSellingAsset(null); setSellQuantity(''); setDisplaySellUnitPrice(''); setDisplaySellFees('');
      } catch (err) { console.error(err); }
    };

    const toggleExpandTicker = (ticker: string) => {
      setExpandedTickers(prev => prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]);
    };

    const brokerCards = ['Geral', ...Array.from(new Set(investments.map((i: any) => i.broker))).filter(Boolean).sort()].map(brokerName => {
      const invs = brokerName === 'Geral' ? investments : investments.filter((i:any) => i.broker === brokerName);
      let totalInv = 0;
      let totalMkt = 0;
      invs.forEach((inv: any) => {
          totalInv += inv.quantity * inv.unitPrice;
          const cp = prices[inv.ticker] || inv.unitPrice;
          totalMkt += inv.quantity * cp;
      });
      return {
         name: brokerName as string,
         invested: totalInv,
         market: totalMkt,
         profit: totalMkt - totalInv
      };
    });

    return (
      <div className="p-4 space-y-4 pb-28 animate-fadeIn">
        
        {/* Painel Horizontal Deslizante de Corretoras */}
        <div>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {brokerCards.map(c => (
              <div 
                key={c.name} 
                onClick={() => setFilterBroker(c.name)} 
                className={`min-w-[260px] flex-shrink-0 p-5 rounded-3xl snap-start cursor-pointer transition-all duration-300 ease-in-out ${filterBroker === c.name ? 'bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-blue-800 dark:to-indigo-900 text-white shadow-xl scale-100' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 scale-95 opacity-70 hover:opacity-100'}`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${filterBroker === c.name ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {c.name === 'Geral' ? 'Patrimônio B3' : `Corretora: ${c.name}`}
                </span>
                <p className="text-3xl font-extrabold mt-1">R$ {formatBRL(c.market)}</p>
                <div className="flex justify-between items-end mt-4 pt-3 border-t border-current/10">
                  <div>
                    <span className={`text-[10px] ${filterBroker === c.name ? 'text-blue-300' : 'text-gray-400 dark:text-gray-500'}`}>Total Investido</span>
                    <p className="font-semibold text-xs">R$ {formatBRL(c.invested)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] ${filterBroker === c.name ? 'text-blue-300' : 'text-gray-400 dark:text-gray-500'}`}>Lucro / Prejuízo</span>
                    <p className={`font-bold text-xs ${c.profit >= 0 ? (filterBroker === c.name ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400') : (filterBroker === c.name ? 'text-red-400' : 'text-red-600 dark:text-red-400')}`}>
                      {c.profit >= 0 ? '+' : ''}R$ {formatBRL(c.profit)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right flex items-center justify-end gap-1 mt-1">
            Última atualização: {lastSync} 
            <button onClick={() => refreshQuotes(true)} className={`p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}><Icons.Refresh size={16}/></button>
          </p>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">Ativos em Carteira</h3>
          <button onClick={() => { setTickerInput(''); setQuantityInput(''); setDisplayUnitPrice(''); setBrokerInput(filterBroker !== 'Geral' ? filterBroker : ''); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
            <Icons.Plus size={16}/> Novo Ativo
          </button>
        </div>

        {groupedInvestments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500 text-sm">Nenhum ativo cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {groupedInvestments.map((group: any) => {
              const currentPrice = prices[group.ticker] || group.averagePM;
              const currentVal = group.totalQuantity * currentPrice;
              const profitVal = currentVal - group.totalInvested;
              const profitPct = group.averagePM > 0 ? ((currentPrice - group.averagePM) / group.averagePM) * 100 : 0;
              const isExpanded = expandedTickers.includes(group.ticker);

              return (
                <div key={group.ticker} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2 relative transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{group.ticker}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{group.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total: <b className="text-gray-800 dark:text-gray-200">{group.totalQuantity} cotas</b></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PM Global: <b className="text-gray-800 dark:text-gray-200">R$ {formatBRL(group.averagePM)}</b></p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">R$ {formatBRL(currentVal)}</p>
                      <p className={`text-xs font-bold ${profitVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {profitVal >= 0 ? '+' : ''}{formatBRL(profitPct)}% (R$ {formatBRL(profitVal)})
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-700 pt-3 mt-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Atual: <b className="text-gray-800 dark:text-gray-200 text-sm">R$ {formatBRL(currentPrice)}</b></span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleExpandTicker(group.ticker)} className="text-gray-500 dark:text-gray-400 font-medium px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1 transition-colors">
                        Compras {isExpanded ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
                      </button>
                      <button onClick={() => setSellingAsset(group)} className="text-blue-600 dark:text-blue-400 font-bold px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors">Vender</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 -mx-4 px-4 pb-2 rounded-b-2xl space-y-2">
                      <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">Histórico de Compras ({group.lots.length})</h4>
                      {group.lots.map((lot: any) => (
                        <div key={lot.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 text-xs shadow-sm">
                          <div>
                            <p className="font-bold text-gray-700 dark:text-gray-200">{lot.quantity} cotas <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({lot.broker})</span></p>
                            <p className="text-gray-500 dark:text-gray-400">{new Date(lot.buyDate).toLocaleDateString('pt-BR')} • PM: R$ {formatBRL(lot.unitPrice)}</p>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={() => openEditAsset(lot)} className="p-1.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"><Icons.Edit size={16} /></button>
                             <button onClick={() => handleDeleteAsset(lot.id)} className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"><Icons.Trash size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {salesHistory.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Histórico de Vendas & IR</h4>
            {salesHistory.map((s: any) => (
              <div key={s.id} className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-gray-800 dark:text-gray-200">{s.ticker} ({s.quantitySold} cotas)</span>
                  <span className={s.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>Resultado: R$ {formatBRL(s.netProfit)}</span>
                </div>
                <div className="flex justify-between text-gray-400 dark:text-gray-500">
                  <span>Venda em {new Date(s.saleDate).toLocaleDateString('pt-BR')}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {s.taxPayable > 0 ? `DARF a Pagar: R$ ${formatBRL(s.taxPayable)}` : 'Isento de IR'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">{s.taxRule}</p>
              </div>
            ))}
          </div>
        )}

        {(isAddOpen || editingAsset) && createPortal(
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999] overflow-hidden p-2 sm:p-4 animate-fadeIn">
            <div className="h-full overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              <div role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 w-full max-w-sm max-h-full my-auto overflow-y-auto overscroll-contain rounded-3xl p-4 sm:p-5 shadow-2xl space-y-2 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{editingAsset ? 'Editar Compra' : 'Adicionar Ativo'}</h3>
                <button onClick={() => { setIsAddOpen(false); setEditingAsset(null); }} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-bold px-2 py-1">✕</button>
              </div>
              
              {assetError && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg">{assetError}</div>}
              
              <form onSubmit={editingAsset ? handleSaveEditAsset : handleSaveAsset} className="space-y-2 text-sm">
                
                <div className="relative">
                  <input type="text" placeholder="Buscar ativo (Ex: Itau, VALE3)" value={tickerInput} onChange={(e) => setTickerInput(e.target.value.toUpperCase())} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required disabled={!!editingAsset} list="ticker-suggestions" />
                  <datalist id="ticker-suggestions">
                    {mergedTickersForSearch.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantidade</label>
                     <input type="number" step="any" placeholder="Qtd" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preço Unitário</label>
                     <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displayUnitPrice} onChange={(e) => setDisplayUnitPrice(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Corretora</label>
                     <input type="text" placeholder="Ex: NuInvest" value={brokerInput} onChange={(e) => setBrokerInput(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" list="broker-suggestions" />
                     <datalist id="broker-suggestions">
                       {allBrokers.map(b => <option key={b} value={b} />)}
                     </datalist>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data da Compra</label>
                     <input type="date" value={buyDateInput} onChange={(e) => setBuyDateInput(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required />
                  </div>
                </div>
                <button type="submit" disabled={isSavingAsset} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 disabled:opacity-50 transition-colors shadow-md">
                   {isSavingAsset ? 'Salvando...' : (editingAsset ? 'Atualizar Compra' : 'Salvar na Carteira')}
                </button>
              </form>
              </div>
            </div>
          </div>,
          document.body
        )}

        {sellingAsset && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999] overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-gray-800 dark:text-gray-100">Registrar Venda: {sellingAsset.ticker}</h3>
                 <button onClick={() => setSellingAsset(null)} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-bold px-2 py-1">✕</button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                Disponível em carteira: <b className="text-gray-800 dark:text-gray-200">{sellingAsset.totalQuantity} cotas</b><br/>
                PM Global: <b className="text-gray-800 dark:text-gray-200">R$ {formatBRL(sellingAsset.averagePM)}</b>
              </div>

              <form onSubmit={handleConfirmSale} className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Qtd. a Vender</label>
                    <input type="number" step="any" max={sellingAsset.totalQuantity} placeholder={`Max: ${sellingAsset.totalQuantity}`} value={sellQuantity} onChange={(e) => setSellQuantity(e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preço Unitário</label>
                    <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displaySellUnitPrice} onChange={(e) => setDisplaySellUnitPrice(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 dark:text-gray-100" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Taxas B3 / Custos</label>
                    <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={displaySellFees} onChange={(e) => setDisplaySellFees(formatCurrencyInput(e.target.value))} className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data da Venda</label>
                    <input type="date" value={sellDate} onChange={(e) => setSellDate(e.target.value)} className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl mt-2 transition-colors shadow-md">
                  Confirmar Venda & Apurar IR
                </button>
              </form>
            </div>
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
    const [payingInvoice, setPayingInvoice] = useState<any>(null);
    const getLocalDateString = () => {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const [invoicePaymentDate, setInvoicePaymentDate] = useState(() => getLocalDateString());
    const [markThirdPartiesReceived, setMarkThirdPartiesReceived] = useState(false);
    const [isPayingInvoice, setIsPayingInvoice] = useState(false);

    const filterMonth = filtersHist.month;
    const setFilterMonth = (month: string) => setFiltersHist(prev => ({ ...prev, month }));
    const filterType = filtersHist.type;
    const setFilterType = (type: string) => setFiltersHist(prev => ({ ...prev, type }));
    const filterPerson = filtersHist.person;
    const setFilterPerson = (person: string) => setFiltersHist(prev => ({ ...prev, person }));

    const availableMonths = Array.from(new Set((transactions || []).map(t => {
      if (!t?.date) return '';
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).filter(m => m !== '').sort().reverse() as string[];
    
    const availablePersons = Array.from(new Set((transactions || []).flatMap(t => t.splits?.map((s: any) => String(s?.name || '')) || []))).filter(Boolean).sort() as string[];

    const groupedInvoices: any = {};
    
    const filteredTxsForHistory = (transactions || []).filter(tx => {
      if (!tx?.date) return false;
      if (filterMonth !== 'all' && filterMonth !== '' && !String(tx.date).startsWith(filterMonth)) return false;
      if (filterType !== 'all' && String(tx.type) !== filterType) return false;
      if (filterPerson === '__mine__') {
        if ((parseFloat(tx.myAmount) || 0) <= 0) return false;
      } else if (filterPerson !== 'all') {
        const hasPerson = tx.splits?.some((s: any) => String(s?.name) === filterPerson);
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
      groupedInvoices[key].totalAmount += (parseFloat(tx.totalAmount) || 0);
      groupedInvoices[key].myAmount += (parseFloat(tx.myAmount) || 0);
      
      if (tx.status !== 'paid') {
        groupedInvoices[key].isFullyPaid = false;
      }
    });

    const invoicesArray = Object.values(groupedInvoices).sort((a: any, b: any) => String(a.monthYear).localeCompare(String(b.monthYear)));
    
    invoicesArray.forEach((inv: any) => {
        inv.transactions.sort((a: any, b: any) => {
           const dateA = new Date(a.purchaseDate || a.date).getTime();
           const dateB = new Date(b.purchaseDate || b.date).getTime();
           return (dateA || 0) - (dateB || 0);
        });
    });

    const handlePayInvoice = (invoice: any) => {
      setInvoicePaymentDate(getLocalDateString());
      setMarkThirdPartiesReceived(false);
      setPayingInvoice(invoice);
    };

    const handleConfirmPayInvoice = async (e: any) => {
      e.preventDefault();
      if (!user || !payingInvoice || !invoicePaymentDate) return;
      setIsPayingInvoice(true);
      try {
        const updatePromises = payingInvoice.transactions.map((tx: any) => {
          const changes: any = {};
          if (tx.status !== 'paid') {
            changes.status = 'paid';
            changes.paymentDate = invoicePaymentDate;
          }
          if (markThirdPartiesReceived && tx.splits?.length) {
            changes.splits = tx.splits.map((split: any) => split?.name ? { ...split, paid: true } : split);
          }
          return Object.keys(changes).length
            ? updateDoc(doc(db, 'users', user.uid, 'transactions', tx.id), changes)
            : Promise.resolve();
        });

        await Promise.all(updatePromises);
        setPayingInvoice(null);
      } catch (err) {
        console.error("Erro ao pagar fatura", err);
      } finally {
        setIsPayingInvoice(false);
      }
    };

    const handleToggleStatus = async (tx: any) => {
      if (!user) return;
      try {
        const newStatus = tx.status === 'paid' ? 'pending' : 'paid';
        await updateDoc(doc(db, 'users', user.uid, 'transactions', tx.id), {
          status: newStatus,
          paymentDate: newStatus === 'paid' ? getLocalDateString() : ''
        });
      } catch (err) { console.error(err); }
    };

    const openEditModal = (tx: any) => {
      setEditingTx(tx);
      setEditForm({ desc: tx.desc || '', totalAmount: tx.totalAmount || '', date: tx.date || '' });
      setUpdateScope('single');
    };

    useEffect(() => {
      if (editingTx) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
    }, [editingTx]);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Faturas e Lançamentos</h2>
          {(filtersHist.month !== 'all' || filtersHist.type !== 'all' || filtersHist.person !== 'all') && (
            <button onClick={() => setFiltersHist({ month: 'all', type: 'all', person: 'all' })} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg font-medium transition-colors">Limpar Filtros</button>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Mês</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os Meses</option>
              {availableMonths.map(month => {
                  if (!month) return null;
                  const [y, m] = (month as string).split('-');
                  return <option key={month as string} value={month as string}>{`${m}/${y}`}</option>
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Tipo</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="income">Receitas (+)</option>
              <option value="expense">Despesas (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Envolvidos</label>
            <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="__mine__">Apenas Eu</option>
              {availablePersons.map(name => <option key={name as string} value={name as string}>{name as string}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Sincronizando...</p>
        ) : (
          <div className="space-y-6">
            {invoicesArray.length === 0 ? (
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">Nenhum lançamento encontrado para estes filtros.</div>
            ) : (
              invoicesArray.map((invoice: any) => {
                const cashbackPct = invoice.card ? parseFloat(invoice.card.cashbackPct) || 0 : 0;
                const invoiceVisibleAmount = filterPerson === '__mine__' ? invoice.myAmount : invoice.totalAmount;
                const cashbackAmount = (invoiceVisibleAmount * (cashbackPct / 100));

                return (
                  <div key={invoice.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className={`p-4 border-b ${invoice.isFullyPaid ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'} flex justify-between items-center`}>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          {invoice.methodName} 
                          {invoice.isFullyPaid && <span className="text-[10px] bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">PAGA</span>}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento: {invoice.dateLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">R$ {formatBRL(invoiceVisibleAmount)}</p>
                        {cashbackAmount > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">+ R$ {formatBRL(cashbackAmount)} de Cashback</p>
                        )}
                      </div>
                    </div>

                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                      {invoice.transactions.map((tx: any) => (
                        <li key={tx.id} className={`p-4 relative group hover:bg-gray-50 dark:hover:bg-gray-700/30 ${tx.type === 'income' ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : ''} ${tx.status === 'paid' ? 'opacity-60' : ''}`}>
                          <div className="flex justify-between items-start pr-24">
                            <div>
                              <p className={`font-medium text-sm ${tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'} ${tx.status === 'paid' ? 'line-through text-opacity-70' : ''}`}>
                                {tx.type === 'income' && <span className="font-bold mr-1">+</span>}
                                {tx.desc}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {tx.type === 'income' ? 'Recebido em: ' : 'Compra: '} 
                                {tx.purchaseDate ? new Date(tx.purchaseDate).toLocaleDateString('pt-BR') : tx.date ? new Date(tx.date).toLocaleDateString('pt-BR') : '-'}
                              </p>
                              {tx.status === 'paid' && tx.paymentDate && (
                                <p className="text-[10px] text-green-600 dark:text-green-400">Efetivado em: {new Date(`${tx.paymentDate}T12:00:00`).toLocaleDateString('pt-BR')}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                                R$ {formatBRL(filterPerson === '__mine__' ? tx.myAmount : tx.totalAmount)}
                              </p>
                              {filterPerson !== '__mine__' && tx.type !== 'income' && tx.myAmount !== tx.totalAmount && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Sua parte: R$ {formatBRL(tx.myAmount)}</p>
                              )}
                            </div>
                          </div>
                          
                          {(tx.splits?.length > 0 || (tx.type !== 'income' && (parseFloat(tx.myAmount) || 0) > 0)) && (
                            <div className="mt-2 bg-blue-50/50 dark:bg-blue-900/20 rounded p-1.5 text-[10px]">
                              {tx.type !== 'income' && (parseFloat(tx.myAmount) || 0) > 0 && (
                                <div className="flex justify-between text-gray-500 dark:text-gray-400 border-b border-blue-100 dark:border-blue-800 pb-1 mb-1">
                                  <span>Minha parte</span>
                                  <span className="flex items-center gap-2">
                                    R$ {formatBRL(tx.myAmount)}
                                    <b className={tx.myPaid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{tx.myPaid ? 'Pago' : 'Pendente'}</b>
                                  </span>
                                </div>
                              )}
                              {tx.splits?.map((s: any, i: number) => (
                                <div key={i} className="flex justify-between text-gray-500 dark:text-gray-400">
                                  <span>{s.name}</span>
                                  <span className="flex items-center gap-2">
                                    R$ {formatBRL(s.amount)}
                                    <b className={s.paid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{s.paid ? 'Pago' : 'Pendente'}</b>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <button onClick={() => handleToggleStatus(tx)} title="Marcar como Efetivado/Pendente" className={`p-1.5 rounded-md transition-colors ${tx.status === 'paid' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}>
                              <Icons.CheckCircle size={16} />
                            </button>
                            <button onClick={() => openEditModal(tx)} disabled={tx.status === 'paid'} title="Editar Lançamento (Apenas Pendentes)" className="p-1.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md disabled:opacity-30 disabled:hover:bg-transparent">
                              <Icons.Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteDoc(tx.id)} title="Excluir" className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                              <Icons.Trash size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {!invoice.isFullyPaid && invoice.card && (invoice.card.limit || 0) > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
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

        {payingInvoice && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[10000] overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 border border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Pagar fatura</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{payingInvoice.methodName} • {payingInvoice.dateLabel}</p>
              </div>
              <form onSubmit={handleConfirmPayInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Data do pagamento</label>
                  <input type="date" value={invoicePaymentDate} onChange={e => setInvoicePaymentDate(e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg" required />
                </div>
                <label className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={markThirdPartiesReceived} onChange={e => setMarkThirdPartiesReceived(e.target.checked)} className="mt-0.5 text-blue-600 rounded" />
                  <span>Também marcar todos os valores de terceiros desta fatura como recebidos.</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Esta opção atualiza as cobranças individuais sem alterar a data nem o status de outras faturas.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPayingInvoice(null)} className="flex-1 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">Cancelar</button>
                  <button type="submit" disabled={isPayingInvoice} className="flex-1 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50">
                    {isPayingInvoice ? 'Salvando...' : 'Confirmar pagamento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingTx && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[9999] overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Editar Lançamento</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <input type="text" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total (R$)</label>
                  <input type="number" step="0.01" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg" required />
                </div>
                {updateScope === 'single' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                    <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg" required />
                  </div>
                )}
                
                {editingTx.groupId && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">Este é um lançamento recorrente. Deseja alterar:</label>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
                  <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">Cancelar</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
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
        const row = [tx.id, tx.type, (tx.desc || '').replace(/;/g, ''), tx.date, (parseFloat(tx.totalAmount)||0).toFixed(2), tx.methodId, tx.status];
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurações e Dados</h2>
        
        {importMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${importMsg.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : importMsg.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
            {importMsg.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Minha Conta</h3>
                   <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 px-4 py-2 rounded-lg font-medium transition-colors">Sair</button>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2"><Icons.Calendar size={20} /> Editar via Planilha (CSV)</h3>
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button onClick={handleExportCSV} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"><Icons.Download size={20} /> Baixar Planilha</button>
              <label className={`flex-1 ${isProcessing ? 'bg-gray-400' : 'bg-white dark:bg-gray-700 border border-green-600 dark:border-green-500 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 cursor-pointer'} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium inline-flex transition-colors`}>
                <Icons.Upload size={20} /> {isProcessing ? 'Enviando...' : 'Importar Planilha'}
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={isProcessing} />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2"><Icons.Cloud size={20} /> Backup do Sistema (JSON)</h3>
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button onClick={handleExportJSON} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"><Icons.Download size={20} /> Baixar Backup</button>
              <label className={`flex-1 ${isProcessing ? 'bg-gray-400' : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white cursor-pointer'} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium inline-flex transition-colors`}>
                <Icons.Upload size={20} /> {isProcessing ? 'Enviando...' : 'Restaurar Backup'}
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" disabled={isProcessing} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 text-blue-600 font-bold">Carregando...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg text-center max-w-sm w-full border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Icons.Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Finanças Inteligentes</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Faça login com o Google para sincronizar seus dados de forma segura em todos os seus dispositivos.</p>
            {loginError && <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{loginError}</div>}
            <button onClick={handleGoogleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2">
               Entrar com o Google
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans pb-24 transition-colors duration-300">
      <header className="bg-blue-700 dark:bg-gray-800 text-white pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-sm relative z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finanças Inteligentes</h1>
            <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
              <Icons.Cloud size={16} /> Sincronizado
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDarkMode} title="Alternar Tema" className="p-2.5 rounded-full bg-blue-600 dark:bg-gray-700 text-blue-100 dark:text-gray-300 hover:bg-blue-500 dark:hover:bg-gray-600 hover:text-white transition-colors">
              {isDarkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
            </button>
            <button onClick={() => setActiveTab('settings')} title="Configurações e Backup" className={`p-2.5 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-blue-800 dark:bg-gray-600 text-white' : 'bg-blue-600 dark:bg-gray-700 text-blue-100 dark:text-gray-300 hover:bg-blue-500 dark:hover:bg-gray-600 hover:text-white'}`}>
              <Icons.Settings size={24} />
            </button>
          </div>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-colors duration-300">
        <div className="max-w-md mx-auto flex justify-between items-center px-4 py-1">
          
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 w-14 transition-colors ${activeTab === 'dashboard' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icons.Home size={20} /> <span className="text-[9px] font-medium mt-1">Início</span>
          </button>
          
          <button onClick={() => setActiveTab('cards')} className={`flex flex-col items-center p-2 w-14 transition-colors ${activeTab === 'cards' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icons.Wallet size={20} /> <span className="text-[9px] font-medium mt-1">Cartões</span>
          </button>
          
          <div className="relative -top-6">
            <button onClick={() => setActiveTab('add')} className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white transition-transform ${activeTab === 'add' ? 'bg-blue-800 dark:bg-blue-500 scale-110' : 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'}`}>
              <Icons.Plus size={24} />
            </button>
          </div>

          <button onClick={() => setActiveTab('collections')} className={`flex flex-col items-center p-2 w-14 transition-colors ${activeTab === 'collections' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icons.Message size={20} /> <span className="text-[9px] font-medium mt-1">Cobrar</span>
          </button>

          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-2 w-14 transition-colors ${activeTab === 'investments' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icons.TrendingUp size={20} /> <span className="text-[9px] font-medium mt-1">Ativos</span>
          </button>

          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-2 w-14 transition-colors ${activeTab === 'history' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icons.Calendar size={20} /> <span className="text-[9px] font-medium mt-1">Faturas</span>
          </button>

        </div>
      </nav>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .pb-safe { padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        .dark { background-color: #111827 !important; color: #f3f4f6 !important; }
        .dark .bg-white { background-color: #1f2937 !important; border-color: #374151 !important; }
        .dark .bg-gray-50 { background-color: #111827 !important; border-color: #374151 !important; }
        .dark .bg-gray-100 { background-color: #374151 !important; }
        .dark .bg-gray-200 { background-color: #4b5563 !important; }
        .dark .text-gray-800 { color: #f3f4f6 !important; }
        .dark .text-gray-700 { color: #d1d5db !important; }
        .dark .text-gray-600 { color: #9ca3af !important; }
        .dark .text-gray-500 { color: #6b7280 !important; }
        .dark .border-gray-100, .dark .border-gray-200, .dark .border-gray-300 { border-color: #374151 !important; }
        .dark input, .dark select, .dark textarea { background-color: #374151 !important; color: #f3f4f6 !important; border-color: #4b5563 !important; }
      `}} />
    </div>
  );
}

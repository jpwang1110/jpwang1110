import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Currency, ExchangeRates } from '../types';
import { SwapIcon, SearchIcon, ChevronDownIcon } from './Icons';

// Rich metadata for searching and display
const CURRENCY_META: Record<string, { name: string; country: string; keywords: string[] }> = {
  USD: { name: '美金', country: 'United States', keywords: ['dollar', 'usa', '美國'] },
  TWD: { name: '新台幣', country: 'Taiwan', keywords: ['ntd', '台幣', '台灣'] },
  CNY: { name: '人民幣', country: 'China', keywords: ['rmb', 'yuan', '中國', '大陸'] },
  JPY: { name: '日圓', country: 'Japan', keywords: ['yen', '日本'] },
  EUR: { name: '歐元', country: 'Europe', keywords: ['euro', '歐洲'] },
  HKD: { name: '港幣', country: 'Hong Kong', keywords: ['香港'] },
  KRW: { name: '韓元', country: 'South Korea', keywords: ['won', '韓國'] },
  GBP: { name: '英鎊', country: 'United Kingdom', keywords: ['pound', '英國'] },
  AUD: { name: '澳幣', country: 'Australia', keywords: ['澳洲'] },
  CAD: { name: '加幣', country: 'Canada', keywords: ['加拿大'] },
  SGD: { name: '新加坡幣', country: 'Singapore', keywords: ['新加坡'] },
  THB: { name: '泰銖', country: 'Thailand', keywords: ['泰國'] },
  VND: { name: '越南盾', country: 'Vietnam', keywords: ['越南'] },
  MYR: { name: '馬來幣', country: 'Malaysia', keywords: ['馬來西亞'] },
  IDR: { name: '印尼盾', country: 'Indonesia', keywords: ['印尼'] },
  PHP: { name: '披索', country: 'Philippines', keywords: ['菲律賓'] },
};

interface CurrencySelectorProps {
  label: string;
  selectedCode: string;
  onSelect: (code: string) => void;
  rates: ExchangeRates;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ label, selectedCode, onSelect, rates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const quickOptions = ['USD', 'TWD', 'CNY', 'JPY'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Reset search when closing
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    const allCodes = Object.keys(rates);
    if (!searchTerm) return allCodes;
    
    const lowerSearch = searchTerm.toLowerCase();
    return allCodes.filter(code => {
      const meta = CURRENCY_META[code];
      if (code.toLowerCase().includes(lowerSearch)) return true;
      if (meta) {
        if (meta.name.includes(lowerSearch) || meta.name.toLowerCase().includes(lowerSearch)) return true;
        if (meta.country.toLowerCase().includes(lowerSearch)) return true;
        if (meta.keywords.some(k => k.includes(lowerSearch))) return true;
      }
      return false;
    });
  }, [rates, searchTerm]);

  const getDisplayLabel = (code: string) => {
    const meta = CURRENCY_META[code];
    return meta ? `${code} ${meta.name}` : code;
  };

  return (
    <div className="flex-1 flex flex-col relative" ref={wrapperRef}>
      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
      
      {/* Quick Select Buttons */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        {quickOptions.map(code => (
          <button
            key={code}
            onClick={() => {
              onSelect(code);
              setIsOpen(false);
            }}
            className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
              selectedCode === code
                ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      {/* Dropdown Trigger / Input */}
      <div className="relative">
        <div 
          className={`w-full px-3 py-2.5 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
            isOpen ? 'ring-2 ring-blue-400 border-blue-400' : 'border-slate-200 hover:border-blue-300'
          }`}
          onClick={() => {
             setIsOpen(!isOpen);
             if (!isOpen) setSearchTerm(''); // Clear search when opening
          }}
        >
           {isOpen ? (
             <div className="flex items-center gap-2 w-full">
               <SearchIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
               <input 
                  autoFocus
                  type="text" 
                  className="w-full text-sm font-bold text-slate-700 outline-none bg-transparent placeholder:font-normal"
                  placeholder="搜尋 Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
               />
             </div>
           ) : (
             <span className="text-sm font-bold text-slate-700 truncate mr-2">
                {getDisplayLabel(selectedCode)}
             </span>
           )}
           {!isOpen && <ChevronDownIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(code => {
                const meta = CURRENCY_META[code];
                return (
                  <div
                    key={code}
                    onClick={() => {
                      onSelect(code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center border-b border-slate-50 last:border-none ${
                      selectedCode === code ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800">{code}</div>
                      {meta && <div className="text-[10px] text-slate-400">{meta.name} - {meta.country}</div>}
                    </div>
                    {selectedCode === code && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                );
              })
            ) : (
               <div className="px-4 py-3 text-xs text-slate-400 text-center">無相符幣別</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ExchangeRateCardProps {
  rates: ExchangeRates;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ rates }) => {
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>(Currency.USD);
  const [toCurrency, setToCurrency] = useState<string>(Currency.TWD);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(33.5);

  const result = useMemo(() => {
    if (isCustomRate) {
      return amount * customRate;
    }
    const rateFrom = rates[fromCurrency] || 1;
    const rateTo = rates[toCurrency] || 1;
    return (amount / rateFrom) * rateTo;
  }, [amount, fromCurrency, toCurrency, isCustomRate, customRate, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const impliedRate = useMemo(() => {
      const rateFrom = rates[fromCurrency] || 1;
      const rateTo = rates[toCurrency] || 1;
      return (rateTo / rateFrom).toFixed(4);
  }, [rates, fromCurrency, toCurrency]);

  return (
    <section className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col relative overflow-visible z-10">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <a 
            href="https://www.exchangerate-api.com" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-blue-500 hover:underline decoration-dotted underline-offset-4 transition-colors" 
            title="View Data Source"
          >
            實時匯率 Data Source
          </a>
        </h2>
      </div>

      <div className="space-y-4 flex-grow flex flex-col">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">金額 Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-xl tracking-wide font-bold text-slate-800"
            placeholder="0.00"
          />
        </div>

        <div className="flex gap-2 items-end">
          <CurrencySelector 
             label="FROM" 
             selectedCode={fromCurrency} 
             onSelect={setFromCurrency} 
             rates={rates} 
          />

          <div className="flex flex-col items-center pb-2.5 px-1">
            <button
              onClick={handleSwap}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-500 hover:text-blue-600 transition-all shadow-sm active:scale-90 flex items-center justify-center"
              title="Switch Currencies"
            >
              <SwapIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <CurrencySelector 
             label="TO" 
             selectedCode={toCurrency} 
             onSelect={setToCurrency} 
             rates={rates} 
          />
        </div>
        
        {/* Display Current Rate Explicitly */}
        {!isCustomRate && (
            <div className="flex justify-center -mt-1 mb-1">
                 <div className="bg-blue-50/80 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-bold uppercase">Current Rate</span>
                    <span className="text-xs font-bold text-blue-600">1 {fromCurrency} ≈ {impliedRate} {toCurrency}</span>
                 </div>
            </div>
        )}

        <div className="border-t border-slate-100 my-1 pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isCustomRate}
                onChange={(e) => setIsCustomRate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 relative"></div>
              <span className="ml-2 text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">使用自訂匯率 (Custom)</span>
            </label>
          </div>
          
          <div className={`transition-all overflow-hidden duration-300 ${isCustomRate ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
              <span className="text-xs font-bold text-yellow-600 whitespace-nowrap">指定匯率:</span>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-yellow-200 rounded px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-400"
                placeholder="ex: 33.5"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F0F7FF] to-slate-50 p-5 rounded-2xl text-center mt-auto border border-blue-100/60 relative">
          <div className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${isCustomRate ? 'text-yellow-600' : 'text-blue-400'}`}>
            {isCustomRate ? '自訂匯率計算結果' : '實時計算結果'}
          </div>
          <div className="text-4xl font-bold text-[#5B9BD5] tracking-tight break-words">
            {result.toLocaleString('zh-TW', { style: 'currency', currency: toCurrency })}
          </div>
          {isCustomRate && (
              <div className="text-[10px] text-slate-400 mt-2">
                使用匯率: {customRate}
              </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExchangeRateCard;
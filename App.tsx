import React, { useEffect, useState } from 'react';
import ExchangeRateCard from './components/ExchangeRateCard';
import UnitConverterCard from './components/UnitConverterCard';
import ContainerCalculatorCard from './components/ContainerCalculatorCard';
import AdvancedPalletModal from './components/AdvancedPalletModal';
import ChangelogModal from './components/ChangelogModal';
import { fetchRates } from './services/exchangeService';
import { ExchangeRates, BoxUnit } from './types';

const App: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [isOnline, setIsOnline] = useState<boolean>(false);
  
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
  const [palletInitialData, setPalletInitialData] = useState<{ l: number, w: number, h: number, unit: BoxUnit } | null>(null);
  
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  useEffect(() => {
    const initRates = async () => {
      const data = await fetchRates();
      setRates(data.rates);
      setIsOnline(data.isOnline);
    };
    initRates();
  }, []);

  const openAdvancedPallet = (data: { l: number, w: number, h: number, unit: BoxUnit }) => {
    setPalletInitialData(data);
    setIsPalletModalOpen(true);
  };

  return (
    <div className="p-4 lg:p-8 flex flex-col min-h-screen">
      <header className="max-w-[1600px] mx-auto w-full mb-6 flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PM常用工具集合</h1>
          <p className="text-slate-400 text-[10px] mt-0.5 font-medium">V7.3</p>
        </div>
        <div 
          className={`text-[10px] px-3 py-1.5 rounded-full border shadow-sm font-medium transition-colors ${
            isOnline 
              ? 'bg-[#F0FDF4] border-green-200 text-green-600' 
              : 'bg-orange-50 border-orange-200 text-orange-500'
          }`}
        >
          {isOnline ? '● 連線正常 Online' : '● 離線模式 Offline'}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 items-stretch flex-grow">
        <ExchangeRateCard rates={rates} />
        <UnitConverterCard />
        <ContainerCalculatorCard onOpenAdvanced={openAdvancedPallet} />
      </main>

      <footer className="max-w-[1600px] mx-auto w-full text-center py-6 mt-8 border-t border-slate-200">
        <span 
          className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none"
          onClick={() => setIsChangelogOpen(true)}
        >
          Copyright © 2025 BACKBONE GLOBAL COMPANY LIMITED. All rights reserved.
        </span>
      </footer>

      <AdvancedPalletModal 
        isOpen={isPalletModalOpen} 
        onClose={() => setIsPalletModalOpen(false)} 
        initialData={palletInitialData} 
      />
      
      <ChangelogModal 
        isOpen={isChangelogOpen} 
        onClose={() => setIsChangelogOpen(false)} 
      />
    </div>
  );
};

export default App;
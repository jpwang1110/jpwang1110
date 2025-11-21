import React, { useState } from 'react';
import { UnitTab } from '../types';

const UnitConverterCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UnitTab>(UnitTab.LENGTH);
  
  // State for inputs
  const [lenInput, setLenInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [forceInput, setForceInput] = useState<string>('');

  // State for results
  const [lenResult, setLenResult] = useState<string>('---');
  const [weightResult, setWeightResult] = useState<string>('---');
  const [forceResult, setForceResult] = useState<string>('---');

  const tabClass = (isActive: boolean) => 
    `flex-1 py-2 text-[10px] font-bold text-center rounded-full transition-all duration-300 ease-out cursor-pointer select-none ${
      isActive 
        ? 'bg-[#102A43] text-white shadow-lg transform scale-100' 
        : 'text-white/90 hover:bg-white/10'
    }`;

  const handleLenCalc = (mode: 'mm2in' | 'in2mm') => {
    const val = parseFloat(lenInput);
    if (isNaN(val)) return;
    setLenResult(mode === 'mm2in' ? `${(val / 25.4).toFixed(2)}"` : `${(val * 25.4).toFixed(1)} mm`);
  };

  const handleWeightCalc = (mode: 'kg2lb' | 'lb2kg') => {
    const val = parseFloat(weightInput);
    if (isNaN(val)) return;
    setWeightResult(mode === 'kg2lb' ? `${(val * 2.20462).toFixed(2)} lbs` : `${(val / 2.20462).toFixed(2)} kg`);
  };

  const handleForceCalc = (mode: 'N2kg' | 'kg2N') => {
    const val = parseFloat(forceInput);
    if (isNaN(val)) return;
    setForceResult(mode === 'N2kg' ? `${(val / 9.80665).toFixed(2)} kgf` : `${(val * 9.80665).toFixed(2)} N`);
  };

  return (
    <section className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-slate-800">規格換算</h2>
      </div>
      
      <div className="mb-6 mt-2 w-full bg-[#5B9BD5] p-1 rounded-full flex items-center justify-between relative shadow-inner gap-1">
        <button onClick={() => setActiveTab(UnitTab.LENGTH)} className={tabClass(activeTab === UnitTab.LENGTH)}>長度 Length</button>
        <button onClick={() => setActiveTab(UnitTab.WEIGHT)} className={tabClass(activeTab === UnitTab.WEIGHT)}>重量 Weight</button>
        <button onClick={() => setActiveTab(UnitTab.FORCE)} className={tabClass(activeTab === UnitTab.FORCE)}>力值 Force</button>
      </div>

      <div className="flex-grow flex flex-col">
        {/* Length Content */}
        {activeTab === UnitTab.LENGTH && (
          <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">數值 Input (Length)</label>
              <input 
                type="number" 
                value={lenInput} 
                onChange={(e) => setLenInput(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-lg font-bold text-slate-700"
                placeholder="輸入長度..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleLenCalc('mm2in')} className="bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold transition-all shadow-sm">mm ➔ inch</button>
              <button onClick={() => handleLenCalc('in2mm')} className="bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold transition-all shadow-sm">inch ➔ mm</button>
            </div>
            <div className="text-center font-bold text-3xl text-slate-700 py-8 bg-slate-50 rounded-2xl mt-4 border border-slate-100">{lenResult}</div>
          </div>
        )}

        {/* Weight Content */}
        {activeTab === UnitTab.WEIGHT && (
          <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
             <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">數值 Input (Weight)</label>
              <input 
                type="number" 
                value={weightInput} 
                onChange={(e) => setWeightInput(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-lg font-bold text-slate-700"
                placeholder="輸入重量..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleWeightCalc('kg2lb')} className="bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold transition-all shadow-sm">kg ➔ lbs</button>
              <button onClick={() => handleWeightCalc('lb2kg')} className="bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold transition-all shadow-sm">lbs ➔ kg</button>
            </div>
            <div className="text-center font-bold text-3xl text-slate-700 py-8 bg-slate-50 rounded-2xl mt-4 border border-slate-100">{weightResult}</div>
          </div>
        )}

        {/* Force Content */}
        {activeTab === UnitTab.FORCE && (
          <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">數值 Input (Force)</label>
              <input 
                type="number" 
                value={forceInput} 
                onChange={(e) => setForceInput(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-lg font-bold text-slate-700"
                placeholder="輸入力值..." 
              />
            </div>
            <div className="space-y-3">
              <button onClick={() => handleForceCalc('N2kg')} className="w-full bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold flex justify-between px-6 transition-all shadow-sm"><span>牛頓 (N)</span> <span>➔</span> <span>kgf</span></button>
              <button onClick={() => handleForceCalc('kg2N')} className="w-full bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 py-3 rounded-xl text-xs font-bold flex justify-between px-6 transition-all shadow-sm"><span>公斤 (kgf)</span> <span>➔</span> <span>N</span></button>
            </div>
            <div className="text-center font-bold text-3xl text-slate-700 py-8 bg-slate-50 rounded-2xl mt-4 border border-slate-100">{forceResult}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UnitConverterCard;
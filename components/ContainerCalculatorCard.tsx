import React, { useState, useEffect } from 'react';
import { BoxUnit } from '../types';
import { ArrowRightIcon } from './Icons';

interface ContainerCalculatorCardProps {
  onOpenAdvanced: (dims: { l: number, w: number, h: number, unit: BoxUnit }) => void;
}

const ContainerCalculatorCard: React.FC<ContainerCalculatorCardProps> = ({ onOpenAdvanced }) => {
  const [unit, setUnit] = useState<BoxUnit>(BoxUnit.CM);
  const [l, setL] = useState<string>('');
  const [w, setW] = useState<string>('');
  const [h, setH] = useState<string>('');
  
  const [singleCBM, setSingleCBM] = useState<string>('0.000');
  const [count20, setCount20] = useState<string>('---');
  const [count40, setCount40] = useState<string>('---');
  const [countHQ, setCountHQ] = useState<string>('---');

  const unitBtnClass = (isActive: boolean) => 
    `flex-1 py-2 text-[10px] font-bold text-center rounded-full transition-all duration-300 ease-out cursor-pointer select-none ${
      isActive ? 'bg-[#102A43] text-white shadow-lg transform scale-100' : 'text-white/90 hover:bg-white/10'
    }`;

  useEffect(() => {
    const length = parseFloat(l) || 0;
    const width = parseFloat(w) || 0;
    const height = parseFloat(h) || 0;

    let factorToMeter = 0.01; // Default cm
    if (unit === BoxUnit.MM) factorToMeter = 0.001;
    if (unit === BoxUnit.INCH) factorToMeter = 0.0254;

    const cbm = length * factorToMeter * width * factorToMeter * height * factorToMeter;

    if (cbm > 0) {
      setSingleCBM(cbm.toFixed(4));
      setCount20(Math.floor(28 / cbm).toLocaleString() + " 箱");
      setCount40(Math.floor(58 / cbm).toLocaleString() + " 箱");
      setCountHQ(Math.floor(68 / cbm).toLocaleString() + " 箱");
    } else {
      setSingleCBM("0.000");
      setCount20("---");
      setCount40("---");
      setCountHQ("---");
    }
  }, [l, w, h, unit]);

  return (
    <section className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-slate-800">裝櫃估算</h2>
        <div className="w-48 bg-[#5B9BD5] p-1 rounded-full flex items-center justify-between relative shadow-inner">
          <button onClick={() => setUnit(BoxUnit.MM)} className={unitBtnClass(unit === BoxUnit.MM)}>mm</button>
          <button onClick={() => setUnit(BoxUnit.CM)} className={unitBtnClass(unit === BoxUnit.CM)}>cm</button>
          <button onClick={() => setUnit(BoxUnit.INCH)} className={unitBtnClass(unit === BoxUnit.INCH)}>in</button>
        </div>
      </div>

      <div className="space-y-4 mb-2 mt-4 flex-grow">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">長 <span className="text-[9px] text-[#5B9BD5]">({unit})</span></label>
            <input type="number" value={l} onChange={(e) => setL(e.target.value)} className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-sm font-bold text-slate-700" placeholder="L" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">寬 <span className="text-[9px] text-[#5B9BD5]">({unit})</span></label>
            <input type="number" value={w} onChange={(e) => setW(e.target.value)} className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-sm font-bold text-slate-700" placeholder="W" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">高 <span className="text-[9px] text-[#5B9BD5]">({unit})</span></label>
            <input type="number" value={h} onChange={(e) => setH(e.target.value)} className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-sm font-bold text-slate-700" placeholder="H" />
          </div>
        </div>

        <div className="bg-[#102A43] text-white p-4 rounded-2xl shadow-md mt-2 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400">SINGLE CBM</span>
          <span className="text-xl font-bold text-[#F0B429]">{singleCBM}</span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">預估裝櫃量 (不含棧板)</h3>
          <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">20' GP (28 CBM)</span><span className="text-sm font-bold text-[#5B9BD5]">{count20}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">40' GP (58 CBM)</span><span className="text-sm font-bold text-[#27AB83]">{count40}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">40' HQ (68 CBM)</span><span className="text-sm font-bold text-purple-500">{countHQ}</span></div>
        </div>

        <div className="text-[10px] text-orange-500 font-medium text-center bg-orange-50 py-1.5 rounded-lg border border-orange-100">
          * 如需計算含棧板裝櫃量，請使用下方詳細裝櫃計算
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100">
        <button 
          onClick={() => onOpenAdvanced({ 
            l: parseFloat(l) || 0, 
            w: parseFloat(w) || 0, 
            h: parseFloat(h) || 0, 
            unit 
          })}
          className="group w-full py-3 bg-white border border-slate-200 hover:border-[#5B9BD5] hover:text-[#5B9BD5] text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-sm"
        >
          詳細裝櫃計算 
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-[9px] rounded-full text-slate-400 group-hover:bg-[#5B9BD5] group-hover:text-white transition-colors">自動轉cm</span>
          <ArrowRightIcon className="w-3 h-3 ml-2 text-slate-400 group-hover:translate-x-1 group-hover:text-[#5B9BD5] transition-all" />
        </button>
      </div>
    </section>
  );
};

export default ContainerCalculatorCard;
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { BoxUnit } from '../types';

interface AdvancedPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: { l: number, w: number, h: number, unit: BoxUnit } | null;
}

interface CalcResult {
  ti: number;
  hiGP: number;
  hiHQ: number;
  boxPerPalletGP: number;
  boxPerPalletHQ: number;
  stackHeightGP: number; // Pallet + Boxes
  stackHeightHQ: number;
}

interface ContainerResult {
  type: '20GP' | '40GP' | '40HQ';
  palletsFloor: number; // How many pallets on floor
  totalPallets: number;
  totalBoxes: number;
  loadUtilization: number; // % of volume roughly
  orientation: 'standard' | 'rotated'; // standard: Pallet L along Cont L, rotated: Pallet W along Cont L
  calcDetails: { cols: number, rows: number };
}

const AdvancedPalletModal: React.FC<AdvancedPalletModalProps> = ({ isOpen, onClose, initialData }) => {
  const [palletType, setPalletType] = useState<string>('std');
  // Pallet Dims (pH is now Pallet Base Height, defaulting to 15cm)
  const [pL, setPL] = useState<number>(120);
  const [pW, setPW] = useState<number>(100);
  const [pH, setPH] = useState<number>(15); 
  
  const [bL, setBL] = useState<number>(0);
  const [bW, setBW] = useState<number>(0);
  const [bH, setBH] = useState<number>(0);

  // Single Pallet Results
  const [results, setResults] = useState<CalcResult>({
    ti: 0, hiGP: 0, hiHQ: 0, boxPerPalletGP: 0, boxPerPalletHQ: 0, stackHeightGP: 0, stackHeightHQ: 0
  });

  // Container Results - Initialized with defaults to prevent crash
  const [contResults, setContResults] = useState<ContainerResult[]>([
    { type: '20GP', palletsFloor: 0, totalPallets: 0, totalBoxes: 0, loadUtilization: 0, orientation: 'standard', calcDetails: {cols:0, rows:0} },
    { type: '40GP', palletsFloor: 0, totalPallets: 0, totalBoxes: 0, loadUtilization: 0, orientation: 'standard', calcDetails: {cols:0, rows:0} },
    { type: '40HQ', palletsFloor: 0, totalPallets: 0, totalBoxes: 0, loadUtilization: 0, orientation: 'standard', calcDetails: {cols:0, rows:0} },
  ]);
  const [selectedContView, setSelectedContView] = useState<'20GP' | '40GP' | '40HQ'>('40HQ');
  
  // Visualization Data for Single Pallet
  const [visualData, setVisualData] = useState<{cols: number, rows: number, rotated: boolean}>({ cols: 0, rows: 0, rotated: false });

  // Constants for container limits (Internal Dimensions)
  // 20GP: 589 x 235 x 239 (Door ~228)
  // 40GP: 1203 x 235 x 239 (Door ~228)
  // 40HQ: 1203 x 235 x 269 (Door ~258)
  const LIMIT_HEIGHT_GP = 228; 
  const LIMIT_HEIGHT_HQ = 258;
  const CONT_W = 235;
  const CONT_20_L = 589;
  const CONT_40_L = 1203;

  useEffect(() => {
    if (initialData && isOpen) {
      let factor = 1; // default cm
      if (initialData.unit === BoxUnit.MM) factor = 0.1;
      if (initialData.unit === BoxUnit.INCH) factor = 2.54;

      setBL(parseFloat((initialData.l * factor).toFixed(1)));
      setBW(parseFloat((initialData.w * factor).toFixed(1)));
      setBH(parseFloat((initialData.h * factor).toFixed(1)));
      
      // Trigger initial calc after state update
      setTimeout(calculate, 100); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const handlePalletPresetChange = (type: string) => {
    setPalletType(type);
    if (type === 'std') { setPL(120); setPW(100); setPH(15); }
    else if (type === 'euro') { setPL(120); setPW(80); setPH(15); }
    else if (type === 'us') { setPL(122); setPW(102); setPH(15); }
    // If custom, keep current values but allow editing
  };

  const calculate = () => {
    if (!pL || !pW || !bL || !bW || !bH) return;
    
    // --- 1. Single Pallet Logic (Optimize for best fit) ---
    
    // Option A: Standard (Box L along Pallet L)
    const colX_std = Math.floor(pL / bL);
    const rowY_std = Math.floor(pW / bW);
    const ti_std = colX_std * rowY_std;

    // Option B: Rotated (Box W along Pallet L)
    const colX_rot = Math.floor(pL / bW);
    const rowY_rot = Math.floor(pW / bL);
    const ti_rot = colX_rot * rowY_rot;

    let finalCols, finalRows, calculatedTi, boxRotated;

    // Select the orientation that gives more boxes per layer (TI)
    if (ti_rot > ti_std) {
        finalCols = colX_rot;
        finalRows = rowY_rot;
        calculatedTi = ti_rot;
        boxRotated = true;
    } else {
        finalCols = colX_std;
        finalRows = rowY_std;
        calculatedTi = ti_std;
        boxRotated = false;
    }
    
    // HI (High) for GP
    const validHeightGP = LIMIT_HEIGHT_GP - pH;
    const calculatedHiGP = Math.max(0, Math.floor(validHeightGP / bH));
    const stackHeightGP = pH + (calculatedHiGP * bH);

    // HI (High) for HQ
    const validHeightHQ = LIMIT_HEIGHT_HQ - pH;
    const calculatedHiHQ = Math.max(0, Math.floor(validHeightHQ / bH));
    const stackHeightHQ = pH + (calculatedHiHQ * bH);

    const newResults = {
      ti: calculatedTi,
      hiGP: calculatedHiGP,
      hiHQ: calculatedHiHQ,
      boxPerPalletGP: calculatedTi * calculatedHiGP,
      boxPerPalletHQ: calculatedTi * calculatedHiHQ,
      stackHeightGP,
      stackHeightHQ
    };
    setResults(newResults);
    setVisualData({ cols: finalCols, rows: finalRows, rotated: boxRotated });

    // --- 2. Container Logic ---
    
    // Function to calculate best fit for a container
    const calculateContainerFit = (contL: number, contW: number) => {
        // Option 1: Standard (Pallet L along Container L)
        // Cols = ContL / PalletL, Rows = ContW / PalletW
        const cols1 = Math.floor(contL / pL);
        const rows1 = Math.floor(contW / pW);
        const count1 = cols1 * rows1;

        // Option 2: Rotated (Pallet W along Container L)
        // Cols = ContL / PalletW, Rows = ContW / PalletL
        const cols2 = Math.floor(contL / pW);
        const rows2 = Math.floor(contW / pL);
        const count2 = cols2 * rows2;

        if (count1 >= count2) {
            return { count: count1, orientation: 'standard' as const, cols: cols1, rows: rows1 };
        } else {
            return { count: count2, orientation: 'rotated' as const, cols: cols2, rows: rows2 };
        }
    };

    const res20 = calculateContainerFit(CONT_20_L, CONT_W);
    const res40 = calculateContainerFit(CONT_40_L, CONT_W);

    const containerData: ContainerResult[] = [
      {
        type: '20GP',
        palletsFloor: res20.count,
        totalPallets: res20.count,
        totalBoxes: res20.count * newResults.boxPerPalletGP,
        loadUtilization: 0,
        orientation: res20.orientation,
        calcDetails: { cols: res20.cols, rows: res20.rows }
      },
      {
        type: '40GP',
        palletsFloor: res40.count,
        totalPallets: res40.count,
        totalBoxes: res40.count * newResults.boxPerPalletGP,
        loadUtilization: 0,
        orientation: res40.orientation,
        calcDetails: { cols: res40.cols, rows: res40.rows }
      },
      {
        type: '40HQ',
        palletsFloor: res40.count,
        totalPallets: res40.count,
        totalBoxes: res40.count * newResults.boxPerPalletHQ,
        loadUtilization: 0,
        orientation: res40.orientation,
        calcDetails: { cols: res40.cols, rows: res40.rows }
      }
    ];

    setContResults(containerData);
  };
  
  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pL, pW, pH, bL, bW, bH]);

  const isCustom = palletType === 'custom';
  const inputBaseClass = isCustom 
    ? "w-16 bg-white border border-blue-300 rounded px-1 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm py-0.5"
    : "w-12 border-none bg-transparent text-center font-bold text-slate-600 focus:ring-0 p-0 outline-none cursor-default select-none";

  // Helper to get current container stats
  const currentContData = contResults.find(c => c.type === selectedContView) || contResults[0];
  const isHQ = selectedContView === '40HQ';
  const currentLimit = isHQ ? LIMIT_HEIGHT_HQ : LIMIT_HEIGHT_GP;
  const currentStackHeight = isHQ ? results.stackHeightHQ : results.stackHeightGP;
  const currentHI = isHQ ? results.hiHQ : results.hiGP;
  const boxesPerStack = isHQ ? results.boxPerPalletHQ : results.boxPerPalletGP;

  // Visualization dimension helpers for Container
  const contLengthCm = selectedContView === '20GP' ? CONT_20_L : CONT_40_L;
  const visualPalletW = currentContData.orientation === 'standard' ? pL : pW;
  const visualPalletH = currentContData.orientation === 'standard' ? pW : pL;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 lg:p-8 h-full flex flex-col bg-slate-50/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              詳細棧板與貨櫃裝載規劃
              <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-white rounded-full border border-slate-200">Auto-calc in CM</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white border hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            關閉視窗 Esc
          </button>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {/* TOP SECTION: INPUTS & SINGLE PALLET */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* 1. Input Controls */}
            <div className="lg:col-span-4 space-y-4">
               {/* Pallet Config */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">1. 棧板規格 Pallet</label>
                </div>
                <select 
                  value={palletType}
                  onChange={(e) => handlePalletPresetChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mb-3 outline-none focus:border-blue-400"
                >
                  <option value="std">標準 Standard (120 x 100)</option>
                  <option value="euro">歐規 Euro (120 x 80)</option>
                  <option value="us">美規 US (122 x 102)</option>
                  <option value="custom">自訂尺寸 Custom</option>
                </select>

                <div className="grid grid-cols-3 gap-2">
                   <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <div className="text-[9px] text-slate-400 font-bold">Length</div>
                      <div className="flex justify-center items-center">
                        <input type="number" value={pL} readOnly={!isCustom} onChange={e => setPL(parseFloat(e.target.value))} className={inputBaseClass} />
                      </div>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <div className="text-[9px] text-slate-400 font-bold">Width</div>
                      <div className="flex justify-center items-center">
                        <input type="number" value={pW} readOnly={!isCustom} onChange={e => setPW(parseFloat(e.target.value))} className={inputBaseClass} />
                      </div>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/20"></div>
                      <div className="text-[9px] text-orange-400 font-bold">Base H</div>
                      <div className="flex justify-center items-center">
                        <input type="number" value={pH} readOnly={!isCustom} onChange={e => setPH(parseFloat(e.target.value))} className={inputBaseClass} />
                      </div>
                   </div>
                </div>
              </div>

              {/* Box Config */}
              <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full blur-xl"></div>
                <label className="block text-[10px] font-bold text-blue-500 mb-3 uppercase tracking-wide relative z-10">2. 貨箱規格 Carton</label>
                <div className="grid grid-cols-3 gap-2 relative z-10">
                  {['Length', 'Width', 'Height'].map((label, idx) => (
                    <div key={label} className="bg-white rounded-xl p-2 shadow-sm border border-blue-100 text-center">
                      <span className="text-[9px] text-blue-300 block uppercase font-bold">{label}</span>
                      <input 
                        type="number" 
                        value={idx === 0 ? bL : idx === 1 ? bW : bH} 
                        onChange={e => {
                           const val = parseFloat(e.target.value);
                           if (idx === 0) setBL(val);
                           if (idx === 1) setBW(val);
                           if (idx === 2) setBH(val);
                        }}
                        className="w-full text-center text-sm font-bold text-blue-600 bg-transparent border-none focus:ring-0 p-0 mt-0.5 outline-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Single Pallet Visualization (Top + Side) */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  單一棧板分析 Single Pallet Analysis
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">TI: {results.ti} (每層) x HI: {currentHI} (層數) = {currentHI * results.ti} 箱</span>
               </h3>
               
               <div className="flex flex-col md:flex-row gap-8 items-center justify-center flex-grow h-full">
                  {/* Top View */}
                  <div className="flex flex-col items-center w-full md:w-1/2">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top View (Plan)</div>
                        {visualData.rotated && (
                            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold animate-pulse">
                                已自動旋轉優化 (Auto-rotated)
                            </span>
                        )}
                     </div>
                     <div 
                        className="relative bg-slate-100 border-2 border-slate-300 shadow-lg transition-all duration-500"
                        style={{ 
                           aspectRatio: `${pL}/${pW}`, 
                           width: '100%',
                           maxWidth: '240px', 
                        }}
                     >
                        {visualData.cols > 0 && visualData.rows > 0 && Array.from({ length: visualData.rows }).map((_, r) => (
                           <React.Fragment key={r}>
                           {Array.from({ length: visualData.cols }).map((_, c) => {
                              // If rotated, we swap dimensions for visualization calculation
                              // Effective Width on Screen = Box Width if rotated, else Box Length
                              const effBL = visualData.rotated ? bW : bL;
                              const effBW = visualData.rotated ? bL : bW;
                              
                              const wPct = (effBL / pL) * 100;
                              const hPct = (effBW / pW) * 100;
                              return (
                                 <div
                                    key={`t-${r}-${c}`}
                                    className="absolute bg-blue-500 border border-white/30 flex items-center justify-center text-white text-[8px] overflow-hidden hover:bg-blue-600 transition-colors"
                                    style={{ left: `${c * wPct}%`, top: `${r * hPct}%`, width: `${wPct}%`, height: `${hPct}%` }}
                                 >
                                    {effBL > 15 ? `${effBL}x${effBW}` : ''}
                                 </div>
                              );
                           })}
                           </React.Fragment>
                        ))}
                        {/* Dimensions Label */}
                        <div className="absolute -bottom-5 w-full text-center text-[10px] text-slate-400">{pL} cm</div>
                        <div className="absolute -right-5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 rotate-90">{pW} cm</div>
                     </div>
                  </div>

                  {/* Side View */}
                  <div className="flex flex-col items-center w-full md:w-1/2 h-full justify-end">
                     <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">Side View (Stacking)</div>
                     <div className="relative w-48 bg-slate-100 border-x-2 border-t-2 border-slate-200 border-b-0 rounded-t-lg flex flex-col justify-end items-center overflow-hidden" style={{ height: '240px' }}>
                        {/* Limit Line Indicator */}
                        <div className={`absolute w-full border-t-2 border-dashed z-20 transition-all duration-500 ${isHQ ? 'top-[5%] border-purple-400' : 'top-[15%] border-red-400'}`}>
                           <span className={`absolute right-1 -top-4 text-[9px] font-bold ${isHQ ? 'text-purple-500' : 'text-red-500'}`}>
                              {isHQ ? '40HQ' : 'GP'} Limit ({currentLimit}cm)
                           </span>
                        </div>

                        {/* Boxes Stack */}
                        <div className="w-3/4 flex flex-col-reverse relative z-10 transition-all duration-500" style={{ height: `${(currentStackHeight / 280) * 100}%` }}>
                           {/* Pallet Base (Fixed: appears at bottom of stack in flex-col-reverse) */}
                           <div className="w-full bg-[#D4A373] border border-[#BC8A5F] flex items-center justify-center text-[8px] text-white/90 shadow-sm flex-shrink-0" style={{ height: `${(pH / currentStackHeight) * 100}%`, minHeight: '8px' }}>
                              Pallet {pH}cm
                           </div>
                           {/* Layers */}
                           {Array.from({ length: currentHI }).map((_, i) => (
                              <div key={`s-${i}`} className="w-full flex border-b border-white/20 flex-grow bg-blue-500 border-x border-blue-600 relative group">
                                 <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white group-hover:hidden">L{i+1}</span>
                              </div>
                           ))}
                        </div>
                        <div className="absolute bottom-1 right-2 text-[9px] font-bold text-slate-500">Total: {currentStackHeight}cm</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* BOTTOM SECTION: CONTAINER LOADING */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
               <div>
                  <h3 className="text-lg font-bold text-slate-800">貨櫃裝載模擬 Container Load Simulation</h3>
                  <p className="text-xs text-slate-400 mt-1">估算整個貨櫃可容納的棧板數與總箱數</p>
               </div>
               
               <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                  {(['20GP', '40GP', '40HQ'] as const).map(type => (
                     <button
                        key={type}
                        onClick={() => setSelectedContView(type)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                           selectedContView === type 
                              ? 'bg-white text-[#5B9BD5] shadow-sm scale-105' 
                              : 'text-slate-400 hover:text-slate-600'
                        }`}
                     >
                        {type}
                     </button>
                  ))}
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Pallets / Floor</div>
                  <div className="text-2xl font-bold text-slate-800">{currentContData.palletsFloor} <span className="text-sm font-medium text-slate-400">plts</span></div>
                  <div className="text-[9px] text-slate-400 mt-1">
                     排列: {currentContData.orientation === 'standard' ? '直向' : '橫向'} ({currentContData.calcDetails.cols}行 x {currentContData.calcDetails.rows}列)
                  </div>
               </div>
               
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Total Pallets</div>
                  <div className="text-2xl font-bold text-[#5B9BD5]">{currentContData.totalPallets} <span className="text-sm font-medium text-slate-400">plts</span></div>
               </div>

               <div className="bg-[#102A43] rounded-2xl p-4 shadow-lg text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
                  <div className="text-[10px] uppercase text-white/60 font-bold mb-1">Total Boxes</div>
                  <div className="text-3xl font-bold text-[#F0B429]">{currentContData.totalBoxes.toLocaleString()}</div>
               </div>
            </div>

            {/* Container Visualizations */}
            <div className="space-y-8">
               {/* Container Top View */}
               <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Container Top View (Floor Layout)</div>
                    <div className="text-[9px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                       公式: Floor(L/pL) × Floor(W/pW)
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                     <div 
                        className="relative bg-[#E2E8F0] border-4 border-slate-400 h-32 md:h-40 shadow-inner mx-auto overflow-hidden"
                        style={{ 
                           width: selectedContView === '20GP' ? '600px' : '1200px', // Fixed scale for visual
                           minWidth: selectedContView === '20GP' ? '600px' : '1200px'
                        }}
                     >
                        {/* Render pallets grid - REMOVED PADDING (p-1) to prevent size reduction causing wrap/overflow */}
                        <div className="w-full h-full flex flex-wrap content-start">
                           {Array.from({ length: currentContData.palletsFloor }).map((_, i) => (
                              <div 
                                 key={i} 
                                 className="bg-[#5B9BD5] border border-white text-white text-[10px] font-bold flex items-center justify-center relative group hover:bg-[#4A8AC2] box-border"
                                 style={{
                                    width: `${(visualPalletW / contLengthCm) * 100}%`,
                                    height: `${(visualPalletH / CONT_W) * 100}%`
                                 }}
                              >
                                 <span className="hidden group-hover:inline">P{i+1}</span>
                              </div>
                           ))}
                        </div>
                        <div className="absolute right-2 bottom-2 text-[10px] font-bold text-slate-500 bg-white/80 px-2 rounded">
                           {selectedContView === '20GP' ? '5.9m' : '12m'} Length
                        </div>
                     </div>
                  </div>
               </div>

               {/* Container Side View */}
               <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Container Side View (Height Check)</div>
                  <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                     <div 
                        className="relative bg-slate-100 border-y-4 border-x-4 border-slate-400 h-40 shadow-inner mx-auto flex items-end px-1 pb-[2px]"
                        style={{ 
                           width: selectedContView === '20GP' ? '600px' : '1200px',
                           minWidth: selectedContView === '20GP' ? '600px' : '1200px'
                        }}
                     >
                        {/* Limit Line */}
                        <div className="absolute w-full border-t-2 border-dashed border-slate-400 opacity-50 pointer-events-none z-10" style={{ top: 0 }}>
                           <span className="absolute right-2 top-0 text-[9px] text-slate-500 bg-white/80 px-1">Limit {currentLimit}cm</span>
                        </div>
                        
                        {/* Pallet Columns Side View - Single Layer Only */}
                        {Array.from({ length: Math.ceil(currentContData.palletsFloor / (currentContData.calcDetails.rows || 1)) }).map((_, colI) => (
                           <div key={colI} className="flex flex-col-reverse h-full justify-start mx-[1px] flex-1 max-w-[60px] relative">
                              {/* Bottom Pallet Stack */}
                              <div className="w-full bg-blue-200 border border-blue-300 flex flex-col justify-end relative group" style={{ height: `${(currentStackHeight / currentLimit) * 100}%` }}>
                                 {/* Cargo (Blue) - Top of stack */}
                                 <div className="flex-grow bg-blue-400/80 w-full border-b border-white/20 flex items-center justify-center">
                                    {/* Show Box Count overlay on hover or if large enough */}
                                    <span className="text-[9px] text-white font-bold drop-shadow-md">{boxesPerStack}</span>
                                 </div>
                                 {/* Pallet Base (Brown) - Bottom of stack */}
                                 <div className="bg-[#D4A373] h-[10%] w-full min-h-[4px] border-t border-[#BC8A5F]"></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default AdvancedPalletModal;
import React, { useState } from 'react';
import { Lock, Banknote, Unlock } from 'lucide-react';

interface ShiftManagerProps {
  onOpenShift: (startCash: number) => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({ onOpenShift }) => {
  const [startCash, setStartCash] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] animate-in fade-in">
      <div className="bg-dark-950 p-8 rounded-2xl border border-dark-800 shadow-2xl w-full max-w-md text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-fox-500 to-fox-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-fox-500/30">
          <Lock size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">الوردية مغلقة (Shift Closed)</h1>
        <p className="text-gray-400 mb-6">يجب فتح الوردية وتحديد رصيد بداية الدرج قبل البدء في البيع.</p>
        
        <div className="text-right mb-4">
          <label className="text-sm text-gray-300 font-bold mb-2 block">رصيد بداية الدرج (Opening Cash)</label>
          <div className="relative">
            <Banknote className="absolute right-3 top-3 text-gray-500" />
            <input 
              type="number" 
              autoFocus
              className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-3 rounded-lg focus:border-fox-500 outline-none text-xl font-bold"
              placeholder="0.00"
              value={startCash}
              onChange={e => setStartCash(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onOpenShift(Number(startCash) || 0);
              }}
            />
          </div>
        </div>
        
        <button 
          onClick={() => onOpenShift(Number(startCash) || 0)}
          className="w-full bg-gradient-to-r from-fox-500 to-fox-600 text-white py-3 rounded-lg font-bold hover:from-fox-600 hover:to-fox-700 transition-all shadow-lg shadow-fox-500/30 flex items-center justify-center gap-2"
        >
          <Unlock size={20} />
          فتح الوردية (Open Shift)
        </button>
      </div>
    </div>
  );
};

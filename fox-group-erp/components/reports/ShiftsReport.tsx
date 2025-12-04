import React from 'react';
import { Printer } from 'lucide-react';
import { Shift } from '../../types';

interface ShiftsReportProps {
  shifts: Shift[];
  onPrintShift: (shift: Shift) => void;
}

export const ShiftsReport: React.FC<ShiftsReportProps> = ({ shifts, onPrintShift }) => {
  return (
    <div className="animate-in fade-in">
      <div className="overflow-x-auto rounded-lg border border-dark-800">
        <table className="w-full text-right text-sm">
          <thead className="bg-dark-900 text-gray-400">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">الكاشير</th>
              <th className="p-3">البداية</th>
              <th className="p-3">النهاية</th>
              <th className="p-3">المبيعات</th>
              <th className="p-3">العجز/الزيادة</th>
              <th className="p-3 text-center">طباعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800 text-gray-300">
            {shifts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">لا يوجد سجل للورديات</td></tr>
            ) : (
              [...shifts].reverse().map(shift => (
                <tr key={shift.id} className="hover:bg-dark-900/50">
                  <td className="p-3 font-mono text-gray-500">{shift.id.toString().slice(-4)}</td>
                  <td className="p-3 text-white font-bold">{shift.userName}</td>
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(shift.startTime).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {shift.endTime ? new Date(shift.endTime).toLocaleString('ar-EG') : 'مفتوحة'}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    {shift.totalSales?.toLocaleString() || 0}
                  </td>
                  <td className="p-3">
                    {shift.status === 'closed' ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        (shift.endCash! - shift.expectedCash!) < 0 ? 'bg-red-500/20 text-red-500' :
                        (shift.endCash! - shift.expectedCash!) > 0 ? 'bg-emerald-500/20 text-emerald-500' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {(shift.endCash! - shift.expectedCash!).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-yellow-500 text-xs">جاري العمل...</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {shift.status === 'closed' && (
                      <button 
                        onClick={() => onPrintShift(shift)}
                        className="p-1.5 bg-dark-800 hover:bg-white hover:text-black rounded text-gray-400 transition-colors"
                        title="إعادة طباعة Z-Report"
                      >
                        <Printer size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

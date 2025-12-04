import React from 'react';
import { AlertOctagon, ShoppingBag } from 'lucide-react';
import { Customer, Supplier } from '../../types';

interface DebtsReportProps {
  customersWithDebt: Customer[];
  totalReceivables: number;
  suppliersWithCredit: Supplier[];
  totalPayables: number;
  topSuppliers: Array<{name: string, amount: number}>;
  overdueInvoices: any[];
}

export const DebtsReport: React.FC<DebtsReportProps> = ({
  customersWithDebt,
  totalReceivables,
  suppliersWithCredit,
  totalPayables,
  topSuppliers,
  overdueInvoices
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers Debts */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden lg:col-span-1">
          <div className="p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
            <h3 className="font-bold text-blue-400">مستحقات عند العملاء</h3>
            <span className="text-xl font-bold text-white">{totalReceivables.toLocaleString()} ج.م</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-dark-950 text-gray-500">
                <tr>
                  <th className="p-3">العميل</th>
                  <th className="p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {customersWithDebt.length === 0 ? (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">لا توجد ديون</td></tr>
                ) : (
                  customersWithDebt.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 text-gray-300">{c.name}</td>
                      <td className="p-3 font-bold text-blue-400 font-mono">
                        {Math.abs(c.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers Debts */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden lg:col-span-1">
          <div className="p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
            <h3 className="font-bold text-red-400">ديون للموردين</h3>
            <span className="text-xl font-bold text-white">{totalPayables.toLocaleString()} ج.م</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-dark-950 text-gray-500">
                <tr>
                  <th className="p-3">المورد</th>
                  <th className="p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {suppliersWithCredit.length === 0 ? (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">لا توجد مستحقات</td></tr>
                ) : (
                  suppliersWithCredit.map(s => (
                    <tr key={s.id}>
                      <td className="p-3 text-gray-300">{s.name}</td>
                      <td className="p-3 font-bold text-red-400 font-mono">{s.balance.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden lg:col-span-1">
          <div className="p-4 bg-dark-800 border-b border-dark-700 flex items-center gap-2">
            <ShoppingBag size={18} className="text-purple-400" />
            <h3 className="font-bold text-gray-200">أكثر الموردين تعاملاً</h3>
          </div>
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {topSuppliers.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-dark-800 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-dark-950 flex items-center justify-center text-xs text-gray-400">
                    {i+1}
                  </span>
                  <span className="text-gray-300">{s.name}</span>
                </div>
                <span className="font-bold text-purple-400">{s.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Invoices Table */}
      <div className="bg-dark-900 rounded-lg border border-red-900/30 overflow-hidden">
        <div className="p-4 bg-red-900/10 border-b border-red-900/30 flex items-center gap-2">
          <AlertOctagon size={20} className="text-red-500" />
          <h3 className="font-bold text-red-400">الفواتير المستحقة والمتأخرة (Overdue)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-dark-950 text-gray-500">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">تاريخ الاستحقاق</th>
                <th className="p-3">الطرف</th>
                <th className="p-3">النوع</th>
                <th className="p-3">القيمة</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {overdueInvoices.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">سجل نظيف! لا توجد فواتير متأخرة.</td></tr>
              ) : (
                overdueInvoices.map(t => (
                  <tr key={t.id} className="hover:bg-dark-800/50">
                    <td className="p-3 font-mono text-gray-300">#{t.id}</td>
                    <td className="p-3 text-gray-400">{new Date(t.dueDate).toLocaleDateString('ar-EG')}</td>
                    <td className="p-3 text-gray-300">{t.relatedName || 'غير محدد'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.isSale ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {t.isSale ? 'مبيعات' : 'مشتريات'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-red-400 font-mono">{t.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-400">متأخر</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Edit2, Trash2, DollarSign, User, Eye, FileText } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  onSettleDebt: (customer: Customer) => void;
  onViewInvoices: (customer: Customer) => void;
  onViewStatement: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onSettleDebt,
  onViewInvoices,
  onViewStatement
}) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User size={48} className="mx-auto mb-4 opacity-30" />
        <p>لا يوجد عملاء</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead className="bg-dark-900 text-gray-400">
          <tr>
            <th className="p-3">الاسم</th>
            <th className="p-3">الهاتف</th>
            <th className="p-3">النوع</th>
            <th className="p-3">الرصيد</th>
            <th className="p-3">حد الائتمان</th>
            <th className="p-3">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-800">
          {customers.map(customer => {
            const hasDebt = customer.balance < 0;
            const debtAmount = Math.abs(customer.balance);

            return (
              <tr key={customer.id} className="hover:bg-dark-900/50 text-gray-300">
                <td className="p-3 font-bold text-white">{customer.name}</td>
                <td className="p-3 font-mono text-gray-400">{customer.phone}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    customer.type === 'business' 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {customer.type === 'business' ? 'تاجر' : 'مستهلك'}
                  </span>
                </td>
                <td className="p-3">
                  {hasDebt ? (
                    <span className="font-bold text-red-400">
                      مدين: {debtAmount.toLocaleString()} ج.م
                    </span>
                  ) : (
                    <span className="text-gray-500">لا يوجد</span>
                  )}
                </td>
                <td className="p-3 font-mono text-gray-400">
                  {customer.type === 'business' ? `${customer.creditLimit.toLocaleString()} ج.م` : '-'}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-start gap-2 flex-wrap">
                    <button
                      onClick={() => onViewInvoices(customer)}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-xs"
                      title="الفواتير"
                    >
                      <Eye size={14} />
                      الفواتير
                    </button>
                    {hasDebt && (
                      <button
                        onClick={() => onSettleDebt(customer)}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-xs"
                        title="تسوية الدين"
                      >
                        <DollarSign size={14} />
                        تسوية
                      </button>
                    )}
                    <button
                      onClick={() => onViewStatement(customer)}
                      className="flex items-center gap-1 px-2 py-1 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs"
                      title="كشف حساب"
                    >
                      <FileText size={14} />
                      كشف حساب
                    </button>
                    <button
                      onClick={() => onEdit(customer)}
                      className="flex items-center gap-1 px-2 py-1 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs"
                      title="تعديل"
                    >
                      <Edit2 size={14} />
                      تعديل
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="p-1.5 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

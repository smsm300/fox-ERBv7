import React from 'react';
import { Edit2, Trash2, DollarSign, User } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  onSettleDebt: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onSettleDebt
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
            <th className="p-3 text-center">الإجراءات</th>
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
                  <div className="flex items-center justify-center gap-2">
                    {hasDebt && (
                      <button
                        onClick={() => onSettleDebt(customer)}
                        className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"
                        title="تسوية الدين"
                      >
                        <DollarSign size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-1.5 bg-fox-500/10 text-fox-400 rounded hover:bg-fox-500/20"
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                      title="حذف"
                    >
                      <Trash2 size={16} />
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

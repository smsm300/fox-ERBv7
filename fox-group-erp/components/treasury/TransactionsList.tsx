import React from 'react';
import { Eye, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Transaction, TransactionType, User } from '../../types';

interface TransactionsListProps {
  transactions: Transaction[];
  currentUser: User;
  onViewDetails: (transaction: Transaction) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReturn?: (transaction: Transaction) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  currentUser,
  onViewDetails,
  onApprove,
  onReject,
  onReturn
}) => {

  const canReturn = (transaction: Transaction) => {
    return (
      (transaction.type === TransactionType.SALE || transaction.type === TransactionType.PURCHASE) &&
      transaction.status === 'completed'
    );
  };
  const getTransactionTypeLabel = (type: TransactionType) => {
    const labels = {
      [TransactionType.SALE]: 'مبيعات',
      [TransactionType.PURCHASE]: 'مشتريات',
      [TransactionType.EXPENSE]: 'مصروف',
      [TransactionType.RETURN]: 'مرتجع',
      [TransactionType.CAPITAL]: 'رأس مال',
      [TransactionType.WITHDRAWAL]: 'سحب',
      [TransactionType.ADJUSTMENT]: 'تسوية'
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type: TransactionType) => {
    const colors = {
      [TransactionType.SALE]: 'text-emerald-400',
      [TransactionType.PURCHASE]: 'text-blue-400',
      [TransactionType.EXPENSE]: 'text-red-400',
      [TransactionType.RETURN]: 'text-orange-400',
      [TransactionType.CAPITAL]: 'text-purple-400',
      [TransactionType.WITHDRAWAL]: 'text-pink-400',
      [TransactionType.ADJUSTMENT]: 'text-yellow-400'
    };
    return colors[type] || 'text-gray-400';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>لا توجد معاملات</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <tbody className="divide-y divide-dark-800">
          {transactions.map(transaction => (
            <tr key={transaction.id} className="hover:bg-dark-900/50 text-gray-300">
              <td className="p-3 font-mono text-gray-500">#{transaction.id}</td>
              <td className="p-3 text-xs text-gray-400">
                {new Date(transaction.date).toLocaleDateString('ar-EG')}
              </td>
              <td className="p-3">
                <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                  {getTransactionTypeLabel(transaction.type)}
                </span>
              </td>
              <td className="p-3 font-mono font-bold text-white">
                {transaction.amount.toLocaleString()} ج.م
              </td>
              <td className="p-3 text-gray-400 max-w-xs truncate">
                {transaction.description}
              </td>
              <td className="p-3">
                {transaction.status === 'pending' ? (
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                    معلق
                  </span>
                ) : transaction.status === 'completed' ? (
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded text-xs">
                    مكتمل
                  </span>
                ) : transaction.status === 'rejected' ? (
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                    مرفوض
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                    مكتمل
                  </span>
                )}
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onViewDetails(transaction)}
                    className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"
                    title="عرض التفاصيل"
                  >
                    <Eye size={16} />
                  </button>
                  {transaction.status === 'pending' && currentUser.role === 'admin' && onApprove && onReject && (
                    <>
                      <button
                        onClick={() => onApprove(transaction.id.toString())}
                        className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"
                        title="قبول"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => onReject(transaction.id.toString())}
                        className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                        title="رفض"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {canReturn(transaction) && onReturn && (
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من إرجاع هذه الفاتورة؟')) {
                          onReturn(transaction);
                        }
                      }}
                      className="p-1.5 bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500/20"
                      title="مرتجع"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

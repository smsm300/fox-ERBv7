import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Customer, PaymentMethod } from '../../types';

interface DebtSettlementProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSettle: (customerId: number, amount: number, paymentMethod: PaymentMethod) => void;
}

export const DebtSettlement: React.FC<DebtSettlementProps> = ({
  isOpen,
  onClose,
  customer,
  onSettle
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  if (!isOpen || !customer) return null;

  const debtAmount = Math.abs(customer.balance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settleAmount = Number(amount);
    if (settleAmount > 0 && settleAmount <= debtAmount) {
      onSettle(customer.id, settleAmount, paymentMethod);
      setAmount('');
      setPaymentMethod(PaymentMethod.CASH);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-950 rounded-xl border border-dark-800 w-full max-w-md">
        <div className="border-b border-dark-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">تسوية الدين</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
            <h3 className="font-bold text-white mb-2">{customer.name}</h3>
            <p className="text-sm text-gray-400">
              الدين الحالي: <span className="font-bold text-red-400">{debtAmount.toLocaleString()} ج.م</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">المبلغ المدفوع *</label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-2.5 text-gray-500" size={20} />
              <input
                type="number"
                required
                min="0"
                max={debtAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              الحد الأقصى: {debtAmount.toLocaleString()} ج.م
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">طريقة الدفع *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg focus:border-fox-500 outline-none"
            >
              <option value={PaymentMethod.CASH}>كاش</option>
              <option value={PaymentMethod.WALLET}>محفظة</option>
              <option value={PaymentMethod.INSTAPAY}>Instapay</option>
            </select>
          </div>

          {amount && Number(amount) > 0 && (
            <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
              <p className="text-sm text-gray-400 mb-1">الرصيد بعد التسوية:</p>
              <p className="text-2xl font-bold text-fox-400">
                {(debtAmount - Number(amount)).toLocaleString()} ج.م
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!amount || Number(amount) <= 0 || Number(amount) > debtAmount}
              className="flex-1 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              تأكيد التسوية
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-dark-900 text-gray-300 py-2 rounded-lg font-bold hover:bg-dark-800 border border-dark-700"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

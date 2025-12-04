import React from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'deposit' | 'withdrawal', amount: number, description: string) => void;
  type: 'deposit' | 'withdrawal';
  onTypeChange: (type: 'deposit' | 'withdrawal') => void;
  formData: { amount: string; description: string };
  onFormChange: (field: string, value: string) => void;
}

export const CapitalModal: React.FC<CapitalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  onTypeChange,
  formData,
  onFormChange
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, Number(formData.amount), formData.description);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-950 rounded-xl border border-dark-800 w-full max-w-md">
        <div className="border-b border-dark-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {type === 'deposit' ? 'إيداع رأس مال' : 'سحب رأس مال'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">نوع العملية</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onTypeChange('deposit')}
                className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  type === 'deposit'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
                }`}
              >
                <ArrowDownLeft size={16} />
                إيداع
              </button>
              <button
                type="button"
                onClick={() => onTypeChange('withdrawal')}
                className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  type === 'withdrawal'
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
                }`}
              >
                <ArrowUpRight size={16} />
                سحب
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">المبلغ *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => onFormChange('amount', e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوصف *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none resize-none"
              rows={3}
              placeholder="اذكر سبب العملية..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                type === 'deposit'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              تأكيد {type === 'deposit' ? 'الإيداع' : 'السحب'}
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

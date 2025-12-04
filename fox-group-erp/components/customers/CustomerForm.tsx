import React from 'react';
import { X } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'balance'>) => void;
  editingCustomer: Customer | null;
  formData: Omit<Customer, 'id' | 'balance'>;
  onFormChange: (field: keyof Omit<Customer, 'id' | 'balance'>, value: any) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCustomer,
  formData,
  onFormChange
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-950 rounded-xl border border-dark-800 w-full max-w-md">
        <div className="border-b border-dark-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {editingCustomer ? 'تعديل عميل' : 'إضافة عميل جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">اسم العميل *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => onFormChange('phone', e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">نوع العميل *</label>
            <select
              value={formData.type}
              onChange={(e) => onFormChange('type', e.target.value as 'consumer' | 'business')}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
            >
              <option value="consumer">مستهلك (Consumer)</option>
              <option value="business">تاجر (Business)</option>
            </select>
          </div>

          {formData.type === 'business' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">حد الائتمان</label>
              <input
                type="number"
                min="0"
                value={formData.creditLimit}
                onChange={(e) => onFormChange('creditLimit', Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors"
            >
              {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
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

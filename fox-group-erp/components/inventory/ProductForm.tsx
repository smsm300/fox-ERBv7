import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  editingProduct: Product | null;
  formData: Omit<Product, 'id'>;
  onFormChange: (field: keyof Omit<Product, 'id'>, value: any) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
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
      <div className="bg-dark-950 rounded-xl border border-dark-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-950 border-b border-dark-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">اسم المنتج *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => onFormChange('sku', e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الفئة *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => onFormChange('category', e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الكمية *</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => onFormChange('quantity', Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الوحدة *</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => onFormChange('unit', e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">سعر التكلفة *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => onFormChange('costPrice', Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">سعر البيع *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.sellPrice}
                onChange={(e) => onFormChange('sellPrice', Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">حد التنبيه *</label>
              <input
                type="number"
                required
                value={formData.minStockAlert}
                onChange={(e) => onFormChange('minStockAlert', Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">رابط الصورة</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => onFormChange('image', e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors"
            >
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
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

import React, { useRef, useState } from 'react';
import { X, RefreshCw, Upload, Link, Plus } from 'lucide-react';
import { Product } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  editingProduct: Product | null;
  formData: Omit<Product, 'id'>;
  onFormChange: (field: keyof Omit<Product, 'id'>, value: any) => void;
  existingCategories?: string[];
  existingUnits?: string[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  onFormChange,
  existingCategories = [],
  existingUnits = []
}) => {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');

  if (!isOpen) return null;

  // Add new category
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onFormChange('category', newCategory.trim());
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  // Add new unit
  const handleAddUnit = () => {
    if (newUnit.trim()) {
      onFormChange('unit', newUnit.trim());
      setNewUnit('');
      setShowNewUnit(false);
    }
  };

  // Generate SKU automatically
  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sku = `PRD-${timestamp}-${random}`;
    onFormChange('sku', sku);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      onFormChange('image', base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL change
  const handleUrlChange = (url: string) => {
    onFormChange('image', url);
    setImagePreview(url);
  };

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
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => onFormChange('sku', e.target.value)}
                  className="flex-1 bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
                  placeholder="أدخل SKU أو اضغط توليد"
                />
                <button
                  type="button"
                  onClick={generateSKU}
                  className="px-3 py-2 bg-fox-500/20 text-fox-400 rounded-lg hover:bg-fox-500/30 flex items-center gap-1"
                  title="توليد SKU تلقائي"
                >
                  <RefreshCw size={16} />
                  توليد
                </button>
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الفئة *</label>
              {showNewCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="اسم الفئة الجديدة"
                    className="flex-1 bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-fox-500 text-white rounded-lg hover:bg-fox-600"
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="px-3 py-2 bg-dark-800 text-gray-400 rounded-lg hover:bg-dark-700"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => onFormChange('category', e.target.value)}
                    className="flex-1 bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
                  >
                    <option value="">اختر الفئة</option>
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="px-3 py-2 bg-fox-500/20 text-fox-400 rounded-lg hover:bg-fox-500/30"
                    title="إضافة فئة جديدة"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
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
              {showNewUnit ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="اسم الوحدة الجديدة"
                    className="flex-1 bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="px-3 py-2 bg-fox-500 text-white rounded-lg hover:bg-fox-600"
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewUnit(false)}
                    className="px-3 py-2 bg-dark-800 text-gray-400 rounded-lg hover:bg-dark-700"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => onFormChange('unit', e.target.value)}
                    className="flex-1 bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
                  >
                    <option value="">اختر الوحدة</option>
                    {existingUnits.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewUnit(true)}
                    className="px-3 py-2 bg-fox-500/20 text-fox-400 rounded-lg hover:bg-fox-500/30"
                    title="إضافة وحدة جديدة"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
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

          </div>

          {/* Image Section */}
          <div className="border-t border-dark-800 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">صورة المنتج</label>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  imageMode === 'url'
                    ? 'bg-fox-500 text-white'
                    : 'bg-dark-900 text-gray-400 border border-dark-700 hover:bg-dark-800'
                }`}
              >
                <Link size={16} />
                رابط صورة
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  imageMode === 'upload'
                    ? 'bg-fox-500 text-white'
                    : 'bg-dark-900 text-gray-400 border border-dark-700 hover:bg-dark-800'
                }`}
              >
                <Upload size={16} />
                رفع صورة
              </button>
            </div>

            {/* URL Input */}
            {imageMode === 'url' && (
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            )}

            {/* File Upload */}
            {imageMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-dark-700 rounded-lg p-6 text-center cursor-pointer hover:border-fox-500/50 transition-colors"
              >
                <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400 text-sm">اضغط لاختيار صورة</p>
                <p className="text-gray-500 text-xs mt-1">PNG, JPG حتى 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-24 h-24 object-cover rounded-lg border border-dark-700"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    onFormChange('image', '');
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
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

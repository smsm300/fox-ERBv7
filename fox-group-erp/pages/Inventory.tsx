import React, { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { ProductForm } from '../components/inventory/ProductForm';
import { ProductList } from '../components/inventory/ProductList';
import { StockAdjustment } from '../components/inventory/StockAdjustment';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustStock
} from '../hooks/useProducts';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { showToast } from '../components/ui/Toast';

interface InventoryProps {
  onProductsChange?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ onProductsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // React Query hooks
  const { data: products = [], isLoading, refetch, isFetching } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustStock = useAdjustStock();

  // Confirm dialog hook
  const { confirm } = useConfirm();

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    sku: '',
    name: '',
    category: '',
    quantity: 0,
    costPrice: 0,
    sellPrice: 0,
    unit: 'قطعة',
    minStockAlert: 5,
    image: '',
    barcode: ''
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const existingUnits = Array.from(new Set(products.map(p => p.unit).filter(Boolean)));

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [products, searchTerm, selectedCategory]);

  const handleOpenForm = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      category: '',
      quantity: 0,
      costPrice: 0,
      sellPrice: 0,
      unit: 'قطعة',
      minStockAlert: 5,
      image: '',
      barcode: ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      unit: product.unit,
      minStockAlert: product.minStockAlert,
      image: product.image || '',
      barcode: product.barcode || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      setIsFormOpen(false);
      onProductsChange?.();
    } catch (err) {
      // Error is handled by the mutation hook
    }
  };

  const handleFormChange = (field: keyof Omit<Product, 'id'>, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
  };

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product);
    setIsStockAdjustmentOpen(true);
  };

  const handleStockAdjustment = async (productId: number, quantity: number, reason: string) => {
    try {
      await adjustStock.mutateAsync({ id: productId, data: { quantity_diff: quantity, reason } });
      setIsStockAdjustmentOpen(false);
      onProductsChange?.();
    } catch (err) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'حذف المنتج',
      message: 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteProduct.mutateAsync(id);
        onProductsChange?.();
      } catch (err) {
        // Error is handled by the mutation hook
      }
    }
  };

  const isAnyLoading = isLoading || createProduct.isPending || updateProduct.isPending || deleteProduct.isPending || adjustStock.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو SKU أو الباركود..."
              className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-dark-900 border border-dark-700 rounded-lg hover:bg-dark-800 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={20} className={`text-gray-400 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleOpenForm}
          disabled={isAnyLoading}
          className="flex items-center gap-2 bg-fox-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
              ? 'bg-fox-500 text-white shadow-md'
              : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
              }`}
          >
            {cat === 'all' ? 'الكل' : cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-fox-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">جاري تحميل المنتجات...</p>
            </div>
          </div>
        ) : (
          <ProductList
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdjustStock={handleAdjustStock}
          />
        )}
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        onFormChange={handleFormChange}
        existingCategories={existingCategories}
        existingUnits={existingUnits}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustment
        isOpen={isStockAdjustmentOpen}
        onClose={() => setIsStockAdjustmentOpen(false)}
        product={adjustingProduct}
        onAdjust={handleStockAdjustment}
        isLoading={adjustStock.isPending}
      />
    </div>
  );
};

export default Inventory;

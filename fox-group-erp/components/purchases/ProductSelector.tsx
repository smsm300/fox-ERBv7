import React from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { Product } from '../../types';

interface ProductSelectorProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  searchTerm,
  onSearchChange,
  onAddToCart
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-3 rounded-lg focus:border-fox-500 outline-none"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Products List */}
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>لا توجد منتجات</p>
          </div>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              className="bg-dark-900 border border-dark-700 rounded-lg p-3 hover:border-fox-500 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm mb-1 group-hover:text-fox-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400">
                      المخزون: <span className="font-bold text-emerald-400">{product.quantity} {product.unit}</span>
                    </span>
                    <span className="text-gray-400">
                      التكلفة: <span className="font-bold text-fox-400">{product.costPrice.toLocaleString()} ج.م</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  className="p-2 bg-fox-500/10 text-fox-400 rounded-lg hover:bg-fox-500/20 transition-colors"
                  title="إضافة للسلة"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

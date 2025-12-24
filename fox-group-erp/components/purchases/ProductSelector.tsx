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
              onClick={() => onAddToCart(product)}
              className="bg-dark-900 border border-dark-700 rounded-lg p-3 hover:border-fox-500 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Product Image Thumbnail */}
                <div className="w-12 h-12 bg-dark-800 rounded-md overflow-hidden flex-shrink-0 border border-dark-700">
                  <img
                    src={product.image || '/fox-logo.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('fox-logo.png')) {
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-dark-600"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>';
                        }
                      } else {
                        target.src = '/fox-logo.png';
                      }
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white text-sm group-hover:text-fox-400 transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-fox-400 font-bold text-sm">{product.costPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">SKU: {product.sku}</span>
                    <span className="text-gray-400">
                      المخزون: <span className="font-bold text-emerald-400">{product.quantity} {product.unit}</span>
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-fox-500/10 text-fox-400 rounded-lg group-hover:bg-fox-500/20 transition-colors">
                  <Plus size={18} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

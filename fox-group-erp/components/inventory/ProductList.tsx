import React from 'react';
import { Edit2, Trash2, AlertTriangle, Package, Barcode, Printer } from 'lucide-react';
import { Product } from '../../types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAdjustStock: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onAdjustStock
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package size={48} className="mx-auto mb-4 opacity-30" />
        <p>لا توجد منتجات</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead className="bg-dark-900 text-gray-400">
          <tr>
            <th className="p-3">الصورة</th>
            <th className="p-3">SKU</th>
            <th className="p-3">الباركود</th>
            <th className="p-3">الاسم</th>
            <th className="p-3">الفئة</th>
            <th className="p-3">الكمية</th>
            <th className="p-3">التكلفة</th>
            <th className="p-3">السعر</th>
            <th className="p-3 text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-800">
          {products.map(product => {
            // Convert string values from API to numbers
            const qty = Number(product.quantity) || 0;
            const cost = Number(product.costPrice) || 0;
            const sell = Number(product.sellPrice) || 0;
            const minAlert = Number(product.minStockAlert) || 0;

            const profit = sell - cost;
            const profitMargin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : '0.0';
            const isLowStock = qty <= minAlert;

            return (
              <tr key={product.id} className="hover:bg-dark-900/50 text-gray-300">
                <td className="p-3">
                  <div className="w-10 h-10 bg-dark-800 rounded overflow-hidden border border-dark-700">
                    <img
                      src={product.image || '/fox-logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Prevent infinite loop if logo fails
                        if (target.src.includes('fox-logo.png')) {
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<span class="text-xs text-gray-500">No Img</span>';
                        } else {
                          target.src = '/fox-logo.png';
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="p-3 font-mono text-gray-500">{product.sku}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="font-mono text-xs text-gray-400">{product.barcode || '---'}</span>
                    {product.barcode && (
                      <span className="font-libre-barcode text-2xl text-white leading-none" title={product.barcode}>
                        {product.barcode}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-bold text-white">{product.name}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-dark-800 rounded text-xs">
                    {product.category}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {isLowStock && (
                      <AlertTriangle size={16} className="text-yellow-500" />
                    )}
                    <span className={`font-bold ${qty === 0 ? 'text-red-400' :
                      isLowStock ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                      {qty} {product.unit}
                    </span>
                  </div>
                </td>
                <td className="p-3 font-mono">{cost.toLocaleString()}</td>
                <td className="p-3 font-mono font-bold text-fox-400">
                  {sell.toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-400">
                      {profit.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {profitMargin}%
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        const win = window.open('', '_blank', 'width=400,height=500');
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>Barcode - ${product.name}</title>
                                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
                                <style>
                                  @font-face {
                                    font-family: 'Libre Barcode 39 Text';
                                    src: url('/fonts/librebarcode39text.woff2') format('woff2');
                                  }
                                  body { 
                                    font-family: 'Cairo', sans-serif;
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    justify-content: center;
                                    background: #f0f0f0;
                                  }
                                  .label-card {
                                    background: white;
                                    width: 300px;
                                    padding: 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                                    text-align: center;
                                    border: 1px dashed #ccc;
                                  }
                                  .brand-name {
                                    color: #f97316;
                                    font-weight: bold;
                                    font-size: 14px;
                                    margin-bottom: 10px;
                                    letter-spacing: 2px;
                                  }
                                  .product-name {
                                    font-size: 18px;
                                    font-weight: 700;
                                    color: #1a1a1a;
                                    margin-bottom: 5px;
                                    display: -webkit-box;
                                    -webkit-line-clamp: 2;
                                    -webkit-box-orient: vertical;
                                    overflow: hidden;
                                  }
                                  .category {
                                    font-size: 11px;
                                    color: #666;
                                    background: #f3f4f6;
                                    padding: 2px 8px;
                                    border-radius: 4px;
                                    display: inline-block;
                                    margin-bottom: 15px;
                                  }
                                  .barcode-container {
                                    margin: 15px 0;
                                    padding: 10px;
                                    background: #fff;
                                  }
                                  .barcode-font {
                                    font-family: 'Libre Barcode 39 Text';
                                    font-size: 70px;
                                    margin: 0;
                                    line-height: 1;
                                    color: #000;
                                  }
                                  .barcode-text {
                                    font-family: monospace;
                                    font-size: 12px;
                                    color: #333;
                                    margin-top: 5px;
                                  }
                                  .price-tag {
                                    margin-top: 15px;
                                    padding-top: 15px;
                                    border-top: 2px solid #f3f4f6;
                                  }
                                  .price-value {
                                    font-size: 28px;
                                    font-weight: 900;
                                    color: #f97316;
                                  }
                                  .currency {
                                    font-size: 14px;
                                    margin-right: 4px;
                                    color: #666;
                                  }
                                  @media print {
                                    body { background: white; padding: 0; }
                                    .label-card { box-shadow: none; border: 1px solid #000; }
                                  }
                                </style>
                              </head>
                              <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
                                <div class="label-card">
                                  <div class="brand-name">FOX GROUP</div>
                                  <div class="product-name">${product.name}</div>
                                  <div class="category">${product.category}</div>
                                  
                                  <div class="barcode-container">
                                    <div class="barcode-font">${product.barcode || product.sku}</div>
                                    <div class="barcode-text">${product.barcode || product.sku}</div>
                                  </div>
                                  
                                  <div class="price-tag">
                                    <span class="price-value">${product.sellPrice.toLocaleString()}</span>
                                    <span class="currency">ج.م</span>
                                  </div>
                                  
                                  <div style="font-size: 10px; color: #999; margin-top: 10px;">SKU: ${product.sku}</div>
                                </div>
                              </body>
                            </html>
                          `);
                        }
                      }}
                      className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded hover:bg-yellow-500/20"
                      title="طباعة باركود"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => onAdjustStock(product)}
                      className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"
                      title="تعديل المخزون"
                    >
                      <Package size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 bg-fox-500/10 text-fox-400 rounded hover:bg-fox-500/20"
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
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

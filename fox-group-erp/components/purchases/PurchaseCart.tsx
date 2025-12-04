import React from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
import { CartItem, Supplier, PaymentMethod } from '../../types';

interface PurchaseCartProps {
  cart: CartItem[];
  selectedSupplier: number;
  suppliers: Supplier[];
  paymentMethod: PaymentMethod;
  dueDate: string;
  onUpdateItem: (id: number, field: keyof CartItem, value: number) => void;
  onRemoveItem: (id: number) => void;
  onSupplierChange: (supplierId: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDueDateChange: (date: string) => void;
  onCompletePurchase: () => void;
  onClearCart: () => void;
}

export const PurchaseCart: React.FC<PurchaseCartProps> = ({
  cart,
  selectedSupplier,
  suppliers,
  paymentMethod,
  dueDate,
  onUpdateItem,
  onRemoveItem,
  onSupplierChange,
  onPaymentMethodChange,
  onDueDateChange,
  onCompletePurchase,
  onClearCart
}) => {
  const total = cart.reduce((sum, item) => sum + (item.costPrice * item.cartQuantity), 0);

  return (
    <div className="bg-dark-950 rounded-xl border border-dark-800 p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingBag className="text-fox-500" />
        سلة المشتريات ({cart.length})
      </h2>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-2">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>السلة فارغة</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-dark-900 border border-dark-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">سعر الوحدة: {item.costPrice.toLocaleString()} ج.م</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    value={item.cartQuantity}
                    onChange={(e) => onUpdateItem(item.id, 'cartQuantity', Number(e.target.value))}
                    className="w-full bg-dark-800 border border-dark-700 text-white px-2 py-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">السعر</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.costPrice}
                    onChange={(e) => onUpdateItem(item.id, 'costPrice', Number(e.target.value))}
                    className="w-full bg-dark-800 border border-dark-700 text-white px-2 py-1 rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-right">
                <span className="text-xs text-gray-400">الإجمالي: </span>
                <span className="font-bold text-fox-400">
                  {(item.costPrice * item.cartQuantity).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Selection */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 mb-1 block">المورد</label>
        <select
          value={selectedSupplier}
          onChange={(e) => onSupplierChange(Number(e.target.value))}
          className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
        >
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} {s.balance > 0 ? `(مستحق: ${s.balance.toLocaleString()})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 mb-1 block">طريقة الدفع</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: PaymentMethod.CASH, label: 'نقدي' },
            { value: PaymentMethod.WALLET, label: 'محفظة' },
            { value: PaymentMethod.DEFERRED, label: 'آجل' }
          ].map(method => (
            <button
              key={method.value}
              onClick={() => onPaymentMethodChange(method.value)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === method.value
                  ? 'bg-fox-500 text-white'
                  : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due Date (if deferred) */}
      {paymentMethod === PaymentMethod.DEFERRED && (
        <div className="mb-3">
          <label className="text-sm text-gray-400 mb-1 block">تاريخ الاستحقاق</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
          />
        </div>
      )}

      {/* Total */}
      <div className="border-t border-dark-800 pt-3 mb-4">
        <div className="flex justify-between text-xl font-bold text-white">
          <span>الإجمالي</span>
          <span className="text-fox-400">{total.toLocaleString()} ج.م</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onCompletePurchase}
          disabled={cart.length === 0}
          className="w-full bg-gradient-to-r from-fox-500 to-fox-600 text-white py-3 rounded-lg font-bold hover:from-fox-600 hover:to-fox-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fox-500/30"
        >
          إتمام الشراء ({total.toLocaleString()} ج.م)
        </button>
        
        <button
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="w-full bg-red-900/20 text-red-400 py-2 rounded-lg text-sm hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50"
        >
          مسح السلة
        </button>
      </div>
    </div>
  );
};

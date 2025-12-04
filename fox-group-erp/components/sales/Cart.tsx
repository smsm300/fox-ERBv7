import React from 'react';
import { Trash2, Plus, Minus, Percent, ShoppingCart } from 'lucide-react';
import { CartItem, Customer, PaymentMethod } from '../../types';

interface CartProps {
  cart: CartItem[];
  selectedCustomer: number;
  customers: Customer[];
  paymentMethod: PaymentMethod;
  isDirectSale: boolean;
  dueDate: string;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onOpenDiscountModal: (item: CartItem) => void;
  onCustomerChange: (customerId: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDirectSaleChange: (value: boolean) => void;
  onDueDateChange: (date: string) => void;
  onCompleteSale: () => void;
  onHoldCart: () => void;
  onClearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({
  cart,
  selectedCustomer,
  customers,
  paymentMethod,
  isDirectSale,
  dueDate,
  onUpdateQuantity,
  onRemoveItem,
  onOpenDiscountModal,
  onCustomerChange,
  onPaymentMethodChange,
  onDirectSaleChange,
  onDueDateChange,
  onCompleteSale,
  onHoldCart,
  onClearCart
}) => {
  const subTotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.cartQuantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + ((item.discount || 0) * item.cartQuantity), 0);
  const total = subTotal - totalDiscount;

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <div className="bg-dark-950 rounded-xl border border-dark-800 p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingCart className="text-fox-500" />
        السلة ({cart.length})
      </h2>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-2">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
            <p>السلة فارغة</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-dark-900 border border-dark-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.sellPrice.toLocaleString()} ج.م</p>
                  {item.discount && item.discount > 0 && (
                    <p className="text-xs text-emerald-400">خصم: {item.discount.toLocaleString()} ج.م</p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 rounded"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-white">{item.cartQuantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDiscountModal(item)}
                    className="p-1.5 bg-dark-800 hover:bg-fox-500/20 text-fox-400 rounded"
                    title="خصم"
                  >
                    <Percent size={14} />
                  </button>
                  <span className="font-bold text-fox-400">
                    {((item.sellPrice - (item.discount || 0)) * item.cartQuantity).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Selection */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 mb-1 block">العميل</label>
        <select
          value={selectedCustomer}
          onChange={(e) => onCustomerChange(Number(e.target.value))}
          className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
        >
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} {c.balance < 0 ? `(رصيد: ${Math.abs(c.balance).toLocaleString()})` : ''}
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
              disabled={method.value === PaymentMethod.DEFERRED && selectedCustomerData?.type === 'consumer'}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === method.value
                  ? 'bg-fox-500 text-white'
                  : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
              } ${method.value === PaymentMethod.DEFERRED && selectedCustomerData?.type === 'consumer' ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Direct Sale Checkbox */}
      <label className="flex items-center gap-2 mb-4 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={isDirectSale}
          onChange={(e) => onDirectSaleChange(e.target.checked)}
          className="w-4 h-4"
        />
        بيع مباشر (لا يؤثر على المخزون)
      </label>

      {/* Totals */}
      <div className="border-t border-dark-800 pt-3 mb-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>المجموع الفرعي</span>
          <span>{subTotal.toLocaleString()} ج.م</span>
        </div>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>الخصم</span>
            <span>- {totalDiscount.toLocaleString()} ج.م</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold text-white">
          <span>الإجمالي</span>
          <span className="text-fox-400">{total.toLocaleString()} ج.م</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onCompleteSale}
          disabled={cart.length === 0}
          className="w-full bg-gradient-to-r from-fox-500 to-fox-600 text-white py-3 rounded-lg font-bold hover:from-fox-600 hover:to-fox-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fox-500/30"
        >
          إتمام البيع ({total.toLocaleString()} ج.م)
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onHoldCart}
            disabled={cart.length === 0}
            className="bg-dark-900 text-gray-300 py-2 rounded-lg text-sm hover:bg-dark-800 border border-dark-700 disabled:opacity-50"
          >
            تعليق
          </button>
          <button
            onClick={onClearCart}
            disabled={cart.length === 0}
            className="bg-red-900/20 text-red-400 py-2 rounded-lg text-sm hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50"
          >
            مسح
          </button>
        </div>
      </div>
    </div>
  );
};

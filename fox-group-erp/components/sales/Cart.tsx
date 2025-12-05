import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Percent,
  ShoppingCart,
  Search,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import { CartItem, Customer, PaymentMethod } from '../../types';
import { Modal } from '../Modal';

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
  onAddCustomer?: (customer: Omit<Customer, 'id'>) => Customer;
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
  onClearCart,
  onAddCustomer,
}) => {
  const subTotal = cart.reduce(
    (sum, item) => sum + Number(item.sellPrice) * Number(item.cartQuantity),
    0
  );
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (Number(item.discount) || 0) * Number(item.cartQuantity),
    0
  );
  const total = subTotal - totalDiscount;

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const cashCustomer = customers.find((c) => c.name === 'عميل نقدي') || customers[0];

  // Modal states
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const handleAddNewCustomer = () => {
    if (!newCustomer.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }
    if (onAddCustomer) {
      const addedCustomer = onAddCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone || '',
        balance: 0,
        type: 'business',
        creditLimit: 10000,
      });
      // Select the newly added customer
      if (addedCustomer && addedCustomer.id) {
        onCustomerChange(addedCustomer.id);
      }
    }
    setNewCustomer({ name: '', phone: '' });
    setIsAddCustomerOpen(false);
  };

  return (
    <div className="bg-dark-950 rounded-xl border border-dark-800 p-3 flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-fox-500" size={20} />
          السلة ({cart.length})
        </h2>
        <span className="text-fox-400 font-bold">{total.toLocaleString()} ج.م</span>
      </div>

      {/* Customer Row - Compact */}
      <div className="flex items-center gap-2 mb-2 bg-dark-900 rounded-lg p-2">
        <span className="text-xs text-gray-400">العميل:</span>
        <span className="text-sm text-white font-medium flex-1 truncate">
          {selectedCustomerData?.name || 'عميل نقدي'}
        </span>
        <button
          onClick={() => setIsCustomerSearchOpen(true)}
          className="p-1.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded"
          title="بحث عن عميل"
        >
          <Search size={14} />
        </button>
        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="p-1.5 bg-fox-500/10 hover:bg-fox-500/20 text-fox-400 rounded"
          title="إضافة عميل جديد"
        >
          <UserPlus size={14} />
        </button>
      </div>

      {/* Payment Method Row - Compact */}
      <div className="flex items-center gap-2 mb-3 bg-dark-900 rounded-lg p-2">
        <span className="text-xs text-gray-400">الدفع:</span>
        <button
          onClick={() => onPaymentMethodChange(PaymentMethod.CASH)}
          className={`px-3 py-1 rounded text-xs font-medium ${
            paymentMethod === PaymentMethod.CASH
              ? 'bg-fox-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          نقدي
        </button>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 ${
            paymentMethod !== PaymentMethod.CASH
              ? 'bg-fox-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          <CreditCard size={12} />
          {paymentMethod !== PaymentMethod.CASH
            ? paymentMethod === PaymentMethod.WALLET
              ? 'محفظة'
              : 'آجل'
            : 'أخرى'}
        </button>
      </div>

      {/* Cart Items - Maximum Space */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
        {cart.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">السلة فارغة</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-dark-900 border border-dark-700 rounded px-2 py-1.5 flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white truncate">{item.name}</span>
                  {item.discount && item.discount > 0 && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">
                      -{item.discount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">
                  {Number(item.sellPrice).toLocaleString()} × {item.cartQuantity}
                </span>
              </div>

              <div className="flex items-center gap-0.5 bg-dark-800 rounded">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <Minus size={10} />
                </button>
                <span className="w-5 text-center text-xs font-bold text-white">
                  {item.cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <Plus size={10} />
                </button>
              </div>

              <button
                onClick={() => onOpenDiscountModal(item)}
                className="w-5 h-5 flex items-center justify-center text-fox-400 hover:bg-fox-500/20 rounded"
              >
                <Percent size={10} />
              </button>

              <span className="text-xs font-bold text-fox-400 min-w-[50px] text-left">
                {((item.sellPrice - (item.discount || 0)) * item.cartQuantity).toLocaleString()}
              </span>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="w-5 h-5 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals - Compact */}
      <div className="border-t border-dark-800 pt-2 mt-2 space-y-1">
        {totalDiscount > 0 && (
          <div className="flex justify-between text-xs text-emerald-400">
            <span>خصم</span>
            <span>- {totalDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-white">
          <span>الإجمالي</span>
          <span className="text-fox-400">{total.toLocaleString()} ج.م</span>
        </div>
      </div>

      {/* Action Buttons - All in one row */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCompleteSale}
          disabled={cart.length === 0}
          className="flex-[2] bg-gradient-to-r from-fox-500 to-fox-600 text-white py-2.5 rounded-lg font-bold hover:from-fox-600 hover:to-fox-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fox-500/30 text-sm"
        >
          إتمام البيع
        </button>
        <button
          onClick={onHoldCart}
          disabled={cart.length === 0}
          className="flex-1 bg-dark-900 text-gray-300 py-2 rounded-lg text-xs hover:bg-dark-800 border border-dark-700 disabled:opacity-50"
        >
          تعليق
        </button>
        <button
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="flex-1 bg-red-900/20 text-red-400 py-2 rounded-lg text-xs hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50"
        >
          مسح
        </button>
      </div>

      {/* Customer Search Modal */}
      <Modal
        isOpen={isCustomerSearchOpen}
        onClose={() => {
          setIsCustomerSearchOpen(false);
          setCustomerSearch('');
        }}
        title="بحث عن عميل"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم التليفون..."
            className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none text-sm"
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onCustomerChange(c.id);
                  setIsCustomerSearchOpen(false);
                  setCustomerSearch('');
                }}
                className={`w-full text-right px-3 py-2 rounded-lg text-sm flex justify-between items-center ${
                  selectedCustomer === c.id
                    ? 'bg-fox-500/20 text-fox-400 border border-fox-500/30'
                    : 'bg-dark-900 text-white hover:bg-dark-800'
                }`}
              >
                <span>{c.name}</span>
                {c.balance < 0 && (
                  <span className="text-xs text-red-400">
                    ({Math.abs(c.balance).toLocaleString()})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="طريقة الدفع"
      >
        <div className="space-y-3">
          {[
            { value: PaymentMethod.WALLET, label: 'محفظة إلكترونية', icon: '📱' },
            { value: PaymentMethod.DEFERRED, label: 'آجل (على الحساب)', icon: '📋' },
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => {
                onPaymentMethodChange(method.value);
                setIsPaymentModalOpen(false);
              }}
              disabled={
                method.value === PaymentMethod.DEFERRED &&
                selectedCustomerData?.type === 'consumer'
              }
              className={`w-full p-3 rounded-lg text-right flex items-center gap-3 ${
                paymentMethod === method.value
                  ? 'bg-fox-500/20 border border-fox-500/30 text-fox-400'
                  : 'bg-dark-900 text-white hover:bg-dark-800 border border-dark-700'
              } ${
                method.value === PaymentMethod.DEFERRED &&
                selectedCustomerData?.type === 'consumer'
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="font-medium">{method.label}</span>
            </button>
          ))}

          {paymentMethod === PaymentMethod.DEFERRED && (
            <div className="mt-4">
              <label className="text-sm text-gray-400 mb-1 block">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setNewCustomer({ name: '', phone: '' });
        }}
        title="إضافة عميل جديد"
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">اسم العميل *</label>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              placeholder="اسم العميل"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">رقم التليفون</label>
            <input
              type="text"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              placeholder="01xxxxxxxxx"
            />
          </div>
          <button
            onClick={handleAddNewCustomer}
            className="w-full bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600"
          >
            إضافة العميل
          </button>
        </div>
      </Modal>
    </div>
  );
};

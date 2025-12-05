import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Search,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import { CartItem, Supplier, PaymentMethod } from '../../types';
import { Modal } from '../Modal';

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
  onAddSupplier?: (supplier: Omit<Supplier, 'id'>) => void;
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
  onClearCart,
  onAddSupplier,
}) => {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.costPrice) * Number(item.cartQuantity),
    0
  );

  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier);

  // Modal states
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '' });

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.phone?.includes(supplierSearch)
    );
  }, [suppliers, supplierSearch]);

  const handleAddNewSupplier = () => {
    if (!newSupplier.name.trim()) {
      alert('يرجى إدخال اسم المورد');
      return;
    }
    if (onAddSupplier) {
      onAddSupplier({
        name: newSupplier.name,
        phone: newSupplier.phone || '',
      } as Omit<Supplier, 'id'>);
    }
    setNewSupplier({ name: '', phone: '' });
    setIsAddSupplierOpen(false);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      const newQty = Math.max(1, item.cartQuantity + delta);
      onUpdateItem(id, 'cartQuantity', newQty);
    }
  };

  return (
    <div className="bg-dark-950 rounded-xl border border-dark-800 p-3 flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-fox-500" size={20} />
          فاتورة المشتريات ({cart.length})
        </h2>
        <span className="text-fox-400 font-bold">{total.toLocaleString()} ج.م</span>
      </div>

      {/* Supplier Row - Compact */}
      <div className="flex items-center gap-2 mb-2 bg-dark-900 rounded-lg p-2">
        <span className="text-xs text-gray-400">المورد:</span>
        <span className="text-sm text-white font-medium flex-1 truncate">
          {selectedSupplierData?.name || 'اختر مورد'}
        </span>
        <button
          onClick={() => setIsSupplierSearchOpen(true)}
          className="p-1.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded"
          title="بحث عن مورد"
        >
          <Search size={14} />
        </button>
        <button
          onClick={() => setIsAddSupplierOpen(true)}
          className="p-1.5 bg-fox-500/10 hover:bg-fox-500/20 text-fox-400 rounded"
          title="إضافة مورد جديد"
        >
          <UserPlus size={14} />
        </button>
      </div>

      {/* Payment Method Row - Compact */}
      <div className="flex items-center gap-2 mb-3 bg-dark-900 rounded-lg p-2">
        <span className="text-xs text-gray-400">الدفع:</span>
        <button
          onClick={() => onPaymentMethodChange(PaymentMethod.DEFERRED)}
          className={`px-3 py-1 rounded text-xs font-medium ${
            paymentMethod === PaymentMethod.DEFERRED
              ? 'bg-fox-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          آجل
        </button>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 ${
            paymentMethod !== PaymentMethod.DEFERRED
              ? 'bg-fox-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
          }`}
        >
          <CreditCard size={12} />
          {paymentMethod !== PaymentMethod.DEFERRED
            ? paymentMethod === PaymentMethod.CASH
              ? 'نقدي'
              : 'محفظة'
            : 'أخرى'}
        </button>
      </div>

      {/* Cart Items - Maximum Space */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
        {cart.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">السلة فارغة</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-dark-900 border border-dark-700 rounded px-2 py-2"
            >
              {/* السطر الأول: اسم المنتج + حقل السعر */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-white font-medium flex-1 truncate">{item.name}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.costPrice}
                    onChange={(e) => onUpdateItem(item.id, 'costPrice', Number(e.target.value))}
                    className="w-20 bg-dark-800 border border-fox-500/50 text-fox-400 px-2 py-1 rounded text-sm font-bold text-center"
                    title="سعر الوحدة"
                  />
                  <span className="text-xs text-gray-500">ج.م</span>
                </div>
              </div>
              
              {/* السطر الثاني: الكمية + الإجمالي + حذف */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-dark-800 rounded">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.cartQuantity}
                    onChange={(e) => onUpdateItem(item.id, 'cartQuantity', Math.max(1, Number(e.target.value) || 1))}
                    className="w-12 text-center text-sm font-bold text-white bg-transparent border-none outline-none"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-400">
                    {(Number(item.costPrice) * Number(item.cartQuantity)).toLocaleString()} ج.م
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals - Compact */}
      <div className="border-t border-dark-800 pt-2 mt-2">
        <div className="flex justify-between text-lg font-bold text-white">
          <span>الإجمالي</span>
          <span className="text-fox-400">{total.toLocaleString()} ج.م</span>
        </div>
      </div>

      {/* Action Buttons - All in one row */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCompletePurchase}
          disabled={cart.length === 0 || !selectedSupplier}
          className="flex-[2] bg-gradient-to-r from-fox-500 to-fox-600 text-white py-2.5 rounded-lg font-bold hover:from-fox-600 hover:to-fox-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fox-500/30 text-sm"
        >
          إتمام الشراء
        </button>
        <button
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="flex-1 bg-red-900/20 text-red-400 py-2 rounded-lg text-xs hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50"
        >
          مسح
        </button>
      </div>

      {/* Supplier Search Modal */}
      <Modal
        isOpen={isSupplierSearchOpen}
        onClose={() => {
          setIsSupplierSearchOpen(false);
          setSupplierSearch('');
        }}
        title="بحث عن مورد"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={supplierSearch}
            onChange={(e) => setSupplierSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم التليفون..."
            className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none text-sm"
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredSuppliers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSupplierChange(s.id);
                  setIsSupplierSearchOpen(false);
                  setSupplierSearch('');
                }}
                className={`w-full text-right px-3 py-2 rounded-lg text-sm flex justify-between items-center ${
                  selectedSupplier === s.id
                    ? 'bg-fox-500/20 text-fox-400 border border-fox-500/30'
                    : 'bg-dark-900 text-white hover:bg-dark-800'
                }`}
              >
                <span>{s.name}</span>
                {s.balance > 0 && (
                  <span className="text-xs text-yellow-400">
                    (مستحق: {s.balance.toLocaleString()})
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
            { value: PaymentMethod.CASH, label: 'نقدي', icon: '💵' },
            { value: PaymentMethod.WALLET, label: 'محفظة إلكترونية', icon: '📱' },
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => {
                onPaymentMethodChange(method.value);
                setIsPaymentModalOpen(false);
              }}
              className={`w-full p-3 rounded-lg text-right flex items-center gap-3 ${
                paymentMethod === method.value
                  ? 'bg-fox-500/20 border border-fox-500/30 text-fox-400'
                  : 'bg-dark-900 text-white hover:bg-dark-800 border border-dark-700'
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

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddSupplierOpen}
        onClose={() => {
          setIsAddSupplierOpen(false);
          setNewSupplier({ name: '', phone: '' });
        }}
        title="إضافة مورد جديد"
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">اسم المورد *</label>
            <input
              type="text"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              placeholder="اسم المورد"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">رقم التليفون</label>
            <input
              type="text"
              value={newSupplier.phone}
              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
              placeholder="01xxxxxxxxx"
            />
          </div>
          <button
            onClick={handleAddNewSupplier}
            className="w-full bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600"
          >
            إضافة المورد
          </button>
        </div>
      </Modal>
    </div>
  );
};

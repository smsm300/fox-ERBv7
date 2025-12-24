import React, { useState, useMemo } from 'react';
import { Search, Plus, Truck, FileText, Edit2, Trash2, Printer, X, DollarSign, Eye, RefreshCw } from 'lucide-react';
import { Supplier, Transaction, TransactionType, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { useDebounce } from '../hooks/useDebounce';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  useSettleSupplierDebt
} from '../hooks/useSuppliers';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { showToast } from '../components/ui/Toast';

interface SuppliersProps {
  onDataChange?: () => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatementSupplier, setSelectedStatementSupplier] = useState<Supplier | null>(null);

  // Form State
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', balance: 0 });

  // Settlement State
  const [settlementSupplier, setSettlementSupplier] = useState<Supplier | null>(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  // Invoices Modal State
  const [invoicesSupplier, setInvoicesSupplier] = useState<Supplier | null>(null);

  // React Query hooks
  const { data: suppliers = [], isLoading, refetch, isFetching } = useSuppliers();
  const { data: transactions = [] } = useTransactions();
  const { data: settings } = useSettings();

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const settleDebt = useSettleSupplierDebt();

  const { confirm } = useConfirm();

  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filtered = useMemo(() => suppliers.filter(s =>
    s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ), [suppliers, debouncedSearchTerm]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', balance: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({ name: supplier.name, phone: supplier.phone, balance: supplier.balance });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, data: formData });
      } else {
        await createSupplier.mutateAsync(formData);
      }
      setIsModalOpen(false);
      onDataChange?.();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'حذف المورد',
      message: 'هل أنت متأكد من حذف هذا المورد؟ سيتم حذف جميع بياناته.',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteSupplier.mutateAsync(id);
        onDataChange?.();
      } catch (err) {
        // Error handled by mutation
      }
    }
  };

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementSupplier) return;

    const amount = Number(settlementAmount);
    if (amount <= 0) {
      showToast.warning('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      await settleDebt.mutateAsync({
        id: settlementSupplier.id,
        data: { amount, payment_method: settlementMethod }
      });
      setSettlementSupplier(null);
      setSettlementAmount('');
    } catch (err) {
      // Error handled by mutation
    }
  };

  const openSettlementModal = (supplier: Supplier) => {
    setSettlementSupplier(supplier);
    setSettlementAmount('');
    setSettlementMethod(PaymentMethod.CASH);
  };

  const getSupplierTransactions = (supplierId: number) => {
    return transactions
      .filter(t => t.relatedId === supplierId && t.type === TransactionType.PURCHASE)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const isAnyLoading = isLoading || createSupplier.isPending || updateSupplier.isPending || deleteSupplier.isPending;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-dark-950 p-4 rounded-xl border border-dark-800">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="بحث عن مورد..."
              className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
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
          onClick={handleOpenAdd}
          disabled={isAnyLoading}
          className="flex items-center gap-2 px-6 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold shadow-lg shadow-fox-500/20 disabled:opacity-50"
        >
          <Plus size={18} /> <span>إضافة مورد</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-fox-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">جاري تحميل الموردين...</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-dark-900 text-gray-400">
              <tr><th className="p-4">اسم المورد</th><th className="p-4">رقم الهاتف</th><th className="p-4">رصيد الحساب</th><th className="p-4">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {filtered.map(supplier => (
                <tr key={supplier.id} className="hover:bg-dark-900/50 transition-colors group">
                  <td className="p-4"><div className="flex items-center gap-3"><Truck size={20} className="text-blue-400" /><span className="font-medium text-white">{supplier.name}</span></div></td>
                  <td className="p-4 font-mono text-gray-400">{supplier.phone}</td>
                  <td className="p-4"><span className={`font-bold font-mono ${supplier.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{supplier.balance.toLocaleString()} ج.م</span></td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center flex-wrap">
                      <button onClick={() => setInvoicesSupplier(supplier)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-xs transition-colors"><Eye size={14} /> الفواتير</button>
                      {supplier.balance > 0 && (
                        <button onClick={() => openSettlementModal(supplier)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded text-xs transition-colors"><DollarSign size={14} /> تسوية</button>
                      )}
                      <button onClick={() => setSelectedStatementSupplier(supplier)} className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded text-xs transition-colors"><FileText size={14} /> كشف حساب</button>
                      <button onClick={() => handleOpenEdit(supplier)} className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded text-xs transition-colors"><Edit2 size={14} /> تعديل</button>
                      <button onClick={() => handleDelete(supplier.id)} className="p-1.5 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded opacity-50 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? "تعديل بيانات مورد" : "إضافة مورد جديد"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm text-gray-400 mb-1">اسم المورد</label><input required type="text" className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label><input required type="text" className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
          <div><label className="block text-sm text-gray-400 mb-1">الرصيد الافتتاحي</label><input type="number" disabled={!!editingSupplier} className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg disabled:opacity-50" value={formData.balance} onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })} /></div>
          <button
            type="submit"
            disabled={createSupplier.isPending || updateSupplier.isPending}
            className="w-full bg-fox-600 hover:bg-fox-500 text-white py-2.5 rounded-lg font-bold mt-4 shadow-lg shadow-fox-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(createSupplier.isPending || updateSupplier.isPending) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {editingSupplier ? 'حفظ التعديلات' : 'حفظ المورد'}
          </button>
        </form>
      </Modal>

      {/* Account Statement Modal */}
      {selectedStatementSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-dark-950 border border-dark-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none print:bg-white print:text-black">
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-dark-800 bg-dark-900/50 no-print">
                <h3 className="text-lg font-bold text-white">كشف حساب مورد: {selectedStatementSupplier.name}</h3>
                <button onClick={() => setSelectedStatementSupplier(null)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
              </div>

              {/* Print Header */}
              <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6 pt-4 px-4">
                {settings?.logoUrl && <img src={settings.logoUrl} className="h-16 mx-auto mb-2 object-contain" alt="Logo" />}
                <h1 className="text-2xl font-bold uppercase">{settings?.companyName}</h1>
                <h2 className="text-xl text-gray-700">كشف حساب مورد</h2>
                <div className="text-right text-sm mt-4 border border-gray-300 p-2 rounded">
                  <p><strong>المورد:</strong> {selectedStatementSupplier.name}</p>
                  <p><strong>الهاتف:</strong> {selectedStatementSupplier.phone}</p>
                  <p><strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] print:max-h-none print:overflow-visible">
                <div className="bg-dark-900 p-3 rounded-lg flex justify-between items-center border border-dark-800 mb-4 print:bg-gray-100 print:border-gray-300">
                  <span className="text-gray-400 print:text-black">الرصيد الحالي</span>
                  <span className={`font-bold text-lg font-mono ${selectedStatementSupplier.balance > 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-green-600'}`}>
                    {selectedStatementSupplier.balance.toLocaleString()} ج.م
                  </span>
                </div>

                <table className="w-full text-right text-sm border-collapse">
                  <thead className="bg-dark-900 text-gray-400 print:bg-gray-200 print:text-black">
                    <tr><th className="p-2 border border-dark-800 print:border-gray-300">التاريخ</th><th className="p-2 border border-dark-800 print:border-gray-300">البيان</th><th className="p-2 border border-dark-800 print:border-gray-300">المبلغ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800 print:divide-gray-300">
                    {getSupplierTransactions(selectedStatementSupplier.id).map(t => (
                      <tr key={t.id} className="hover:bg-dark-900/50">
                        <td className="p-2 border border-dark-800 print:border-gray-300 print:text-black">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                        <td className="p-2 border border-dark-800 print:border-gray-300 print:text-black">{t.description}</td>
                        <td className="p-2 border border-dark-800 print:border-gray-300 font-bold font-mono text-red-400 print:text-black">{t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-dark-900 p-4 border-t border-dark-800 flex justify-center no-print">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-fox-600 text-white rounded-lg font-bold hover:bg-fox-500 shadow-lg shadow-fox-500/20">
                  <Printer size={18} /> طباعة
                </button>
              </div>

              <div className="hidden print:block text-center text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
                <p>{settings?.companyAddress} - {settings?.companyPhone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      <Modal isOpen={!!settlementSupplier} onClose={() => setSettlementSupplier(null)} title="تسوية دين مورد">
        {settlementSupplier && (
          <form onSubmit={handleSettleDebt} className="space-y-4">
            <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
              <h3 className="font-bold text-white mb-2">{settlementSupplier.name}</h3>
              <p className="text-sm text-gray-400">
                الدين الحالي: <span className="font-bold text-red-400">{settlementSupplier.balance.toLocaleString()} ج.م</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">المبلغ المدفوع *</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-2.5 text-gray-500" size={20} />
                <input
                  type="number"
                  required
                  min="0"
                  max={settlementSupplier.balance}
                  step="0.01"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                الحد الأقصى: {settlementSupplier.balance.toLocaleString()} ج.م
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">طريقة الدفع *</label>
              <select
                value={settlementMethod}
                onChange={(e) => setSettlementMethod(e.target.value as PaymentMethod)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg focus:border-fox-500 outline-none"
              >
                <option value={PaymentMethod.CASH}>كاش</option>
                <option value={PaymentMethod.WALLET}>محفظة</option>
                <option value={PaymentMethod.INSTAPAY}>Instapay</option>
              </select>
            </div>

            {settlementAmount && Number(settlementAmount) > 0 && (
              <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
                <p className="text-sm text-gray-400 mb-1">الرصيد بعد التسوية:</p>
                <p className="text-2xl font-bold text-fox-400">
                  {(settlementSupplier.balance - Number(settlementAmount)).toLocaleString()} ج.م
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!settlementAmount || Number(settlementAmount) <= 0 || Number(settlementAmount) > settlementSupplier.balance || settleDebt.isPending}
                className="flex-1 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {settleDebt.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                تأكيد التسوية
              </button>
              <button
                type="button"
                onClick={() => setSettlementSupplier(null)}
                className="flex-1 bg-dark-900 text-gray-300 py-2 rounded-lg font-bold hover:bg-dark-800 border border-dark-700"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Invoices Modal */}
      <Modal isOpen={!!invoicesSupplier} onClose={() => setInvoicesSupplier(null)} title={`فواتير المورد: ${invoicesSupplier?.name || ''}`}>
        {invoicesSupplier && (
          <div className="space-y-4">
            <div className="bg-dark-900 p-3 rounded-lg flex justify-between items-center border border-dark-800">
              <span className="text-gray-400">إجمالي المشتريات</span>
              <span className="font-bold text-lg text-fox-400">
                {getSupplierTransactions(invoicesSupplier.id).reduce((sum, t) => sum + t.amount, 0).toLocaleString()} ج.م
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {getSupplierTransactions(invoicesSupplier.id).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p>لا توجد فواتير لهذا المورد</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getSupplierTransactions(invoicesSupplier.id).map(t => (
                    <div key={t.id} className="bg-dark-900 p-3 rounded-lg border border-dark-800 hover:border-dark-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">{t.description || 'فاتورة شراء'}</p>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <span className="font-bold text-fox-400">{t.amount.toLocaleString()} ج.م</span>
                      </div>
                      {t.items && t.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-gray-500 mb-1">العناصر:</p>
                          <div className="text-xs text-gray-400 space-y-1">
                            {t.items.slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name || item.productName}</span>
                                <span>{item.cartQuantity || item.quantity} × {Number(item.buyPrice || item.price).toLocaleString()}</span>
                              </div>
                            ))}
                            {t.items.length > 3 && (
                              <p className="text-gray-500">... و {t.items.length - 3} عناصر أخرى</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Suppliers;

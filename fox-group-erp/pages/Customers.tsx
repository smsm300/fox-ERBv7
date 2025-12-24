import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Printer, FileText, RefreshCw } from 'lucide-react';
import { Customer, PaymentMethod, Transaction, TransactionType, AppSettings } from '../types';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerList } from '../components/customers/CustomerList';
import { DebtSettlement } from '../components/customers/DebtSettlement';
import { Modal } from '../components/Modal';
import { useDebounce } from '../hooks/useDebounce';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useSettleCustomerDebt
} from '../hooks/useCustomers';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { showToast } from '../components/ui/Toast';

interface CustomersProps {
  onDataChange?: () => void;
}

const Customers: React.FC<CustomersProps> = ({ onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDebtSettlementOpen, setIsDebtSettlementOpen] = useState(false);
  const [settlingCustomer, setSettlingCustomer] = useState<Customer | null>(null);

  // Invoices and Statement modals
  const [invoicesCustomer, setInvoicesCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  // React Query hooks
  const { data: customers = [], isLoading, refetch, isFetching } = useCustomers();
  const { data: transactions = [] } = useTransactions();
  const { data: settings } = useSettings();

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const settleDebt = useSettleCustomerDebt();

  const { confirm } = useConfirm();

  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'balance'>>({
    name: '',
    phone: '',
    type: 'consumer',
    creditLimit: 0
  });

  const getCustomerTransactions = (customer: Customer) => {
    return transactions
      .filter(t => {
        const matchById = t.relatedId === customer.id;
        const matchByName = t.customerName && t.customerName === customer.name;
        return (matchById || matchByName) && t.type === TransactionType.SALE;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredCustomers = useMemo(() => (customers || []).filter(c =>
    c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    c.phone.includes(debouncedSearchTerm)
  ), [customers, debouncedSearchTerm]);

  const handleOpenForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      type: 'consumer',
      creditLimit: 0
    });
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      type: customer.type,
      creditLimit: customer.creditLimit
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Omit<Customer, 'id' | 'balance'>) => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, data });
      } else {
        await createCustomer.mutateAsync(data);
      }
      setIsFormOpen(false);
      onDataChange?.();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleFormChange = (field: keyof Omit<Customer, 'id' | 'balance'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettleDebt = (customer: Customer) => {
    setSettlingCustomer(customer);
    setIsDebtSettlementOpen(true);
  };

  const handleDebtSettlement = async (customerId: number, amount: number, paymentMethod: PaymentMethod) => {
    try {
      await settleDebt.mutateAsync({ id: customerId, data: { amount, payment_method: paymentMethod } });
      setIsDebtSettlementOpen(false);
      setSettlingCustomer(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'حذف العميل',
      message: 'هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع بياناته.',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteCustomer.mutateAsync(id);
        onDataChange?.();
      } catch (err) {
        // Error handled by mutation
      }
    }
  };

  const isAnyLoading = isLoading || createCustomer.isPending || updateCustomer.isPending || deleteCustomer.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="ابحث عن عميل..."
              className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          onClick={handleOpenForm}
          disabled={isAnyLoading}
          className="flex items-center gap-2 bg-fox-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          <Plus size={20} />
          إضافة عميل
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-fox-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">جاري تحميل العملاء...</p>
            </div>
          </div>
        ) : (
          <CustomerList
            customers={filteredCustomers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSettleDebt={handleSettleDebt}
            onViewInvoices={setInvoicesCustomer}
            onViewStatement={setStatementCustomer}
          />
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingCustomer={editingCustomer}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
      />

      {/* Debt Settlement Modal */}
      <DebtSettlement
        isOpen={isDebtSettlementOpen}
        onClose={() => setIsDebtSettlementOpen(false)}
        customer={settlingCustomer}
        onSettle={handleDebtSettlement}
        isLoading={settleDebt.isPending}
      />

      {/* Invoices Modal */}
      <Modal isOpen={!!invoicesCustomer} onClose={() => setInvoicesCustomer(null)} title={`فواتير العميل: ${invoicesCustomer?.name || ''}`}>
        {invoicesCustomer && (
          <div className="space-y-4">
            <div className="bg-dark-900 p-3 rounded-lg flex justify-between items-center border border-dark-800">
              <span className="text-gray-400">إجمالي المبيعات</span>
              <span className="font-bold text-lg text-fox-400">
                {getCustomerTransactions(invoicesCustomer).reduce((sum, t) => sum + Number(t.amount || 0), 0).toLocaleString()} ج.م
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {getCustomerTransactions(invoicesCustomer).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p>لا توجد فواتير لهذا العميل</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getCustomerTransactions(invoicesCustomer).map(t => (
                    <div key={t.id} className="bg-dark-900 p-3 rounded-lg border border-dark-800 hover:border-dark-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">{t.id}</p>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <span className="font-bold text-fox-400">{Number(t.amount || 0).toLocaleString()} ج.م</span>
                      </div>
                      {t.items && Array.isArray(t.items) && t.items.length > 0 ? (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-gray-500 mb-1">العناصر ({t.items.length}):</p>
                          <div className="text-xs text-gray-400 space-y-1">
                            {t.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name || item.productName || 'منتج'}</span>
                                <span>{item.cartQuantity || item.quantity || 1} × {Number(item.sellPrice || item.price || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mt-2">لا توجد تفاصيل للعناصر</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Account Statement Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-dark-950 border border-dark-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none print:bg-white print:text-black">
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-dark-800 bg-dark-900/50 no-print">
                <h3 className="text-lg font-bold text-white">كشف حساب عميل: {statementCustomer.name}</h3>
                <button onClick={() => setStatementCustomer(null)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
              </div>

              {/* Print Header */}
              <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6 pt-4 px-4">
                {settings?.logoUrl && <img src={settings.logoUrl} className="h-16 mx-auto mb-2 object-contain" alt="Logo" />}
                <h1 className="text-2xl font-bold uppercase">{settings?.companyName}</h1>
                <h2 className="text-xl text-gray-700">كشف حساب عميل</h2>
                <div className="text-right text-sm mt-4 border border-gray-300 p-2 rounded">
                  <p><strong>العميل:</strong> {statementCustomer.name}</p>
                  <p><strong>الهاتف:</strong> {statementCustomer.phone}</p>
                  <p><strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] print:max-h-none print:overflow-visible">
                <div className="bg-dark-900 p-3 rounded-lg flex justify-between items-center border border-dark-800 mb-4 print:bg-gray-100 print:border-gray-300">
                  <span className="text-gray-400 print:text-black">الرصيد الحالي</span>
                  <span className={`font-bold text-lg font-mono ${statementCustomer.balance < 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-green-600'}`}>
                    {statementCustomer.balance < 0 ? `مدين: ${Math.abs(statementCustomer.balance).toLocaleString()}` : statementCustomer.balance.toLocaleString()} ج.م
                  </span>
                </div>

                <table className="w-full text-right text-sm border-collapse">
                  <thead className="bg-dark-900 text-gray-400 print:bg-gray-200 print:text-black">
                    <tr><th className="p-2 border border-dark-800 print:border-gray-300">التاريخ</th><th className="p-2 border border-dark-800 print:border-gray-300">البيان</th><th className="p-2 border border-dark-800 print:border-gray-300">المبلغ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800 print:divide-gray-300">
                    {getCustomerTransactions(statementCustomer).map(t => (
                      <tr key={t.id} className="hover:bg-dark-900/50">
                        <td className="p-2 border border-dark-800 print:border-gray-300 print:text-black">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                        <td className="p-2 border border-dark-800 print:border-gray-300 print:text-black">{t.description}</td>
                        <td className="p-2 border border-dark-800 print:border-gray-300 font-bold font-mono text-fox-400 print:text-black">{t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-dark-900 p-4 border-t border-dark-800 flex justify-center no-print">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-fox-600 text-white rounded-lg font-bold hover:bg-fox-500">
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
    </div>
  );
};

export default Customers;

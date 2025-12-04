import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Customer, PaymentMethod } from '../types';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerList } from '../components/customers/CustomerList';
import { DebtSettlement } from '../components/customers/DebtSettlement';
import { customersAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDebtSettlementOpen, setIsDebtSettlementOpen] = useState(false);
  const [settlingCustomer, setSettlingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'balance'>>({
    name: '',
    phone: '',
    type: 'consumer',
    creditLimit: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.list();
      // Handle both paginated and non-paginated responses
      const customersData = (response.data as any).results || response.data;
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err: any) {
      alert(handleAPIError(err));
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = (customers || []).filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

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
    setLoading(true);
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, data);
        alert('تم تحديث بيانات العميل بنجاح');
      } else {
        await customersAPI.create(data);
        alert('تم إضافة العميل بنجاح');
      }
      setIsFormOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      await customersAPI.settleDebt(customerId, { amount, payment_method: paymentMethod });
      alert('تم تسجيل تسوية المديونية بنجاح');
      setIsDebtSettlementOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setLoading(true);
      try {
        await customersAPI.delete(id);
        alert('تم حذف العميل بنجاح');
        await fetchCustomers();
      } catch (err: any) {
        alert(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800 gap-4">
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
          onClick={handleOpenForm}
          className="flex items-center gap-2 bg-fox-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          إضافة عميل
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-6">
        <CustomerList
          customers={filteredCustomers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSettleDebt={handleSettleDebt}
        />
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingCustomer={editingCustomer}
        formData={formData}
        onFormChange={handleFormChange}
      />

      {/* Debt Settlement Modal */}
      <DebtSettlement
        isOpen={isDebtSettlementOpen}
        onClose={() => setIsDebtSettlementOpen(false)}
        customer={settlingCustomer}
        onSettle={handleDebtSettlement}
      />
    </div>
  );
};

export default Customers;

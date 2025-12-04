import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Customer, Supplier, AppSettings, User } from '../types';
import { ArrowDownLeft, ArrowUpRight, Wallet, Download, Filter } from 'lucide-react';
import { ExpenseModal } from '../components/treasury/ExpenseModal';
import { CapitalModal } from '../components/treasury/CapitalModal';
import { TransactionsList } from '../components/treasury/TransactionsList';
import { useTreasuryBalance } from '../hooks/useTreasuryBalance';
import { transactionsAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';

interface TreasuryProps {
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  onAddExpense: (amount: number, description: string, category: string) => void;
  onReturnTransaction?: (transaction: Transaction) => void;
  onDebtSettlement?: (type: 'customer' | 'supplier', id: number, amount: number, notes: string) => void;
  settings?: AppSettings;
  currentUser: User;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCapitalTransaction: (type: 'deposit' | 'withdrawal', amount: number, description: string) => void;
}

const Treasury: React.FC<TreasuryProps> = ({ 
  transactions, 
  customers, 
  suppliers, 
  onAddExpense, 
  settings, 
  currentUser, 
  onApprove, 
  onReject, 
  onCapitalTransaction 
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ 
    amount: '', 
    description: '', 
    category: 'مصروفات تشغيلية' 
  });

  // Capital Modal
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [capitalType, setCapitalType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [capitalForm, setCapitalForm] = useState({ amount: '', description: '' });

  // Expense Categories
  const expenseCategories = [
    'مصروفات تشغيلية',
    'إيجار',
    'رواتب وأجور',
    'كهرباء ومياه',
    'نقل ومشال',
    'دعاية وإعلان',
    'صيانة',
    'نثريات',
    'أخرى'
  ];

  // Calculate treasury balance
  const { balance, totalIncome, totalExpenses, netFlow } = useTreasuryBalance({
    transactions,
    customers,
    suppliers,
    openingBalance: settings?.openingBalance || 50000
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const handleAddExpense = () => {
    onAddExpense(
      Number(expenseForm.amount),
      expenseForm.description,
      expenseForm.category
    );
    setExpenseForm({ amount: '', description: '', category: 'مصروفات تشغيلية' });
    setIsExpenseModalOpen(false);
  };

  const handleCapitalTransaction = () => {
    onCapitalTransaction(
      capitalType,
      Number(capitalForm.amount),
      capitalForm.description
    );
    setCapitalForm({ amount: '', description: '' });
    setIsCapitalModalOpen(false);
  };

  const handleReturnTransaction = async (transaction: Transaction) => {
    setLoading(true);
    try {
      await transactionsAPI.return(transaction.id.toString());
      alert('تم تسجيل المرتجع وتحديث الحسابات بنجاح');
      // Refresh transactions list if needed
      window.location.reload();
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <div className="bg-gradient-to-r from-dark-950 to-dark-900 rounded-xl border border-dark-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm mb-1">رصيد الخزينة الحالي</p>
            <h1 className="text-4xl font-bold text-white mb-2">
              {balance.toLocaleString()} <span className="text-xl text-gray-500">ج.م</span>
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-400">
                إيرادات: {totalIncome.toLocaleString()}
              </span>
              <span className="text-red-400">
                مصروفات: {totalExpenses.toLocaleString()}
              </span>
              <span className={netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                صافي: {netFlow.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 border border-red-500/30"
            >
              <ArrowUpRight size={20} />
              مصروف
            </button>
            <button
              onClick={() => {
                setCapitalType('deposit');
                setIsCapitalModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 border border-emerald-500/30"
            >
              <ArrowDownLeft size={20} />
              إيداع
            </button>
            <button
              onClick={() => {
                setCapitalType('withdrawal');
                setIsCapitalModalOpen(true);
              }}
              className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-lg font-bold hover:bg-purple-500/20 border border-purple-500/30"
            >
              <Wallet size={20} />
              سحب
            </button>
          </div>
        </div>
      </div>

      {/* Pending Transactions Alert */}
      {pendingTransactions.length > 0 && currentUser.role === 'admin' && (
        <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-lg p-4">
          <p className="text-yellow-400 font-bold">
            يوجد {pendingTransactions.length} معاملة معلقة تحتاج موافقة
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
          />
          <span className="text-gray-500">إلى</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
          />
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-gray-400 hover:text-white text-sm"
          >
            مسح الفلتر
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-6">
        <h2 className="text-xl font-bold text-white mb-4">سجل المعاملات</h2>
        <TransactionsList
          transactions={filteredTransactions}
          currentUser={currentUser}
          onViewDetails={setSelectedTransaction}
          onApprove={onApprove}
          onReject={onReject}
          onReturn={handleReturnTransaction}
        />
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
        formData={expenseForm}
        onFormChange={(field, value) => setExpenseForm(prev => ({ ...prev, [field]: value }))}
        categories={expenseCategories}
      />

      <CapitalModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
        onSubmit={handleCapitalTransaction}
        type={capitalType}
        onTypeChange={setCapitalType}
        formData={capitalForm}
        onFormChange={(field, value) => setCapitalForm(prev => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default Treasury;

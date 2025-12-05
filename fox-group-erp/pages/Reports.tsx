import React, { useState, useEffect } from 'react';
import { Transaction, ActivityLogEntry, Customer, Supplier, Product, User, Shift, AppSettings } from '../types';
import { FileText, Download, Calendar, Activity, Wallet, ArrowRight, Package, Printer, History } from 'lucide-react';
import { useReportsData } from '../hooks/useReportsData';
import { SalesReport } from '../components/reports/SalesReport';
import { InventoryReport } from '../components/reports/InventoryReport';
import { FinancialReport } from '../components/reports/FinancialReport';
import { DebtsReport } from '../components/reports/DebtsReport';
import { ActivityReport } from '../components/reports/ActivityReport';
import { ShiftsReport } from '../components/reports/ShiftsReport';
import { transactionsAPI, activityLogAPI, shiftsAPI, customersAPI, suppliersAPI, productsAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'financial' | 'debts' | 'activity' | 'shifts'>('sales');
  
  // Date Filtering State
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAllData();
  }, [startDate, endDate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, logsRes, shiftsRes, customersRes, suppliersRes, productsRes] = await Promise.all([
        transactionsAPI.list({ from_date: startDate, to_date: endDate }),
        activityLogAPI.list({ from_date: startDate, to_date: endDate }),
        shiftsAPI.list(),
        customersAPI.list(),
        suppliersAPI.list(),
        productsAPI.list()
      ]);
      
      // Handle paginated responses (results array) or direct arrays
      const extractData = (res: any) => {
        if (Array.isArray(res.data)) return res.data;
        if (res.data?.results && Array.isArray(res.data.results)) return res.data.results;
        return [];
      };
      
      setTransactions(extractData(transactionsRes));
      setLogs(extractData(logsRes));
      setShifts(extractData(shiftsRes));
      setCustomers(extractData(customersRes));
      setSuppliers(extractData(suppliersRes));
      setProducts(extractData(productsRes));
    } catch (err: any) {
      alert(handleAPIError(err));
      // Set empty arrays on error
      setTransactions([]);
      setLogs([]);
      setShifts([]);
      setCustomers([]);
      setSuppliers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Print Preview State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Destructure Data
  const {
    chartData,
    totalSales,
    totalReturns,
    netSales,
    totalExpenses,
    expenseBreakdown,
    cogs,
    grossProfit,
    netIncome,
    customersWithDebt,
    totalReceivables,
    suppliersWithCredit,
    totalPayables,
    totalInventoryCost,
    totalInventoryValue,
    potentialProfit,
    topSelling,
    topCustomers,
    overdueInvoices,
    totalCapital,
    totalWithdrawals
  } = useReportsData({
    transactions,
    filteredTransactions: transactions,
    customers,
    suppliers,
    products
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'التاريخ', 'النوع', 'المبلغ', 'الوصف', 'طريقة الدفع'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.id, t.date, t.type, t.amount, `"${t.description}"`, t.paymentMethod
      ].join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800 gap-4">
        {/* Tabs */}
        <div className="flex bg-dark-900 p-1 rounded-lg border border-dark-700 overflow-x-auto max-w-full">
          {[
            { id: 'sales', label: 'المبيعات' },
            { id: 'inventory', label: 'المخزون' },
            { id: 'financial', label: 'المالية' },
            { id: 'debts', label: 'الديون' },
            { id: 'shifts', label: 'أرشيف الورديات' },
            { id: 'activity', label: 'سجل النشاط' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-fox-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group flex-1">
            <Calendar className="absolute right-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="date" 
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 pr-10 rounded-lg text-sm focus:border-fox-500 outline-none"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <ArrowRight size={16} className="text-gray-600" />
          <div className="relative group flex-1">
            <Calendar className="absolute right-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="date" 
              className="w-full bg-dark-900 border border-dark-700 text-white px-3 py-2 pr-10 rounded-lg text-sm focus:border-fox-500 outline-none"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 p-6 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">جاري تحميل البيانات...</div>
          </div>
        ) : (
          <>
        <div className="flex justify-between items-center mb-6 border-b border-dark-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activeTab === 'activity' ? <Activity className="text-fox-500" /> : 
             activeTab === 'debts' ? <Wallet className="text-fox-500" /> :
             activeTab === 'inventory' ? <Package className="text-fox-500" /> :
             activeTab === 'shifts' ? <History className="text-fox-500" /> :
             <FileText className="text-fox-500" />}
            {activeTab === 'sales' ? 'تحليل المبيعات' : 
             activeTab === 'inventory' ? 'تحليل وقيمة المخزون' : 
             activeTab === 'financial' ? 'القوائم المالية' : 
             activeTab === 'debts' ? 'الديون والمستحقات' : 
             activeTab === 'shifts' ? 'سجل الورديات (Z-Reports)' : 'سجل نشاط المستخدمين'}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-dark-900 text-gray-300 border border-dark-700 rounded text-sm hover:bg-dark-800"
            >
              <Download size={16} />
              تصدير (CSV)
            </button>
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-fox-500/10 text-fox-500 border border-fox-500/30 rounded text-sm hover:bg-fox-500/20"
            >
              <Printer size={16} />
              طباعة التقرير
            </button>
          </div>
        </div>

        {/* Render Active Tab Content */}
        {activeTab === 'sales' && (
          <SalesReport
            netSales={netSales}
            totalReturns={totalReturns}
            filteredTransactions={transactions}
            chartData={chartData}
            topCustomers={topCustomers}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryReport
            totalInventoryCost={totalInventoryCost}
            totalInventoryValue={totalInventoryValue}
            potentialProfit={potentialProfit}
            topSelling={topSelling}
            products={products}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialReport
            netIncome={netIncome}
            totalSales={totalSales}
            totalReturns={totalReturns}
            cogs={cogs}
            grossProfit={grossProfit}
            expenseBreakdown={expenseBreakdown}
            totalCapital={totalCapital}
            totalWithdrawals={totalWithdrawals}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsReport
            customersWithDebt={customersWithDebt}
            totalReceivables={totalReceivables}
            suppliersWithCredit={suppliersWithCredit}
            totalPayables={totalPayables}
            topSuppliers={[]}
            overdueInvoices={overdueInvoices}
          />
        )}

        {activeTab === 'shifts' && (
          <ShiftsReport
            shifts={shifts}
            onPrintShift={(shift) => setSelectedShift(shift)}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityReport logs={logs} />
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Reports;

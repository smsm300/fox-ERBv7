import { useMemo } from 'react';
import { Transaction, TransactionType, Customer, Supplier, Product } from '../types';

interface UseReportsDataProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
}

export const useReportsData = ({
  transactions,
  filteredTransactions,
  customers,
  suppliers,
  products
}: UseReportsDataProps) => {
  
  // Helper Functions
  const isSalesReturn = (t: Transaction) => 
    t.type === TransactionType.RETURN && customers.some(c => c.id === t.relatedId);

  // Daily Data for Charts
  const getDailyData = () => {
    const data: any = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('ar-EG');
      if (!data[date]) data[date] = { date, sales: 0, expenses: 0, purchases: 0 };
      if (t.type === TransactionType.SALE) data[date].sales += t.amount;
      if (t.type === TransactionType.EXPENSE) data[date].expenses += t.amount;
      if (t.type === TransactionType.PURCHASE) data[date].purchases += t.amount;
    });
    return Object.values(data);
  };

  // Sales Calculations
  const totalSales = filteredTransactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((a, b) => a + b.amount, 0);
    
  const totalReturns = filteredTransactions
    .filter(t => isSalesReturn(t))
    .reduce((a, b) => a + b.amount, 0);
    
  const netSales = totalSales - totalReturns;

  // Expenses Calculations
  const totalExpenses = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.category !== 'تكلفة بضاعة مباعة (Direct)')
    .reduce((a, b) => a + b.amount, 0);

  const expenseBreakdown = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      const cat = curr.category || 'غير مصنف';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as {[key: string]: number});

  // COGS Calculation
  let cogs = 0;
  filteredTransactions.forEach(t => {
    if (t.type === TransactionType.SALE && t.items) {
      t.items.forEach(item => cogs += (item.costPrice * item.cartQuantity));
    }
    if (isSalesReturn(t) && t.items) {
      t.items.forEach(item => cogs -= (item.costPrice * item.cartQuantity));
    }
  });

  const grossProfit = netSales - cogs;
  const netIncome = grossProfit - totalExpenses;

  // Debts Calculations
  const customersWithDebt = customers.filter(c => c.balance < 0);
  const totalReceivables = customersWithDebt.reduce((acc, c) => acc + Math.abs(c.balance), 0);

  const suppliersWithCredit = suppliers.filter(s => s.balance > 0);
  const totalPayables = suppliersWithCredit.reduce((acc, s) => acc + s.balance, 0);

  // Inventory Analysis
  const totalInventoryCost = products.reduce((acc, p) => acc + (p.quantity * p.costPrice), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.sellPrice), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  // Top Selling Products
  const topSelling = useMemo(() => {
    const productSales: {[id: number]: {name: string, qty: number, revenue: number}} = {};
    
    transactions.forEach(t => {
      if (t.type === TransactionType.SALE && t.items) {
        t.items.forEach(item => {
          if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
          productSales[item.id].qty += item.cartQuantity;
          productSales[item.id].revenue += (item.cartQuantity * item.sellPrice);
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transactions]);

  // Top Customers
  const topCustomers = useMemo(() => {
    const custMap: {[id: number]: number} = {};
    transactions.filter(t => t.type === TransactionType.SALE).forEach(t => {
      if(t.relatedId) custMap[t.relatedId] = (custMap[t.relatedId] || 0) + t.amount;
    });
    return Object.entries(custMap)
      .map(([id, amount]) => ({
        name: customers.find(c => c.id === Number(id))?.name || 'Unknown',
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, customers]);

  // Top Suppliers
  const topSuppliers = useMemo(() => {
    const suppMap: {[id: number]: number} = {};
    transactions.filter(t => t.type === TransactionType.PURCHASE).forEach(t => {
      if(t.relatedId) suppMap[t.relatedId] = (suppMap[t.relatedId] || 0) + t.amount;
    });
    return Object.entries(suppMap)
      .map(([id, amount]) => ({
        name: suppliers.find(s => s.id === Number(id))?.name || 'Unknown',
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, suppliers]);

  // Overdue Invoices
  const getOverdueInvoices = () => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter(t => 
      t.paymentMethod === 'deferred' && 
      t.dueDate && 
      t.dueDate < today
    ).map(t => {
      const isSale = t.type === TransactionType.SALE;
      const relatedName = isSale 
        ? customers.find(c => c.id === t.relatedId)?.name 
        : suppliers.find(s => s.id === t.relatedId)?.name;
      return { ...t, relatedName, isSale };
    });
  };

  return {
    // Chart Data
    chartData: getDailyData(),
    
    // Sales
    totalSales,
    totalReturns,
    netSales,
    
    // Expenses
    totalExpenses,
    expenseBreakdown,
    
    // Financial
    cogs,
    grossProfit,
    netIncome,
    
    // Debts
    customersWithDebt,
    totalReceivables,
    suppliersWithCredit,
    totalPayables,
    overdueInvoices: getOverdueInvoices(),
    
    // Inventory
    totalInventoryCost,
    totalInventoryValue,
    potentialProfit,
    
    // Top Lists
    topSelling,
    topCustomers,
    topSuppliers
  };
};

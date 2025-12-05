import { useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod, Customer, Supplier } from '../types';

interface UseTreasuryBalanceProps {
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  openingBalance: number;
}

export const useTreasuryBalance = ({
  transactions,
  customers,
  suppliers,
  openingBalance
}: UseTreasuryBalanceProps) => {
  
  const balance = useMemo(() => {
    let currentBalance = openingBalance;

    transactions.forEach(t => {
      if (t.paymentMethod === PaymentMethod.DEFERRED) return;
      if (t.status === 'pending' || t.status === 'rejected') return;

      switch (t.type) {
        case TransactionType.SALE:
        case TransactionType.CAPITAL:
          currentBalance += Number(t.amount);
          break;
        case TransactionType.PURCHASE:
        case TransactionType.EXPENSE:
        case TransactionType.WITHDRAWAL:
          currentBalance -= Number(t.amount);
          break;
        case TransactionType.RETURN:
          const isCustomerReturn = customers.some(c => c.id === t.relatedId);
          if (isCustomerReturn) {
            currentBalance -= Number(t.amount);
          } else {
            currentBalance += Number(t.amount);
          }
          break;
      }
    });

    return currentBalance;
  }, [transactions, customers, suppliers, openingBalance]);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      if (t.paymentMethod === PaymentMethod.DEFERRED) return;
      if (t.status === 'pending' || t.status === 'rejected') return;

      switch (t.type) {
        case TransactionType.SALE:
        case TransactionType.CAPITAL:
          totalIncome += Number(t.amount);
          break;
        case TransactionType.PURCHASE:
        case TransactionType.EXPENSE:
        case TransactionType.WITHDRAWAL:
          totalExpenses += Number(t.amount);
          break;
        case TransactionType.RETURN:
          const isCustomerReturn = customers.some(c => c.id === t.relatedId);
          if (isCustomerReturn) {
            totalExpenses += Number(t.amount);
          } else {
            totalIncome += Number(t.amount);
          }
          break;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses
    };
  }, [transactions, customers, suppliers]);

  return {
    balance,
    ...summary
  };
};

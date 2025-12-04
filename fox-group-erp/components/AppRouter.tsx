import React from 'react';
import Dashboard from '../pages/Dashboard';
import Sales from '../pages/Sales';
import Purchases from '../pages/Purchases';
import Quotations from '../pages/Quotations';
import Inventory from '../pages/Inventory';
import Treasury from '../pages/Treasury';
import Customers from '../pages/Customers';
import Suppliers from '../pages/Suppliers';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import { APP_SECTIONS } from '../constants';
import { 
  Product, 
  Transaction, 
  Customer, 
  Supplier, 
  Quotation, 
  AppSettings, 
  User, 
  ActivityLogEntry, 
  Shift,
  CartItem,
  PaymentMethod
} from '../types';

interface AppRouterProps {
  currentSection: string;
  state: {
    products: Product[];
    transactions: Transaction[];
    customers: Customer[];
    suppliers: Supplier[];
    quotations: Quotation[];
    settings: AppSettings;
    users: User[];
    activityLogs: ActivityLogEntry[];
    shifts: Shift[];
  };
  currentUser: User;
  handlers: any; // We'll type this properly later
}

export const AppRouter: React.FC<AppRouterProps> = ({ 
  currentSection, 
  state, 
  currentUser, 
  handlers 
}) => {
  switch (currentSection) {
    case APP_SECTIONS.DASHBOARD:
      return (
        <Dashboard
          transactions={state.transactions}
          products={state.products}
          customers={state.customers}
          suppliers={state.suppliers}
          settings={state.settings}
        />
      );
    case APP_SECTIONS.SALES:
      return (
        <Sales
          products={state.products}
          customers={state.customers}
          transactions={state.transactions}
          onCompleteSale={handlers.handleSaleComplete}
          onReturnTransaction={handlers.handleReturnTransaction}
          settings={state.settings}
          currentUser={currentUser}
          onOpenShift={handlers.handleOpenShift}
          onCloseShift={handlers.handleCloseShift}
          onAddCustomer={handlers.handleAddCustomer}
        />
      );
    case APP_SECTIONS.PURCHASES:
      return (
        <Purchases
          products={state.products}
          suppliers={state.suppliers}
          transactions={state.transactions}
          onCompletePurchase={handlers.handlePurchaseComplete}
          onReturnTransaction={handlers.handleReturnTransaction}
        />
      );
    case APP_SECTIONS.QUOTATIONS:
      return (
        <Quotations
          quotations={state.quotations}
          customers={state.customers}
          products={state.products}
          onCreateQuotation={handlers.handleCreateQuotation}
          onConvertToInvoice={handlers.handleConvertQuoteToInvoice}
        />
      );
    case APP_SECTIONS.INVENTORY:
      return (
        <Inventory
          products={state.products}
          onAddProduct={handlers.handleAddProduct}
          onUpdateProduct={handlers.handleUpdateProduct}
          onDeleteProduct={handlers.handleDeleteProduct}
          onAdjustStock={handlers.handleStockAdjustment}
        />
      );
    case APP_SECTIONS.TREASURY:
      return (
        <Treasury
          transactions={state.transactions}
          customers={state.customers}
          suppliers={state.suppliers}
          onAddExpense={handlers.handleAddExpense}
          onReturnTransaction={handlers.handleReturnTransaction}
          onDebtSettlement={handlers.handleDebtSettlement}
          settings={state.settings}
          currentUser={currentUser}
          onApprove={handlers.handleApproveTransaction}
          onReject={handlers.handleRejectTransaction}
          onCapitalTransaction={handlers.handleCapitalTransaction}
        />
      );
    case APP_SECTIONS.CUSTOMERS:
      return (
        <Customers
          customers={state.customers}
          onAddCustomer={handlers.handleAddCustomer}
          onUpdateCustomer={handlers.handleUpdateCustomer}
          onDeleteCustomer={handlers.handleDeleteCustomer}
          onSettleDebt={handlers.handleDebtSettlement}
        />
      );
    case APP_SECTIONS.SUPPLIERS:
      return (
        <Suppliers
          suppliers={state.suppliers}
          onAddSupplier={handlers.handleAddSupplier}
          onUpdateSupplier={handlers.handleUpdateSupplier}
          onDeleteSupplier={handlers.handleDeleteSupplier}
          onSettleDebt={handlers.handleDebtSettlement}
        />
      );
    case APP_SECTIONS.REPORTS:
      return (
        <Reports
          transactions={state.transactions}
          logs={state.activityLogs}
          shifts={state.shifts}
          customers={state.customers}
          suppliers={state.suppliers}
          products={state.products}
          currentUser={currentUser}
          settings={state.settings}
        />
      );
    case APP_SECTIONS.SETTINGS:
      return (
        <Settings
          settings={state.settings}
          onUpdateSettings={handlers.handleUpdateSettings}
          onBackup={handlers.handleBackup}
          onRestore={handlers.handleRestore}
          onClearTransactions={handlers.handleClearTransactions}
          onFactoryReset={handlers.handleFactoryReset}
        />
      );
    case APP_SECTIONS.USERS:
      return (
        <Users
          users={state.users}
          currentUser={currentUser}
          onAddUser={handlers.handleAddUser}
          onDeleteUser={handlers.handleDeleteUser}
          onChangePassword={handlers.handleChangePassword}
        />
      );
    default:
      return (
        <Dashboard
          transactions={state.transactions}
          products={state.products}
          customers={state.customers}
          suppliers={state.suppliers}
          settings={state.settings}
        />
      );
  }
};

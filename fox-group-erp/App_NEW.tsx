import React, { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Quotations from './pages/Quotations';
import Inventory from './pages/Inventory';
import Treasury from './pages/Treasury';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import { APP_SECTIONS, INITIAL_USERS } from './constants';
import { User } from './types';
import { useAppState } from './hooks/useAppState';
import { createActivityLog } from './utils/activityLogger';

// Import handlers (we'll create these files)
import { useShiftHandlers } from './handlers/useShiftHandlers';
import { useTransactionHandlers } from './handlers/useTransactionHandlers';
import { useCRUDHandlers } from './handlers/useCRUDHandlers';
import { useSystemHandlers } from './handlers/useSystemHandlers';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState(APP_SECTIONS.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Get all state
  const state = useAppState();

  // Helper to log activities
  const logActivity = (action: string, details: string) => {
    const newLog = createActivityLog(currentUser, action, details);
    state.setActivityLogs(prev => [...prev, newLog]);
  };

  // Get all handlers
  const shiftHandlers = useShiftHandlers(state, currentUser, logActivity);
  const transactionHandlers = useTransactionHandlers(state, currentUser, logActivity);
  const crudHandlers = useCRUDHandlers(state, logActivity);
  const systemHandlers = useSystemHandlers(state, logActivity);

  // Login Handler
  const handleLogin = (username: string, password: string) => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      logActivity('تسجيل دخول', `تسجيل دخول بواسطة ${user.name}`);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    logActivity('تسجيل خروج', `تسجيل خروج بواسطة ${currentUser.name}`);
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentSection(APP_SECTIONS.DASHBOARD);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
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
            onCompleteSale={transactionHandlers.handleSaleComplete}
            onReturnTransaction={transactionHandlers.handleReturnTransaction}
            settings={state.settings}
            currentUser={currentUser}
            onOpenShift={shiftHandlers.handleOpenShift}
            onCloseShift={shiftHandlers.handleCloseShift}
            onAddCustomer={crudHandlers.handleAddCustomer}
          />
        );
      case APP_SECTIONS.PURCHASES:
        return (
          <Purchases
            products={state.products}
            suppliers={state.suppliers}
            transactions={state.transactions}
            onCompletePurchase={transactionHandlers.handlePurchaseComplete}
            onReturnTransaction={transactionHandlers.handleReturnTransaction}
          />
        );
      case APP_SECTIONS.QUOTATIONS:
        return (
          <Quotations
            quotations={state.quotations}
            customers={state.customers}
            products={state.products}
            onCreateQuotation={transactionHandlers.handleCreateQuotation}
            onConvertToInvoice={transactionHandlers.handleConvertQuoteToInvoice}
          />
        );
      case APP_SECTIONS.INVENTORY:
        return (
          <Inventory
            products={state.products}
            onAddProduct={crudHandlers.handleAddProduct}
            onUpdateProduct={crudHandlers.handleUpdateProduct}
            onDeleteProduct={crudHandlers.handleDeleteProduct}
            onAdjustStock={transactionHandlers.handleStockAdjustment}
          />
        );
      case APP_SECTIONS.TREASURY:
        return (
          <Treasury
            transactions={state.transactions}
            customers={state.customers}
            suppliers={state.suppliers}
            onAddExpense={transactionHandlers.handleAddExpense}
            onReturnTransaction={transactionHandlers.handleReturnTransaction}
            onDebtSettlement={transactionHandlers.handleDebtSettlement}
            settings={state.settings}
            currentUser={currentUser}
            onApprove={transactionHandlers.handleApproveTransaction}
            onReject={transactionHandlers.handleRejectTransaction}
            onCapitalTransaction={transactionHandlers.handleCapitalTransaction}
          />
        );
      case APP_SECTIONS.CUSTOMERS:
        return (
          <Customers
            customers={state.customers}
            onAddCustomer={crudHandlers.handleAddCustomer}
            onUpdateCustomer={crudHandlers.handleUpdateCustomer}
            onDeleteCustomer={crudHandlers.handleDeleteCustomer}
            onSettleDebt={transactionHandlers.handleDebtSettlement}
          />
        );
      case APP_SECTIONS.SUPPLIERS:
        return (
          <Suppliers
            suppliers={state.suppliers}
            onAddSupplier={crudHandlers.handleAddSupplier}
            onUpdateSupplier={crudHandlers.handleUpdateSupplier}
            onDeleteSupplier={crudHandlers.handleDeleteSupplier}
            onSettleDebt={transactionHandlers.handleDebtSettlement}
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
            onUpdateSettings={crudHandlers.handleUpdateSettings}
            onBackup={systemHandlers.handleBackup}
            onRestore={systemHandlers.handleRestore}
            onClearTransactions={systemHandlers.handleClearTransactions}
            onFactoryReset={systemHandlers.handleFactoryReset}
          />
        );
      case APP_SECTIONS.USERS:
        return (
          <Users
            users={state.users}
            currentUser={currentUser}
            onAddUser={crudHandlers.handleAddUser}
            onDeleteUser={crudHandlers.handleDeleteUser}
            onChangePassword={crudHandlers.handleChangePassword}
          />
        );
      default:
        return <Dashboard transactions={state.transactions} products={state.products} customers={state.customers} suppliers={state.suppliers} settings={state.settings} />;
    }
  };

  return (
    <Layout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;

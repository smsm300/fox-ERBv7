
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import Treasury from './pages/Treasury';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import { APP_SECTIONS, INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_TRANSACTIONS, INITIAL_SETTINGS, INITIAL_USERS } from './constants';
import { Product, Transaction, Customer, Supplier, CartItem, PaymentMethod, TransactionType, Quotation, AppSettings, User, ActivityLogEntry, Shift } from './types';
import { authAPI, productsAPI, customersAPI, suppliersAPI, transactionsAPI, shiftsAPI, quotationsAPI, settingsAPI, usersAPI, activityLogAPI, systemAPI } from './services/endpoints';
import { handleAPIError } from './services/errorHandler';
import { useAutoLogout } from './hooks/useAutoLogout';

// Helper to load from localStorage
const loadState = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(`fox_erp_${key}`);
  return stored ? JSON.parse(stored) : fallback;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState(() =>
    localStorage.getItem('fox_erp_current_section') || APP_SECTIONS.DASHBOARD
  );

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Global State - All data from API (NO localStorage for data)
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Invoice Modal State
  const [invoiceModal, setInvoiceModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
    items: CartItem[];
    customerName: string;
    total: number;
    paymentMethod: PaymentMethod;
  }>({
    isOpen: false,
    transaction: null,
    items: [],
    customerName: '',
    total: 0,
    paymentMethod: PaymentMethod.CASH
  });

  // Logout handler
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setIsAuthenticated(false);
    logActivity('تسجيل خروج', 'خروج المستخدم من النظام');
  };

  // Auto logout hook (only active when authenticated)
  // Handles inactivity timeout and tab visibility
  useAutoLogout({
    onLogout: handleLogout,
    inactivityTimeout: (settings.inactivityTimeout || 30) * 60 * 1000,
    enabled: isAuthenticated // Only run when user is logged in
  });

  // Check authentication on mount (with browser close detection)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const sessionActive = sessionStorage.getItem('fox_erp_session_active');

    // If there's a token but no active session, browser was closed
    // Clear the old token so user needs to login again
    if (token && !sessionActive) {
      console.log('Browser was closed - clearing old authentication');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't return - let user see login page
    }

    // Check again after potential cleanup
    const currentToken = localStorage.getItem('token');
    const currentUserStr = localStorage.getItem('user');

    if (currentToken && currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Mark session as active
        sessionStorage.setItem('fox_erp_session_active', 'true');
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch Data on Auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  // Helper to extract list data from potentially paginated response
  const getListData = (response: any) => {
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return [];
  };

  const fetchInitialData = async () => {
    try {
      const [
        productsRes,
        transactionsRes,
        customersRes,
        suppliersRes,
        quotationsRes,
        settingsRes,
        usersRes,
        activityLogsRes,
        shiftsRes
      ] = await Promise.all([
        productsAPI.list(),
        transactionsAPI.list(),
        customersAPI.list(),
        suppliersAPI.list(),
        quotationsAPI.list(),
        settingsAPI.get(),
        usersAPI.list(),
        activityLogAPI.list(),
        shiftsAPI.list()
      ]);

      setProducts(getListData(productsRes));
      setTransactions(getListData(transactionsRes));
      setCustomers(getListData(customersRes));
      setSuppliers(getListData(suppliersRes));
      setQuotations(getListData(quotationsRes));
      if (settingsRes.data) setSettings(settingsRes.data);
      setUsers(getListData(usersRes));
      setActivityLogs(getListData(activityLogsRes));
      setShifts(getListData(shiftsRes));

    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      // Don't show alert on load to avoid annoyance, just log
    }
  };

  // Save only current section to localStorage (for navigation persistence)
  useEffect(() => localStorage.setItem('fox_erp_current_section', currentSection), [currentSection]);

  // Helper to log activities
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLogEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details
    };
    setActivityLogs(prev => [...prev, newLog]);
  };

  // --- Shift Handlers ---

  const handleOpenShift = async (startCash: number) => {
    if (settings.currentShiftId) {
      alert('هناك وردية مفتوحة بالفعل!');
      return;
    }

    try {
      const response = await shiftsAPI.open(startCash);
      const newShift = response.data;

      setShifts(prev => [...prev, newShift]);
      setSettings(prev => ({ ...prev, currentShiftId: newShift.id }));

      logActivity('وردية', `فتح وردية جديدة بواسطة ${currentUser.name} برصيد ${startCash}`);
    } catch (error: any) {
      console.error('Failed to open shift:', error);
      alert('فشل فتح الوردية: ' + handleAPIError(error));
    }
  };

  const handleCloseShift = async (endCash: number) => {
    if (!settings.currentShiftId) return;

    try {
      const response = await shiftsAPI.close(settings.currentShiftId, endCash);
      const updatedShift = response.data;

      setShifts(prev => prev.map(s => s.id === settings.currentShiftId ? updatedShift : s));
      setSettings(prev => ({ ...prev, currentShiftId: undefined }));

      logActivity('وردية', `إغلاق الوردية. المتوقع: ${updatedShift.expectedCash}، الفعلي: ${endCash}`);
      return updatedShift;
    } catch (error: any) {
      console.error('Failed to close shift:', error);
      alert('فشل إغلاق الوردية: ' + handleAPIError(error));
    }
  };

  // --- Handlers ---

  const handleSaleComplete = async (cartItems: CartItem[], customerId: number, paymentMethod: PaymentMethod, totalAmount: number, invoiceId?: string, isDirectSale: boolean = false, dueDate?: string, discountAmount?: number) => {
    // Check if shift is open (Admin can sell without shift)
    if (!settings.currentShiftId && currentUser.role !== 'admin') {
      alert('يجب فتح الوردية (Shift) أولاً قبل إجراء أي عملية بيع.');
      return;
    }

    try {
      // 1. Create Sale Transaction via API
      const response = await transactionsAPI.createSale({
        customer_id: customerId,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.cartQuantity,
          price: item.sellPrice,
          discount: item.discount || 0
        })),
        total_amount: totalAmount,
        invoice_id: invoiceId,
        is_direct_sale: isDirectSale,
        discount_amount: discountAmount
      });

      const newTransaction = response.data;
      setTransactions(prev => [...prev, newTransaction]);

      // 2. Refresh Products (to get updated stock)
      const productsRes = await productsAPI.list();
      setProducts(getListData(productsRes));

      // 3. Refresh Customers (to get updated balance if deferred)
      if (paymentMethod === PaymentMethod.DEFERRED) {
        const customersRes = await customersAPI.list();
        setCustomers(getListData(customersRes));
      }

      // 4. Update Settings (Invoice Number) if needed
      // (API handles this usually, but we update local state to reflect changes immediately if we want)
      // But simpler to just fetch settings or let API handle next ID.
      // Let's refresh settings just in case
      // const settingsRes = await settingsAPI.get();
      // setSettings(settingsRes.data);
      // Actually, we can manually increment locally to avoid full fetch for just ID
      if (!invoiceId || invoiceId === settings.nextInvoiceNumber.toString()) {
        setSettings(prev => ({ ...prev, nextInvoiceNumber: prev.nextInvoiceNumber + 1 }));
      }

      logActivity('عملية بيع', `إضافة فاتورة بيع رقم ${newTransaction.id} بقيمة ${totalAmount}`);

      // Show Invoice Modal
      const customer = customers.find(c => c.id === customerId);
      setInvoiceModal({
        isOpen: true,
        transaction: newTransaction,
        items: cartItems,
        customerName: customer?.name || 'عميل نقدي',
        total: totalAmount,
        paymentMethod
      });

    } catch (error: any) {
      console.error('Sale failed:', error);
      alert('فشل حفظ عملية البيع: ' + handleAPIError(error));
    }
  };

  // Print Invoice from Modal
  // Print Invoice from Modal
  // Print Invoice from Modal
  const handlePrintInvoice = () => {
    // 1. Create a hidden iframe
    let printFrame = document.getElementById('print-frame') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'print-frame';
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
    }

    // 2. Build items HTML separately
    const itemsHtml = invoiceModal.items.map(function (item) {
      const total = ((item.sellPrice - (item.discount || 0)) * item.cartQuantity).toLocaleString(undefined, { minimumFractionDigits: 0 });
      return '<tr><td class="col-name">' + item.name + '</td><td class="col-qty">' + item.cartQuantity + '</td><td class="col-price">' + item.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) + '</td><td class="col-total">' + total + '</td></tr>';
    }).join('');

    const subtotal = invoiceModal.items.reduce(function (s, i) { return s + (i.sellPrice * i.cartQuantity); }, 0).toLocaleString();

    // Safely handle taxRate
    const taxRate = Number(settings.taxRate) || 0;
    const taxAmount = taxRate > 0 ? (invoiceModal.total * taxRate / 100).toLocaleString(undefined, { minimumFractionDigits: 1 }) : '';
    const grandTotal = (invoiceModal.total + (taxRate > 0 ? invoiceModal.total * taxRate / 100 : 0)).toLocaleString(undefined, { minimumFractionDigits: 1 });

    const invoiceId = invoiceModal.transaction?.invoiceNumber || invoiceModal.transaction?.id || '';
    const dateStr = new Date().toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: '2-digit', day: '2-digit' });

    const fontUrl = window.location.origin + '/fonts/librebarcode39text.woff2';
    const htmlContent = '<!DOCTYPE html>' +
      '<html dir="rtl" lang="ar">' +
      '<head>' +
      '<meta charset="UTF-8">' +
      '<title>فاتورة - FOX GROUP</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">' +
      '<style>' +
      '@font-face { font-family: "Libre Barcode 39 Text"; src: url("' + fontUrl + '") format("woff2"); }' +
      '* { margin: 0; padding: 0; box-sizing: border-box; }' +
      'body { font-family: "Cairo", sans-serif; padding: 20px; font-size: 12px; color: #000; background: #fff; width: 80mm; line-height: 1.4; }' +
      '.text-center { text-align: center; }' +
      '.border-dashed { border-style: dashed; border-color: #9ca3af; }' +
      '.border-b-2 { border-bottom-width: 2px; }' +
      '.border-t-2 { border-top-width: 2px; }' +
      '.pb-4 { padding-bottom: 1rem; }' +
      '.pt-4 { padding-top: 1rem; }' +
      '.mb-4 { margin-bottom: 1rem; }' +
      '.mt-4 { margin-top: 1rem; }' +
      '.text-sm { font-size: 0.875rem; }' +
      '.text-xs { font-size: 0.75rem; }' +
      '.text-gray-500 { color: #6b7280; }' +
      '.text-gray-600 { color: #4b5563; }' +
      '.font-bold { font-weight: 700; }' +
      '.company-title { font-size: 1.25rem; font-weight: 900; margin-bottom: 2px; }' +
      '.info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }' +
      '.info-value { font-weight: 600; }' +
      'table { width: 100%; margin: 15px 0; border-collapse: collapse; }' +
      'th { font-weight: 900; font-size: 13px; text-align: right; padding: 4px; }' +
      'td { padding: 4px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }' +
      '.col-name { text-align: right; width: 40%; }' +
      '.col-qty { text-align: center; width: 15%; }' +
      '.col-price { text-align: center; width: 20%; }' +
      '.col-total { text-align: left; width: 25%; }' +
      '.total-row { display: flex; justify-content: space-between; font-size: 13px; }' +
      '.grand-total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px; }' +
      '.terms-section { font-size: 11px; color: #4b5563; text-align: right; margin-top: 10px; }' +
      '.footer-msg { font-size: 13px; font-weight: 600; color: #4b5563; margin-top: 15px; }' +
      '.barcode-wrap { text-align: center; margin-top: 15px; }' +
      '.barcode-main { font-family: "Libre Barcode 39 Text"; font-size: 45px; line-height: 1; }' +
      '@media print { body { width: 100%; padding: 0; } @page { margin: 0; } }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div style="padding: 1rem; color: black;">' +
      '<div class="text-center mb-4 border-b-2 border-dashed border-gray-400 pb-4">' +
      (settings.logoUrl ? '<img src="' + settings.logoUrl + '" alt="Logo" style="height: 3rem; margin: 0 auto 0.5rem auto;" />' : '') +
      '<h1 class="company-title">' + (settings.companyName || 'Fox Group') + '</h1>' +
      (settings.companyAddress ? '<p class="text-sm text-gray-600">' + settings.companyAddress + '</p>' : '') +
      (settings.companyPhone ? '<p class="text-sm text-gray-600">تليفون: ' + settings.companyPhone + '</p>' : '') +
      '</div>' +

      '<div class="mb-4 text-sm width-100">' +
      '<div class="info-row"><span class="info-value">#' + invoiceId + '</span><span class="text-gray-600">:رقم الفاتورة</span></div>' +
      '<div class="info-row"><span class="info-value">' + dateStr + '</span><span class="text-gray-600">:التاريخ</span></div>' +
      '<div class="info-row"><span class="info-value">' + invoiceModal.customerName + '</span><span class="text-gray-600">:العميل</span></div>' +
      '<div class="info-row"><span class="info-value">' + invoiceModal.paymentMethod + '</span><span class="text-gray-600">:طريقة الدفع</span></div>' +
      '</div>' +

      '<table>' +
      '<thead><tr><th class="col-name">الصنف</th><th class="col-qty">الكمية</th><th class="col-price">السعر</th><th class="col-total">الإجمالي</th></tr></thead>' +
      '<tbody>' + itemsHtml + '</tbody>' +
      '</table>' +

      '<div class="border-t-2 border-dashed border-gray-400 pt-4">' +
      '<div class="total-row"><span>' + subtotal + ' ج.م</span><span>:المجموع الفرعي</span></div>' +
      (taxRate > 0 ? '<div class="total-row"><span>' + taxAmount + ' ج.م</span><span>:ضريبة القيمة المضافة (' + taxRate.toFixed(2) + '%)</span></div>' : '') +
      '<div class="grand-total-row"><span>' + grandTotal + ' ج.م</span><span>:الإجمالي</span></div>' +
      '</div>' +

      (settings.invoiceTerms ? '<div class="mt-4 pt-4 border-t-2 border-dashed border-gray-400 text-xs text-gray-500"><p class="font-bold mb-1">الشروط والأحكام:</p><p>' + settings.invoiceTerms + '</p></div>' : '') +

      '<div class="text-center mt-4 pt-4 border-t-2 border-dashed border-gray-400 text-sm text-gray-600">' +
      '<p>شكراً لتعاملكم معنا</p><p>نتمنى لكم يوماً سعيداً</p>' +
      '</div>' +

      '<div class="text-center mt-4 pt-4 border-t-2 border-dashed border-gray-400">' +
      '<p class="text-xs text-gray-500 mb-1">رقم الفاتورة المميكن</p>' +
      '<p class="barcode-main">' + invoiceId + '</p>' +
      '<p style="font-family: monospace; font-size: 10px; color: #4b5563;">' + invoiceId + '</p>' +
      '</div>' +
      '</div>' +
      '</body>' +
      '</html>';

    // 3. Write to iframe
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      // 4. Print after images load (little delay)
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      }, 500);
    }
  };

  // Close Invoice Modal
  const closeInvoiceModal = () => {
    setInvoiceModal({
      isOpen: false,
      transaction: null,
      items: [],
      customerName: '',
      total: 0,
      paymentMethod: PaymentMethod.CASH
    });
  };

  const handlePurchaseComplete = async (cartItems: CartItem[], supplierId: number, paymentMethod: PaymentMethod, totalAmount: number, dueDate?: string) => {
    try {
      // 1. Create Purchase Transaction via API
      const response = await transactionsAPI.createPurchase({
        supplier_id: supplierId,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.cartQuantity,
          cost_price: item.costPrice
        })),
        total_amount: totalAmount
      });

      const newTransaction = response.data;
      setTransactions(prev => [...prev, newTransaction]);

      // 2. Refresh Products to get new stock and average cost from backend
      const productsRes = await productsAPI.list();
      setProducts((productsRes.data as any).results || productsRes.data);

      // 3. Refresh Suppliers if deferred to update balance
      if (paymentMethod === PaymentMethod.DEFERRED) {
        const suppliersRes = await suppliersAPI.list();
        setSuppliers((suppliersRes.data as any).results || suppliersRes.data);
      }

      logActivity('عملية شراء', `إضافة فاتورة شراء من مورد #${supplierId}`);
      alert('تم حفظ فاتورة الشراء وتحديث المخزن ومتوسط التكلفة!');

    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert('فشل حفظ فاتورة الشراء: ' + handleAPIError(error));
    }
  };

  const handleReturnTransaction = async (originalTransaction: Transaction) => {
    if (originalTransaction.type !== TransactionType.SALE && originalTransaction.type !== TransactionType.PURCHASE) return;

    try {
      // 1. Process Return via API
      // Note: We need the transaction ID string. If it's a number disguised as string, it should still work.
      await transactionsAPI.return(originalTransaction.id);

      // 2. Refresh Data
      // Refresh Transactions (to show the new return transaction)
      const transactionsRes = await transactionsAPI.list();
      setTransactions((transactionsRes.data as any).results || transactionsRes.data);

      // Refresh Products (stock updated)
      const productsRes = await productsAPI.list();
      setProducts((productsRes.data as any).results || productsRes.data);

      // Refresh Customers/Suppliers (balance updated)
      if (originalTransaction.paymentMethod === PaymentMethod.DEFERRED) {
        if (originalTransaction.type === TransactionType.SALE) {
          const customersRes = await customersAPI.list();
          setCustomers((customersRes.data as any).results || customersRes.data);
        } else {
          const suppliersRes = await suppliersAPI.list();
          setSuppliers((suppliersRes.data as any).results || suppliersRes.data);
        }
      }

      logActivity('مرتجع', `تسجيل مرتجع للفاتورة ${originalTransaction.id}`);
      alert('تم تسجيل المرتجع وتحديث الحسابات.');

    } catch (error: any) {
      console.error('Return failed:', error);
      alert('فشل تسجيل المرتجع: ' + handleAPIError(error));
    }
  };

  const handleAddExpense = async (amount: number, description: string, category: string) => {
    // Check if shift is open (Admin can add without shift, but better to enforce)
    if (!settings.currentShiftId && currentUser.role !== 'admin') {
      alert('يجب فتح الوردية (Shift) أولاً.');
      return;
    }

    try {
      const threshold = 2000;
      const response = await transactionsAPI.createExpense({
        amount,
        category,
        description,
        payment_method: PaymentMethod.CASH
      });

      const newTransaction = response.data;
      setTransactions(prev => [...prev, newTransaction]);

      const isPending = newTransaction.status === 'pending';

      if (isPending) {
        logActivity('مصروفات', `طلب موافقة على مصروف بقيمة ${amount}`);
        alert('تم تسجيل الطلب، بانتظار موافقة المدير (المبلغ يتجاوز الحد المسموح).');
      } else {
        logActivity('مصروفات', `تسجيل مصروف (${category}) بقيمة ${amount}`);
        alert('تم تسجيل المصروف بنجاح');
      }

    } catch (error: any) {
      console.error('Failed to create expense:', error);
      alert('فشل تسجيل المصروف: ' + handleAPIError(error));
    }
  };

  const handleCapitalTransaction = async (type: 'deposit' | 'withdrawal', amount: number, description: string) => {
    try {
      if (type === 'deposit') {
        await transactionsAPI.createCapital({
          amount,
          description
        });
      } else {
        await transactionsAPI.createWithdrawal({
          amount,
          description
        });
      }

      // Refresh Transactions
      const transactionsRes = await transactionsAPI.list();
      setTransactions((transactionsRes.data as any).results || transactionsRes.data);

      logActivity('رأس مال', `${type === 'deposit' ? 'إيداع رأس مال' : 'مسحوبات شخصية'} بقيمة ${amount}`);
      alert('تم تسجيل العملية بنجاح');
    } catch (error: any) {
      console.error('Capital/Withdrawal failed:', error);
      alert('فشل تسجيل العملية: ' + handleAPIError(error));
    }
  };

  const handleApproveTransaction = async (id: string) => {
    try {
      await transactionsAPI.approve(id);
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'completed' } : t
      ));
      logActivity('موافقة', `تمت الموافقة على المعاملة ${id}`);
    } catch (error: any) {
      console.error('Approve failed:', error);
      alert('فشل الموافقة على المعاملة: ' + handleAPIError(error));
    }
  };

  const handleRejectTransaction = async (id: string) => {
    try {
      await transactionsAPI.reject(id);
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'rejected' } : t
      ));
      logActivity('رفض', `تم رفض المعاملة ${id}`);
    } catch (error: any) {
      console.error('Reject failed:', error);
      alert('فشل رفض المعاملة: ' + handleAPIError(error));
    }
  };

  const handleDebtSettlement = async (type: 'customer' | 'supplier', id: number, amount: number, notes: string) => {
    try {
      const isCustomer = type === 'customer';
      let res;

      if (isCustomer) {
        res = await customersAPI.settleDebt(id, { amount, payment_method: PaymentMethod.CASH });
        // Refresh Customer to get new balance
        const customerRes = await customersAPI.list();
        setCustomers((customerRes.data as any).results || customerRes.data);
        logActivity('تحصيل', `استلام مبلغ ${amount} من العميل ID: ${id}`);
      } else {
        res = await suppliersAPI.settleDebt(id, { amount, payment_method: PaymentMethod.CASH });
        // Refresh Supplier to get new balance
        const supplierRes = await suppliersAPI.list();
        setSuppliers((supplierRes.data as any).results || supplierRes.data);
        logActivity('سداد', `دفع مبلغ ${amount} للمورد ID: ${id}`);
      }

      // Refresh Transactions to see the settlement transaction
      const transactionsRes = await transactionsAPI.list();
      setTransactions((transactionsRes.data as any).results || transactionsRes.data);

      alert('تم تسجيل العملية وتحديث الرصيد بنجاح');
    } catch (error: any) {
      console.error('Debt settlement failed:', error);
      alert('فشل تسوية المديونية: ' + handleAPIError(error));
    }
  };

  const handleStockAdjustment = async (productId: number, quantityDiff: number, reason: string) => {
    try {
      if (quantityDiff === 0) return;

      await productsAPI.adjustStock(productId, { quantity_diff: quantityDiff, reason });

      // Refresh Products
      const productsRes = await productsAPI.list();
      setProducts((productsRes.data as any).results || productsRes.data);

      // Refresh Transactions (Adjustment is recorded as a transaction)
      const transactionsRes = await transactionsAPI.list();
      setTransactions((transactionsRes.data as any).results || transactionsRes.data);

      logActivity('تسوية مخزون', `تعديل كمية المنتج ID ${productId} بمقدار ${quantityDiff}. السبب: ${reason}`);
      alert('تم تحديث المخزون وتسجيل التسوية');
    } catch (error: any) {
      console.error('Stock adjustment failed:', error);
      alert('فشل تسوية المخزون: ' + handleAPIError(error));
    }
  };

  const handleCreateQuotation = async (customerId: number, items: CartItem[]) => {
    try {
      const res = await quotationsAPI.create({
        customer_id: customerId,
        items: items.map(item => ({
          id: item.id,
          quantity: item.cartQuantity,
          price: item.sellPrice,
          discount: item.discount || 0
        })),
        total_amount: items.reduce((sum, item) => sum + (item.sellPrice * item.cartQuantity), 0)
      });

      setQuotations(prev => [res.data, ...prev]);
      logActivity('عرض سعر', `إنشاء عرض سعر للعميل ID: ${customerId}`);
      alert('تم إنشاء عرض السعر بنجاح');
    } catch (error: any) {
      console.error('Create quotation failed:', error);
      alert('فشل إنشاء عرض السعر: ' + handleAPIError(error));
    }
  };

  const handleConvertQuoteToInvoice = async (quotationId: string) => {
    if (!window.confirm('هل أنت متأكد من تحويل العرض لفاتورة؟')) return;

    try {
      await quotationsAPI.convert(quotationId, { payment_method: PaymentMethod.CASH });

      // Refresh Quotations (status update)
      const quotesRes = await quotationsAPI.list();
      setQuotations((quotesRes.data as any).results || quotesRes.data);

      // Refresh Transactions (new sale)
      const transactionsRes = await transactionsAPI.list();
      setTransactions((transactionsRes.data as any).results || transactionsRes.data);

      // Refresh Products (stock deduction)
      const productsRes = await productsAPI.list();
      setProducts((productsRes.data as any).results || productsRes.data);

      logActivity('تحويل عرض سعر', `تحويل العرض ${quotationId} لفاتورة`);
      alert('تم تحويل العرض لفاتورة بيع بنجاح');
    } catch (error: any) {
      console.error('Convert quotation failed:', error);
      alert('فشل تحويل عرض السعر: ' + handleAPIError(error));
    }
  };

  // --- CRUD Handlers with Safety Checks ---

  // --- CRUD Handlers with API Integration ---

  const handleAddCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const res = await customersAPI.create(customerData);
      setCustomers(prev => [...prev, res.data]);
      logActivity('إضافة عميل', `إضافة العميل ${customerData.name}`);
      return res.data;
    } catch (error: any) {
      console.error('Add customer failed:', error);
      alert('فشل إضافة العميل: ' + handleAPIError(error));
      throw error;
    }
  };

  const handleUpdateCustomer = async (customer: Customer) => {
    try {
      const res = await customersAPI.update(customer.id, customer);
      setCustomers(prev => prev.map(c => c.id === customer.id ? res.data : c));
      logActivity('تعديل عميل', `تعديل بيانات العميل ${customer.name}`);
    } catch (error: any) {
      console.error('Update customer failed:', error);
      alert('فشل تعديل العميل: ' + handleAPIError(error));
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    try {
      await customersAPI.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      logActivity('حذف عميل', `حذف العميل ID: ${id}`);
    } catch (error: any) {
      console.error('Delete customer failed:', error);
      alert('فشل حذف العميل: ' + handleAPIError(error));
    }
  };

  const handleAddSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const res = await suppliersAPI.create(supplierData);
      setSuppliers(prev => [...prev, res.data]);
      logActivity('إضافة مورد', `إضافة المورد ${supplierData.name}`);
    } catch (error: any) {
      console.error('Add supplier failed:', error);
      alert('فشل إضافة المورد: ' + handleAPIError(error));
    }
  };

  const handleUpdateSupplier = async (supplier: Supplier) => {
    try {
      const res = await suppliersAPI.update(supplier.id, supplier);
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? res.data : s));
      logActivity('تعديل مورد', `تعديل بيانات المورد ${supplier.name}`);
    } catch (error: any) {
      console.error('Update supplier failed:', error);
      alert('فشل تعديل المورد: ' + handleAPIError(error));
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await suppliersAPI.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      logActivity('حذف مورد', `حذف المورد ID: ${id}`);
    } catch (error: any) {
      console.error('Delete supplier failed:', error);
      alert('فشل حذف المورد: ' + handleAPIError(error));
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await productsAPI.create(productData);
      setProducts(prev => [...prev, res.data]);
      logActivity('إضافة منتج', `إضافة المنتج ${productData.name}`);
    } catch (error: any) {
      console.error('Add product failed:', error);
      alert('فشل إضافة المنتج: ' + handleAPIError(error));
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const res = await productsAPI.update(updatedProduct.id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? res.data : p));
      logActivity('تعديل منتج', `تعديل المنتج ${updatedProduct.name}`);
    } catch (error: any) {
      console.error('Update product failed:', error);
      alert('فشل تعديل المنتج: ' + handleAPIError(error));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      logActivity('حذف منتج', `حذف المنتج ID: ${id}`);
    } catch (error: any) {
      console.error('Delete product failed:', error);
      alert('فشل حذف المنتج: ' + handleAPIError(error));
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      const res = await settingsAPI.update(newSettings);
      setSettings(res.data);
      logActivity('إعدادات', 'تحديث إعدادات النظام');
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error: any) {
      console.error('Update settings failed:', error);
      alert('فشل تحديث الإعدادات: ' + handleAPIError(error));
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      const userToCreate = {
        username: userData.username,
        name: userData.name,
        role: userData.role,
        password: userData.password || '123456'
      };
      const res = await usersAPI.create(userToCreate);
      setUsers(prev => [...prev, res.data]);
      logActivity('مستخدمين', `إضافة مستخدم جديد: ${userData.username}`);
    } catch (error: any) {
      console.error('Add user failed:', error);
      alert('فشل إضافة المستخدم: ' + handleAPIError(error));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await usersAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      logActivity('مستخدمين', `حذف مستخدم ID: ${userId}`);
    } catch (error: any) {
      console.error('Delete user failed:', error);
      alert('فشل حذف المستخدم: ' + handleAPIError(error));
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    try {
      await usersAPI.changePassword({ old_password: 'unknown', new_password: newPassword }); // Note: Backend typically needs old password. Assuming admin override or current user change.
      // If the backend requires old password, we might need a prompt. But for now let's assume simple update if endpoints allow.
      // Actually checking endpoints.ts: changePassword: (data: { old_password: string; new_password: string }) => ...
      // If we don't have old password, this might fail unless we are admin updating another user.
      // If it is 'my profile', we need old password.
      // For this simplified version, let's assume we might need to update the UI to ask for old password later.
      // For now, I will use a placeholder or check if this function is used for self or others.
      // It says: "setCurrentUser(prev => ({ ...prev, password: newPassword })); logActivity('حسابي', ...)" so it is for self.

      // Prompt for old password since it is required for security
      const oldPassword = prompt('الرجاء إدخال كلمة المرور الحالية للتأكيد:');
      if (!oldPassword) return;

      await usersAPI.changePassword({ old_password: oldPassword, new_password: newPassword });

      setUsers(prev => prev.map(u =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      ));
      setCurrentUser(prev => ({ ...prev, password: newPassword }));
      logActivity('حسابي', 'تم تغيير كلمة المرور');
      alert('تم تغيير كلمة المرور بنجاح');
    } catch (error: any) {
      console.error('Change password failed:', error);
      alert('فشل تغيير كلمة المرور: ' + handleAPIError(error));
    }
  };

  // --- System Management Handlers ---

  const handleBackup = async () => {
    try {
      const response = await systemAPI.backup();
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`); // Adjust extension if it's zip or sql
      document.body.appendChild(link);
      link.click();
      link.remove();
      logActivity('نسخ احتياطي', 'تنزيل نسخة احتياطية من البيانات');
    } catch (error: any) {
      console.error('Backup failed:', error);
      alert('فشل إنشاء النسخة الاحتياطية: ' + handleAPIError(error));
    }
  };

  const handleRestore = async (file: File) => {
    try {
      await systemAPI.restore(file);
      logActivity('استعادة نسخة', 'تم استعادة البيانات من ملف نسخة احتياطية');
      alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
      window.location.reload();
    } catch (error: any) {
      console.error('Restore failed:', error);
      alert('فشل استعادة النسخة الاحتياطية: ' + handleAPIError(error));
    }
  };

  const handleClearTransactions = async () => {
    if (!window.confirm('تحذير: سيتم مسح جميع المعاملات وتصفية الحسابات. هل أنت متأكد؟')) return;
    try {
      await systemAPI.clearTransactions();
      setTransactions([]);
      setActivityLogs([]);
      setQuotations([]);
      setShifts([]);
      setSettings(prev => ({ ...prev, currentShiftId: undefined }));
      // Reset Balances
      // Ideally fetch fresh customers/suppliers
      const clientsRes = await customersAPI.list();
      setCustomers((clientsRes.data as any).results || clientsRes.data);
      const suppliersRes = await suppliersAPI.list();
      setSuppliers((suppliersRes.data as any).results || suppliersRes.data);

      logActivity('مسح معاملات', 'تم مسح سجل المعاملات وتصفية الحسابات');
      alert('تم مسح جميع المعاملات وتصفية أرصدة العملاء والموردين بنجاح.');
    } catch (error: any) {
      console.error('Clear transactions failed:', error);
      alert('فشل مسح المعاملات: ' + handleAPIError(error));
    }
  };

  const handleFactoryReset = async () => {
    if (!window.confirm('تحذير هام جداً: سيتم حذف كل البيانات (منتجات، عملاء، فواتير، مستخدمين) والعودة لضبط المصنع. هل أنت متأكد تماماً؟')) return;
    try {
      await systemAPI.factoryReset();
      localStorage.clear();
      alert('تمت إعادة ضبط المصنع بنجاح!');
      window.location.reload();
    } catch (error: any) {
      console.error('Factory reset failed:', error);
      alert('فشل إعادة ضبط المصنع: ' + handleAPIError(error));
    }
  };

  // Notifications
  const lowStockProducts = Array.isArray(products) ? products.filter(p => p.quantity <= p.minStockAlert) : [];

  const renderContent = () => {
    switch (currentSection) {
      case APP_SECTIONS.DASHBOARD:
        return <Dashboard products={products} transactions={transactions} customers={customers} currentUser={currentUser} settings={settings} />;
      case APP_SECTIONS.SALES:
        return <Sales
          products={products}
          customers={customers}
          transactions={transactions}
          onCompleteSale={handleSaleComplete}
          onReturnTransaction={handleReturnTransaction}
          settings={settings}
          currentUser={currentUser}
          onAddCustomer={handleAddCustomer}
        />;
      case APP_SECTIONS.PURCHASES:
        return <Purchases onDataChange={fetchInitialData} />;
      case APP_SECTIONS.QUOTATIONS:
        return <Quotations quotations={quotations} customers={customers} products={products} onCreateQuotation={handleCreateQuotation} onConvertToInvoice={handleConvertQuoteToInvoice} settings={settings} />;
      case APP_SECTIONS.INVOICES:
        return <Invoices onDataChange={fetchInitialData} />;
      case APP_SECTIONS.INVENTORY:
        return <Inventory onProductsChange={fetchInitialData} />;
      case APP_SECTIONS.TREASURY:
        return <Treasury
          transactions={transactions}
          customers={customers}
          suppliers={suppliers}
          onAddExpense={handleAddExpense}
          onReturnTransaction={handleReturnTransaction}
          onDebtSettlement={handleDebtSettlement}
          settings={settings}
          currentUser={currentUser}
          onApprove={handleApproveTransaction}
          onReject={handleRejectTransaction}
          onCapitalTransaction={handleCapitalTransaction}
        />;
      case APP_SECTIONS.CUSTOMERS:
        return <Customers onDataChange={fetchInitialData} />;
      case APP_SECTIONS.SUPPLIERS:
        return <Suppliers onDataChange={fetchInitialData} />;
      case APP_SECTIONS.REPORTS:
        return <Reports />;
      case APP_SECTIONS.USERS:
        return <Users />;
      case APP_SECTIONS.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard products={products} transactions={transactions} customers={customers} currentUser={currentUser} settings={settings} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      // Mark session as active for browser close detection
      sessionStorage.setItem('fox_erp_session_active', 'true');
      setIsAuthenticated(true);
      setCurrentUser(user);
      logActivity('تسجيل دخول', `تسجيل دخول المستخدم ${user.username}`);
    }} />;
  }

  return (
    <Layout
      currentSection={currentSection}
      onNavigate={setCurrentSection}
      alertsCount={lowStockProducts.length}
      lowStockItems={lowStockProducts}
      currentUser={currentUser}
      onLogout={handleLogout}
      onChangePassword={handleChangePassword}
      settings={settings}
    >
      {renderContent()}

      {/* Invoice Modal */}
      {invoiceModal.isOpen && invoiceModal.transaction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div id="invoice-print-content" className="p-6 text-black">
              {/* Header */}
              <div className="text-center mb-4 border-b-2 border-dashed border-gray-400 pb-4">
                {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />
                )}
                <h1 className="text-xl font-bold">{settings.companyName || 'Fox Group'}</h1>
                {settings.companyAddress && <p className="text-sm text-gray-600">{settings.companyAddress}</p>}
                {settings.companyPhone && <p className="text-sm text-gray-600">تليفون: {settings.companyPhone}</p>}
              </div>

              {/* Info */}
              <div className="mb-4 text-sm space-y-1">
                <div className="flex justify-between"><span>رقم الفاتورة:</span><span>#{invoiceModal.transaction.id}</span></div>
                <div className="flex justify-between"><span>التاريخ:</span><span>{new Date().toLocaleString('ar-EG')}</span></div>
                <div className="flex justify-between"><span>العميل:</span><span>{invoiceModal.customerName}</span></div>
                <div className="flex justify-between"><span>طريقة الدفع:</span><span>{invoiceModal.paymentMethod}</span></div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-right">الصنف</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-left">السعر</th>
                    <th className="p-2 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceModal.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-center">{item.cartQuantity}</td>
                      <td className="p-2 text-left">{item.sellPrice.toLocaleString()}</td>
                      <td className="p-2 text-left">{((item.sellPrice - (item.discount || 0)) * item.cartQuantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t-2 border-dashed border-gray-400 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي:</span>
                  <span>{invoiceModal.items.reduce((s, i) => s + (i.sellPrice * i.cartQuantity), 0).toLocaleString()} ج.م</span>
                </div>
                {invoiceModal.items.reduce((s, i) => s + ((i.discount || 0) * i.cartQuantity), 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم:</span>
                    <span>- {invoiceModal.items.reduce((s, i) => s + ((i.discount || 0) * i.cartQuantity), 0).toLocaleString()} ج.م</span>
                  </div>
                )}
                {settings.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>ضريبة القيمة المضافة ({settings.taxRate}%):</span>
                    <span>{(invoiceModal.total * settings.taxRate / 100).toLocaleString()} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>الإجمالي:</span>
                  <span>{(invoiceModal.total + (settings.taxRate > 0 ? invoiceModal.total * settings.taxRate / 100 : 0)).toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Invoice Terms */}
              {settings.invoiceTerms && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-300 text-xs text-gray-500">
                  <p className="font-bold mb-1">الشروط والأحكام:</p>
                  <p>{settings.invoiceTerms}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-400 text-sm text-gray-600">
                <p>شكراً لتعاملكم معنا</p>
                <p>نتمنى لكم يوماً سعيداً</p>
              </div>

              {/* Invoice Barcode for Thermal Print */}
              <div className="barcode-section text-center mt-4 pt-4 border-t border-dashed border-gray-400">
                <div className="text-xs text-gray-500 mb-1">رقم الفاتورة المميكن</div>
                <div className="barcode-font text-4xl font-libre-barcode text-black">
                  {invoiceModal.transaction.invoiceNumber || invoiceModal.transaction.id}
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                  {invoiceModal.transaction.invoiceNumber || invoiceModal.transaction.id}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-4 bg-gray-100 border-t">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600"
              >
                طباعة
              </button>
              <button
                onClick={closeInvoiceModal}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;

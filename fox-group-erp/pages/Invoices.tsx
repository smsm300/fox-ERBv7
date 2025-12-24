import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Printer, RotateCcw, FileText, Calendar, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Transaction, TransactionType, AppSettings } from '../types';
import { Modal } from '../components/Modal';
import { transactionsAPI, settingsAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';
import { useDebounce } from '../hooks/useDebounce';

// Sort types
type SortField = 'id' | 'type' | 'party' | 'date' | 'amount' | 'paymentMethod' | 'itemsCount';
type SortDirection = 'asc' | 'desc';

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Get default date range (last month)
const getDefaultDateRange = () => {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  return {
    from: getDateString(lastMonth),
    to: getDateString(today)
  };
};

interface InvoicesProps {
  onDataChange?: () => void;
}

const Invoices: React.FC<InvoicesProps> = ({ onDataChange }) => {
  const defaultDates = getDefaultDateRange();
  const [invoices, setInvoices] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'purchase'>('all');

  // View Invoice Modal
  const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);

  // Return Modal
  const [returningInvoice, setReturningInvoice] = useState<Transaction | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-open invoice when barcode matches exactly
  useEffect(() => {
    if (searchTerm.length >= 8) {
      const exactMatch = invoices.find(inv =>
        (inv.invoiceNumber === searchTerm) ||
        (inv.id.toString() === searchTerm)
      );

      if (exactMatch) {
        setViewingInvoice(exactMatch);
        setSearchTerm(''); // Clear search for next scan
      }
    }
  }, [searchTerm, invoices]);

  // Global keydown listener to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (searchInputRef.current) searchInputRef.current.focus();
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await transactionsAPI.list();
      const data = (response.data as any).results || response.data;
      // Filter only sale and purchase transactions (invoices)
      const invoiceTypes = [TransactionType.SALE, TransactionType.PURCHASE];
      const filteredInvoices = Array.isArray(data)
        ? data.filter((t: Transaction) => invoiceTypes.includes(t.type as TransactionType))
        : [];
      setInvoices(filteredInvoices);
    } catch (err: any) {
      alert(handleAPIError(err));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp
        size={12}
        className={`-mb-1 ${sortField === field && sortDirection === 'asc' ? 'text-fox-400' : 'text-gray-600'}`}
      />
      <ChevronDown
        size={12}
        className={`${sortField === field && sortDirection === 'desc' ? 'text-fox-400' : 'text-gray-600'}`}
      />
    </span>
  );

  const filteredAndSortedInvoices = useMemo(() => {
    // First filter
    const filtered = invoices.filter(inv => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        inv.id.toLowerCase().includes(searchLower) ||
        (inv.customerName || '').toLowerCase().includes(searchLower) ||
        (inv.supplierName || '').toLowerCase().includes(searchLower) ||
        (inv.description || '').toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'sale' && inv.type === TransactionType.SALE) ||
        (typeFilter === 'purchase' && inv.type === TransactionType.PURCHASE);

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = matchesDate && new Date(inv.date) >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDate = matchesDate && new Date(inv.date) <= new Date(dateTo + 'T23:59:59');
      }

      return matchesSearch && matchesType && matchesDate;
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      const isSaleA = a.type === TransactionType.SALE;
      const isSaleB = b.type === TransactionType.SALE;
      const partyA = (isSaleA ? a.customerName : a.supplierName) || '';
      const partyB = (isSaleB ? b.customerName : b.supplierName) || '';

      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id, 'ar');
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type, 'ar');
          break;
        case 'party':
          comparison = partyA.localeCompare(partyB, 'ar');
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case 'paymentMethod':
          comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '', 'ar');
          break;
        case 'itemsCount':
          comparison = (a.items?.length || 0) - (b.items?.length || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [invoices, searchTerm, typeFilter, dateFrom, dateTo, sortField, sortDirection]);

  // طباعة إيصال حراري (مثل نقطة البيع)
  const handlePrintInvoice = (invoice: Transaction) => {
    const isSale = invoice.type === TransactionType.SALE;
    const partyName = isSale ? invoice.customerName : invoice.supplierName;
    const items = invoice.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
      const qty = item.cartQuantity || item.quantity || 0;
      const price = Number(item.sellPrice || item.buyPrice || item.price || 0);
      return sum + (qty * price);
    }, 0);
    const amount = Number(invoice.amount);

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - FOX GROUP</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
          @font-face {
            font-family: 'Libre Barcode 39 Text';
            src: url('/fonts/librebarcode39text.woff2') format('woff2');
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', sans-serif; 
            padding: 20px; 
            font-size: 12px; 
            color: #000;
            background: #fff;
            width: 80mm;
            line-height: 1.4;
          }
          .text-center { text-align: center; }
          .divider { border-top: 1px dashed #9ca3af; margin: 12px 0; }
          
          .header-section { margin-bottom: 15px; }
          .logo-img { height: 50px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
          .company-title { font-size: 20px; font-weight: 900; margin-bottom: 2px; }
          .company-info { font-size: 13px; color: #374151; }
          
          .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
          .info-label { color: #1f2937; }
          .info-value { font-weight: 600; }
          
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { font-weight: 900; font-size: 13px; border-bottom: 1px solid #e5e7eb; padding: 8px 4px; }
          td { padding: 10px 4px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
          .col-name { text-align: right; width: 40%; }
          .col-qty { text-align: center; width: 15%; }
          .col-price { text-align: center; width: 20%; }
          .col-total { text-align: left; width: 25%; }
          
          .totals-section { space-y: 6px; }
          .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
          .grand-total-row { display: flex; justify-content: space-between; font-size: 19px; font-weight: 900; margin-top: 10px; }
          
          .terms-section { font-size: 11px; color: #4b5563; text-align: right; margin-top: 10px; }
          .terms-title { font-weight: 700; margin-bottom: 4px; color: #374151; }
          
          .footer-msg { font-size: 13px; font-weight: 600; color: #374151; margin: 15px 0; }
          
          .barcode-wrap { text-align: center; margin-top: 15px; }
          .barcode-label { font-size: 11px; color: #6b7280; margin-bottom: 5px; }
          .barcode-main { 
            font-family: 'Libre Barcode 39 Text'; 
            font-size: 55px; 
            line-height: 1;
            margin: 5px 0;
          }
          .barcode-id { font-family: monospace; font-size: 10px; color: #374151; }
          
          @media print {
            body { width: 100%; padding: 5px; }
            @page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header-section text-center">
          ${settings?.logoUrl ? `<img src="${settings.logoUrl}" class="logo-img" />` : ''}
          <div class="company-title">${settings?.companyName || 'FOX GROUP'}</div>
          <div class="company-info">${settings?.companyAddress || 'القاهرة - مصر'}</div>
          <div class="company-info">تليفون: ${settings?.companyPhone || '01112223334'}</div>
        </div>

        <div class="divider"></div>

        <div class="info-section">
          <div class="info-row"><span class="info-value">#${invoice.invoiceNumber || invoice.id}</span><span class="info-label">:رقم الفاتورة</span></div>
          <div class="info-row"><span class="info-value">${new Date(invoice.date).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: '2-digit', day: '2-digit' })}</span><span class="info-label">:التاريخ</span></div>
          <div class="info-row"><span class="info-value">${partyName || 'عميل نقدي'}</span><span class="info-label">:العميل</span></div>
          <div class="info-row"><span class="info-value">${invoice.paymentMethod || 'كاش'}</span><span class="info-label">:طريقة الدفع</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-name">الصنف</th>
              <th class="col-qty">الكمية</th>
              <th class="col-price">السعر</th>
              <th class="col-total">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any) => {
      const qty = item.cartQuantity || item.quantity || 0;
      const price = Number(item.sellPrice || item.buyPrice || item.price || 0);
      return `
              <tr>
                <td class="col-name">${item.name || item.productName || '-'}</td>
                <td class="col-qty">${qty}</td>
                <td class="col-price">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="col-total">${(qty * price).toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="totals-section">
          <div class="total-row"><span>${subtotal.toLocaleString()} ج.م</span><span>:المجموع الفرعي</span></div>
          <div class="grand-total-row"><span>${amount.toLocaleString(undefined, { minimumFractionDigits: 1 })} ج.م</span><span>:الإجمالي</span></div>
        </div>

        ${settings?.invoiceTerms ? `
          <div class="divider"></div>
          <div class="terms-section">
            <div class="terms-title">:الشروط والأحكام</div>
            <div>${settings.invoiceTerms}</div>
          </div>
        ` : ''}

        <div class="divider"></div>

        <div class="footer-msg text-center">
          <div>شكراً لتعاملكم معنا</div>
          <div>نتمنى لكم يوماً سعيداً</div>
        </div>

        <div class="divider"></div>

        <div class="barcode-wrap">
          <div class="barcode-label">رقم الفاتورة المميكن</div>
          <div class="barcode-main">${invoice.invoiceNumber || invoice.id}</div>
          <div class="barcode-id">${invoice.invoiceNumber || invoice.id}</div>
        </div>
      </body>
      <script>
        window.onload = function() { 
          setTimeout(() => {
            window.print(); 
            window.close(); 
          }, 500); 
        }
      </script>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=450,height=700');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const handleReturn = async () => {
    if (!returningInvoice) return;

    setLoading(true);
    try {
      await transactionsAPI.return(returningInvoice.id.toString());
      alert(`تم تسجيل مرتجع للفاتورة ${returningInvoice.id} بنجاح`);
      setReturningInvoice(null);
      setReturnReason('');
      await fetchInvoices();
      onDataChange?.();
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
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
      {/* Search and Filters */}
      <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="بحث برقم الفاتورة أو امسح الباركود..."
              className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg focus:border-fox-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg focus:border-fox-500 outline-none"
            >
              <option value="all">جميع الفواتير</option>
              <option value="sale">فواتير البيع</option>
              <option value="purchase">فواتير الشراء</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-gray-400 text-sm">من:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">إلى:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-dark-900 border border-dark-700 text-white px-3 py-2 rounded-lg focus:border-fox-500 outline-none"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-sm text-fox-400 hover:text-fox-300"
            >
              مسح التاريخ
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>عدد النتائج: {filteredAndSortedInvoices.length} فاتورة</span>
        <span>الإجمالي: {filteredAndSortedInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0).toLocaleString()} ج.م</span>
      </div>

      {/* Invoices Table */}
      <div className="bg-dark-950 rounded-xl border border-dark-800 overflow-hidden">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>لا توجد فواتير</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-dark-900 text-gray-400">
                <tr>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('id')}>
                    <span className="flex items-center">رقم الفاتورة <SortIcon field="id" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('type')}>
                    <span className="flex items-center">النوع <SortIcon field="type" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('party')}>
                    <span className="flex items-center">العميل/المورد <SortIcon field="party" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('date')}>
                    <span className="flex items-center">التاريخ <SortIcon field="date" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('amount')}>
                    <span className="flex items-center">المبلغ <SortIcon field="amount" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('paymentMethod')}>
                    <span className="flex items-center">طريقة الدفع <SortIcon field="paymentMethod" /></span>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-fox-400 select-none" onClick={() => handleSort('itemsCount')}>
                    <span className="flex items-center">الأصناف <SortIcon field="itemsCount" /></span>
                  </th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredAndSortedInvoices.map(invoice => {
                  const isSale = invoice.type === TransactionType.SALE;
                  const partyName = isSale ? invoice.customerName : invoice.supplierName;

                  return (
                    <tr key={invoice.id} className="hover:bg-dark-900/50 text-gray-300">
                      <td className="p-3 font-mono text-fox-400">{invoice.id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${isSale
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-blue-900/30 text-blue-400'
                          }`}>
                          {isSale ? 'بيع' : 'شراء'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-white">{partyName || 'عميل نقدي'}</td>
                      <td className="p-3 text-gray-400">{new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                      <td className="p-3 font-bold font-mono">{invoice.amount.toLocaleString()} ج.م</td>
                      <td className="p-3 text-gray-400">{invoice.paymentMethod}</td>
                      <td className="p-3 text-center text-gray-400">{invoice.items?.length || 0}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewingInvoice(invoice)}
                            className="flex items-center gap-1 px-2 py-1 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs"
                            title="عرض"
                          >
                            <Eye size={14} />
                            عرض
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(invoice)}
                            className="flex items-center gap-1 px-2 py-1 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs"
                            title="طباعة"
                          >
                            <Printer size={14} />
                            طباعة
                          </button>
                          {isSale && (
                            <button
                              onClick={() => setReturningInvoice(invoice)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded text-xs"
                              title="مرتجع"
                            >
                              <RotateCcw size={14} />
                              مرتجع
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Invoice Modal */}
      <Modal isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title="تفاصيل الفاتورة">
        {viewingInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">رقم الفاتورة</p>
                <p className="text-fox-400 font-mono">{viewingInvoice.id}</p>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">التاريخ</p>
                <p className="text-white">{new Date(viewingInvoice.date).toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">النوع</p>
                <p className="text-white">{viewingInvoice.type === TransactionType.SALE ? 'فاتورة بيع' : 'فاتورة شراء'}</p>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">{viewingInvoice.type === TransactionType.SALE ? 'العميل' : 'المورد'}</p>
                <p className="text-white">{viewingInvoice.customerName || viewingInvoice.supplierName || 'عميل نقدي'}</p>
              </div>
            </div>

            <div className="bg-dark-900 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-dark-800">
                  <tr>
                    <th className="p-3 text-right text-gray-400">الصنف</th>
                    <th className="p-3 text-center text-gray-400">الكمية</th>
                    <th className="p-3 text-left text-gray-400">السعر</th>
                    <th className="p-3 text-left text-gray-400">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingInvoice.items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="border-t border-dark-700">
                      <td className="p-3 text-white">{item.name || item.productName || '-'}</td>
                      <td className="p-3 text-center text-gray-300">{item.cartQuantity || item.quantity || 0}</td>
                      <td className="p-3 text-left text-gray-300">{Number(item.sellPrice || item.buyPrice || item.price || 0).toLocaleString()}</td>
                      <td className="p-3 text-left text-fox-400 font-bold">
                        {((item.cartQuantity || item.quantity || 0) * Number(item.sellPrice || item.buyPrice || item.price || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-dark-700">
              <span className="text-gray-400">الإجمالي الكلي</span>
              <span className="text-fox-400 font-bold text-xl">{viewingInvoice.amount.toLocaleString()} ج.م</span>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handlePrintInvoice(viewingInvoice)}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 flex justify-center items-center gap-2"
              >
                <Printer size={16} />
                طباعة
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="flex-1 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={!!returningInvoice} onClose={() => setReturningInvoice(null)} title="مرتجع فاتورة">
        {returningInvoice && (
          <div className="space-y-4">
            <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
              <p className="text-gray-400 text-sm">رقم الفاتورة</p>
              <p className="text-fox-400 font-mono text-lg">{returningInvoice.id}</p>
              <p className="text-gray-400 text-sm mt-2">المبلغ</p>
              <p className="text-white font-bold">{returningInvoice.amount.toLocaleString()} ج.م</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">سبب المرتجع</label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg focus:border-fox-500 outline-none resize-none"
                rows={3}
                placeholder="اكتب سبب المرتجع (اختياري)..."
              />
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ سيتم إرجاع الكميات للمخزون وتسجيل معاملة مرتجع في الخزينة
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setReturningInvoice(null)}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleReturn}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 font-bold flex justify-center items-center gap-2"
              >
                <RotateCcw size={16} />
                تأكيد المرتجع
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;

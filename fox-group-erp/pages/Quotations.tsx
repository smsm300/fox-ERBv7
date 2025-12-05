
import React, { useState, useEffect } from 'react';
import { Plus, Search, Printer, Check, Trash2, Minus, Eye, Edit, Percent } from 'lucide-react';
import { Customer, Product, CartItem, Quotation, AppSettings } from '../types';
import { Modal } from '../components/Modal';

interface QuotationsProps {
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  onCreateQuotation: (customerId: number, items: CartItem[]) => void;
  onConvertToInvoice: (quotationId: string) => void;
  settings: AppSettings;
}

const Quotations: React.FC<QuotationsProps> = ({ quotations, customers, products, onCreateQuotation, onConvertToInvoice, settings }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Mode State
  const [selectedCustomer, setSelectedCustomer] = useState<number>(customers[0]?.id || 0);
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  
  // تحديث العميل المحدد عند تحميل قائمة العملاء
  useEffect(() => {
    if (customers.length > 0 && selectedCustomer === 0) {
      setSelectedCustomer(customers[0].id);
    }
  }, [customers, selectedCustomer]);
  
  // View/Edit Mode State
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  
  // Discount State
  const [discountModal, setDiscountModal] = useState<{isOpen: boolean; itemId?: number; type: 'item' | 'total'}>({isOpen: false, type: 'total'});
  const [discountValue, setDiscountValue] = useState('');
  const [discountMode, setDiscountMode] = useState<'amount' | 'percent'>('amount');
  const [totalDiscount, setTotalDiscount] = useState(0);
  
  // Terms State - شروط عرض السعر
  const [quotationTerms, setQuotationTerms] = useState('');

  const filteredQuotations = quotations.filter(q => {
    const customerName = String(q.customerName || '');
    const quotationId = String(q.id || '');
    const quotationNumber = String(q.quotation_number || '');
    const search = searchTerm || '';
    
    const nameMatch = customerName.toLowerCase().includes(search.toLowerCase());
    const idMatch = quotationId.toLowerCase().includes(search.toLowerCase());
    const numberMatch = quotationNumber.toLowerCase().includes(search.toLowerCase());
    
    return nameMatch || idMatch || numberMatch;
  });

  const filteredProducts = products.filter(p => {
    const productName = String(p.name || '');
    const search = productSearch || '';
    return productName.toLowerCase().includes(search.toLowerCase());
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      return [...prev, { ...product, cartQuantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const setQuantity = (productId: number, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, cartQuantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Apply discount to item
  const applyItemDiscount = (itemId: number, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, discount: Math.min(discount, item.sellPrice) };
      }
      return item;
    }));
  };

  // Open discount modal for item
  const openItemDiscountModal = (itemId: number) => {
    const item = cart.find(i => i.id === itemId);
    setDiscountValue((item?.discount || 0).toString());
    setDiscountMode('amount');
    setDiscountModal({ isOpen: true, itemId, type: 'item' });
  };

  // Open discount modal for total
  const openTotalDiscountModal = () => {
    setDiscountValue(totalDiscount.toString());
    setDiscountMode('amount');
    setDiscountModal({ isOpen: true, type: 'total' });
  };

  // Get item total for percentage calculation
  const getItemTotal = (itemId: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return 0;
    return Number(item.sellPrice) * item.cartQuantity;
  };

  // Get cart subtotal for percentage calculation
  const getCartSubtotal = () => {
    return cart.reduce((a, b) => a + (Number(b.sellPrice) * b.cartQuantity) - (b.discount || 0), 0);
  };

  // Apply discount from modal
  const handleApplyDiscount = () => {
    const value = Number(discountValue) || 0;
    if (discountModal.type === 'item' && discountModal.itemId) {
      let discountAmount = value;
      if (discountMode === 'percent') {
        const itemTotal = getItemTotal(discountModal.itemId);
        discountAmount = (itemTotal * value) / 100;
      }
      applyItemDiscount(discountModal.itemId, discountAmount);
    } else {
      let discountAmount = value;
      if (discountMode === 'percent') {
        const subtotal = getCartSubtotal();
        discountAmount = (subtotal * value) / 100;
      }
      setTotalDiscount(discountAmount);
    }
    setDiscountModal({ isOpen: false, type: 'total' });
    setDiscountValue('');
  };

  // View quotation
  const handleViewQuote = (quote: Quotation) => {
    setViewingQuote(quote);
  };

  // Edit quotation - load into cart
  const handleEditQuote = (quote: Quotation) => {
    setCart(quote.items);
    setSelectedCustomer(quote.customerId);
    setEditingQuote(quote);
    setView('create');
  };

  // Print existing quotation - طباعة A4
  const handlePrintExistingQuote = (quote: Quotation) => {
    const total = quote.totalAmount;
    const subtotal = quote.items.reduce((a, b) => a + (Number(b.sellPrice) * Number(b.cartQuantity)), 0);
    const itemsDiscount = quote.items.reduce((a, b) => a + (b.discount || 0), 0);
    const totalDiscountAmount = subtotal - itemsDiscount - total;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عرض سعر</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; font-size: 14px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
          .company-info { display: flex; align-items: center; gap: 15px; }
          .company-info img { height: 70px; width: auto; object-fit: contain; }
          .company-info .details h1 { color: #f97316; font-size: 24px; margin-bottom: 5px; }
          .company-info .details p { color: #666; font-size: 12px; margin-top: 3px; }
          .quote-info { text-align: left; background: #f9f9f9; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e5e5; }
          .quote-info h2 { font-size: 20px; color: #f97316; margin-bottom: 8px; }
          .quote-info p { font-size: 12px; color: #666; margin-top: 4px; }
          .customer-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e5e5; }
          .customer-box label { font-size: 12px; color: #666; font-weight: bold; }
          .customer-box .name { font-size: 18px; font-weight: bold; margin-top: 5px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #fff7ed; color: #c2410c; padding: 12px 10px; border: 1px solid #fed7aa; text-align: right; font-weight: bold; }
          td { padding: 10px; border: 1px solid #e5e5e5; }
          tbody tr:nth-child(even) { background: #fafafa; }
          .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
          .total-box { width: 280px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
          .total-row:last-child { border-bottom: none; }
          .total-row.discount { color: #9333ea; }
          .total-row.final { font-size: 18px; font-weight: bold; color: #333; border-top: 2px solid #f97316; padding-top: 12px; margin-top: 8px; }
          .total-box .note { font-size: 10px; color: #666; margin-top: 10px; text-align: center; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
          .footer p { font-size: 11px; color: #666; margin-top: 5px; }
          .footer .terms { font-style: italic; margin-bottom: 10px; }
          @media print {
            body { padding: 0; }
            .header { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo">` : ''}
            <div class="details">
              <h1>${settings.companyName}</h1>
              <p>للديكور والإضاءة الحديثة</p>
              <p dir="ltr">${settings.companyPhone}</p>
              <p>${settings.companyAddress}</p>
            </div>
          </div>
          <div class="quote-info">
            <h2>عرض سعر</h2>
            <p><strong>التاريخ:</strong> ${new Date(quote.date).toLocaleDateString('ar-EG')}</p>
            <p><strong>رقم العرض:</strong> ${quote.quotation_number || quote.id}</p>
          </div>
        </div>
        
        <div class="customer-box">
          <label>موجه إلى السيد / السادة:</label>
          <div class="name">${quote.customerName}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">م</th>
              <th>الصنف / البيان</th>
              <th style="width: 80px; text-align: center;">الكمية</th>
              <th style="width: 100px;">سعر الوحدة</th>
              ${itemsDiscount > 0 ? '<th style="width: 80px;">الخصم</th>' : ''}
              <th style="width: 120px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map((item, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.cartQuantity}</td>
                <td>${Number(item.sellPrice).toLocaleString()}</td>
                ${itemsDiscount > 0 ? `<td style="color: #9333ea;">${item.discount ? item.discount.toLocaleString() : '-'}</td>` : ''}
                <td style="font-weight: bold;">${((Number(item.sellPrice) * Number(item.cartQuantity)) - (item.discount || 0)).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-box">
            <div class="total-row"><span>المجموع:</span><span>${subtotal.toLocaleString()} ج.م</span></div>
            ${itemsDiscount > 0 ? `<div class="total-row discount"><span>خصم الأصناف:</span><span>- ${itemsDiscount.toLocaleString()} ج.م</span></div>` : ''}
            ${totalDiscountAmount > 0 ? `<div class="total-row discount"><span>خصم إضافي:</span><span>- ${totalDiscountAmount.toLocaleString()} ج.م</span></div>` : ''}
            <div class="total-row final"><span>الإجمالي:</span><span>${total.toLocaleString()} ج.م</span></div>
            <div class="note">* الأسعار سارية لمدة 3 أيام من تاريخ العرض</div>
          </div>
        </div>
        
        <div class="footer">
          <p class="terms">${settings.invoiceTerms || ''}</p>
          <p>${settings.companyName} - ${settings.companyAddress} - ت: ${settings.companyPhone}</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Get customer name for display
  const getCustomerName = () => {
    if (useCustomName) return customCustomerName || 'عميل';
    return customers.find(c => c.id === selectedCustomer)?.name || 'عميل';
  };

  // Print quotation - طباعة A4
  const handlePrint = () => {
    const customerName = getCustomerName();
    const customerPhone = !useCustomName ? customers.find(c => c.id === selectedCustomer)?.phone || '' : '';
    const subtotal = cart.reduce((a, b) => a + (Number(b.sellPrice) * Number(b.cartQuantity)), 0);
    const itemsDiscount = cart.reduce((a, b) => a + (b.discount || 0), 0);
    const finalTotal = subtotal - itemsDiscount - totalDiscount;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عرض سعر</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; font-size: 14px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
          .company-info { display: flex; align-items: center; gap: 15px; }
          .company-info img { height: 70px; width: auto; object-fit: contain; }
          .company-info .details h1 { color: #f97316; font-size: 24px; margin-bottom: 5px; }
          .company-info .details p { color: #666; font-size: 12px; margin-top: 3px; }
          .quote-info { text-align: left; background: #f9f9f9; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e5e5; }
          .quote-info h2 { font-size: 20px; color: #f97316; margin-bottom: 8px; }
          .quote-info p { font-size: 12px; color: #666; margin-top: 4px; }
          .customer-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e5e5; }
          .customer-box label { font-size: 12px; color: #666; font-weight: bold; }
          .customer-box .name { font-size: 18px; font-weight: bold; margin-top: 5px; color: #333; }
          .customer-box .phone { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #fff7ed; color: #c2410c; padding: 12px 10px; border: 1px solid #fed7aa; text-align: right; font-weight: bold; }
          td { padding: 10px; border: 1px solid #e5e5e5; }
          tbody tr:nth-child(even) { background: #fafafa; }
          .terms-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .terms-box h3 { font-size: 14px; color: #92400e; margin-bottom: 10px; font-weight: bold; }
          .terms-box p { font-size: 12px; color: #78350f; line-height: 1.6; white-space: pre-wrap; }
          .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
          .total-box { width: 280px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
          .total-row:last-child { border-bottom: none; }
          .total-row.discount { color: #9333ea; }
          .total-row.final { font-size: 18px; font-weight: bold; color: #333; border-top: 2px solid #f97316; padding-top: 12px; margin-top: 8px; }
          .total-box .note { font-size: 10px; color: #666; margin-top: 10px; text-align: center; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
          .footer p { font-size: 11px; color: #666; margin-top: 5px; }
          .footer .terms { font-style: italic; margin-bottom: 10px; }
          @media print {
            body { padding: 0; }
            .header { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo">` : ''}
            <div class="details">
              <h1>${settings.companyName}</h1>
              <p>للديكور والإضاءة الحديثة</p>
              <p dir="ltr">${settings.companyPhone}</p>
              <p>${settings.companyAddress}</p>
            </div>
          </div>
          <div class="quote-info">
            <h2>عرض سعر</h2>
            <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>رقم العرض:</strong> QT-${Date.now().toString().slice(-6)}</p>
          </div>
        </div>
        
        <div class="customer-box">
          <label>موجه إلى السيد / السادة:</label>
          <div class="name">${customerName}</div>
          ${customerPhone ? `<div class="phone">ت: ${customerPhone}</div>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">م</th>
              <th>الصنف / البيان</th>
              <th style="width: 80px; text-align: center;">الكمية</th>
              <th style="width: 100px;">سعر الوحدة</th>
              ${itemsDiscount > 0 ? '<th style="width: 80px;">الخصم</th>' : ''}
              <th style="width: 120px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map((item, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.cartQuantity}</td>
                <td>${Number(item.sellPrice).toLocaleString()}</td>
                ${itemsDiscount > 0 ? `<td style="color: #9333ea;">${item.discount ? item.discount.toLocaleString() : '-'}</td>` : ''}
                <td style="font-weight: bold;">${((Number(item.sellPrice) * Number(item.cartQuantity)) - (item.discount || 0)).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${quotationTerms ? `
        <div class="terms-box">
          <h3>📋 الشروط والأحكام:</h3>
          <p>${quotationTerms}</p>
        </div>
        ` : ''}
        
        <div class="total-section">
          <div class="total-box">
            <div class="total-row"><span>المجموع:</span><span>${subtotal.toLocaleString()} ج.م</span></div>
            ${itemsDiscount > 0 ? `<div class="total-row discount"><span>خصم الأصناف:</span><span>- ${itemsDiscount.toLocaleString()} ج.م</span></div>` : ''}
            ${totalDiscount > 0 ? `<div class="total-row discount"><span>خصم إضافي:</span><span>- ${totalDiscount.toLocaleString()} ج.م</span></div>` : ''}
            <div class="total-row final"><span>الإجمالي:</span><span>${finalTotal.toLocaleString()} ج.م</span></div>
            <div class="note">* الأسعار سارية لمدة 3 أيام من تاريخ العرض</div>
          </div>
        </div>
        
        <div class="footer">
          <p class="terms">${settings.invoiceTerms || ''}</p>
          <p>${settings.companyName} - ${settings.companyAddress} - ت: ${settings.companyPhone}</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة العرض');
    }
  };

  const handleSaveQuotation = () => {
    if (cart.length === 0) return;
    onCreateQuotation(selectedCustomer, cart);
    setView('list');
    setCart([]);
  };

  const handleConvert = (id: string) => {
     if(window.confirm('هل أنت متأكد من تحويل عرض السعر إلى فاتورة بيع؟ سيتم خصم الكميات من المخزون.')) {
        onConvertToInvoice(id);
     }
  };

  if (view === 'create') {
    return (
      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Products */}
        <div className="w-1/3 bg-dark-950 rounded-xl border border-dark-800 flex flex-col no-print">
          <div className="p-4 border-b border-dark-800">
            <input 
              type="text" 
              placeholder="بحث عن منتج..."
              className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded-lg"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToCart(product)} className="bg-dark-900 p-3 rounded-lg border border-dark-800 hover:border-fox-500 cursor-pointer flex justify-between">
                <span className="text-gray-200 text-sm">{product.name}</span>
                <span className="text-fox-400 text-sm">{product.sellPrice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quotation Preview */}
        <div className="flex-1 bg-white text-black rounded-xl shadow-xl overflow-hidden flex flex-col print:rounded-none print:shadow-none print:absolute print:inset-0 print:h-auto print:z-50">
          <div className="p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
             {/* Print Header */}
             <div className="flex justify-between items-center border-b-2 border-orange-500 pb-4 mb-6">
               <div className="flex items-center gap-4">
                  {settings.logoUrl && (
                     <img src={settings.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-orange-600">{settings.companyName}</h1>
                    <p className="text-sm text-gray-500">للديكور والإضاءة الحديثة</p>
                    <p className="text-xs text-gray-400 mt-1" dir="ltr">{settings.companyPhone}</p>
                    <p className="text-xs text-gray-400">{settings.companyAddress}</p>
                  </div>
               </div>
               <div className="text-left bg-gray-50 p-3 rounded border border-gray-200">
                 <h2 className="text-xl font-bold text-gray-800">عرض سعر</h2>
                 <p className="text-sm text-gray-500 mt-1">التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                 <p className="text-sm text-gray-500">رقم العرض: QT-{Date.now().toString().slice(-6)}</p>
               </div>
             </div>

             {/* Customer Info */}
             <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200 print:border-gray-300">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-xs text-gray-500 font-bold">موجه إلى السيد / السادة:</label>
                   <label className="flex items-center gap-2 text-xs text-gray-500 no-print">
                     <input
                       type="checkbox"
                       checked={useCustomName}
                       onChange={(e) => setUseCustomName(e.target.checked)}
                       className="rounded"
                     />
                     كتابة اسم يدوي
                   </label>
                </div>
                {useCustomName ? (
                  <input
                    type="text"
                    value={customCustomerName}
                    onChange={(e) => setCustomCustomerName(e.target.value)}
                    placeholder="اكتب اسم العميل..."
                    className="w-full bg-transparent border-b border-gray-300 font-bold text-lg focus:outline-none focus:border-orange-500 print:border-none"
                  />
                ) : (
                  <select 
                    className="w-full bg-transparent border-b border-gray-300 font-bold text-lg focus:outline-none print:border-none print:appearance-none"
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(Number(e.target.value))}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <div className="mt-2 text-xs text-gray-500">
                   {!useCustomName && customers.find(c => c.id === selectedCustomer)?.phone}
                </div>
             </div>

             {/* Items Table */}
             <table className="w-full text-right mb-6 border-collapse">
                <thead className="bg-orange-50 text-orange-800 border-t border-b border-orange-200">
                  <tr>
                    <th className="p-3 border-l border-orange-100">م</th>
                    <th className="p-3 border-l border-orange-100">الصنف / البيان</th>
                    <th className="p-3 border-l border-orange-100 text-center">الكمية</th>
                    <th className="p-3 border-l border-orange-100">سعر الوحدة</th>
                    <th className="p-3 border-l border-orange-100 no-print">خصم</th>
                    <th className="p-3 border-l border-orange-100">الإجمالي</th>
                    <th className="p-3 no-print">حذف</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {cart.map((item, idx) => {
                    const itemTotal = (Number(item.sellPrice) * Number(item.cartQuantity)) - (item.discount || 0);
                    return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 border-l border-gray-200">{idx + 1}</td>
                      <td className="p-3 border-l border-gray-200 font-medium">{item.name}</td>
                      <td className="p-3 border-l border-gray-200">
                        <div className="flex items-center justify-center gap-2 no-print">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.cartQuantity}
                            onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                            className="w-14 text-center border border-gray-300 rounded py-1 text-black"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="hidden print:inline">{item.cartQuantity}</span>
                      </td>
                      <td className="p-3 border-l border-gray-200">{Number(item.sellPrice).toLocaleString()}</td>
                      <td className="p-3 border-l border-gray-200 no-print">
                        <button
                          type="button"
                          onClick={() => openItemDiscountModal(item.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                        >
                          <Percent size={12} />
                          {item.discount ? item.discount.toLocaleString() : '0'}
                        </button>
                      </td>
                      <td className="p-3 border-l border-gray-200 font-bold">{itemTotal.toLocaleString()}</td>
                      <td className="p-3 no-print">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
             </table>

             {/* Terms Section - الشروط والأحكام */}
             <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                <label className="block text-xs text-gray-500 font-bold mb-2">الشروط والأحكام (اختياري):</label>
                <textarea
                  value={quotationTerms}
                  onChange={(e) => setQuotationTerms(e.target.value)}
                  placeholder="أدخل الشروط والأحكام الخاصة بهذا العرض..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-500 resize-none no-print"
                  rows={3}
                />
                {quotationTerms && (
                  <div className="hidden print:block mt-2 text-sm text-gray-600 whitespace-pre-wrap">{quotationTerms}</div>
                )}
             </div>

             {/* Totals Section */}
             <div className="flex justify-end mt-8">
               <div className="w-80 bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
                 {/* Subtotal */}
                 <div className="flex justify-between text-gray-600">
                    <span>المجموع:</span>
                    <span>{cart.reduce((a, b) => a + (Number(b.sellPrice) * Number(b.cartQuantity)), 0).toLocaleString()} ج.م</span>
                 </div>
                 {/* Items Discount */}
                 {cart.some(i => i.discount && i.discount > 0) && (
                   <div className="flex justify-between text-purple-600">
                      <span>خصم الأصناف:</span>
                      <span>- {cart.reduce((a, b) => a + (b.discount || 0), 0).toLocaleString()} ج.م</span>
                   </div>
                 )}
                 {/* Total Discount */}
                 <div className="flex justify-between items-center text-purple-600">
                    <span>خصم إضافي:</span>
                    <button
                      type="button"
                      onClick={openTotalDiscountModal}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded hover:bg-purple-200 text-sm no-print"
                    >
                      <Percent size={14} />
                      {totalDiscount > 0 ? `- ${totalDiscount.toLocaleString()}` : 'إضافة خصم'}
                    </button>
                    <span className="hidden print:inline">- {totalDiscount.toLocaleString()} ج.م</span>
                 </div>
                 {/* Final Total */}
                 <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-xl text-gray-800">
                    <span>الإجمالي:</span>
                    <span>{(cart.reduce((a, b) => a + ((Number(b.sellPrice) * Number(b.cartQuantity)) - (b.discount || 0)), 0) - totalDiscount).toLocaleString()} ج.م</span>
                 </div>
                 <p className="text-xs text-center text-gray-500">* الأسعار سارية لمدة 3 أيام من تاريخ العرض</p>
               </div>
             </div>
             
             {/* Print Footer */}
             <div className="hidden print:block fixed bottom-0 left-0 w-full text-center border-t border-gray-300 pt-4 pb-4 bg-white">
                <p className="text-xs text-gray-600 mb-1">{settings.invoiceTerms}</p>
                <p className="text-[10px] text-gray-400">
                   {settings.companyName} - {settings.companyAddress} - ت: {settings.companyPhone}
                </p>
             </div>
          </div>

          <div className="bg-gray-100 p-4 border-t flex justify-between no-print">
            <button onClick={() => setView('list')} className="text-red-500 px-4 py-2 font-bold hover:bg-red-100 rounded">إلغاء</button>
            <div className="flex gap-2">
               <button onClick={handlePrint} className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-700 flex items-center gap-2">
                 <Printer size={16} />
                 طباعة
               </button>
               <button onClick={handleSaveQuotation} className="bg-fox-600 text-white px-8 py-2 rounded font-bold hover:bg-fox-500 flex items-center gap-2">
                 <Check size={16} />
                 حفظ العرض
               </button>
            </div>
          </div>
        </div>

        {/* Discount Modal - Create View */}
        <Modal isOpen={discountModal.isOpen} onClose={() => setDiscountModal({ isOpen: false, type: 'total' })} title={discountModal.type === 'item' ? 'خصم على الصنف' : 'خصم إضافي على العرض'}>
          <div className="space-y-4">
            {/* Discount Type Toggle */}
            <div className="flex gap-2 p-1 bg-dark-900 rounded-lg">
              <button
                type="button"
                onClick={() => setDiscountMode('amount')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                  discountMode === 'amount' 
                    ? 'bg-fox-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                مبلغ (ج.م)
              </button>
              <button
                type="button"
                onClick={() => setDiscountMode('percent')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                  discountMode === 'percent' 
                    ? 'bg-fox-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                نسبة (%)
              </button>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {discountMode === 'amount' ? 'قيمة الخصم (ج.م)' : 'نسبة الخصم (%)'}
              </label>
              <input
                type="number"
                min="0"
                max={discountMode === 'percent' ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-3 rounded-lg text-lg"
                placeholder="0"
                autoFocus
              />
              {discountMode === 'percent' && discountValue && (
                <p className="text-xs text-gray-500 mt-2">
                  = {((discountModal.type === 'item' && discountModal.itemId 
                    ? getItemTotal(discountModal.itemId) 
                    : getCartSubtotal()) * (Number(discountValue) || 0) / 100).toLocaleString()} ج.م
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDiscountModal({ isOpen: false, type: 'total' })}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold"
              >
                تطبيق الخصم
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800">
        <div className="relative w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="بحث في عروض الأسعار..." 
            className="w-full bg-dark-900 border border-dark-700 text-white pr-10 pl-4 py-2 rounded-lg"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-6 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold"
        >
          <Plus size={18} />
          <span>عرض سعر جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuotations.map(quote => (
          <div key={quote.id} className="bg-dark-950 border border-dark-800 rounded-xl p-5 hover:border-fox-500/30 transition-all">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-bold text-gray-200">{quote.customerName}</h3>
                 <span className="text-xs text-gray-500 font-mono">{quote.date.split('T')[0]}</span>
               </div>
               <span className={`px-2 py-1 rounded text-xs border ${
                 quote.status === 'converted' 
                 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                 : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
               }`}>
                 {quote.status === 'converted' ? 'تم البيع' : 'معلق'}
               </span>
             </div>
             <div className="bg-dark-900 p-3 rounded-lg mb-4">
               <div className="flex justify-between text-sm text-gray-400 mb-1">
                 <span>عدد الأصناف</span>
                 <span>{quote.items.length}</span>
               </div>
               <div className="flex justify-between font-bold text-white">
                 <span>القيمة</span>
                 <span className="text-fox-400">{quote.totalAmount.toLocaleString()} ج.م</span>
               </div>
             </div>
             <div className="flex gap-2 flex-wrap">
               <button 
                 onClick={() => handleViewQuote(quote)} 
                 className="flex-1 py-2 bg-dark-800 text-gray-300 rounded hover:bg-dark-700 flex justify-center items-center gap-2"
               >
                 <Eye size={16} />
                 عرض
               </button>
               {quote.status === 'pending' && (
                 <button 
                   onClick={() => handleEditQuote(quote)} 
                   className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex justify-center items-center gap-2"
                 >
                   <Edit size={16} />
                   تعديل
                 </button>
               )}
               <button 
                 onClick={() => handlePrintExistingQuote(quote)} 
                 className="flex-1 py-2 bg-dark-800 text-gray-300 rounded hover:bg-dark-700 flex justify-center items-center gap-2"
               >
                 <Printer size={16} />
                 طباعة
               </button>
               {quote.status === 'pending' && (
                 <button 
                   onClick={() => handleConvert(quote.id)}
                   className="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 flex justify-center items-center gap-2 font-bold"
                 >
                   <Check size={16} />
                   تحويل لفاتورة
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>

      {/* View Quotation Modal */}
      <Modal isOpen={!!viewingQuote} onClose={() => setViewingQuote(null)} title="تفاصيل عرض السعر">
        {viewingQuote && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dark-700">
              <div>
                <p className="text-gray-400 text-sm">العميل</p>
                <p className="text-white font-bold text-lg">{viewingQuote.customerName}</p>
              </div>
              <div className="text-left">
                <p className="text-gray-400 text-sm">التاريخ</p>
                <p className="text-white">{new Date(viewingQuote.date).toLocaleDateString('ar-EG')}</p>
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
                  {viewingQuote.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-dark-700">
                      <td className="p-3 text-white">{item.name}</td>
                      <td className="p-3 text-center text-gray-300">{item.cartQuantity}</td>
                      <td className="p-3 text-left text-gray-300">{Number(item.sellPrice).toLocaleString()}</td>
                      <td className="p-3 text-left text-fox-400 font-bold">{(Number(item.sellPrice) * item.cartQuantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-dark-700">
              <span className="text-gray-400">الإجمالي الكلي</span>
              <span className="text-fox-400 font-bold text-xl">{viewingQuote.totalAmount.toLocaleString()} ج.م</span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handlePrintExistingQuote(viewingQuote)}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 flex justify-center items-center gap-2"
              >
                <Printer size={16} />
                طباعة
              </button>
              <button
                onClick={() => setViewingQuote(null)}
                className="flex-1 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Discount Modal */}
      <Modal isOpen={discountModal.isOpen} onClose={() => setDiscountModal({ isOpen: false, type: 'total' })} title={discountModal.type === 'item' ? 'خصم على الصنف' : 'خصم إضافي على العرض'}>
        <div className="space-y-4">
          {/* Discount Type Toggle */}
          <div className="flex gap-2 p-1 bg-dark-900 rounded-lg">
            <button
              type="button"
              onClick={() => setDiscountMode('amount')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                discountMode === 'amount' 
                  ? 'bg-fox-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              مبلغ (ج.م)
            </button>
            <button
              type="button"
              onClick={() => setDiscountMode('percent')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                discountMode === 'percent' 
                  ? 'bg-fox-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              نسبة (%)
            </button>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {discountMode === 'amount' ? 'قيمة الخصم (ج.م)' : 'نسبة الخصم (%)'}
            </label>
            <input
              type="number"
              min="0"
              max={discountMode === 'percent' ? 100 : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-3 rounded-lg text-lg"
              placeholder="0"
              autoFocus
            />
            {discountMode === 'percent' && discountValue && (
              <p className="text-xs text-gray-500 mt-2">
                = {((discountModal.type === 'item' && discountModal.itemId 
                  ? getItemTotal(discountModal.itemId) 
                  : getCartSubtotal()) * (Number(discountValue) || 0) / 100).toLocaleString()} ج.م
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDiscountModal({ isOpen: false, type: 'total' })}
              className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
            >
              إلغاء
            </button>
            <button
              onClick={handleApplyDiscount}
              className="flex-1 py-2 bg-fox-600 text-white rounded-lg hover:bg-fox-500 font-bold"
            >
              تطبيق الخصم
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Quotations;

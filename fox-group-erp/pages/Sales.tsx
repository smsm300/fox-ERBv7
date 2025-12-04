import React, { useState, useRef, useEffect } from 'react';
import { Product, Customer, CartItem, PaymentMethod, AppSettings, Transaction, User as AppUser, Shift } from '../types';
import { ShiftManager } from '../components/sales/ShiftManager';
import { ProductSelector } from '../components/sales/ProductSelector';
import { Cart } from '../components/sales/Cart';
import { shiftsAPI, settingsAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';

interface SalesProps {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  onCompleteSale: (items: CartItem[], customerId: number, paymentMethod: PaymentMethod, paidAmount: number, invoiceId: string, isDirectSale: boolean, dueDate?: string) => void;
  onReturnTransaction?: (transaction: Transaction) => void;
  settings: AppSettings;
  currentUser: AppUser;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Customer;
}

const Sales: React.FC<SalesProps> = ({ 
  products, 
  customers, 
  transactions, 
  onCompleteSale, 
  settings: initialSettings, 
  currentUser
}) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  // Fetch current user's open shift
  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      const response = await shiftsAPI.list();
      const shifts = response.data.results || response.data;
      // Find the current user's open shift
      const openShift = Array.isArray(shifts) 
        ? shifts.find((s: Shift) => s.status === 'open' && s.userId === currentUser.id)
        : null;
      setCurrentShift(openShift || null);
    } catch (err: any) {
      console.error('Error fetching shift:', err);
    }
  };

  const handleOpenShift = async (startCash: number) => {
    setLoading(true);
    try {
      const response = await shiftsAPI.open(startCash);
      setCurrentShift(response.data);
      alert('تم فتح الوردية بنجاح');
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (endCash: number) => {
    if (!currentShift) return;
    
    setLoading(true);
    try {
      const response = await shiftsAPI.close(currentShift.id, endCash);
      const closedShift = response.data;
      
      // Display Z-Report
      alert(`تم إغلاق الوردية\n\nالنقدية المتوقعة: ${closedShift.expectedCash}\nالنقدية الفعلية: ${closedShift.endCash}\nالفرق: ${closedShift.endCash! - closedShift.expectedCash!}`);
      
      setCurrentShift(null);
      return closedShift;
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };
  // POS State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isDirectSale, setIsDirectSale] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Discount Modal State
  const [discountModalItem, setDiscountModalItem] = useState<{id: number, price: number, currentDiscount: number} | null>(null);

  // Check if current user has an open shift
  // Admins can work without a shift, but cashiers must have one
  const requiresShift = currentUser.role !== 'admin';
  
  if (!currentShift && requiresShift) {
    return <ShiftManager onOpenShift={handleOpenShift} currentUser={currentUser} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        cartQuantity: 1,
        discount: 0
      }]);
    }
    
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  // Update cart item quantity
  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        return newQty > 0 ? { ...item, cartQuantity: newQty } : item;
      }
      return item;
    }).filter(item => item.cartQuantity > 0));
  };

  // Remove item from cart
  const handleRemoveItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Open discount modal
  const handleOpenDiscountModal = (item: CartItem) => {
    setDiscountModalItem({
      id: item.id,
      price: item.sellPrice,
      currentDiscount: item.discount || 0
    });
  };

  // Complete sale
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => 
      sum + ((item.sellPrice - (item.discount || 0)) * item.cartQuantity), 0
    );

    const invoiceId = `INV-${Date.now()}`;
    
    onCompleteSale(
      cart,
      selectedCustomer,
      paymentMethod,
      total,
      invoiceId,
      isDirectSale,
      paymentMethod === PaymentMethod.DEFERRED ? dueDate : undefined
    );

    // Clear cart
    setCart([]);
    setSearchTerm('');
    setIsDirectSale(false);
    setDueDate('');
    searchInputRef.current?.focus();
  };

  // Hold cart
  const handleHoldCart = () => {
    // Implementation for holding cart
    console.log('Hold cart');
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setSearchTerm('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 bg-dark-950 rounded-xl border border-dark-800 p-4 overflow-hidden">
        <ProductSelector
          products={products}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onAddToCart={handleAddToCart}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Right: Cart */}
      <div className="lg:col-span-1">
        <Cart
          cart={cart}
          selectedCustomer={selectedCustomer}
          customers={customers}
          paymentMethod={paymentMethod}
          isDirectSale={isDirectSale}
          dueDate={dueDate}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenDiscountModal={handleOpenDiscountModal}
          onCustomerChange={setSelectedCustomer}
          onPaymentMethodChange={setPaymentMethod}
          onDirectSaleChange={setIsDirectSale}
          onDueDateChange={setDueDate}
          onCompleteSale={handleCompleteSale}
          onHoldCart={handleHoldCart}
          onClearCart={handleClearCart}
        />
      </div>
    </div>
  );
};

export default Sales;

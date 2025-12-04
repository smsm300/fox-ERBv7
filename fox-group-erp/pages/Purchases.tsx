import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { Product, Supplier, CartItem, PaymentMethod, Transaction } from '../types';
import { ProductSelector } from '../components/purchases/ProductSelector';
import { PurchaseCart } from '../components/purchases/PurchaseCart';
import { productsAPI, suppliersAPI, transactionsAPI } from '../services/endpoints';
import { handleAPIError } from '../services/errorHandler';

const Purchases: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'create' | 'history'>('create');
  
  // Create View State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<number>(suppliers[0]?.id || 0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEFERRED);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsResponse, suppliersResponse] = await Promise.all([
        productsAPI.list(),
        suppliersAPI.list()
      ]);
      // Handle both paginated and non-paginated responses
      const productsData = productsResponse.data.results || productsResponse.data;
      const suppliersData = suppliersResponse.data.results || suppliersResponse.data;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (err: any) {
      alert(handleAPIError(err));
      // Set empty arrays on error to prevent crashes
      setProducts([]);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products for selection
  const filteredProducts = (products || []).filter(p => 
    p.name.includes(searchTerm) || p.sku.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev;
      return [...prev, { ...product, cartQuantity: 1, discount: 0 }];
    });
  };

  const updateCartItem = (id: number, field: keyof CartItem, value: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCompletePurchase = async () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.costPrice * item.cartQuantity), 0);
    
    setLoading(true);
    try {
      await transactionsAPI.createPurchase({
        supplier_id: selectedSupplier,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.cartQuantity,
          cost_price: item.costPrice
        })),
        total_amount: total
      });

      alert('تم حفظ فاتورة الشراء وتحديث المخزن ومتوسط التكلفة!');

      // Clear cart
      setCart([]);
      setSearchTerm('');
      setDueDate('');
      
      // Refresh data
      await fetchData();
    } catch (err: any) {
      alert(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setSearchTerm('');
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
      {/* Header */}
      <div className="flex justify-between items-center bg-dark-950 p-4 rounded-xl border border-dark-800">
        <h1 className="text-2xl font-bold text-white">المشتريات</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'create'
                ? 'bg-fox-500 text-white'
                : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
            }`}
          >
            إنشاء فاتورة
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              view === 'history'
                ? 'bg-fox-500 text-white'
                : 'bg-dark-900 text-gray-400 hover:bg-dark-800 border border-dark-700'
            }`}
          >
            <History size={18} />
            السجل
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left: Product Selection */}
          <div className="lg:col-span-2 bg-dark-950 rounded-xl border border-dark-800 p-4 overflow-hidden">
            <ProductSelector
              products={filteredProducts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddToCart={addToCart}
            />
          </div>

          {/* Right: Cart */}
          <div className="lg:col-span-1">
            <PurchaseCart
              cart={cart}
              selectedSupplier={selectedSupplier}
              suppliers={suppliers}
              paymentMethod={paymentMethod}
              dueDate={dueDate}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
              onSupplierChange={setSelectedSupplier}
              onPaymentMethodChange={setPaymentMethod}
              onDueDateChange={setDueDate}
              onCompletePurchase={handleCompletePurchase}
              onClearCart={handleClearCart}
            />
          </div>
        </div>
      ) : (
        <div className="bg-dark-950 rounded-xl border border-dark-800 p-6">
          <p className="text-gray-400 text-center py-12">سجل المشتريات قيد التطوير...</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;

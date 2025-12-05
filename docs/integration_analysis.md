# Fox ERP Integration Analysis

## Model Mapping: Django to TypeScript

### Product Model

**Django Model** (`apps/api/models.py`):
```python
class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    min_stock_alert = models.IntegerField(default=0)
    image = models.URLField(null=True, blank=True)
```

**TypeScript Interface** (`types.ts`):
```typescript
interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  unit: string;
  minStockAlert: number;
  image?: string;
  isLowStock?: boolean;
}
```

**Field Mapping**:
- `cost_price` (snake_case) → `costPrice` (camelCase)
- `sell_price` → `sellPrice`
- `min_stock_alert` → `minStockAlert`
- `is_low_stock` (computed) → `isLowStock`

---

### Customer Model

**Django Model**:
```python
class Customer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    type = models.CharField(max_length=20, choices=[
        ('consumer', 'Consumer'),
        ('wholesale', 'Wholesale'),
        ('retail', 'Retail')
    ])
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
```

**TypeScript Interface**:
```typescript
interface Customer {
  id: number;
  name: string;
  phone: string;
  type: 'consumer' | 'wholesale' | 'retail';
  balance: number;
  creditLimit: number;
}
```

**Field Mapping**:
- `credit_limit` → `creditLimit`

---

### Supplier Model

**Django Model**:
```python
class Supplier(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
```

**TypeScript Interface**:
```typescript
interface Supplier {
  id: number;
  name: string;
  phone: string;
  balance: number;
}
```

**Field Mapping**: Direct 1:1 mapping

---

### Transaction Model

**Django Model**:
```python
class Transaction(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    type = models.CharField(max_length=20, choices=[...])
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=[...])
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    related_customer = models.ForeignKey(Customer, ...)
    related_supplier = models.ForeignKey(Supplier, ...)
    items = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=[...])
    due_date = models.DateField(null=True, blank=True)
    is_direct_sale = models.BooleanField(default=False)
    shift = models.ForeignKey(Shift, ...)
```

**TypeScript Interface**:
```typescript
interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  category?: string;
  customer?: Customer;
  supplier?: Supplier;
  items?: CartItem[];
  status: TransactionStatus;
  dueDate?: string;
  isDirectSale?: boolean;
  shift?: number;
}
```

**Field Mapping**:
- `payment_method` → `paymentMethod`
- `related_customer` → `customer` (nested object)
- `related_supplier` → `supplier` (nested object)
- `due_date` → `dueDate`
- `is_direct_sale` → `isDirectSale`

---

### Shift Model

**Django Model**:
```python
class Shift(models.Model):
    user = models.ForeignKey(User, ...)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    start_cash = models.DecimalField(max_digits=10, decimal_places=2)
    end_cash = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    expected_cash = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sales_by_method = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=[...])
```

**TypeScript Interface**:
```typescript
interface Shift {
  id: number;
  user: User;
  startTime: string;
  endTime?: string;
  startCash: number;
  endCash?: number;
  expectedCash?: number;
  totalSales: number;
  salesByMethod: Record<PaymentMethod, number>;
  status: 'open' | 'closed';
}
```

**Field Mapping**:
- `start_time` → `startTime`
- `end_time` → `endTime`
- `start_cash` → `startCash`
- `end_cash` → `endCash`
- `expected_cash` → `expectedCash`
- `total_sales` → `totalSales`
- `sales_by_method` → `salesByMethod`

---

### Quotation Model

**Django Model**:
```python
class Quotation(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, ...)
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[...])
```

**TypeScript Interface**:
```typescript
interface Quotation {
  id: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'converted' | 'cancelled';
}
```

**Field Mapping**:
- `total_amount` → `totalAmount`

---

### User Model

**Django Model**:
```python
class User(AbstractUser):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('accountant', 'Accountant'),
        ('cashier', 'Cashier'),
        ('stock_keeper', 'Stock Keeper')
    ])
```

**TypeScript Interface**:
```typescript
interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'accountant' | 'cashier' | 'stock_keeper';
}
```

**Field Mapping**: Direct 1:1 mapping

---

### AppSettings Model

**Django Model**:
```python
class AppSettings(models.Model):
    company_name = models.CharField(max_length=200)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    currency = models.CharField(max_length=10)
    prevent_negative_stock = models.BooleanField(default=True)
    require_customer_for_sales = models.BooleanField(default=False)
    auto_generate_sku = models.BooleanField(default=True)
    invoice_prefix = models.CharField(max_length=10)
    quotation_prefix = models.CharField(max_length=10)
    logo_url = models.URLField(blank=True)
```

**TypeScript Interface**:
```typescript
interface AppSettings {
  companyName: string;
  taxRate: number;
  currency: string;
  preventNegativeStock: boolean;
  requireCustomerForSales: boolean;
  autoGenerateSku: boolean;
  invoicePrefix: string;
  quotationPrefix: string;
  logoUrl?: string;
}
```

**Field Mapping**:
- `company_name` → `companyName`
- `tax_rate` → `taxRate`
- `prevent_negative_stock` → `preventNegativeStock`
- `require_customer_for_sales` → `requireCustomerForSales`
- `auto_generate_sku` → `autoGenerateSku`
- `invoice_prefix` → `invoicePrefix`
- `quotation_prefix` → `quotationPrefix`
- `logo_url` → `logoUrl`

---

### ActivityLog Model

**Django Model**:
```python
class ActivityLog(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, ...)
    user_name = models.CharField(max_length=200)
    action = models.CharField(max_length=100)
    details = models.TextField()
```

**TypeScript Interface**:
```typescript
interface ActivityLogEntry {
  id: number;
  date: string;
  user: User;
  userName: string;
  action: string;
  details: string;
}
```

**Field Mapping**:
- `user_name` → `userName`

---

## Feature Map: Handlers to Endpoints

### Sales Feature

**Frontend Handler** (`pages/Sales.tsx`):
```typescript
const handleCompleteSale = async () => {
  const saleData = {
    customer_id: selectedCustomer.id,
    payment_method: paymentMethod,
    items: cart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount
    })),
    total_amount: calculateTotal(),
    is_direct_sale: isDirectSale
  };
  
  await transactionsAPI.createSale(saleData);
};
```

**Backend Endpoint** (`apps/api/views.py`):
```python
@action(detail=False, methods=['post'])
def create_sale(self, request):
    serializer = SaleRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    result = SaleService.complete_sale(
        user=request.user,
        customer_id=serializer.validated_data['customer_id'],
        items=serializer.validated_data['items'],
        payment_method=serializer.validated_data['payment_method'],
        is_direct_sale=serializer.validated_data.get('is_direct_sale', False)
    )
    
    return Response(result, status=status.HTTP_201_CREATED)
```

**Service Layer** (`apps/api/services/sale_service.py`):
```python
class SaleService:
    @staticmethod
    @transaction.atomic
    def complete_sale(user, customer_id, items, payment_method, is_direct_sale=False):
        # Validate shift
        shift = Shift.objects.filter(user=user, status='open').first()
        if not shift:
            raise ValidationError('NO_OPEN_SHIFT')
        
        # Validate stock
        if not is_direct_sale:
            for item in items:
                product = Product.objects.get(id=item['id'])
                if product.quantity < item['quantity']:
                    raise ValidationError('INSUFFICIENT_STOCK')
        
        # Create transaction
        transaction = Transaction.objects.create(...)
        
        # Update quantities
        if not is_direct_sale:
            for item in items:
                product = Product.objects.get(id=item['id'])
                product.quantity -= item['quantity']
                product.save()
        
        # Update customer balance
        if payment_method == 'deferred':
            customer = Customer.objects.get(id=customer_id)
            customer.balance += total_amount
            customer.save()
        
        # Log activity
        log_activity(user, 'create_sale', f'Sale {transaction.id}')
        
        return transaction
```

---

### Purchase Feature

**Frontend Handler** (`pages/Purchases.tsx`):
```typescript
const handleCompletePurchase = async () => {
  const purchaseData = {
    supplier_id: selectedSupplier.id,
    payment_method: paymentMethod,
    items: cart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      cost_price: item.costPrice
    })),
    total_amount: calculateTotal()
  };
  
  await transactionsAPI.createPurchase(purchaseData);
};
```

**Backend Service** (`apps/api/services/purchase_service.py`):
```python
class PurchaseService:
    @staticmethod
    @transaction.atomic
    def complete_purchase(user, supplier_id, items, payment_method):
        # Create transaction
        transaction = Transaction.objects.create(...)
        
        # Update quantities and calculate weighted average cost
        for item in items:
            product = Product.objects.get(id=item['id'])
            old_quantity = product.quantity
            old_cost = product.cost_price
            new_quantity = item['quantity']
            new_cost = item['cost_price']
            
            # Weighted average
            total_quantity = old_quantity + new_quantity
            product.cost_price = (
                (old_quantity * old_cost + new_quantity * new_cost) / total_quantity
            )
            product.quantity += new_quantity
            product.save()
        
        # Update supplier balance
        if payment_method == 'deferred':
            supplier = Supplier.objects.get(id=supplier_id)
            supplier.balance -= total_amount
            supplier.save()
        
        return transaction
```

---

### Shift Management Feature

**Frontend Handler** (`pages/Sales.tsx`):
```typescript
const handleOpenShift = async () => {
  const response = await shiftsAPI.open(startCash);
  setCurrentShift(response.data);
};

const handleCloseShift = async () => {
  const response = await shiftsAPI.close(currentShift.id, endCash);
  setZReport(response.data.z_report);
};
```

**Backend Endpoint** (`apps/api/views.py`):
```python
class ShiftViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'])
    def open(self, request):
        # Validate no other open shift
        existing = Shift.objects.filter(user=request.user, status='open').first()
        if existing:
            raise ValidationError('SHIFT_ALREADY_OPEN')
        
        shift = Shift.objects.create(
            user=request.user,
            start_cash=request.data['start_cash'],
            status='open'
        )
        return Response(ShiftSerializer(shift).data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        shift = self.get_object()
        
        # Calculate expected cash
        cash_sales = Transaction.objects.filter(
            shift=shift,
            type='sale',
            payment_method='cash'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        cash_expenses = Transaction.objects.filter(
            shift=shift,
            type='expense',
            payment_method='cash'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        expected_cash = shift.start_cash + cash_sales - cash_expenses
        
        shift.end_cash = request.data['end_cash']
        shift.expected_cash = expected_cash
        shift.end_time = timezone.now()
        shift.status = 'closed'
        shift.save()
        
        # Generate Z-Report
        z_report = {
            'shift_id': shift.id,
            'start_time': shift.start_time,
            'end_time': shift.end_time,
            'start_cash': shift.start_cash,
            'end_cash': shift.end_cash,
            'expected_cash': expected_cash,
            'difference': shift.end_cash - expected_cash,
            'sales_by_method': shift.sales_by_method,
            'total_sales': shift.total_sales
        }
        
        return Response({'shift': ShiftSerializer(shift).data, 'z_report': z_report})
```

---

## Data Flow Diagrams

### Sale Transaction Flow

```
Frontend (Sales.tsx)
    ↓ handleCompleteSale()
API Client (endpoints.ts)
    ↓ transactionsAPI.createSale()
Axios Interceptor (api.ts)
    ↓ Add JWT token
Backend (views.py)
    ↓ TransactionViewSet.create_sale()
Service Layer (sale_service.py)
    ↓ SaleService.complete_sale()
Database Transaction
    ├─ Create Transaction
    ├─ Update Product Quantities
    ├─ Update Customer Balance
    └─ Log Activity
    ↓
Response
    ↓
Frontend State Update
```

### Offline Sync Flow

```
User Action (Offline)
    ↓
API Call Intercepted
    ↓
Check Network Status
    ↓ (Offline)
Add to Queue (localStorage)
    ↓
Return Mock Response
    ↓
Update UI with "pending_sync"
    ↓
Network Reconnects
    ↓
Auto Sync Triggered
    ↓
Process Queue (Chronological)
    ↓
For Each Transaction:
        ├─ Send to Backend
        ├─ Success → Remove from Queue
        └─ Failure → Mark for Retry
    ↓
Update UI
```

---

## Serialization Strategy

### Django REST Framework Serializers

```python
class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_is_low_stock(self, obj):
        return obj.quantity <= obj.min_stock_alert
```

### TypeScript Type Guards

```typescript
function isProduct(obj: any): obj is Product {
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.quantity === 'number'
  );
}
```

---

## Error Handling Strategy

### Backend Error Codes

```python
ERROR_CODES = {
    'INVALID_CREDENTIALS': 'بيانات الدخول غير صحيحة',
    'INSUFFICIENT_STOCK': 'الكمية المتاحة غير كافية',
    'CREDIT_LIMIT_EXCEEDED': 'تجاوز حد الائتمان',
    'NO_OPEN_SHIFT': 'لا توجد وردية مفتوحة',
    'VALIDATION_ERROR': 'خطأ في البيانات المدخلة',
}
```

### Frontend Error Handler

```typescript
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.error) {
    const errorCode = error.response.data.error;
    return ERROR_MESSAGES[errorCode] || error.response.data.message;
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'خطأ في الاتصال بالخادم';
  }
  
  return 'حدث خطأ غير متوقع';
};
```

---

## Performance Considerations

1. **Database Indexing**: All foreign keys and frequently queried fields are indexed
2. **Query Optimization**: Use `select_related()` and `prefetch_related()` for nested objects
3. **Pagination**: Implemented for large lists (transactions, logs)
4. **Caching**: Frontend caches products, customers, suppliers for offline use
5. **Lazy Loading**: Components load data on mount, not on app start

---

## Security Measures

1. **JWT Authentication**: All API requests require valid JWT token
2. **Role-Based Access Control**: Endpoints check user role before execution
3. **Input Validation**: Django serializers validate all input data
4. **SQL Injection Prevention**: Django ORM prevents SQL injection
5. **XSS Prevention**: React escapes all user input by default
6. **CORS Configuration**: Only allowed origins can access API

---

## Testing Strategy

### Backend Tests
- Unit tests for services
- Integration tests for API endpoints
- Property-based tests for business logic

### Frontend Tests
- Component tests with React Testing Library
- Integration tests for user workflows
- E2E tests with Playwright (future)

---

## Deployment Architecture

```
┌─────────────────┐
│   Nginx         │ (Reverse Proxy)
│   Port 80/443   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼──────┐
│ Django │ │ React  │
│ Backend│ │Frontend│
│ :8000  │ │ :5173  │
└───┬────┘ └────────┘
    │
┌───▼────────┐
│ PostgreSQL │
│   :5432    │
└────────────┘
```

# Fox ERP API Endpoints Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

### Login
**POST** `/auth/login/`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "المدير",
    "role": "admin"
  }
}
```

### Logout
**POST** `/auth/logout/`

Request:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Products

### List Products
**GET** `/products/`

Query Parameters:
- `category` (optional): Filter by category
- `search` (optional): Search by name, SKU, or barcode

Response:
```json
[
  {
    "id": 1,
    "sku": "PROD001",
    "barcode": "1234567890",
    "name": "منتج تجريبي",
    "category": "electronics",
    "quantity": 100,
    "cost_price": 50.00,
    "sell_price": 75.00,
    "unit": "piece",
    "min_stock_alert": 10,
    "image": null,
    "is_low_stock": false
  }
]
```

### Create Product
**POST** `/products/`

Request:
```json
{
  "sku": "PROD002",
  "barcode": "9876543210",
  "name": "منتج جديد",
  "category": "food",
  "quantity": 50,
  "cost_price": 30.00,
  "sell_price": 45.00,
  "unit": "kg",
  "min_stock_alert": 5
}
```

### Update Product
**PUT** `/products/{id}/`

Request: Same as Create

### Delete Product
**DELETE** `/products/{id}/`

### Adjust Stock
**POST** `/products/{id}/adjust_stock/`

Request:
```json
{
  "quantity_diff": -10,
  "reason": "تالف"
}
```

---

## Customers

### List Customers
**GET** `/customers/`

Response:
```json
[
  {
    "id": 1,
    "name": "عميل تجريبي",
    "phone": "01234567890",
    "type": "wholesale",
    "balance": 1500.00,
    "credit_limit": 5000.00
  }
]
```

### Create Customer
**POST** `/customers/`

Request:
```json
{
  "name": "عميل جديد",
  "phone": "01111111111",
  "type": "consumer",
  "credit_limit": 0
}
```

### Update Customer
**PUT** `/customers/{id}/`

### Delete Customer
**DELETE** `/customers/{id}/`

### Settle Debt
**POST** `/customers/{id}/settle_debt/`

Request:
```json
{
  "amount": 500.00,
  "payment_method": "cash"
}
```

---

## Suppliers

### List Suppliers
**GET** `/suppliers/`

Response:
```json
[
  {
    "id": 1,
    "name": "مورد تجريبي",
    "phone": "01234567890",
    "balance": -2000.00
  }
]
```

### Create Supplier
**POST** `/suppliers/`

Request:
```json
{
  "name": "مورد جديد",
  "phone": "01222222222"
}
```

### Update Supplier
**PUT** `/suppliers/{id}/`

### Delete Supplier
**DELETE** `/suppliers/{id}/`

### Settle Debt
**POST** `/suppliers/{id}/settle_debt/`

Request:
```json
{
  "amount": 1000.00,
  "payment_method": "bank_transfer"
}
```

---

## Transactions

### List Transactions
**GET** `/transactions/`

Query Parameters:
- `type`: sale, purchase, expense, capital, withdrawal
- `status`: completed, pending, rejected
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD
- `shift_id`: Filter by shift
- `customer_id`: Filter by customer
- `supplier_id`: Filter by supplier

Response:
```json
[
  {
    "id": "TXN001",
    "type": "sale",
    "date": "2025-12-05T10:30:00Z",
    "amount": 750.00,
    "payment_method": "cash",
    "status": "completed",
    "items": [
      {
        "id": 1,
        "name": "منتج",
        "quantity": 10,
        "price": 75.00,
        "discount": 0
      }
    ],
    "customer": {
      "id": 1,
      "name": "عميل"
    },
    "shift": 1
  }
]
```

### Create Sale
**POST** `/transactions/create_sale/`

Request:
```json
{
  "customer_id": 1,
  "payment_method": "cash",
  "items": [
    {
      "id": 1,
      "quantity": 5,
      "price": 75.00,
      "discount": 0
    }
  ],
  "total_amount": 375.00,
  "is_direct_sale": false
}
```

### Create Purchase
**POST** `/transactions/create_purchase/`

Request:
```json
{
  "supplier_id": 1,
  "payment_method": "cash",
  "items": [
    {
      "id": 1,
      "quantity": 100,
      "cost_price": 50.00
    }
  ],
  "total_amount": 5000.00
}
```

### Create Expense
**POST** `/transactions/create_expense/`

Request:
```json
{
  "amount": 500.00,
  "category": "rent",
  "description": "إيجار المحل",
  "payment_method": "cash"
}
```

### Create Capital
**POST** `/transactions/create_capital/`

Request:
```json
{
  "amount": 10000.00,
  "description": "رأس مال إضافي"
}
```

### Create Withdrawal
**POST** `/transactions/create_withdrawal/`

Request:
```json
{
  "amount": 2000.00,
  "description": "سحب نقدي"
}
```

### Approve Transaction
**PUT** `/transactions/{id}/approve/`

### Reject Transaction
**PUT** `/transactions/{id}/reject/`

### Process Return
**POST** `/transactions/{id}/process_return/`

---

## Shifts

### List Shifts
**GET** `/shifts/`

Response:
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "name": "الكاشير"
    },
    "start_time": "2025-12-05T08:00:00Z",
    "end_time": "2025-12-05T16:00:00Z",
    "start_cash": 1000.00,
    "end_cash": 5000.00,
    "expected_cash": 4800.00,
    "total_sales": 10000.00,
    "sales_by_method": {
      "cash": 5000.00,
      "card": 3000.00,
      "bank_transfer": 2000.00
    },
    "status": "closed"
  }
]
```

### Open Shift
**POST** `/shifts/open/`

Request:
```json
{
  "start_cash": 1000.00
}
```

### Close Shift
**POST** `/shifts/{id}/close/`

Request:
```json
{
  "end_cash": 5000.00
}
```

Response includes Z-Report data

---

## Quotations

### List Quotations
**GET** `/quotations/`

Query Parameters:
- `status`: pending, converted, cancelled
- `customer_id`: Filter by customer

Response:
```json
[
  {
    "id": "QUO001",
    "date": "2025-12-05T10:00:00Z",
    "customer": {
      "id": 1,
      "name": "عميل"
    },
    "items": [
      {
        "id": 1,
        "name": "منتج",
        "quantity": 10,
        "price": 75.00,
        "discount": 5
      }
    ],
    "total_amount": 712.50,
    "status": "pending"
  }
]
```

### Create Quotation
**POST** `/quotations/`

Request:
```json
{
  "customer_id": 1,
  "items": [
    {
      "id": 1,
      "quantity": 10,
      "price": 75.00,
      "discount": 5
    }
  ],
  "total_amount": 712.50
}
```

### Convert to Invoice
**POST** `/quotations/{id}/convert/`

Request:
```json
{
  "payment_method": "cash"
}
```

### Delete Quotation
**DELETE** `/quotations/{id}/`

---

## Settings

### Get Settings
**GET** `/settings/`

Response:
```json
{
  "company_name": "Fox Group",
  "tax_rate": 14.0,
  "currency": "EGP",
  "prevent_negative_stock": true,
  "require_customer_for_sales": false,
  "auto_generate_sku": true,
  "invoice_prefix": "INV",
  "quotation_prefix": "QUO",
  "logo_url": "/fox-logo.png"
}
```

### Update Settings
**PUT** `/settings/`

Request: Same as response

---

## Users

### List Users
**GET** `/users/`

Response:
```json
[
  {
    "id": 1,
    "username": "admin",
    "name": "المدير",
    "role": "admin"
  }
]
```

### Create User
**POST** `/users/`

Request:
```json
{
  "username": "cashier1",
  "password": "password123",
  "name": "كاشير 1",
  "role": "cashier"
}
```

### Delete User
**DELETE** `/users/{id}/`

### Change Password
**PUT** `/users/me/change_password/`

Request:
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```

---

## Activity Logs

### List Activity Logs
**GET** `/activity-logs/`

Query Parameters:
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD
- `user_id`: Filter by user

Response:
```json
[
  {
    "id": 1,
    "date": "2025-12-05T10:30:00Z",
    "user": {
      "id": 1,
      "name": "المدير"
    },
    "action": "create_product",
    "details": "تم إضافة منتج: منتج جديد"
  }
]
```

---

## Reports

### Sales Report
**GET** `/reports/sales/`

Query Parameters:
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD

Response:
```json
{
  "total_sales": 50000.00,
  "total_returns": 2000.00,
  "net_sales": 48000.00,
  "sales_by_method": {
    "cash": 30000.00,
    "card": 15000.00,
    "bank_transfer": 5000.00
  },
  "top_products": [
    {
      "product": "منتج 1",
      "quantity": 100,
      "revenue": 7500.00
    }
  ]
}
```

### Inventory Report
**GET** `/reports/inventory/`

Response:
```json
{
  "total_products": 150,
  "total_value": 125000.00,
  "low_stock_items": [
    {
      "id": 1,
      "name": "منتج",
      "quantity": 5,
      "min_stock_alert": 10
    }
  ]
}
```

### Treasury Report
**GET** `/reports/treasury/`

Query Parameters:
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD

Response:
```json
{
  "total_income": 50000.00,
  "total_expenses": 15000.00,
  "net_cash_flow": 35000.00,
  "expenses_by_category": {
    "rent": 5000.00,
    "utilities": 2000.00,
    "salaries": 8000.00
  }
}
```

### Debts Report
**GET** `/reports/debts/`

Response:
```json
{
  "customer_debts": [
    {
      "customer": "عميل 1",
      "balance": 5000.00
    }
  ],
  "supplier_debts": [
    {
      "supplier": "مورد 1",
      "balance": -10000.00
    }
  ],
  "total_customer_debts": 15000.00,
  "total_supplier_debts": -25000.00
}
```

### Profit/Loss Report
**GET** `/reports/profit_loss/`

Query Parameters:
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD

Response:
```json
{
  "revenue": 50000.00,
  "cost_of_goods_sold": 30000.00,
  "gross_profit": 20000.00,
  "expenses": 10000.00,
  "net_profit": 10000.00,
  "profit_margin": 20.0
}
```

---

## System

### Backup
**POST** `/system/backup/`

Response: JSON file download

### Restore
**POST** `/system/restore/`

Request: Multipart form data with file

### Clear Transactions
**POST** `/system/clear_transactions/`

### Factory Reset
**POST** `/system/factory_reset/`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "ERROR_CODE",
  "message": "رسالة الخطأ بالعربية",
  "details": {}
}
```

Common Error Codes:
- `INVALID_CREDENTIALS`: بيانات الدخول غير صحيحة
- `INSUFFICIENT_STOCK`: الكمية المتاحة غير كافية
- `CREDIT_LIMIT_EXCEEDED`: تجاوز حد الائتمان
- `NO_OPEN_SHIFT`: لا توجد وردية مفتوحة
- `VALIDATION_ERROR`: خطأ في البيانات المدخلة
- `PERMISSION_DENIED`: ليس لديك صلاحية لهذه العملية
- `NOT_FOUND`: العنصر غير موجود

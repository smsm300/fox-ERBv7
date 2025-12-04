# Requirements Document

## Introduction

هذا المستند يحدد متطلبات الربط الكامل بين نظام Fox ERP المكون من:
- **Backend**: مشروع Django REST Framework في `fox_pos_project`
- **Frontend**: مشروع React + Vite + TypeScript في `fox-group-erp`

الهدف هو إنشاء طبقة API موحدة تربط بين الطرفين مع ضمان تغطية كاملة للمميزات في كلا الاتجاهين.

## Glossary

- **Fox_ERP_System**: نظام إدارة نقاط البيع والمخزون والمحاسبة
- **API_Layer**: طبقة REST API التي تربط بين Frontend و Backend
- **Shift**: الوردية - فترة عمل الكاشير من فتح الصندوق حتى إغلاقه
- **Transaction**: أي حركة مالية (بيع، شراء، مصروف، مرتجع، إيداع، سحب)
- **Debt_Settlement**: تسوية المديونية - سداد أو تحصيل مبالغ مستحقة
- **Direct_Sale**: بيع مباشر - بيع بضاعة خارجية بدون خصم من المخزون
- **Average_Cost**: متوسط التكلفة المرجح للمنتج
- **JWT_Token**: رمز المصادقة للوصول للـ API
- **Z_Report**: تقرير إغلاق الوردية يحتوي على ملخص المبيعات والنقدية
- **Barcode**: الباركود - رمز شريطي فريد لتعريف المنتج
- **Error_Code**: رمز الخطأ - معرف فريد لنوع الخطأ يستخدم للتعامل البرمجي
- **Offline_Mode**: وضع عدم الاتصال - القدرة على العمل بدون اتصال بالإنترنت
- **Pending_Sync**: معلق للمزامنة - معاملة محفوظة محلياً تنتظر الإرسال للخادم

## Requirements

### Requirement 1: API Layer Setup

**User Story:** As a developer, I want a unified API layer between frontend and backend, so that all data operations are consistent and centralized.

#### Acceptance Criteria

1. WHEN the frontend application starts THEN the Fox_ERP_System SHALL provide an axios-based API client configured with base URL and authentication headers
2. WHEN an API request is made THEN the Fox_ERP_System SHALL include JWT_Token in the Authorization header
3. WHEN an API response returns an error THEN the Fox_ERP_System SHALL handle the error gracefully and display appropriate user feedback
4. WHEN the JWT_Token expires THEN the Fox_ERP_System SHALL redirect the user to the login page
5. WHEN the backend returns validation errors THEN the Fox_ERP_System SHALL display field-specific error messages to the user
6. WHEN a network error occurs THEN the Fox_ERP_System SHALL retry the request up to 3 times before showing an error
7. WHEN the backend is under maintenance THEN the Fox_ERP_System SHALL display a maintenance message to the user

### Requirement 2: Authentication and Authorization

**User Story:** As a system administrator, I want role-based access control, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a user submits login credentials THEN the Fox_ERP_System SHALL validate credentials against the backend and return a JWT_Token
2. WHEN a user with role 'cashier' attempts to access admin-only features THEN the Fox_ERP_System SHALL deny access and display an appropriate message
3. WHEN a user with role 'admin' logs in THEN the Fox_ERP_System SHALL grant access to all system features
4. WHEN a user logs out THEN the Fox_ERP_System SHALL invalidate the JWT_Token and clear local session data
5. WHEN the backend receives an API request THEN the Fox_ERP_System SHALL verify the JWT_Token and user permissions before processing

### Requirement 3: Products Management API

**User Story:** As a stock keeper, I want to manage products through the system, so that I can maintain accurate inventory records.

#### Acceptance Criteria

1. WHEN a user requests the products list THEN the Fox_ERP_System SHALL return all products with fields: id, sku, name, category, quantity, costPrice, sellPrice, unit, minStockAlert, image
2. WHEN a user creates a new product THEN the Fox_ERP_System SHALL validate required fields and persist the product to the database
3. WHEN a user updates a product THEN the Fox_ERP_System SHALL update the product record and return the updated data
4. WHEN a user deletes a product that has no transactions THEN the Fox_ERP_System SHALL remove the product from the database
5. WHEN a user attempts to delete a product with existing transactions THEN the Fox_ERP_System SHALL reject the deletion and return an error message
6. WHEN products are listed THEN the Fox_ERP_System SHALL support filtering by category and searching by name/SKU
7. WHEN a product quantity reaches minStockAlert THEN the Fox_ERP_System SHALL flag it as low stock in the response

### Requirement 4: Customers Management API

**User Story:** As a sales representative, I want to manage customer records, so that I can track customer information and balances.

#### Acceptance Criteria

1. WHEN a user requests the customers list THEN the Fox_ERP_System SHALL return all customers with fields: id, name, phone, type, balance, creditLimit
2. WHEN a user creates a new customer THEN the Fox_ERP_System SHALL validate required fields and persist the customer to the database
3. WHEN a user updates a customer THEN the Fox_ERP_System SHALL update the customer record and return the updated data
4. WHEN a user deletes a customer with zero balance and no transactions THEN the Fox_ERP_System SHALL remove the customer from the database
5. WHEN a user attempts to delete a customer with non-zero balance THEN the Fox_ERP_System SHALL reject the deletion and return an error message
6. WHEN creating a customer with type 'consumer' THEN the Fox_ERP_System SHALL set creditLimit to 0 and prevent deferred payments
7. WHEN creating a customer with type 'business' THEN the Fox_ERP_System SHALL allow setting creditLimit and enable deferred payments

### Requirement 5: Suppliers Management API

**User Story:** As a purchasing manager, I want to manage supplier records, so that I can track supplier information and balances.

#### Acceptance Criteria

1. WHEN a user requests the suppliers list THEN the Fox_ERP_System SHALL return all suppliers with fields: id, name, phone, balance
2. WHEN a user creates a new supplier THEN the Fox_ERP_System SHALL validate required fields and persist the supplier to the database
3. WHEN a user updates a supplier THEN the Fox_ERP_System SHALL update the supplier record and return the updated data
4. WHEN a user deletes a supplier with zero balance and no transactions THEN the Fox_ERP_System SHALL remove the supplier from the database
5. WHEN a user attempts to delete a supplier with non-zero balance THEN the Fox_ERP_System SHALL reject the deletion and return an error message


### Requirement 6: Sales Operations API

**User Story:** As a cashier, I want to process sales transactions, so that I can complete customer purchases efficiently.

#### Acceptance Criteria

1. WHEN a user completes a sale THEN the Fox_ERP_System SHALL create a sales transaction, update product quantities, and update customer balance if payment is deferred
2. WHEN a sale is completed with Direct_Sale flag THEN the Fox_ERP_System SHALL create an expense transaction for cost of goods sold without reducing inventory
3. WHEN a sale is completed with deferred payment THEN the Fox_ERP_System SHALL decrease the customer balance by the sale amount
4. WHEN a deferred sale exceeds customer creditLimit THEN the Fox_ERP_System SHALL reject the sale and return an error message
5. WHEN a user processes a sales return THEN the Fox_ERP_System SHALL create a return transaction, restore product quantities (unless Direct_Sale), and adjust customer balance
6. WHEN a sale is attempted without an open Shift THEN the Fox_ERP_System SHALL reject the sale and prompt the user to open a shift
7. WHEN a sale is completed THEN the Fox_ERP_System SHALL auto-increment the invoice number in settings
8. WHEN a sale uses a custom invoice ID THEN the Fox_ERP_System SHALL accept the custom ID without incrementing the auto-counter

### Requirement 7: Purchase Operations API

**User Story:** As a purchasing manager, I want to process purchase transactions, so that I can receive inventory from suppliers.

#### Acceptance Criteria

1. WHEN a user completes a purchase THEN the Fox_ERP_System SHALL create a purchase transaction, increase product quantities, and calculate Average_Cost
2. WHEN a purchase is completed with deferred payment THEN the Fox_ERP_System SHALL increase the supplier balance by the purchase amount
3. WHEN a user processes a purchase return THEN the Fox_ERP_System SHALL create a return transaction, decrease product quantities, and adjust supplier balance
4. WHEN calculating Average_Cost THEN the Fox_ERP_System SHALL use the formula: (oldQuantity × oldCost + newQuantity × newCost) / totalQuantity
5. WHEN a purchase return would result in negative quantity THEN the Fox_ERP_System SHALL reject the return and return an error message

### Requirement 8: Shift Management API

**User Story:** As a cashier, I want to manage my work shift, so that I can track cash movements during my shift.

#### Acceptance Criteria

1. WHEN a user opens a shift THEN the Fox_ERP_System SHALL create a new Shift record with start time and starting cash amount
2. WHEN a user closes a shift THEN the Fox_ERP_System SHALL calculate expected cash based on all cash transactions during the shift
3. WHEN closing a shift THEN the Fox_ERP_System SHALL record the actual ending cash and compare with expected cash
4. WHEN a user attempts to open a shift while another is open THEN the Fox_ERP_System SHALL reject the request and display an error message
5. WHEN a shift is closed THEN the Fox_ERP_System SHALL generate a Z_Report summary with sales breakdown by payment method
6. WHEN calculating expected cash THEN the Fox_ERP_System SHALL include: startCash + cashSales - cashReturns - cashExpenses - cashWithdrawals + cashCapital
7. WHEN closing a shift THEN the Fox_ERP_System SHALL return the complete shift object with expectedCash, endCash, and salesByMethod for Z_Report generation

### Requirement 9: Treasury Operations API

**User Story:** As an accountant, I want to manage treasury operations, so that I can track all financial movements.

#### Acceptance Criteria

1. WHEN a user adds an expense THEN the Fox_ERP_System SHALL create an expense transaction with amount, category, and description
2. WHEN an expense exceeds 2000 EGP and user is not admin THEN the Fox_ERP_System SHALL mark the transaction as pending approval
3. WHEN an admin approves a pending transaction THEN the Fox_ERP_System SHALL update the transaction status to completed
4. WHEN an admin rejects a pending transaction THEN the Fox_ERP_System SHALL update the transaction status to rejected
5. WHEN a user records a capital deposit THEN the Fox_ERP_System SHALL create a capital transaction increasing available funds
6. WHEN a user records a withdrawal THEN the Fox_ERP_System SHALL create a withdrawal transaction decreasing available funds
7. WHEN a user requests transactions list THEN the Fox_ERP_System SHALL support filtering by: type, status, date_range, shift_id, customer_id, supplier_id
8. WHEN filtering transactions THEN the Fox_ERP_System SHALL return paginated results with limit and offset parameters

### Requirement 10: Debt Settlement API

**User Story:** As an accountant, I want to settle customer and supplier debts, so that I can maintain accurate account balances.

#### Acceptance Criteria

1. WHEN a user settles a customer debt THEN the Fox_ERP_System SHALL create a settlement transaction and increase the customer balance
2. WHEN a user settles a supplier debt THEN the Fox_ERP_System SHALL create a settlement transaction and decrease the supplier balance
3. WHEN a debt settlement is recorded THEN the Fox_ERP_System SHALL link the transaction to the current Shift if one is open
4. WHEN settling more than the outstanding balance THEN the Fox_ERP_System SHALL accept the overpayment and update the balance accordingly

### Requirement 11: Inventory Adjustment API

**User Story:** As a stock keeper, I want to adjust inventory quantities, so that I can correct discrepancies between physical and system stock.

#### Acceptance Criteria

1. WHEN a user performs a stock adjustment THEN the Fox_ERP_System SHALL update the product quantity and create an adjustment transaction
2. WHEN a stock adjustment would result in negative quantity THEN the Fox_ERP_System SHALL reject the adjustment and return an error message
3. WHEN a stock adjustment is recorded THEN the Fox_ERP_System SHALL require and log the reason for the adjustment
4. WHEN a stock adjustment transaction is created THEN the Fox_ERP_System SHALL include the product details in the items field for audit trail

### Requirement 12: Quotations API

**User Story:** As a sales representative, I want to create and manage quotations, so that I can provide price quotes to customers.

#### Acceptance Criteria

1. WHEN a user creates a quotation THEN the Fox_ERP_System SHALL create a quotation record with customer, items, and total amount
2. WHEN a user converts a quotation to an invoice THEN the Fox_ERP_System SHALL create a sales transaction using the quotation data
3. WHEN converting a quotation with insufficient stock THEN the Fox_ERP_System SHALL warn the user and allow them to proceed or cancel
4. WHEN a quotation is converted THEN the Fox_ERP_System SHALL update the quotation status to 'converted'
5. WHEN a user requests quotations list THEN the Fox_ERP_System SHALL support filtering by status (pending/converted) and customer

### Requirement 13: System Settings API

**User Story:** As an administrator, I want to manage system settings, so that I can configure the application behavior.

#### Acceptance Criteria

1. WHEN a user requests system settings THEN the Fox_ERP_System SHALL return all settings including: companyName, companyPhone, companyAddress, logoUrl, autoPrint, nextInvoiceNumber, openingBalance, taxRate, currentShiftId, preventNegativeStock, invoiceTerms
2. WHEN a user updates system settings THEN the Fox_ERP_System SHALL persist the changes and return the updated settings
3. WHEN settings are updated THEN the Fox_ERP_System SHALL log the change in the activity log
4. WHEN the system settings are requested THEN the Fox_ERP_System SHALL treat it as a singleton (only one settings record exists)

### Requirement 14: Backup and Restore API

**User Story:** As an administrator, I want to backup and restore system data, so that I can protect against data loss.

#### Acceptance Criteria

1. WHEN a user requests a backup THEN the Fox_ERP_System SHALL generate a JSON file containing: products, transactions, customers, suppliers, quotations, settings, users (without passwords), activityLogs, shifts, timestamp, version
2. WHEN a user uploads a backup file THEN the Fox_ERP_System SHALL validate the file format and version before restoring
3. WHEN a backup file is restored THEN the Fox_ERP_System SHALL replace all current data with the backup data
4. WHEN a user requests to clear transactions THEN the Fox_ERP_System SHALL remove all transactions, quotations, shifts, activityLogs and reset customer/supplier balances to zero
5. WHEN a user requests a factory reset THEN the Fox_ERP_System SHALL restore all data to initial default values and clear localStorage


### Requirement 15: Reports API

**User Story:** As a manager, I want to view various reports, so that I can analyze business performance.

#### Acceptance Criteria

1. WHEN a user requests a sales report THEN the Fox_ERP_System SHALL return sales data filtered by date range with totals by payment method
2. WHEN a user requests an inventory report THEN the Fox_ERP_System SHALL return current stock levels, low stock alerts, and total inventory value
3. WHEN a user requests a treasury report THEN the Fox_ERP_System SHALL return cash flow summary by transaction type (sales, purchases, expenses, capital, withdrawals)
4. WHEN a user requests a debts report THEN the Fox_ERP_System SHALL return outstanding customer balances (negative) and supplier balances (positive) separately
5. WHEN a user requests a profit/loss report THEN the Fox_ERP_System SHALL calculate: totalSales - totalPurchases - totalExpenses = netIncome
6. WHEN generating reports THEN the Fox_ERP_System SHALL support date range filtering with from_date and to_date parameters

### Requirement 16: Activity Logging

**User Story:** As an administrator, I want to track user activities, so that I can audit system usage.

#### Acceptance Criteria

1. WHEN any significant action is performed THEN the Fox_ERP_System SHALL create an activity log entry with: id, date, userId, userName, action, details
2. WHEN a user requests the activity log THEN the Fox_ERP_System SHALL return log entries filtered by date range and user
3. WHEN logging an activity THEN the Fox_ERP_System SHALL include descriptive action types such as: 'عملية بيع', 'عملية شراء', 'مصروفات', 'وردية', 'تسوية مخزون', 'إضافة عميل', 'تعديل منتج'
4. WHEN the activity log grows large THEN the Fox_ERP_System SHALL support pagination with limit and offset

### Requirement 17: Frontend API Integration

**User Story:** As a developer, I want the frontend to use the backend API, so that data is persisted and shared across sessions.

#### Acceptance Criteria

1. WHEN the frontend loads THEN the Fox_ERP_System SHALL fetch initial data from the backend API instead of localStorage
2. WHEN a user performs a CRUD operation THEN the Fox_ERP_System SHALL send the request to the backend API and update local state on success
3. WHEN the backend API is unavailable THEN the Fox_ERP_System SHALL display an appropriate error message to the user
4. WHEN data is successfully saved to the backend THEN the Fox_ERP_System SHALL update the local state to reflect the changes
5. WHEN the frontend makes concurrent requests THEN the Fox_ERP_System SHALL handle race conditions properly
6. WHEN API calls are in progress THEN the Fox_ERP_System SHALL display loading indicators to the user

### Requirement 18: CORS Configuration

**User Story:** As a developer, I want proper CORS configuration, so that the frontend can communicate with the backend during development.

#### Acceptance Criteria

1. WHEN the frontend makes a request from localhost:5173 THEN the Fox_ERP_System SHALL accept the request with proper CORS headers
2. WHEN the backend receives a preflight OPTIONS request THEN the Fox_ERP_System SHALL respond with appropriate CORS headers
3. WHEN deploying to production THEN the Fox_ERP_System SHALL allow configuring allowed origins via environment variables
4. WHEN CORS is configured THEN the Fox_ERP_System SHALL allow credentials (cookies/auth headers) in cross-origin requests

### Requirement 19: Initial Data Loading

**User Story:** As a system administrator, I want to load initial data, so that the system has default products, customers, and settings on first deployment.

#### Acceptance Criteria

1. WHEN the system is first deployed THEN the Fox_ERP_System SHALL provide a management command to load initial data
2. WHEN initial data is loaded THEN the Fox_ERP_System SHALL create INITIAL_PRODUCTS: 4 products (كرنيشة فيوتك، أباليك كلاسيك، بانوهات، معجون لاصق) with SKUs, prices, quantities, and categories as defined in constants.ts
3. WHEN initial data is loaded THEN the Fox_ERP_System SHALL create INITIAL_CUSTOMERS: 3 customers (عميل نقدي as consumer, مكتب الهندسية للديكور and أحمد للمقاولات as business customers with credit limits)
4. WHEN initial data is loaded THEN the Fox_ERP_System SHALL create INITIAL_SUPPLIERS: 2 suppliers (مصنع فيوتك and الشركة الدولية للإضاءة)
5. WHEN initial data is loaded THEN the Fox_ERP_System SHALL create default users: admin (username: admin, password: admin, role: admin) and cashier (username: cashier, password: 123, role: cashier)
6. WHEN initial data is loaded THEN the Fox_ERP_System SHALL set INITIAL_SETTINGS with: companyName='FOX GROUP', companyPhone='01112223334', companyAddress='القاهرة - مصر', logoUrl, nextInvoiceNumber=1002, openingBalance=50000, taxRate=14, invoiceTerms
7. WHEN initial data already exists THEN the Fox_ERP_System SHALL skip loading and not duplicate records

### Requirement 20: Users Management API

**User Story:** As an administrator, I want to manage system users, so that I can control access and maintain security.

#### Acceptance Criteria

1. WHEN a user requests the users list THEN the Fox_ERP_System SHALL return all users with fields: id, username, name, role (excluding passwords)
2. WHEN an admin creates a new user THEN the Fox_ERP_System SHALL validate username uniqueness, hash the password, and create the user
3. WHEN a user changes their own password THEN the Fox_ERP_System SHALL validate the old password, hash the new password, and update the record
4. WHEN an admin deletes a user THEN the Fox_ERP_System SHALL remove the user unless it's the last admin user
5. WHEN a non-admin attempts to access users management API THEN the Fox_ERP_System SHALL deny access and return 403 Forbidden
6. WHEN creating a user THEN the Fox_ERP_System SHALL validate that role is one of: admin, accountant, cashier, stock_keeper

### Requirement 21: Frontend UI Coverage

**User Story:** As a developer, I want every backend feature to have a corresponding UI, so that all functionality is accessible to users.

#### Acceptance Criteria

1. WHEN the backend provides a feature THEN the Fox_ERP_System SHALL ensure a corresponding page/component exists in frontend
2. WHEN the frontend has a handler function THEN the Fox_ERP_System SHALL ensure a corresponding backend endpoint exists
3. WHEN creating new backend endpoints THEN the Fox_ERP_System SHALL document them in an API reference file (docs/api_endpoints.md)
4. WHEN adding new frontend pages THEN the Fox_ERP_System SHALL ensure they are accessible from the navigation menu in Layout component
5. WHEN a mismatch is found between frontend handlers and backend endpoints THEN the Fox_ERP_System SHALL create missing endpoints or UI components to achieve full coverage
6. WHEN documenting coverage THEN the Fox_ERP_System SHALL maintain a feature mapping table in docs/integration_coverage.md

### Requirement 22: Performance and Optimization

**User Story:** As a user, I want fast response times, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN loading the products list THEN the Fox_ERP_System SHALL respond within 500ms for up to 1000 products
2. WHEN processing a sale transaction THEN the Fox_ERP_System SHALL complete within 1 second including database updates
3. WHEN generating a report with large datasets THEN the Fox_ERP_System SHALL use pagination with default page size of 50 records
4. WHEN the frontend fetches frequently accessed data (products, customers) THEN the Fox_ERP_System SHALL implement local caching with configurable TTL
5. WHEN multiple users access the system concurrently THEN the Fox_ERP_System SHALL handle at least 10 concurrent requests without performance degradation
6. WHEN database queries are executed THEN the Fox_ERP_System SHALL use proper indexing on commonly queried fields (id, sku, date, status)

### Requirement 23: Print and Export Features

**User Story:** As a user, I want to print invoices and export reports, so that I can provide documentation to customers and management.

#### Acceptance Criteria

1. WHEN a user completes a sale and autoPrint is enabled in settings THEN the Fox_ERP_System SHALL automatically trigger the browser print dialog with formatted invoice
2. WHEN a user closes a shift THEN the Fox_ERP_System SHALL generate a printable Z_Report with: shift summary, sales by payment method, expected vs actual cash, transaction breakdown
3. WHEN a user views a report THEN the Fox_ERP_System SHALL provide buttons to export the report to PDF and Excel formats
4. WHEN printing an invoice THEN the Fox_ERP_System SHALL include: company logo, company info, invoice number, date, customer name, itemized products with quantities and prices, subtotal, tax, total, payment method, invoice terms
5. WHEN printing a Z_Report THEN the Fox_ERP_System SHALL include: shift ID, user name, start/end time, start/end cash, expected cash, cash difference, sales breakdown by payment method, total transactions count
6. WHEN exporting to Excel THEN the Fox_ERP_System SHALL format data in tabular structure with proper column headers in Arabic

### Requirement 24: Data Validation and Business Rules

**User Story:** As a system user, I want the system to enforce business rules, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a sale is processed and preventNegativeStock is enabled THEN the Fox_ERP_System SHALL reject the sale if any product quantity would become negative
2. WHEN a deferred payment is attempted for a consumer customer THEN the Fox_ERP_System SHALL reject the transaction and require cash/wallet/instapay payment
3. WHEN a product is created THEN the Fox_ERP_System SHALL validate that: name and SKU are non-empty, costPrice and sellPrice are positive, quantity and minStockAlert are non-negative
4. WHEN a transaction is created THEN the Fox_ERP_System SHALL validate that: amount is positive, date is valid ISO format, type and paymentMethod are from allowed enums
5. WHEN a customer balance update would exceed creditLimit THEN the Fox_ERP_System SHALL reject the transaction
6. WHEN updating Average_Cost THEN the Fox_ERP_System SHALL prevent division by zero if total quantity becomes zero

### Requirement 25: Barcode Scanner Support

**User Story:** As a cashier, I want to scan product barcodes, so that I can quickly add products to the cart without manual search.

#### Acceptance Criteria

1. WHEN a barcode is scanned in the POS screen THEN the Fox_ERP_System SHALL search for the product by barcode field and add it to the cart
2. WHEN a scanned barcode matches a product THEN the Fox_ERP_System SHALL increment the cart quantity by 1 if the product is already in cart
3. WHEN a scanned barcode does not match any product THEN the Fox_ERP_System SHALL display an error message "المنتج غير موجود"
4. WHEN creating or updating a product THEN the Fox_ERP_System SHALL allow setting an optional barcode field
5. WHEN a barcode is provided THEN the Fox_ERP_System SHALL validate that the barcode is unique across all products

### Requirement 26: Error Codes and Messages

**User Story:** As a developer, I want standardized error codes and messages, so that error handling is consistent across the application.

#### Acceptance Criteria

1. WHEN an API error occurs THEN the Fox_ERP_System SHALL return a JSON response with: error_code, message, details fields
2. WHEN a validation error occurs THEN the Fox_ERP_System SHALL return error_code 'VALIDATION_ERROR' with field-specific details
3. WHEN authentication fails THEN the Fox_ERP_System SHALL return error_code 'AUTH_FAILED' with status 401
4. WHEN authorization fails THEN the Fox_ERP_System SHALL return error_code 'PERMISSION_DENIED' with status 403
5. WHEN a resource is not found THEN the Fox_ERP_System SHALL return error_code 'NOT_FOUND' with status 404
6. WHEN a business rule is violated THEN the Fox_ERP_System SHALL return error_code 'BUSINESS_RULE_VIOLATION' with descriptive message
7. WHEN a server error occurs THEN the Fox_ERP_System SHALL return error_code 'SERVER_ERROR' with status 500 and log the error details
8. WHEN the frontend receives an error response THEN the Fox_ERP_System SHALL display the localized message to the user

### Requirement 27: Offline Mode Support

**User Story:** As a cashier, I want to continue working when the network is unavailable, so that business operations are not interrupted.

#### Acceptance Criteria

1. WHEN the network connection is lost THEN the Fox_ERP_System SHALL display a visual indicator showing offline status
2. WHEN offline THEN the Fox_ERP_System SHALL allow viewing cached products, customers, and suppliers data
3. WHEN a sale is attempted offline THEN the Fox_ERP_System SHALL queue the transaction locally with status 'pending_sync'
4. WHEN the network connection is restored THEN the Fox_ERP_System SHALL automatically sync pending transactions to the backend
5. WHEN syncing pending transactions THEN the Fox_ERP_System SHALL process them in chronological order
6. WHEN a sync conflict occurs THEN the Fox_ERP_System SHALL flag the transaction for manual review
7. WHEN offline THEN the Fox_ERP_System SHALL prevent operations that require real-time validation (delete, factory reset, user management)
8. WHEN the application starts offline THEN the Fox_ERP_System SHALL load the last cached data from localStorage

---

## Implementation Notes

### Django Models Structure

The backend SHALL implement the following Django models matching the TypeScript types:
- **Product**: Maps to Product interface with choices for unit enum
- **Customer**: Maps to Customer interface with choices for type field
- **Supplier**: Maps to Supplier interface
- **Transaction**: Maps to Transaction interface with JSONField for items, choices for type/paymentMethod/status
- **Shift**: Maps to Shift interface with JSONField for salesByMethod
- **Quotation**: Maps to Quotation interface with JSONField for items
- **AppSettings**: Singleton model mapping to AppSettings interface
- **User**: Extends Django AbstractUser with role field and choices
- **ActivityLog**: Maps to ActivityLogEntry interface

### API Endpoints Summary

The backend SHALL provide the following RESTful endpoints:

```
POST   /api/auth/login/
POST   /api/auth/logout/

GET    /api/products/
POST   /api/products/
PUT    /api/products/{id}/
DELETE /api/products/{id}/
POST   /api/products/{id}/adjust_stock/

GET    /api/customers/
POST   /api/customers/
PUT    /api/customers/{id}/
DELETE /api/customers/{id}/
POST   /api/customers/{id}/settle_debt/

GET    /api/suppliers/
POST   /api/suppliers/
PUT    /api/suppliers/{id}/
DELETE /api/suppliers/{id}/
POST   /api/suppliers/{id}/settle_debt/

GET    /api/transactions/
POST   /api/transactions/
PUT    /api/transactions/{id}/approve/
PUT    /api/transactions/{id}/reject/
POST   /api/transactions/{id}/return/

GET    /api/shifts/
POST   /api/shifts/open/
POST   /api/shifts/{id}/close/

GET    /api/quotations/
POST   /api/quotations/
POST   /api/quotations/{id}/convert/

GET    /api/settings/
PUT    /api/settings/

GET    /api/users/
POST   /api/users/
DELETE /api/users/{id}/
PUT    /api/users/me/change_password/

GET    /api/activity_logs/

GET    /api/reports/sales/
GET    /api/reports/inventory/
GET    /api/reports/treasury/
GET    /api/reports/debts/
GET    /api/reports/profit_loss/

POST   /api/system/backup/
POST   /api/system/restore/
POST   /api/system/clear_transactions/
POST   /api/system/factory_reset/
```

### Frontend Services Structure

The frontend SHALL implement the following service modules:
- `src/services/api.ts`: Axios instance with interceptors
- `src/services/endpoints.ts`: All API functions organized by resource
- `src/services/auth.ts`: Authentication helpers
- `src/services/storage.ts`: LocalStorage fallback utilities

### Testing Requirements

Both backend and frontend SHALL include:
- Unit tests for business logic functions
- Integration tests for API endpoints
- End-to-end tests for critical workflows (sale, purchase, shift close)
- Test coverage minimum 70%

---

**Document Version:** 2.0  
**Last Updated:** 2025-12-04  
**Status:** Complete - Ready for Implementation

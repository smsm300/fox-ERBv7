# Implementation Plan

## Phase 1: Backend API Foundation

- [x] 1. Setup Django REST API Infrastructure



  - [x] 1.1 Create new `apps/api/` Django app for unified API

    - Create app structure with models, views, serializers, urls, services directories
    - Register app in settings.py INSTALLED_APPS
    - _Requirements: 1.1, 21.3_
  - [x] 1.2 Configure JWT Authentication


    - Install and configure djangorestframework-simplejwt
    - Create custom token serializer to include user info (id, username, name, role)
    - Add token endpoints: /api/auth/login/, /api/auth/logout/
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 1.3 Setup CORS and API settings


    - Update CORS_ALLOWED_ORIGINS to include localhost:5173
    - Configure REST_FRAMEWORK with JWT as default authentication
    - Add custom exception handler for standardized error responses
    - _Requirements: 18.1, 18.2, 18.4, 26.1-26.7_
  - [ ]* 1.4 Write property test for JWT token inclusion
    - **Property 1: JWT Token Inclusion**
    - **Validates: Requirements 1.2**
  - [ ]* 1.5 Write property test for error response format
    - **Property 2: Error Response Format**
    - **Validates: Requirements 26.1**

- [x] 2. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Core Data Models and CRUD APIs

- [x] 3. Implement Products API




  - [x] 3.1 Create Product model and serializer in apps/api/

    - Map fields: id, sku, barcode, name, category, quantity, cost_price, sell_price, unit, min_stock_alert, image
    - Add computed field is_low_stock
    - _Requirements: 3.1, 3.7_

  - [x] 3.2 Create ProductViewSet with CRUD operations

    - Implement list, create, retrieve, update, delete actions
    - Add filtering by category and search by name/sku/barcode
    - Add validation to prevent deletion of products with transactions
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.3 Implement adjust_stock action

    - Create stock adjustment endpoint POST /api/products/{id}/adjust_stock/
    - Validate quantity won't go negative
    - Create adjustment transaction with reason
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [ ]* 3.4 Write property test for Product CRUD round-trip
    - **Property 3: Product CRUD Round-Trip**
    - **Validates: Requirements 3.2, 3.3**
  - [ ]* 3.5 Write property test for product deletion with transactions
    - **Property 4: Product Deletion with Transactions**
    - **Validates: Requirements 3.5**
  - [ ]* 3.6 Write property test for barcode uniqueness
    - **Property 21: Barcode Uniqueness**
    - **Validates: Requirements 25.5**



- [x] 4. Implement Customers API


  - [x] 4.1 Create Customer model and serializer

    - Map fields: id, name, phone, type, balance, credit_limit
    - Add validation for consumer type (credit_limit must be 0)

    - _Requirements: 4.1, 4.6, 4.7_
  - [x] 4.2 Create CustomerViewSet with CRUD operations

    - Implement list, create, retrieve, update, delete actions
    - Add validation to prevent deletion with non-zero balance or transactions
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 4.3 Implement settle_debt action

    - Create debt settlement endpoint POST /api/customers/{id}/settle_debt/
    - Update customer balance and create settlement transaction
    - _Requirements: 10.1, 10.3, 10.4_
  - [ ]* 4.4 Write property test for Customer CRUD round-trip
    - **Property 5: Customer CRUD Round-Trip**
    - **Validates: Requirements 4.2, 4.3**
  - [ ]* 4.5 Write property test for customer deletion with balance
    - **Property 6: Customer Deletion with Balance**
    - **Validates: Requirements 4.5**
  - [ ]* 4.6 Write property test for debt settlement balance update
    - **Property 16: Debt Settlement Balance Update**
    - **Validates: Requirements 10.1**

- [x] 5. Implement Suppliers API



  - [x] 5.1 Create Supplier model and serializer

    - Map fields: id, name, phone, balance
    - _Requirements: 5.1_
  - [x] 5.2 Create SupplierViewSet with CRUD operations


    - Implement list, create, retrieve, update, delete actions
    - Add validation to prevent deletion with non-zero balance or transactions
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 5.3 Implement settle_debt action for suppliers

    - Create debt settlement endpoint POST /api/suppliers/{id}/settle_debt/
    - Update supplier balance and create settlement transaction
    - _Requirements: 10.2, 10.3_


- [x] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Transaction and Business Logic APIs

- [x] 7. Implement Shift Management API




  - [x] 7.1 Create Shift model and serializer

    - Map fields: id, user, start_time, end_time, start_cash, end_cash, expected_cash, total_sales, sales_by_method, status
    - _Requirements: 8.1_

  - [x] 7.2 Create ShiftViewSet with open/close actions

    - Implement list action
    - Implement open action POST /api/shifts/open/
    - Validate no other shift is open before opening
    - _Requirements: 8.1, 8.4_

  - [x] 7.3 Implement shift close with expected cash calculation

    - Calculate expected_cash = start_cash + cash_sales - cash_returns - cash_expenses - cash_withdrawals + cash_capital
    - Generate Z-Report data with sales breakdown by payment method
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 8.7_
  - [ ]* 7.4 Write property test for shift expected cash calculation
    - **Property 13: Shift Expected Cash Calculation**
    - **Validates: Requirements 8.2, 8.6**
  - [ ]* 7.5 Write property test for single open shift
    - **Property 14: Single Open Shift**
    - **Validates: Requirements 8.4**

- [x] 8. Implement Transaction API



  - [x] 8.1 Create Transaction model and serializer


    - Map fields: id, type, date, amount, payment_method, description, category, related_customer, related_supplier, items, status, due_date, is_direct_sale, shift

    - _Requirements: 9.7, 9.8_
  - [x] 8.2 Create TransactionViewSet with filtering

    - Implement list with filtering by type, status, date_range, shift_id, customer_id, supplier_id
    - Implement pagination
    - _Requirements: 9.7, 9.8_


  - [x] 8.3 Implement approve/reject actions for pending transactions


    - Create approve endpoint PUT /api/transactions/{id}/approve/
    - Create reject endpoint PUT /api/transactions/{id}/reject/
    - Restrict to admin users only
    - _Requirements: 9.3, 9.4_
  - [ ]* 8.4 Write property test for expense approval threshold
    - **Property 15: Expense Approval Threshold**
    - **Validates: Requirements 9.2**



- [x] 9. Implement Sales Service

  - [x] 9.1 Create SaleService class

    - Implement complete_sale method with all business logic
    - Validate shift is open
    - Validate stock availability (if not direct sale and prevent_negative_stock enabled)
    - Validate customer credit limit (if deferred)
    - _Requirements: 6.1, 6.6, 24.1_


  - [x] 9.2 Implement sale transaction creation

    - Create transaction record
    - Update product quantities (if not direct sale)
    - Create expense for COGS (if direct sale)
    - Update customer balance (if deferred)
    - Increment invoice number
    - Log activity


    - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8_

  - [x] 9.3 Implement sales return processing


    - Create return endpoint POST /api/transactions/{id}/return/
    - Restore product quantities (unless direct sale)
    - Adjust customer balance
    - _Requirements: 6.5_
  - [ ]* 9.4 Write property test for sale transaction atomicity
    - **Property 7: Sale Transaction Atomicity**
    - **Validates: Requirements 6.1, 6.3**
  - [ ]* 9.5 Write property test for direct sale inventory invariant
    - **Property 8: Direct Sale Inventory Invariant**
    - **Validates: Requirements 6.2**
  - [ ]* 9.6 Write property test for credit limit enforcement
    - **Property 9: Credit Limit Enforcement**
    - **Validates: Requirements 6.4, 24.5**
  - [ ]* 9.7 Write property test for sale return inverse
    - **Property 10: Sale Return Inverse**
    - **Validates: Requirements 6.5**
  - [ ]* 9.8 Write property test for shift requirement
    - **Property 11: Shift Requirement for Sales**
    - **Validates: Requirements 6.6**
  - [ ]* 9.9 Write property test for consumer deferred payment prevention
    - **Property 23: Consumer Deferred Payment Prevention**
    - **Validates: Requirements 24.2**

- [x] 10. Implement Purchase Service


  - [x] 10.1 Create PurchaseService class


    - Implement complete_purchase method
    - Create transaction record
    - Update product quantities
    - Calculate weighted average cost
    - Update supplier balance (if deferred)

    - _Requirements: 7.1, 7.2_


  - [x] 10.2 Implement purchase return processing

    - Validate quantity won't go negative
    - Decrease product quantities
    - Adjust supplier balance
    - _Requirements: 7.3, 7.5_
  - [ ]* 10.3 Write property test for average cost calculation
    - **Property 12: Purchase Average Cost Calculation**


    - **Validates: Requirements 7.4**

- [x] 11. Implement Treasury Operations

  - [x] 11.1 Create expense transaction endpoint

    - Validate amount and category
    - Mark as pending if amount > 2000 and user is not admin

    - Link to current shift

    - _Requirements: 9.1, 9.2_

  - [x] 11.2 Create capital deposit endpoint


    - Create capital transaction
    - Link to current shift


    - _Requirements: 9.5_
  - [x] 11.3 Create withdrawal endpoint

    - Create withdrawal transaction

    - Link to current shift
    - _Requirements: 9.6_

- [x] 12. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Supporting APIs

- [x] 13. Implement Quotations API


  - [x] 13.1 Create Quotation model and serializer


    - Map fields: id, date, customer, items, total_amount, status
    - _Requirements: 12.1_

  - [x] 13.2 Create QuotationViewSet with CRUD and convert action

    - Implement list with filtering by status and customer
    - Implement create action
    - Implement convert action POST /api/quotations/{id}/convert/
    - _Requirements: 12.1, 12.5_

  - [x] 13.3 Implement quotation to invoice conversion

    - Validate stock availability (warn if insufficient)
    - Create sale transaction using quotation data
    - Update quotation status to 'converted'
    - _Requirements: 12.2, 12.3, 12.4_
  - [ ]* 13.4 Write property test for quotation conversion
    - **Property 19: Quotation Conversion**
    - **Validates: Requirements 12.2, 12.4**

- [x] 14. Implement Settings API



  - [x] 14.1 Create AppSettings singleton model and serializer

    - Map all settings fields
    - Ensure only one record exists
    - _Requirements: 13.1, 13.4_

  - [x] 14.2 Create SettingsViewSet

    - Implement retrieve (GET /api/settings/)
    - Implement update (PUT /api/settings/)
    - Log changes to activity log
    - _Requirements: 13.1, 13.2, 13.3_



- [x] 15. Implement Users API
  - [x] 15.1 Create custom User model extending AbstractUser

    - Add role field with choices: admin, accountant, cashier, stock_keeper
    - Add name field
    - _Requirements: 20.1, 20.6_

  - [x] 15.2 Create UserViewSet (admin only)

    - Implement list, create, delete actions
    - Validate username uniqueness
    - Hash passwords on create
    - Prevent deletion of last admin
    - _Requirements: 20.1, 20.2, 20.4, 20.5_


  - [x] 15.3 Implement change password endpoint
    - Create PUT /api/users/me/change_password/
    - Validate old password
    - Hash and save new password
    - _Requirements: 20.3_
  - [ ]* 15.4 Write property test for role-based access control
    - **Property 24: Role-Based Access Control**
    - **Validates: Requirements 2.2, 20.5**

- [x] 16. Implement Activity Log API



  - [x] 16.1 Create ActivityLog model and serializer

    - Map fields: id, date, user, user_name, action, details
    - _Requirements: 16.1_

  - [x] 16.2 Create ActivityLogViewSet

    - Implement list with filtering by date range and user
    - Implement pagination
    - _Requirements: 16.2, 16.4_

  - [x] 16.3 Create log_activity utility function

    - Use in all services to log significant actions
    - _Requirements: 16.1, 16.3_


- [x] 17. Implement Reports API

  - [x] 17.1 Create ReportsViewSet with report endpoints


    - GET /api/reports/sales/ - Sales report with date filtering
    - GET /api/reports/inventory/ - Inventory report with low stock
    - GET /api/reports/treasury/ - Cash flow summary
    - GET /api/reports/debts/ - Outstanding balances
    - GET /api/reports/profit_loss/ - Profit/loss calculation
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 18. Implement System API


  - [x] 18.1 Create backup endpoint

    - POST /api/system/backup/ - Generate JSON backup file
    - Include all data: products, transactions, customers, suppliers, quotations, settings, users (no passwords), activityLogs, shifts
    - _Requirements: 14.1_
  - [x] 18.2 Create restore endpoint

    - POST /api/system/restore/ - Restore from backup file
    - Validate file format and version
    - _Requirements: 14.2, 14.3_

  - [x] 18.3 Create clear_transactions endpoint
    - POST /api/system/clear_transactions/
    - Remove transactions, quotations, shifts, activityLogs
    - Reset customer/supplier balances to zero
    - _Requirements: 14.4_
  - [x] 18.4 Create factory_reset endpoint

    - POST /api/system/factory_reset/
    - Restore all data to initial defaults
    - _Requirements: 14.5_
  - [ ]* 18.5 Write property test for backup round-trip
    - **Property 20: Backup Round-Trip**
    - **Validates: Requirements 14.1, 14.3**

- [x] 19. Implement Initial Data Loading


  - [x] 19.1 Create management command load_initial_data


    - Load INITIAL_PRODUCTS from constants
    - Load INITIAL_CUSTOMERS from constants
    - Load INITIAL_SUPPLIERS from constants
    - Create default users (admin, cashier)
    - Set INITIAL_SETTINGS
    - Skip if data already exists
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [x] 20. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Frontend API Integration

- [ ] 21. Setup Frontend API Layer
  - [x] 21.1 Create API client with axios





    - Create src/services/api.ts with axios instance
    - Configure base URL from VITE_API_URL environment variable
    - Add request interceptor for JWT token
    - Add response interceptor for error handling and token expiry
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [x] 21.2 Create API endpoints module


    - Create src/services/endpoints.ts
    - Implement productsAPI, customersAPI, suppliersAPI, transactionsAPI, shiftsAPI, quotationsAPI, settingsAPI, usersAPI, systemAPI, authAPI
    - _Requirements: 17.2_

  - [x] 21.3 Create error handler utility





    - Create src/services/errorHandler.ts
    - Map error codes to Arabic messages
    - _Requirements: 26.8_

- [ ] 22. Implement Authentication Flow
  - [x] 22.1 Update Login page to use API


    - Replace local user validation with authAPI.login()
    - Store JWT token in localStorage
    - Store user info in state
    - _Requirements: 2.1_

  - [x] 22.2 Implement logout functionality

    - Call authAPI.logout()
    - Clear token and user from localStorage
    - Redirect to login page
    - _Requirements: 2.4_
  - [x] 22.3 Add role-based UI restrictions

    - Hide admin-only menu items for non-admin users
    - Disable restricted actions based on role
    - _Requirements: 2.2, 2.3_

- [-] 23. Integrate Products with API

  - [x] 23.1 Update Inventory page to fetch from API

    - Replace localStorage with productsAPI.list()
    - Add loading state and error handling
    - _Requirements: 17.1, 17.3_

  - [x] 23.2 Update product CRUD operations

    - Replace local handlers with API calls
    - Update state on successful API response
    - _Requirements: 17.2, 17.4_
  - [x] 23.3 Implement barcode search

    - Add barcode scanner input handling
    - Search products by barcode using API
    - _Requirements: 25.1, 25.2, 25.3_
  - [ ]* 23.4 Write property test for barcode search
    - **Property 22: Barcode Search**
    - **Validates: Requirements 25.1**

- [-] 24. Integrate Customers and Suppliers with API



  - [x] 24.1 Update Customers page to use API





    - Replace localStorage with customersAPI
    - Implement debt settlement using API

    - _Requirements: 17.1, 17.2_
  - [x] 24.2 Update Suppliers page to use API

    - Replace localStorage with suppliersAPI
    - Implement debt settlement using API
    - _Requirements: 17.1, 17.2_

- [ ] 25. Integrate Sales with API
  - [x] 25.1 Update Sales page to use API


    - Fetch products and customers from API
    - Submit sales through transactionsAPI.createSale()
    - Handle shift validation errors
    - _Requirements: 17.1, 17.2_



  - [x] 25.2 Update shift management in Sales


    - Open shift using shiftsAPI.open()
    - Close shift using shiftsAPI.close()

    - Display Z-Report from API response

    - _Requirements: 17.2_

  - [x] 25.3 Update returns processing




    - Process returns through transactionsAPI.return()

    - _Requirements: 17.2_


- [-] 26. Integrate Purchases with API

  - [x] 26.1 Update Purchases page to use API

    - Fetch products and suppliers from API

    - Submit purchases through transactionsAPI.createPurchase()

    - _Requirements: 17.1, 17.2_

- [x] 27. Integrate Treasury with API

  - [x] 27.1 Update Treasury page to use API

    - Fetch transactions from API with filtering
    - Submit expenses through transactionsAPI.createExpense()
    - Submit capital/withdrawals through API
    - _Requirements: 17.1, 17.2_

  - [x] 27.2 Implement approval workflow UI

    - Display pending transactions for admin
    - Implement approve/reject buttons
    - _Requirements: 17.2_

- [ ] 28. Integrate Quotations with API
  - [x] 28.1 Update Quotations page to use API


    - Fetch quotations from API
    - Create quotations through API
    - Convert to invoice through API


    - _Requirements: 17.1, 17.2_

- [ ] 29. Integrate Settings and System with API
  - [x] 29.1 Update Settings page to use API


    - Fetch settings from API
    - Update settings through API


    - _Requirements: 17.1, 17.2_

  - [ ] 29.2 Update backup/restore to use API
    - Download backup from API
    - Upload restore file to API
    - Call clear_transactions and factory_reset through API
    - _Requirements: 17.2_



- [ ] 30. Integrate Users with API
  - [x] 30.1 Update Users page to use API


    - Fetch users from API

    - Create/delete users through API
    - Implement change password through API
    - _Requirements: 17.1, 17.2_

- [ ] 31. Integrate Reports with API
  - [x] 31.1 Update Reports page to use API



    - Fetch all reports from API
    - Implement date range filtering
    - _Requirements: 17.1, 17.2_

- [x] 32. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Offline Support and Polish

- [x] 33. Implement Offline Mode




  - [x] 33.1 Create offline queue service

    - Create src/services/offline.ts
    - Implement queue for pending transactions
    - Store queue in localStorage

    - _Requirements: 27.3_
  - [x] 33.2 Implement network status detection

    - Add online/offline event listeners
    - Display visual indicator for offline status
    - _Requirements: 27.1_

  - [x] 33.3 Implement automatic sync on reconnect

    - Sync pending transactions when online
    - Process in chronological order
    - Handle conflicts
    - _Requirements: 27.4, 27.5, 27.6_

  - [x] 33.4 Implement offline data caching

    - Cache products, customers, suppliers locally
    - Load from cache when offline

    - _Requirements: 27.2, 27.8_

  - [ ] 33.5 Restrict offline operations
    - Prevent delete, factory reset, user management when offline
    - _Requirements: 27.7_
  - [ ]* 33.6 Write property test for offline sync
    - **Property: Offline transactions sync correctly when online**
    - **Validates: Requirements 27.4**

- [x] 34. Implement Loading States



  - [x] 34.1 Add loading indicators to all API calls

    - Show spinner during API requests
    - Disable buttons during submission
    - _Requirements: 17.6_



- [x] 35. Create Documentation

  - [x] 35.1 Create docs/api_endpoints.md

    - Document all API endpoints with request/response examples
    - _Requirements: 21.3_

  - [x] 35.2 Create docs/integration_coverage.md

    - Create feature mapping table
    - Document frontend handlers to backend endpoints mapping
    - _Requirements: 21.6_

  - [x] 35.3 Create docs/integration_analysis.md

    - Document Model Map (Django models to TypeScript types)
    - Document Feature Map (handlers to endpoints)
    - _Requirements: 21.5_

  - [x] 35.4 Update README files

    - Update backend README with setup instructions
    - Update frontend README with API configuration
    - _Requirements: 18.3_


- [x] 36. Final Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

---

**Total Tasks:** 36 main tasks with 100+ sub-tasks
**Estimated Effort:** 40-60 hours
**Priority:** Phase 1-3 are critical, Phase 4-6 can be iterative

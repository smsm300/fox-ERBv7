import apiClient from './api';
import type {
  Product,
  Customer,
  Supplier,
  Transaction,
  Shift,
  Quotation,
  AppSettings,
  User,
  ActivityLogEntry,
  CartItem,
  PaymentMethod,
} from '../types';

export const productsAPI = {
  list: (params?: { category?: string; search?: string }) =>
    apiClient.get<Product[]>('/products/', { params }),
  
  create: (data: Omit<Product, 'id'>) =>
    apiClient.post<Product>('/products/', data),
  
  update: (id: number, data: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}/`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/products/${id}/`),
  
  adjustStock: (id: number, data: { quantity_diff: number; reason: string }) =>
    apiClient.post(`/products/${id}/adjust_stock/`, data),
};

export const customersAPI = {
  list: () =>
    apiClient.get<Customer[]>('/customers/'),
  
  create: (data: Omit<Customer, 'id' | 'balance'>) =>
    apiClient.post<Customer>('/customers/', data),
  
  update: (id: number, data: Partial<Customer>) =>
    apiClient.put<Customer>(`/customers/${id}/`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/customers/${id}/`),
  
  settleDebt: (id: number, data: { amount: number; payment_method: PaymentMethod }) =>
    apiClient.post(`/customers/${id}/settle_debt/`, data),
};

export const suppliersAPI = {
  list: () =>
    apiClient.get<Supplier[]>('/suppliers/'),
  
  create: (data: Omit<Supplier, 'id' | 'balance'>) =>
    apiClient.post<Supplier>('/suppliers/', data),
  
  update: (id: number, data: Partial<Supplier>) =>
    apiClient.put<Supplier>(`/suppliers/${id}/`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/suppliers/${id}/`),
  
  settleDebt: (id: number, data: { amount: number; payment_method: PaymentMethod }) =>
    apiClient.post(`/suppliers/${id}/settle_debt/`, data),
};

interface SaleRequest {
  customer_id: number;
  payment_method: PaymentMethod;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    discount: number;
  }>;
  total_amount: number;
  invoice_id?: string;
  is_direct_sale?: boolean;
}

interface PurchaseRequest {
  supplier_id: number;
  payment_method: PaymentMethod;
  items: Array<{
    id: number;
    quantity: number;
    cost_price: number;
  }>;
  total_amount: number;
}

interface ExpenseRequest {
  amount: number;
  category: string;
  description: string;
  payment_method: PaymentMethod;
}

interface CapitalRequest {
  amount: number;
  description: string;
}

interface WithdrawalRequest {
  amount: number;
  description: string;
}

export const transactionsAPI = {
  list: (params?: {
    type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    shift_id?: number;
    customer_id?: number;
    supplier_id?: number;
  }) =>
    apiClient.get<Transaction[]>('/transactions/', { params }),
  
  createSale: (data: SaleRequest) =>
    apiClient.post<Transaction>('/transactions/create_sale/', data),
  
  createPurchase: (data: PurchaseRequest) =>
    apiClient.post<Transaction>('/transactions/create_purchase/', data),
  
  createExpense: (data: ExpenseRequest) =>
    apiClient.post<Transaction>('/transactions/create_expense/', data),
  
  createCapital: (data: CapitalRequest) =>
    apiClient.post<Transaction>('/transactions/create_capital/', data),
  
  createWithdrawal: (data: WithdrawalRequest) =>
    apiClient.post<Transaction>('/transactions/create_withdrawal/', data),
  
  approve: (id: string) =>
    apiClient.put(`/transactions/${id}/approve/`),
  
  reject: (id: string) =>
    apiClient.put(`/transactions/${id}/reject/`),
  
  return: (id: string) =>
    apiClient.post(`/transactions/${id}/process_return/`),
};

export const shiftsAPI = {
  list: () =>
    apiClient.get<Shift[]>('/shifts/'),
  
  open: (startCash: number) =>
    apiClient.post<Shift>('/shifts/open/', { start_cash: startCash }),
  
  close: (id: number, endCash: number) =>
    apiClient.post<Shift>(`/shifts/${id}/close/`, { end_cash: endCash }),
};

export const quotationsAPI = {
  list: (params?: { status?: string; customer_id?: number }) =>
    apiClient.get<Quotation[]>('/quotations/', { params }),
  
  create: (data: {
    customer_id: number;
    items: Array<{
      id: number;
      quantity: number;
      price: number;
      discount: number;
    }>;
    total_amount: number;
  }) =>
    apiClient.post<Quotation>('/quotations/', data),
  
  convert: (id: string, data: { payment_method: PaymentMethod }) =>
    apiClient.post<Transaction>(`/quotations/${id}/convert/`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/quotations/${id}/`),
};

export const settingsAPI = {
  get: () =>
    apiClient.get<AppSettings>('/settings/'),
  
  update: (data: Partial<AppSettings>) =>
    apiClient.put<AppSettings>('/settings/', data),
};

export const usersAPI = {
  list: () =>
    apiClient.get<User[]>('/users/'),
  
  create: (data: { username: string; password: string; name: string; role: string }) =>
    apiClient.post<User>('/users/', data),
  
  delete: (id: number) =>
    apiClient.delete(`/users/${id}/`),
  
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.put('/users/me/change_password/', data),
};

export const activityLogAPI = {
  list: (params?: { from_date?: string; to_date?: string; user_id?: number }) =>
    apiClient.get<ActivityLogEntry[]>('/activity-logs/', { params }),
};

interface ReportParams {
  from_date?: string;
  to_date?: string;
}

export const reportsAPI = {
  sales: (params?: ReportParams) =>
    apiClient.get('/reports/sales/', { params }),
  
  inventory: () =>
    apiClient.get('/reports/inventory/'),
  
  treasury: (params?: ReportParams) =>
    apiClient.get('/reports/treasury/', { params }),
  
  debts: () =>
    apiClient.get('/reports/debts/'),
  
  profitLoss: (params?: ReportParams) =>
    apiClient.get('/reports/profit_loss/', { params }),
};

export const systemAPI = {
  backup: () =>
    apiClient.post('/system/backup/', {}, { responseType: 'blob' }),
  
  restore: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/system/restore/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  clearTransactions: () =>
    apiClient.post('/system/clear_transactions/'),
  
  factoryReset: () =>
    apiClient.post('/system/factory_reset/'),
};

export const authAPI = {
  login: (username: string, password: string) =>
    apiClient.post<{ access: string; refresh: string; user: User }>('/auth/login/', {
      username,
      password,
    }),
  
  logout: () =>
    apiClient.post('/auth/logout/'),
};

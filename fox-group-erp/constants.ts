
import { Product, ProductUnit, Customer, Supplier, Transaction, TransactionType, PaymentMethod, AppSettings, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'FOX Decoration Home',
  companyPhone: '01112223334',
  companyAddress: 'القاهرة - مصر',
  logoUrl: (import.meta as unknown as { env: Record<string, string> }).env.VITE_LOGO_URL || '/fox-logo.png',
  autoPrint: false,
  nextInvoiceNumber: 1002,
  openingBalance: 50000,
  taxRate: 14,
  currentShiftId: undefined,
  preventNegativeStock: false,
  invoiceTerms: 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بحالتها الأصلية. تطبق الشروط والأحكام.'
};

export const INITIAL_USERS: User[] = [];

export const APP_SECTIONS = {
  DASHBOARD: 'dashboard',
  SALES: 'sales',
  PURCHASES: 'purchases',
  INVENTORY: 'inventory',
  QUOTATIONS: 'quotations',
  INVOICES: 'invoices',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  TREASURY: 'treasury',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USERS: 'users'
};

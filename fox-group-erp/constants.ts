
import { Product, ProductUnit, Customer, Supplier, Transaction, TransactionType, PaymentMethod, AppSettings, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'FOX GROUP',
  companyPhone: '01112223334',
  companyAddress: 'القاهرة - مصر',
  logoUrl: 'https://foxgroup-egy.com/wp-content/uploads/2022/03/logo.png', // Official Logo
  autoPrint: false,
  nextInvoiceNumber: 1002,
  openingBalance: 50000,
  taxRate: 14, // Default VAT 14%
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
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  TREASURY: 'treasury',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USERS: 'users'
};

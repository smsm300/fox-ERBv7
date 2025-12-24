// Products
export {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useAdjustStock,
    productKeys
} from './useProducts';

// Customers
export {
    useCustomers,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
    useSettleCustomerDebt,
    customerKeys
} from './useCustomers';

// Suppliers
export {
    useSuppliers,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
    useSettleSupplierDebt,
    supplierKeys
} from './useSuppliers';

// Transactions
export {
    useTransactions,
    useCreateSale,
    useCreatePurchase,
    useCreateExpense,
    useCreateCapital,
    useCreateWithdrawal,
    useApproveTransaction,
    useRejectTransaction,
    useProcessReturn,
    transactionKeys
} from './useTransactions';

// Shifts
export {
    useShifts,
    useOpenShift,
    useCloseShift,
    shiftKeys
} from './useShifts';

// Quotations
export {
    useQuotations,
    useCreateQuotation,
    useConvertQuotation,
    useDeleteQuotation,
    quotationKeys
} from './useQuotations';

// Settings
export {
    useSettings,
    useUpdateSettings,
    settingsKeys
} from './useSettings';

// Users
export {
    useUsers,
    useCreateUser,
    useDeleteUser,
    useChangePassword,
    userKeys
} from './useUsers';

// Other hooks
export { useAutoLogout } from './useAutoLogout';
export { useDebounce } from './useDebounce';
export { useReportsData } from './useReportsData';
export { useTreasuryBalance } from './useTreasuryBalance';

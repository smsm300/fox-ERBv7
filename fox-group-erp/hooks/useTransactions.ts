import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../services/endpoints';
import { Transaction, CartItem, PaymentMethod } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const transactionKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...transactionKeys.lists(), filters] as const,
};

// Helper to extract list data
const getListData = (response: any) => {
    if (response.data && Array.isArray(response.data)) {
        return response.data;
    }
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
    }
    return [];
};

/**
 * Hook to fetch all transactions
 */
export const useTransactions = (filters?: {
    type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    shift_id?: number;
}) => {
    return useQuery({
        queryKey: transactionKeys.list(filters || {}),
        queryFn: async () => {
            const response = await transactionsAPI.list(filters);
            return getListData(response) as Transaction[];
        },
        staleTime: 2 * 60 * 1000, // 2 minutes (transactions change more frequently)
    });
};

/**
 * Hook to create a sale
 */
export const useCreateSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            customer_id: number;
            payment_method: PaymentMethod;
            items: Array<{ id: number; quantity: number; price: number; discount: number }>;
            total_amount: number;
            invoice_id?: string;
            is_direct_sale?: boolean;
            discount_amount?: number;
        }) => {
            const response = await transactionsAPI.createSale(data);
            return response.data as Transaction;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            // Don't show toast here - let the calling component handle it for invoice display
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to create a purchase
 */
export const useCreatePurchase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            supplier_id: number;
            payment_method: PaymentMethod;
            items: Array<{ id: number; quantity: number; cost_price: number }>;
            total_amount: number;
        }) => {
            const response = await transactionsAPI.createPurchase(data);
            return response.data as Transaction;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            showToast.success('تم حفظ فاتورة الشراء وتحديث المخزون');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to create an expense
 */
export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            amount: number;
            category: string;
            description: string;
            payment_method: PaymentMethod;
        }) => {
            const response = await transactionsAPI.createExpense(data);
            return response.data as Transaction;
        },
        onSuccess: (transaction) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            if (transaction.status === 'pending') {
                showToast.warning('تم تسجيل الطلب، بانتظار موافقة المدير');
            } else {
                showToast.success('تم تسجيل المصروف بنجاح');
            }
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to create capital deposit
 */
export const useCreateCapital = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { amount: number; description: string }) => {
            const response = await transactionsAPI.createCapital(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            showToast.success('تم إيداع رأس المال بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to create withdrawal
 */
export const useCreateWithdrawal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { amount: number; description: string }) => {
            const response = await transactionsAPI.createWithdrawal(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            showToast.success('تم تسجيل المسحوبات بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to approve a transaction
 */
export const useApproveTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await transactionsAPI.approve(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            showToast.success('تمت الموافقة على المعاملة');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to reject a transaction
 */
export const useRejectTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await transactionsAPI.reject(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            showToast.success('تم رفض المعاملة');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to process return
 */
export const useProcessReturn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await transactionsAPI.return(id);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            showToast.success('تم تسجيل المرتجع وتحديث الحسابات');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

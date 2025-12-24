import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsAPI } from '../services/endpoints';
import { Quotation, PaymentMethod, CartItem } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const quotationKeys = {
    all: ['quotations'] as const,
    lists: () => [...quotationKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...quotationKeys.lists(), filters] as const,
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
 * Hook to fetch all quotations
 */
export const useQuotations = (filters?: { status?: string; customer_id?: number }) => {
    return useQuery({
        queryKey: quotationKeys.list(filters || {}),
        queryFn: async () => {
            const response = await quotationsAPI.list(filters);
            return getListData(response) as Quotation[];
        },
        staleTime: 3 * 60 * 1000,
    });
};

/**
 * Hook to create a quotation
 */
export const useCreateQuotation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            customer_id: number;
            items: Array<{ id: number; quantity: number; price: number; discount: number }>;
            total_amount: number;
        }) => {
            const response = await quotationsAPI.create(data);
            return response.data as Quotation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
            showToast.success('تم إنشاء عرض السعر بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to convert quotation to invoice
 */
export const useConvertQuotation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, paymentMethod }: { id: string; paymentMethod: PaymentMethod }) => {
            const response = await quotationsAPI.convert(id, { payment_method: paymentMethod });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            showToast.success('تم تحويل عرض السعر إلى فاتورة بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to delete a quotation
 */
export const useDeleteQuotation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await quotationsAPI.delete(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
            showToast.success('تم حذف عرض السعر بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

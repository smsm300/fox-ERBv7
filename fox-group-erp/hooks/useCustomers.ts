import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '../services/endpoints';
import { Customer, PaymentMethod } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const customerKeys = {
    all: ['customers'] as const,
    lists: () => [...customerKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...customerKeys.lists(), filters] as const,
    details: () => [...customerKeys.all, 'detail'] as const,
    detail: (id: number) => [...customerKeys.details(), id] as const,
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
 * Hook to fetch all customers
 */
export const useCustomers = () => {
    return useQuery({
        queryKey: customerKeys.lists(),
        queryFn: async () => {
            const response = await customersAPI.list();
            return getListData(response) as Customer[];
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to create a new customer
 */
export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Customer, 'id' | 'balance'>) => {
            const response = await customersAPI.create(data);
            return response.data as Customer;
        },
        onSuccess: (newCustomer) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            showToast.success(`تم إضافة العميل "${newCustomer.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to update a customer
 */
export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Customer> }) => {
            const response = await customersAPI.update(id, data);
            return response.data as Customer;
        },
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            showToast.success(`تم تحديث العميل "${updatedCustomer.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to delete a customer
 */
export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await customersAPI.delete(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            showToast.success('تم حذف العميل بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to settle customer debt
 */
export const useSettleCustomerDebt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: { amount: number; payment_method: PaymentMethod };
        }) => {
            const response = await customersAPI.settleDebt(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            showToast.success('تم تسوية المديونية بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersAPI } from '../services/endpoints';
import { Supplier, PaymentMethod } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const supplierKeys = {
    all: ['suppliers'] as const,
    lists: () => [...supplierKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...supplierKeys.lists(), filters] as const,
    details: () => [...supplierKeys.all, 'detail'] as const,
    detail: (id: number) => [...supplierKeys.details(), id] as const,
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
 * Hook to fetch all suppliers
 */
export const useSuppliers = () => {
    return useQuery({
        queryKey: supplierKeys.lists(),
        queryFn: async () => {
            const response = await suppliersAPI.list();
            return getListData(response) as Supplier[];
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to create a new supplier
 */
export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Supplier, 'id' | 'balance'>) => {
            const response = await suppliersAPI.create(data);
            return response.data as Supplier;
        },
        onSuccess: (newSupplier) => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            showToast.success(`تم إضافة المورد "${newSupplier.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to update a supplier
 */
export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Supplier> }) => {
            const response = await suppliersAPI.update(id, data);
            return response.data as Supplier;
        },
        onSuccess: (updatedSupplier) => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            showToast.success(`تم تحديث المورد "${updatedSupplier.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to delete a supplier
 */
export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await suppliersAPI.delete(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            showToast.success('تم حذف المورد بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to settle supplier debt
 */
export const useSettleSupplierDebt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: { amount: number; payment_method: PaymentMethod };
        }) => {
            const response = await suppliersAPI.settleDebt(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            showToast.success('تم سداد المديونية بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

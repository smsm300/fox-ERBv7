import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../services/endpoints';
import { Product } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
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
 * Hook to fetch all products
 */
export const useProducts = (filters?: { category?: string; search?: string }) => {
    return useQuery({
        queryKey: productKeys.list(filters || {}),
        queryFn: async () => {
            const response = await productsAPI.list(filters);
            return getListData(response) as Product[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Product, 'id'>) => {
            const response = await productsAPI.create(data);
            return response.data as Product;
        },
        onSuccess: (newProduct) => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            showToast.success(`تم إضافة المنتج "${newProduct.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
            const response = await productsAPI.update(id, data);
            return response.data as Product;
        },
        onSuccess: (updatedProduct) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
            showToast.success(`تم تحديث المنتج "${updatedProduct.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await productsAPI.delete(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            showToast.success('تم حذف المنتج بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to adjust stock
 */
export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: { quantity_diff: number; reason: string };
        }) => {
            const response = await productsAPI.adjustStock(id, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            showToast.success('تم تعديل المخزون بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/endpoints';
import { AppSettings } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const settingsKeys = {
    all: ['settings'] as const,
};

/**
 * Hook to fetch settings
 */
export const useSettings = () => {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: async () => {
            const response = await settingsAPI.get();
            return response.data as AppSettings;
        },
        staleTime: 10 * 60 * 1000, // Settings don't change often
    });
};

/**
 * Hook to update settings
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<AppSettings>) => {
            const response = await settingsAPI.update(data);
            return response.data as AppSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
            showToast.success('تم حفظ الإعدادات بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

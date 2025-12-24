import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsAPI } from '../services/endpoints';
import { Shift } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const shiftKeys = {
    all: ['shifts'] as const,
    lists: () => [...shiftKeys.all, 'list'] as const,
    current: () => [...shiftKeys.all, 'current'] as const,
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
 * Hook to fetch all shifts
 */
export const useShifts = () => {
    return useQuery({
        queryKey: shiftKeys.lists(),
        queryFn: async () => {
            const response = await shiftsAPI.list();
            return getListData(response) as Shift[];
        },
        staleTime: 2 * 60 * 1000,
    });
};

/**
 * Hook to open a new shift
 */
export const useOpenShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (startCash: number) => {
            const response = await shiftsAPI.open(startCash);
            return response.data as Shift;
        },
        onSuccess: (newShift) => {
            queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
            showToast.success(`تم فتح الوردية برصيد ${newShift.startCash} ج.م`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to close a shift
 */
export const useCloseShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, endCash }: { id: number; endCash: number }) => {
            const response = await shiftsAPI.close(id, endCash);
            return response.data as Shift;
        },
        onSuccess: (closedShift) => {
            queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
            const diff = (closedShift.endCash || 0) - (closedShift.expectedCash || 0);
            const diffText = diff >= 0 ? `فائض ${diff}` : `عجز ${Math.abs(diff)}`;
            showToast.success(`تم إغلاق الوردية - ${diffText} ج.م`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../services/endpoints';
import { User } from '../types';
import { handleAPIError } from '../services/errorHandler';
import { showToast } from '../components/ui/Toast';

// Query Keys
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
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
 * Hook to fetch all users
 */
export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const response = await usersAPI.list();
            return getListData(response) as User[];
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { username: string; password: string; name: string; role: string }) => {
            const response = await usersAPI.create(data);
            return response.data as User;
        },
        onSuccess: (newUser) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            showToast.success(`تم إضافة المستخدم "${newUser.name}" بنجاح`);
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await usersAPI.delete(id);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            showToast.success('تم حذف المستخدم بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: { old_password: string; new_password: string }) => {
            const response = await usersAPI.changePassword(data);
            return response.data;
        },
        onSuccess: () => {
            showToast.success('تم تغيير كلمة المرور بنجاح');
        },
        onError: (error: any) => {
            showToast.error(handleAPIError(error));
        },
    });
};

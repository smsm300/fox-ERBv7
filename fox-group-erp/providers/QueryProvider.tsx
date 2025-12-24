import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a client with optimized settings
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Retry delay
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus (useful for keeping data fresh)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect by default
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry failed mutations once
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;

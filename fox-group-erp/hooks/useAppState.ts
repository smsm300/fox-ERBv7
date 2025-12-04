// This hook is deprecated - we now load data directly from API in each component
// Keeping this file for backward compatibility but it's no longer used

export const useAppState = () => {
  console.warn('useAppState is deprecated - load data from API instead');
  return null;
};

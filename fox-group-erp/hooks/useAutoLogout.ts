import { useEffect, useRef, useCallback } from 'react';

interface UseAutoLogoutOptions {
  onLogout: () => void;
  inactivityTimeout?: number; // in milliseconds (default: 30 minutes)
  logoutOnBrowserClose?: boolean; // default: true
}

export const useAutoLogout = ({
  onLogout,
  inactivityTimeout = 30 * 60 * 1000, // 30 minutes default
  logoutOnBrowserClose = true
}: UseAutoLogoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset inactivity timer
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Auto logout due to inactivity');
      onLogout();
    }, inactivityTimeout);
  }, [inactivityTimeout, onLogout]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  // Handle browser close/refresh
  useEffect(() => {
    if (!logoutOnBrowserClose) return;

    const handleBeforeUnload = () => {
      // Mark session as ended
      sessionStorage.setItem('fox_erp_session_ended', 'true');
    };

    const handleLoad = () => {
      // Check if this is a new session (browser was closed)
      const sessionEnded = sessionStorage.getItem('fox_erp_session_ended');
      
      if (sessionEnded === 'true') {
        // This is a page refresh, not a new session
        sessionStorage.removeItem('fox_erp_session_ended');
      } else {
        // This is a new session (browser was closed and reopened)
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Auto logout: Browser was closed');
          onLogout();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    handleLoad(); // Check on mount

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logoutOnBrowserClose, onLogout]);

  // Visibility change detection (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - store the time
        sessionStorage.setItem('fox_erp_hidden_time', Date.now().toString());
      } else {
        // Tab is visible again - check how long it was hidden
        const hiddenTime = sessionStorage.getItem('fox_erp_hidden_time');
        if (hiddenTime) {
          const elapsed = Date.now() - parseInt(hiddenTime);
          if (elapsed > inactivityTimeout) {
            console.log('Auto logout: Tab was hidden too long');
            onLogout();
          } else {
            // Reset timer if still within timeout
            resetTimer();
          }
          sessionStorage.removeItem('fox_erp_hidden_time');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [inactivityTimeout, onLogout, resetTimer]);

  return { resetTimer };
};

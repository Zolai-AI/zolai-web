'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to get CSRF token for forms and API calls
 * Fetches token from server on mount
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  /**
   * Helper to add CSRF token to fetch requests
   */
  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!token) throw new Error('CSRF token not loaded');
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
        credentials: 'include',
      });
    },
    [token]
  );

  return { token, loading, fetchWithCSRF };
}

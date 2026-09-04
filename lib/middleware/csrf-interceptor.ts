/**
 * CSRF Token Interceptor
 * Automatically adds CSRF token to all fetch requests
 * Call this in your app layout to enable global CSRF protection
 */

let csrfToken: string | null = null;

/**
 * Initialize CSRF interceptor
 * Fetches token once and caches it
 */
export async function initCSRFInterceptor() {
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.token;
      return csrfToken;
    }
  } catch (error) {
    console.error('Failed to initialize CSRF interceptor:', error);
  }
  
  return null;
}

/**
 * Get cached CSRF token
 */
export function getCSRFToken(): string | null {
  return csrfToken;
}

/**
 * Intercept fetch to add CSRF token
 * Usage: window.fetch = interceptFetch(window.fetch)
 */
export function interceptFetch(originalFetch: typeof fetch) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (!csrfToken) {
        await initCSRFInterceptor();
      }
      
      if (csrfToken) {
        const existing = new Headers(init?.headers);
        existing.set('X-CSRF-Token', csrfToken);
        init = { ...init, headers: existing };
      }
    }
    
    return originalFetch(input, init);
  };
}

/**
 * Setup CSRF interceptor in browser
 * Call this in your root layout useEffect
 */
export function setupCSRFInterceptor() {
  if (typeof window === 'undefined') return;
  
  // Initialize token
  initCSRFInterceptor();
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = interceptFetch(originalFetch) as typeof fetch;
}

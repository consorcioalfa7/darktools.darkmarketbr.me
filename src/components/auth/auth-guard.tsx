'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, Terminal } from 'lucide-react';
import type { ValidateResponse } from '@/lib/types/auth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/dark-cards-validateur', '/database'];

// Helper function to check auth (synchronous)
function getAuthStatus(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('darktools_session');
  const expiry = localStorage.getItem('darktools_session_expiry');
  
  if (!token || !expiry) return false;
  
  const expiryDate = new Date(expiry);
  if (expiryDate < new Date()) {
    localStorage.removeItem('darktools_session');
    localStorage.removeItem('darktools_session_expiry');
    return false;
  }
  
  return true;
}

// Custom hook to subscribe to localStorage changes
function useLocalStorageSubscription() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => true // Return snapshot
  );
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Use useSyncExternalStore for SSR-safe localStorage access
  const mounted = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => true,
    () => false
  );

  // Calculate derived state
  const isAuthenticated = useMemo(() => {
    if (!mounted) return false;
    return getAuthStatus();
  }, [mounted]);

  const isPublicRoute = useMemo(() => {
    if (!pathname) return false;
    return PUBLIC_ROUTES.some(route => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    });
  }, [pathname]);

  const shouldRedirect = mounted && !isPublicRoute && !isAuthenticated;

  // Handle redirect with a separate effect for side effects only
  if (shouldRedirect && typeof window !== 'undefined') {
    // Use setTimeout to defer the navigation
    setTimeout(() => {
      router.push('/login');
    }, 0);
  }

  // Loading state
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border border-red-600/50 animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm animate-pulse">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">A redirecionar para login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to use authentication state
export function useAuth() {
  const mounted = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => true,
    () => false
  );

  const isAuthenticated = useMemo(() => {
    if (!mounted) return null;
    return getAuthStatus();
  }, [mounted]);

  const login = useCallback(async (token: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.darkmarketbr.me';
      
      const response = await fetch(`${apiUrl}/api/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: token }), // Enviar 'code' em vez de 'token'
      });

      const data: ValidateResponse = await response.json().catch(() => ({ valid: false }));

      if (response.ok && data.valid && data.data) {
        // Usar dados da resposta da API (campos em camelCase)
        const { code, planId, expiresAt, createdAt } = data.data;
        
        localStorage.setItem('darktools_session', code);
        localStorage.setItem('darktools_session_expiry', expiresAt);
        localStorage.setItem('darktools_session_plan', planId);
        localStorage.setItem('darktools_session_created', createdAt);
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('darktools_session');
    localStorage.removeItem('darktools_session_expiry');
    localStorage.removeItem('darktools_session_plan');
    localStorage.removeItem('darktools_session_created');
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage'));
  }, []);

  return { isAuthenticated, login, logout };
}

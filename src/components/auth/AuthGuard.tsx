'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback = <div>Loading...</div>, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the current path as intended destination
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams();
      if (currentPath !== '/') {
        searchParams.set('redirect', currentPath);
      }
      const loginUrl = `${redirectTo}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ 
  children, 
  redirectTo = '/' 
}: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
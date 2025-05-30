'use client';

import { useAuth, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { logout, isLoading } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">TODO App</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span className="font-medium">{user.username}</span>
            <span className="text-muted-foreground">({user.email})</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            loading={isLoading}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
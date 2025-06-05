'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { Button, ThemeToggle, LanguageSwitcher } from '@/components/ui';
import { LogOut, User, Settings } from 'lucide-react';

export function Header() {
  const t = useTranslations();
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
          <h1 className="text-xl font-bold">{t('app.title')}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span className="font-medium">{user.username}</span>
          </div>
          
          <LanguageSwitcher />
          <ThemeToggle />
          
          <Link href="/profile">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Settings className="h-4 w-4" />}
            >
              {t('header.profile')}
            </Button>
          </Link>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            loading={isLoading}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            {t('header.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}
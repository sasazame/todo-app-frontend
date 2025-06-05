'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { 
  Home, 
  CheckSquare, 
  Archive, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Star
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      href: '/',
      label: t('nav.home'),
      icon: <Home className="h-5 w-5" />
    },
    {
      href: '/todos',
      label: t('nav.todos'),
      icon: <CheckSquare className="h-5 w-5" />
    },
    {
      href: '/calendar',
      label: t('nav.calendar'),
      icon: <Calendar className="h-5 w-5" />
    },
    {
      href: '/tags',
      label: t('nav.tags'),
      icon: <Tag className="h-5 w-5" />
    },
    {
      href: '/starred',
      label: t('nav.starred'),
      icon: <Star className="h-5 w-5" />
    },
    {
      href: '/archive',
      label: t('nav.archive'),
      icon: <Archive className="h-5 w-5" />
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      href: '/settings',
      label: t('nav.settings'),
      icon: <Settings className="h-5 w-5" />
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 transition-all duration-300 ease-in-out hidden md:block",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive(item.href)
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn(
                "transition-transform duration-200",
                isActive(item.href) && "scale-110"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom navigation */}
        <nav className="px-3 py-4 border-t border-white/20 dark:border-gray-700/20 space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive(item.href)
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn(
                "transition-transform duration-200",
                isActive(item.href) && "scale-110"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
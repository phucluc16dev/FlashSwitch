import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { StatusBar } from '@/components/StatusBar';
import {
  LayoutDashboard,
  Settings,
  Network,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Info,
  Bot,
  SquareTerminal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Initialize state from localStorage if available, default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const navItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: t('nav.accounts'),
    },
    {
      to: '/proxy',
      icon: Network,
      label: t('nav.proxy', 'API Proxy'),
    },
    {
      to: '/settings',
      icon: Settings,
      label: t('nav.settings'),
    },
    {
      to: '/info',
      icon: Info,
      label: t('nav.info'),
    },
    {
      to: '/skill-agent',
      icon: Bot,
      label: t('nav.skill_agent'),
    },
    {
      to: '/mcp',
      icon: SquareTerminal,
      label: 'MCP UI',
    },
  ];

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-muted/10 group relative flex flex-col border-r transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-[70px]' : 'w-64',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="bg-background hover:bg-accent hover:text-accent-foreground absolute top-6 -right-3 z-10 h-6 w-6 rounded-full border opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>

          <div className={cn('flex flex-col', isCollapsed ? 'items-center p-4' : 'p-6')}>
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="text-primary flex h-8 w-8 shrink-0 items-center justify-center">
                <svg height="32" color="var(--mui-palette-primary-main)" fill="none" viewBox="0 0 32 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M31.5104 19.7579L21.8869 15.4979L18.9112 0.474774C18.8479 0.149167 18.459 -0.113127 18.0972 0.0496763L9.25153 4.02931C9.10682 4.09262 8.98924 4.21925 8.93497 4.37301L0.17977 29.3271C0.0712341 29.6256 0.261171 29.9512 0.496332 30.0598L10.1198 34.3198L13.1317 49.5238C13.204 49.8946 13.602 50.1026 13.9457 49.9489L22.7913 45.9693C22.9089 45.915 23.0627 45.7612 23.1079 45.6256L31.8179 20.4815C31.9174 20.1921 31.7817 19.8755 31.5013 19.7489L31.5104 19.7579ZM9.95701 5.00613L17.3284 1.68675L9.11586 25.1033L1.74449 28.4227L9.95701 5.00613ZM9.58618 26.1887L18.052 29.9331L10.6444 33.2706L2.17863 29.5261L9.58618 26.1887ZM11.3137 34.2565L19.065 30.7652L21.8959 45.0919L14.1447 48.5832L11.3137 34.2565Z" fill="currentColor"></path></svg>
              </div>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                )}
              >
                <h1 className="text-xl font-bold tracking-tight">FlashSwitch</h1>
              </div>
            </div>
            <div
              className={cn(
                'text-muted-foreground mt-1 overflow-hidden text-xs whitespace-nowrap transition-all duration-300',
                isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100',
              )}
            >
              Manager
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-2">
            <TooltipProvider>
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.to} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            'mx-auto flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </TooltipProvider>
          </nav>

          <div className="border-t p-2">
            <StatusBar isCollapsed={isCollapsed} />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

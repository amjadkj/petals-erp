'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissionsStore } from '@/lib/permissions/store';
import { buildNav } from '@/lib/permissions/navBuilder';
import { Tooltip } from '@/components/ui/Tooltip';
import { UserMenu } from './UserMenu';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { permissions, roleKey, sidebarExpanded, toggleSidebar, loadPermissions } =
    usePermissionsStore();

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Keyboard shortcut [ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '[' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const navItems = buildNav(permissions || {}, roleKey);

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-[#E6D8F1]/60 sticky top-0 h-screen z-30 transition-[width] duration-150 ease-out select-none',
        sidebarExpanded ? 'w-[240px]' : 'w-[72px]',
      )}
    >
      {/* Toggle button on edge */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute -right-3 top-20 z-40 w-6 h-6 rounded-full bg-white border border-[#D9D4DE] text-gray-500 hover:text-purple-600 hover:border-purple-600 shadow-sm flex items-center justify-center transition-colors"
      >
        {sidebarExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Header / Brand */}
      <div className="h-[88px] flex items-center px-4 border-b border-[#E6D8F1]/40 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-btn bg-white-600 flex items-center justify-center shrink-0">
            {/* <span className="font-quicksand font-bold text-white text-lg leading-none">P</span> */}
            <img src="/icons/logo.png" alt="" />
          </div>

          {sidebarExpanded && (
            <div className="flex flex-col min-w-0 transition-opacity duration-150">
              <span className="font-quicksand font-bold text-lg text-purple-600 leading-tight">
                Petals
              </span>
              <span className="text-[9px] tracking-wider text-gray-500 uppercase font-semibold leading-tight truncate">
                Child Dev Centre
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
        {sidebarExpanded && (
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Workspace
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center h-[44px] rounded-btn transition-colors font-medium text-sm',
                sidebarExpanded ? 'px-3 gap-3' : 'justify-center w-[46px] mx-auto',
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-800',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarExpanded && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (!sidebarExpanded) {
            return (
              <Tooltip key={item.href} label={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </div>

      {/* Bottom Block */}
      {/* <div className="p-3 border-t border-[#E6D8F1]/40 shrink-0 space-y-2">
        {sidebarExpanded ? (
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 h-[40px] rounded-btn bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Help &amp; support</span>
          </button>
        ) : (
          <Tooltip label="Help &amp; support" side="right">
            <button
              type="button"
              className="w-[46px] h-[40px] mx-auto flex items-center justify-center rounded-btn bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
              aria-label="Help and support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        <div className="pt-1">
          <UserMenu
            name="Priya Nair"
            role={roleKey ? roleKey.toLowerCase() : 'Director'}
            customTrigger={
              !sidebarExpanded ? (
                <div className="w-[46px] mx-auto flex justify-center py-1">
                  <Tooltip label="Priya Nair (Director)" side="right">
                    <div className="cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                        PN
                      </div>
                    </div>
                  </Tooltip>
                </div>
              ) : undefined
            }
          />
        </div>
      </div> */}
    </aside>
  );
}

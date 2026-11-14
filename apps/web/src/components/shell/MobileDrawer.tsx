'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissionsStore } from '@/lib/permissions/store';
import { buildNav } from '@/lib/permissions/navBuilder';
import { UserMenu } from './UserMenu';
import { X, HelpCircle } from 'lucide-react';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { permissions, roleKey } = usePermissionsStore();
  const prevPathname = React.useRef(pathname);

  // Close only when route actually changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = buildNav(permissions || {}, roleKey);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div className="relative w-[280px] max-w-[80vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Brand & Close */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E6D8F1]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-btn bg-purple-600 flex items-center justify-center">
              <span className="font-quicksand font-bold text-white text-base leading-none">P</span>
            </div>
            <div>
              <span className="font-quicksand font-bold text-base text-purple-600 leading-tight block">
                Petals ERP
              </span>
              <span className="text-[9px] tracking-wider text-gray-500 uppercase font-semibold block">
                Child Dev Centre
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-btn text-gray-400 hover:text-ink hover:bg-purple-50 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center h-[44px] px-3 gap-3 rounded-btn transition-colors font-medium text-sm',
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-800',
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Block */}
        <div className="p-4 border-t border-[#E6D8F1]/40 shrink-0 space-y-3">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 h-[40px] rounded-btn bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Help &amp; support</span>
          </button>

          <div className="pt-1">
            <UserMenu
              name="Priya Nair"
              role={roleKey ? roleKey.toLowerCase() : 'Director'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

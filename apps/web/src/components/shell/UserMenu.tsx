'use client';

import React, { ReactNode } from 'react';
import { Popover } from '@/components/ui/Popover';
import { Avatar } from '@/components/ui/Avatar';
import { authApi } from '@/lib/api/auth';
import { session } from '@/lib/auth/session';
import { usePermissionsStore } from '@/lib/permissions/store';
import { useRouter } from 'next/navigation';
import {
  User,
  KeyRound,
  ShieldCheck,
  Download,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export interface UserMenuProps {
  name?: string;
  role?: string;
  customTrigger?: ReactNode;
}

export function UserMenu({
  name = 'User',
  role = 'Staff',
  customTrigger,
}: UserMenuProps) {
  const router = useRouter();
  const resetStore = usePermissionsStore((s) => s.reset);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      session.clear();
      resetStore();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((c) => caches.delete(c)));
          } catch {
            // ignore
          }
        }
        window.location.href = '/login';
      } else {
        router.push('/login');
      }
    }
  };

  const defaultTrigger = (
    <div className="flex items-center gap-2 p-1.5 rounded-btn hover:bg-purple-50 transition-colors select-none">
      <Avatar name={name} size="sm" />
      <div className="hidden lg:flex flex-col text-left">
        <span className="text-xs font-semibold text-ink leading-tight">{name}</span>
        <span className="text-[11px] text-gray-500 capitalize leading-tight">{role.toLowerCase()}</span>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
    </div>
  );

  return (
    <Popover trigger={customTrigger || defaultTrigger} align="right">
      {({ close }) => (
        <div className="w-56 py-2 text-sm text-ink divide-y divide-[#E6D8F1]/40">
          <div className="px-4 py-2">
            <p className="font-semibold text-ink truncate">{name}</p>
            <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                close();
                router.push('/profile');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 transition-colors text-left"
            >
              <User className="w-4 h-4 text-purple-600" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                router.push('/profile?tab=password');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 transition-colors text-left"
            >
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Change password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                router.push('/profile?tab=2fa');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 transition-colors text-left"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>2FA settings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                window.dispatchEvent(new CustomEvent('prompt-pwa-install'));
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 transition-colors text-left"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>Install app</span>
            </button>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                close();
                handleSignOut();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-danger-bg/50 text-danger transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}

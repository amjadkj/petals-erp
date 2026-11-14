'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Header } from '@/components/shell/Header';
import { OfflineBanner } from '@/components/shell/OfflineBanner';
import { InstallBanner } from '@/components/shell/InstallBanner';
import { InactivityLock } from '@/components/shell/InactivityLock';
import { useAuthGuard } from '@/lib/auth/guards';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isChecking } = useAuthGuard();

  return (
    <div className="min-h-screen flex bg-white text-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <OfflineBanner />
        <InstallBanner />
        <main className="flex-1 p-4 md:p-8 bg-[#FAF8FB] overflow-y-auto">
          {isChecking ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-28 bg-white rounded-card border border-[#E6D8F1]/40" />
                <div className="h-28 bg-white rounded-card border border-[#E6D8F1]/40" />
                <div className="h-28 bg-white rounded-card border border-[#E6D8F1]/40" />
              </div>
              <div className="h-64 bg-white rounded-card border border-[#E6D8F1]/40" />
            </div>
          ) : (
            children
          )}
        </main>
        <InactivityLock />
      </div>
    </div>
  );
}

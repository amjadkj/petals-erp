'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Header } from '@/components/shell/Header';
import { OfflineBanner } from '@/components/shell/OfflineBanner';
import { InstallBanner } from '@/components/shell/InstallBanner';
import { InactivityLock } from '@/components/shell/InactivityLock';
import { useAuthGuard } from '@/lib/auth/guards';

export default function AppLayout({ children }: { children: ReactNode }) {
  useAuthGuard();

  return (
    <div className="min-h-screen flex bg-white text-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <OfflineBanner />
        <InstallBanner />
        <main className="flex-1 p-4 md:p-8 bg-[#FAF8FB] overflow-y-auto">
          {children}
        </main>
        <InactivityLock />
      </div>
    </div>
  );
}

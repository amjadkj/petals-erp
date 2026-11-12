'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="w-full bg-warning-bg border-b border-warning/30 px-4 py-2 text-warning flex items-center justify-center gap-2 text-xs md:text-sm font-medium animate-fade-in"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You&apos;re offline. Some features may be unavailable.</span>
    </div>
  );
}

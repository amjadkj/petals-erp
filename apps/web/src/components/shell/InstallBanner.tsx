'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check visit count
    const visits = parseInt(localStorage.getItem('petals.visitCount') || '0', 10) + 1;
    localStorage.setItem('petals.visitCount', visits.toString());

    const isDismissed = localStorage.getItem('petals.installDismissed') === 'true';

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show if visitCount >= 2 and not previously dismissed
      if (visits >= 2 && !isDismissed) {
        setShowBanner(true);
      }
    };

    const handleManualPrompt = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        alert(
          'To install Petals ERP on your device, tap Share or the browser menu and select "Add to Home Screen".',
        );
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('prompt-pwa-install', handleManualPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('prompt-pwa-install', handleManualPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('petals.installDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-purple-50 border-b border-purple-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs md:text-sm animate-fade-in">
      <div className="flex items-center gap-2 text-purple-800 font-medium">
        <Download className="w-4 h-4 text-purple-600 shrink-0" />
        <span>Install Petals ERP on your device for fast offline access.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={handleInstallClick} className="h-8 px-3 text-xs">
          Install App
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-btn text-purple-600 hover:text-purple-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

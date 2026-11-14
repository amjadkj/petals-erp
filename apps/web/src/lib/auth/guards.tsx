'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { session } from './session';
import { restoreSession } from '@/lib/api/fetcher';

/** Client hook: ensure authenticated session with silent refresh restore */
export function useAuthGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (session.getAccessToken()) {
        return;
      }

      setIsChecking(true);
      const ok = await restoreSession();
      if (!mounted) return;

      if (!ok) {
        router.replace('/login');
      } else {
        setIsChecking(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  return { isChecking };
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { session } from './session';

/** Client hook: redirect to /login if no access token */
export function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!session.getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);
}

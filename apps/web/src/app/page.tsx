'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { session } from '@/lib/auth/session';
import { usePermissionsStore } from '@/lib/permissions/store';
import { getFirstAccessiblePath } from '@/lib/permissions/navBuilder';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (session.getAccessToken()) {
      usePermissionsStore
        .getState()
        .loadPermissions()
        .then(() => {
          const perms = usePermissionsStore.getState().permissions;
          const role = usePermissionsStore.getState().roleKey || (session.getRoleKey() as any);
          router.replace(getFirstAccessiblePath(perms, role));
        })
        .catch(() => {
          router.replace('/dashboard');
        });
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
    </div>
  );
}

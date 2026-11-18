'use client';

import { ClientProfileView } from '@/features/client-profile';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function ClientProfilePage() {
  return (
    <ModuleGuard module={AppModule.CLIENTS} moduleName="Clients">
      <ClientProfileView />
    </ModuleGuard>
  );
}

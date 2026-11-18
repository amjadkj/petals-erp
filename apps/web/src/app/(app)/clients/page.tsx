'use client';

import { ClientsView } from '@/features/clients';
import { ModuleGuard } from '@/components/auth/ModuleGuard';
import { AppModule } from '@petals/types';

export default function ClientsPage() {
  return (
    <ModuleGuard module={AppModule.CLIENTS} moduleName="Clients">
      <ClientsView />
    </ModuleGuard>
  );
}

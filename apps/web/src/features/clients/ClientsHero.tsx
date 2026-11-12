'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Can } from '@/lib/permissions/Can';
import { AppModule, PermissionAction } from '@petals/types';
import { Download, Plus } from 'lucide-react';

interface ClientsHeroProps {
  onAddClient: () => void;
  onExport: () => void;
  selectedCount?: number;
}

export function ClientsHero({ onAddClient, onExport, selectedCount = 0 }: ClientsHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-3xl text-ink tracking-tight">
          Care begins with knowing each child.
        </h1>
        <p className="text-sm md:text-[15px] text-gray-500 mt-1 font-medium">
          Manage client details, care teams, and session attendance in one place.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          className="flex items-center gap-2 border-purple-200 text-purple-800 hover:bg-purple-50 h-9 px-3 text-xs md:text-sm"
        >
          <Download className="w-4 h-4" />
          <span>{selectedCount > 0 ? `Export (${selectedCount})` : 'Export'}</span>
        </Button>

        <Can module={AppModule.CLIENTS} action={PermissionAction.CREATE}>
          <Button
            type="button"
            variant="primary"
            onClick={onAddClient}
            className="flex items-center gap-2 h-9 px-3.5 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add client</span>
          </Button>
        </Can>
      </div>
    </div>
  );
}

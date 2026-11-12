'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Plus } from 'lucide-react';

interface LeadsHeroProps {
  onNewLead: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export function LeadsHero({
  onNewLead,
  onExport,
  isExporting = false,
}: LeadsHeroProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600 leading-tight">
          Every enquiry is a new beginning.
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Nurture family enquiries from the first hello to their first session.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </Button>

        <Button
          variant="primary"
          onClick={onNewLead}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ New lead</span>
        </Button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download, UserPlus } from 'lucide-react';

interface EmployeesHeroProps {
  onAddEmployee: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export function EmployeesHero({
  onAddEmployee,
  onExport,
  isExporting = false,
}: EmployeesHeroProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600 leading-tight">
          The people behind every milestone.
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Support your team, understand their workload, and celebrate their impact.
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
          onClick={onAddEmployee}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add employee</span>
        </Button>
      </div>
    </div>
  );
}

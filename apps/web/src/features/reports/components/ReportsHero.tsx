'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { FileText, Plus, BellRing, Download } from 'lucide-react';
import { RoleKey } from '@petals/types';

interface ReportsHeroProps {
  roleKey?: RoleKey | string | null;
  onNewReport?: () => void;
  onCheckOverdue?: () => void;
  isCheckingOverdue?: boolean;
}

export function ReportsHero({
  roleKey,
  onNewReport,
  onCheckOverdue,
  isCheckingOverdue = false,
}: ReportsHeroProps) {
  const isDirectorOrManager =
    roleKey === RoleKey.DIRECTOR || roleKey === RoleKey.MANAGER;
  const isTherapist = roleKey === RoleKey.THERAPIST;
  const isParent = roleKey === RoleKey.PARENT;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6D8F1]/40">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-btn">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600">
            {isParent
              ? "Your Child's Progress Reports"
              : isTherapist
              ? 'My Clinical Reports'
              : 'Clinical Reports'}
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {isParent
            ? 'Access and download completed clinical, assessment, and progress reports.'
            : isTherapist
            ? 'Manage drafts, submissions, and overdue clinical reports for your cases.'
            : 'Reports that help families see progress. Track due dates and shared milestones.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isDirectorOrManager && onCheckOverdue && (
          <Button
            variant="outline"
            onClick={onCheckOverdue}
            disabled={isCheckingOverdue}
            className="flex items-center gap-2"
          >
            <BellRing className="w-4 h-4 text-purple-600" />
            <span>{isCheckingOverdue ? 'Checking...' : 'Check Overdue'}</span>
          </Button>
        )}

        {(isTherapist || isDirectorOrManager) && onNewReport && (
          <Button
            variant="primary"
            onClick={onNewReport}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ New report</span>
          </Button>
        )}

        {isParent && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export / Print</span>
          </Button>
        )}
      </div>
    </div>
  );
}


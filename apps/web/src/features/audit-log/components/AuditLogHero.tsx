'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, FileClock, Download } from 'lucide-react';

interface AuditLogHeroProps {
  onExport?: () => void;
}

export function AuditLogHero({ onExport }: AuditLogHeroProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-[#E6D8F1]/40">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/role-access"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Role access / Audit log</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-btn">
              <FileClock className="w-5 h-5" />
            </div>
            <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600">
              Every change, accounted for.
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Who did what, and when · Immutable tamper-evident system audit log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onExport || (() => window.print())}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export audit trail</span>
          </Button>
        </div>
      </div>
    </div>
  );
}


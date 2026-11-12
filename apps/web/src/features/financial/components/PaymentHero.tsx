'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download, PlusCircle } from 'lucide-react';

interface PaymentHeroProps {
  onRecordPayment: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export function PaymentHero({
  onRecordPayment,
  onExport,
  isExporting = false,
}: PaymentHeroProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600 leading-tight">
          Clear balances. Continued care.
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track payments, issue receipts, and follow up with care.
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
          <span>{isExporting ? 'Preparing export...' : 'Export'}</span>
        </Button>

        {/* Record payment CTA MUST be TEAL primary per specification */}
        <Button
          variant="teal"
          onClick={onRecordPayment}
          className="flex items-center gap-2 font-semibold shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record payment</span>
        </Button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { FiltersSheet } from './FiltersSheet';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterBarProps {
  children: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  filterCount?: number;
  className?: string;
}

export function FilterBar({
  children,
  onApply,
  onReset,
  filterCount = 0,
  className,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Bar (>= 768px) */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {children}
      </div>

      {/* Mobile Collapsed Button (< 768px) */}
      <div className="md:hidden flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 h-10 px-3 text-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-[10px]">
              {filterCount}
            </span>
          )}
        </Button>

        <FiltersSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onApply={onApply}
          onReset={onReset}
        >
          {children}
        </FiltersSheet>
      </div>
    </div>
  );
}

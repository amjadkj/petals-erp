'use client';

import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui';
import { SlidersHorizontal } from 'lucide-react';

interface DashboardHeroProps {
  onConfigureWidgets: () => void;
  roleSubtitle?: string;
}

export function DashboardHero({ onConfigureWidgets, roleSubtitle }: DashboardHeroProps) {
  const todayFormatted = format(new Date(), 'EEEE, dd MMM yyyy');
  const subText = roleSubtitle || `${todayFormatted} · Here's how your centre is doing today.`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <h1 className="font-quicksand font-bold text-2xl md:text-3xl text-ink tracking-tight">
          A little progress, every day.
        </h1>
        <p className="text-sm md:text-[15px] text-gray-500 mt-1 font-medium">
          {subText}
        </p>
      </div>
      <div>
        <Button
          variant="outline"
          onClick={onConfigureWidgets}
          className="flex items-center gap-2 border-purple-200 text-purple-800 hover:bg-purple-50 h-9 px-3 text-xs md:text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Configure widgets</span>
        </Button>
      </div>
    </div>
  );
}

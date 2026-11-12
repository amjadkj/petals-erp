'use client';

import React, { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  label,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          aria-hidden={!visible}
          className={cn(
            'absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-ink rounded-btn whitespace-nowrap pointer-events-none shadow-md transition-opacity duration-150',
            sidePositions[side],
            className,
          )}
        >
          {label}
        </div>
      )}
    </div>
  );
}

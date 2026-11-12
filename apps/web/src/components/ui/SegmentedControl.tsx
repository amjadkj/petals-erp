'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl({
  value,
  onChange,
  options,
  className,
  size = 'md',
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex items-center p-1 bg-[#F5EFFA]/50 rounded-btn border border-[#E6D8F1]/40 gap-1',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-btn font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              isActive
                ? 'bg-purple-50 text-purple-600 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-ink',
              option.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

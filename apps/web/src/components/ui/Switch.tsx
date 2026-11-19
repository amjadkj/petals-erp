'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  className,
  id,
}: SwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            onChange(!checked);
          }
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-purple-600' : 'bg-gray-300',
          className,
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      {label && (
        <span
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'text-sm font-medium text-ink cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

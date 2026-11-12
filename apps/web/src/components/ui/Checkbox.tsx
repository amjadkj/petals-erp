'use client';

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          className={cn(
            'w-4 h-4 rounded text-purple-600 border-[#D9D4DE]',
            'focus:ring-2 focus:ring-purple-200 focus:ring-offset-0',
            'transition-colors',
            className,
          )}
          {...props}
        />
        {label && <span className="text-sm text-ink font-medium">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

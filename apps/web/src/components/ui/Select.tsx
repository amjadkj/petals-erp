'use client';

import React, { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      options,
      children,
      required,
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs md:text-sm font-medium text-ink flex items-center gap-1"
          >
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
              {leadingIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            required={required}
            disabled={disabled}
            className={cn(
              'w-full h-[44px] bg-white text-ink text-sm rounded-btn border border-[#D9D4DE] px-3.5 pr-10 appearance-none',
              'transition-colors duration-150',
              'focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200',
              'disabled:bg-[#EEEBF1] disabled:text-[#8E8B94] disabled:cursor-not-allowed',
              leadingIcon && 'pl-10',
              error && 'border-danger focus:border-danger focus:ring-danger-bg',
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <span className="text-xs text-danger">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-gray-500">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';

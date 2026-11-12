'use client';

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      required,
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
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
          <input
            id={inputId}
            ref={ref}
            required={required}
            disabled={disabled}
            className={cn(
              'w-full h-[44px] bg-white text-ink text-sm rounded-btn border border-[#D9D4DE] px-3.5',
              'transition-colors duration-150',
              'focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200',
              'disabled:bg-[#EEEBF1] disabled:text-[#8E8B94] disabled:cursor-not-allowed',
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger-bg',
              className,
            )}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 flex items-center text-gray-400">
              {trailingIcon}
            </div>
          )}
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

Input.displayName = 'Input';

'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'teal' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:ring-offset-1 select-none text-sm';
    const dimensions = 'h-[44px] px-4 rounded-btn';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-800 disabled:bg-[#EEEBF1] disabled:text-[#8E8B94] disabled:cursor-not-allowed',
      teal:
        'bg-teal-500 text-ink hover:bg-teal-700 hover:text-white disabled:bg-[#EEEBF1] disabled:text-[#8E8B94] disabled:cursor-not-allowed',
      outline:
        'bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 disabled:bg-[#EEEBF1] disabled:border-transparent disabled:text-[#8E8B94] disabled:cursor-not-allowed',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          dimensions,
          variants[variant],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

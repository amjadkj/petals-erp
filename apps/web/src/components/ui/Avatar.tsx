import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'purple' | 'teal';
  className?: string;
}

export function Avatar({
  name,
  size = 'md',
  variant,
  className,
}: AvatarProps) {
  // Generate 1-2 letter initials
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.substring(0, 2) || '?').toUpperCase();

  // If variant not specified, hash name to choose purple or teal
  const resolvedVariant =
    variant ??
    (name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 === 0
      ? 'purple'
      : 'teal');

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
  };

  const variantStyles = {
    purple: 'bg-purple-100 text-purple-800',
    teal: 'bg-teal-50 text-teal-700',
  };

  return (
    <div
      aria-label={name}
      className={cn(
        'rounded-full flex items-center justify-center font-medium select-none shrink-0',
        sizeStyles[size],
        variantStyles[resolvedVariant],
        className,
      )}
    >
      {initials}
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  variant?: 'card' | 'row' | 'text' | 'circle';
  className?: string;
  count?: number;
}

export function Skeleton({
  variant = 'text',
  className,
  count = 1,
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'h-32 w-full rounded-card border border-[#E6D8F1]/40';
      case 'row':
        return 'h-12 w-full rounded-btn';
      case 'circle':
        return 'w-10 h-10 rounded-full';
      case 'text':
      default:
        return 'h-4 w-full rounded';
    }
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn('bg-gray-200 animate-pulse', getVariantStyles(), className)}
    />
  ));

  if (count === 1) return elements[0];

  return <div className="space-y-2">{elements}</div>;
}

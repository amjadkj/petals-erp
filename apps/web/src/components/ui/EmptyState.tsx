import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  headline: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  headline,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full py-12 px-6 flex flex-col items-center justify-center text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
        {icon || <Sparkles className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="font-quicksand font-bold text-lg text-ink mb-1">{headline}</h3>
      {hint && <p className="text-sm text-gray-500 max-w-sm mb-6">{hint}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

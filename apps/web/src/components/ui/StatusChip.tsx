import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'attended'
  | 'paid'
  | 'active'
  | 'present'
  | 'approved'
  | 'scheduled'
  | 'on-leave'
  | 'on_leave'
  | 'pending'
  | 'late'
  | 'cancelled'
  | 'overdue'
  | 'advance';

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  label?: string;
}

export function StatusChip({ status, label, className, ...props }: StatusChipProps) {
  const normalized = status.toLowerCase().replace(/_/g, '-');

  let colorClasses = 'bg-gray-100 text-ink';

  if (['attended', 'paid', 'active', 'present', 'approved'].includes(normalized)) {
    colorClasses = 'bg-success-bg text-success';
  } else if (['scheduled', 'on-leave'].includes(normalized)) {
    colorClasses = 'bg-purple-100 text-purple-800';
  } else if (['pending', 'late'].includes(normalized)) {
    colorClasses = 'bg-warning-bg text-warning';
  } else if (['cancelled', 'overdue'].includes(normalized)) {
    colorClasses = 'bg-danger-bg text-danger';
  } else if (['advance'].includes(normalized)) {
    colorClasses = 'bg-teal-50 text-teal-700';
  }

  const displayLabel = label ?? status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-chip text-xs md:text-[13px] font-medium capitalize',
        colorClasses,
        className,
      )}
      {...props}
    >
      {displayLabel}
    </span>
  );
}

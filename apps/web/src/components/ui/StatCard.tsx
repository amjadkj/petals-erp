import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value?: string | number;
  helper?: string | ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  helper,
  icon,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        data-testid="stat-card-skeleton"
        className={cn(
          'bg-white border border-[#E6D8F1]/40 rounded-card p-5 animate-pulse flex flex-col justify-between h-[120px]',
          className,
        )}
      >
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-purple-100 rounded w-16 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-purple-600">{icon}</span>}
      </div>
      <div className="my-2">
        <span className="font-quicksand font-bold text-[32px] leading-tight text-purple-600">
          {value}
        </span>
      </div>
      {helper && (
        <div className="text-xs md:text-[13px] text-teal-700 font-medium truncate">
          {helper}
        </div>
      )}
    </div>
  );
}

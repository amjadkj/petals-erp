'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  isTitle?: boolean;
  isStatus?: boolean;
  isSecondary?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  isLoading = false,
  emptyState,
  className,
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total ? Math.min(page * pageSize, total) : data.length;

  const titleCol = columns.find((c) => c.isTitle) || columns[0];
  const statusCol = columns.find((c) => c.isStatus);
  const secondaryCols = columns.filter((c) => c.isSecondary || (!c.isTitle && !c.isStatus));

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-[#E6D8F1]/40 rounded-card p-4 animate-pulse space-y-4">
        <div className="h-10 bg-purple-50 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white border border-[#E6D8F1]/60 rounded-card p-8 flex items-center justify-center">
        {emptyState ?? (
          <p className="text-sm text-gray-500 font-medium">No records found.</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full flex flex-col', className)}>
      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block w-full bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-11">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none"
                  >
                    {col.header}
                  </th>
                ))}
                {onRowClick && <th className="w-10 px-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6D8F1]/30">
              {data.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'h-[48px] transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-purple-50/50' : '',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-sm text-ink">
                      {col.render
                        ? col.render(row)
                        : (row as Record<string, unknown>)[col.key] != null
                          ? String((row as Record<string, unknown>)[col.key])
                          : null}
                    </td>
                  ))}
                  {onRowClick && (
                    <td className="px-2 text-right text-gray-400">
                      <ChevronRight className="w-4 h-4 inline" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row, idx) => (
          <div
            key={keyExtractor(row, idx)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'bg-white border border-[#E6D8F1]/60 rounded-card p-4 transition-colors',
              onRowClick ? 'cursor-pointer active:bg-purple-50/40' : '',
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-semibold text-ink text-base">
                {titleCol.render
                  ? titleCol.render(row)
                  : String((row as Record<string, unknown>)[titleCol.key] ?? '')}
              </div>
              {statusCol && (
                <div>
                  {statusCol.render
                    ? statusCol.render(row)
                    : String((row as Record<string, unknown>)[statusCol.key] ?? '')}
                </div>
              )}
            </div>

            <div className="space-y-1">
              {secondaryCols.slice(0, 3).map((col) => (
                <div key={col.key} className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium text-gray-400 uppercase text-[11px]">{col.header}</span>
                  <span>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </span>
                </div>
              ))}
            </div>

            {onRowClick && (
              <div className="mt-3 pt-2 border-t border-[#E6D8F1]/40 flex items-center justify-end text-xs text-purple-600 font-medium">
                View details <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Offset Pagination Footer */}
      {total !== undefined && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 py-2">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-semibold text-ink">{startItem}</span>–
            <span className="font-semibold text-ink">{endItem}</span> of{' '}
            <span className="font-semibold text-ink">{total}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="p-1.5 rounded-btn border border-[#D9D4DE] text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                totalPages > 6 &&
                p > 2 &&
                p < totalPages - 1 &&
                Math.abs(p - page) > 1
              ) {
                if (p === 3 || p === totalPages - 2) {
                  return (
                    <span key={p} className="px-2 text-gray-400 text-xs">
                      …
                    </span>
                  );
                }
                return null;
              }

              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    'w-8 h-8 rounded-btn text-xs font-medium transition-colors',
                    isCurrent
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'border border-[#D9D4DE] text-gray-700 hover:bg-purple-50',
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="p-1.5 rounded-btn border border-[#D9D4DE] text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

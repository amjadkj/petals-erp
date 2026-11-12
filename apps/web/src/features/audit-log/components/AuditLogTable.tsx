'use client';

import React, { useState } from 'react';
import type { AuditLogDto } from '../types';
import { AuditLogDetailDrawer } from './AuditLogDetailDrawer';
import { Button, EmptyState } from '@/components/ui';
import {
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogTableProps {
  logs: AuditLogDto[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function AuditLogTable({
  logs,
  isLoading = false,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
}: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  const getActionBadgeClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('DEACTIVATE')) {
      return 'bg-danger-bg text-danger';
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) {
      return 'bg-success-bg text-success';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('PERMISSION')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="bg-white border border-[#E6D8F1]/40 rounded-card p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-purple-50 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8">
        <EmptyState
          headline="No audit logs recorded"
          hint="System events and user actions matching your filter criteria will appear here."
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-11 text-[11px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                <th className="px-4">Timestamp</th>
                <th className="px-4">User</th>
                <th className="px-4">Action</th>
                <th className="px-4">Target Entity</th>
                <th className="px-4">Summary</th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6D8F1]/30">
              {logs.map((log) => {
                const date = new Date(log.createdAt);

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="h-12 hover:bg-purple-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="px-4 whitespace-nowrap text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {format(date, 'dd MMM yyyy, HH:mm:ss')}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px]">
                          {log.user?.name ? log.user.name[0] : 'S'}
                        </div>
                        <span className="font-semibold text-ink text-sm group-hover:text-purple-600 transition-colors">
                          {log.user?.name ?? 'System'}
                        </span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-chip font-medium text-[11px] uppercase ${getActionBadgeClass(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Target Entity */}
                    <td className="px-4 font-medium text-ink">
                      {log.entity}
                    </td>

                    {/* Summary / Metadata Preview */}
                    <td className="px-4 text-gray-500 max-w-xs truncate">
                      {log.metadata
                        ? JSON.stringify(log.metadata)
                        : `Event on ${log.entity}`}
                    </td>

                    {/* Chevron */}
                    <td className="px-2 text-gray-400 group-hover:text-purple-600">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => {
          const date = new Date(log.createdAt);

          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card space-y-2 cursor-pointer hover:border-purple-300 transition-colors text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {log.user?.name ? log.user.name[0] : 'S'}
                  </div>
                  <div>
                    <span className="font-semibold text-ink text-sm block">
                      {log.user?.name ?? 'System'}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {log.entity}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-chip font-medium text-[10px] uppercase ${getActionBadgeClass(
                    log.action,
                  )}`}
                >
                  {log.action}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(date, 'dd MMM, HH:mm:ss')}
                </span>
                <span className="text-purple-600 flex items-center gap-0.5">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cursor Pagination: Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 flex items-center gap-2 text-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading more audit events...</span>
              </>
            ) : (
              <span>Load older records ↓</span>
            )}
          </Button>
        </div>
      )}

      {/* Drawer */}
      <AuditLogDetailDrawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}

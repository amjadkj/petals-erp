'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatusChip, Button, EmptyState } from '@/components/ui';
import { RoleKey, ReportStatus } from '@petals/types';
import type { ReportItemDto } from '../types';
import {
  ChevronRight,
  Download,
  BellRing,
  AlertTriangle,
  FileText,
  User,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportsTableProps {
  reports: ReportItemDto[];
  roleKey?: RoleKey | string | null;
  onSendReminder?: (report: ReportItemDto) => void;
  isLoading?: boolean;
}

export function ReportsTable({
  reports,
  roleKey,
  onSendReminder,
  isLoading = false,
}: ReportsTableProps) {
  const router = useRouter();
  const isParent = roleKey === RoleKey.PARENT;
  const isDirectorOrManager =
    roleKey === RoleKey.DIRECTOR || roleKey === RoleKey.MANAGER;

  const handleRowClick = (report: ReportItemDto) => {
    if (isParent) {
      if (report.fileUrl) {
        window.open(report.fileUrl, '_blank');
      } else {
        router.push(`/reports/${report.id}`);
      }
    } else {
      router.push(`/reports/${report.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E6D8F1]/40 rounded-card p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-purple-50 rounded" />
        <div className="h-14 bg-gray-100 rounded" />
        <div className="h-14 bg-gray-100 rounded" />
        <div className="h-14 bg-gray-100 rounded" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8">
        <EmptyState
          headline="No reports found"
          hint={
            isParent
              ? 'No clinical reports have been shared for your family yet.'
              : 'There are no reports matching your active filters.'
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-11 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                <th className="px-4">Client</th>
                <th className="px-4">Report Title & Type</th>
                <th className="px-4">Therapist</th>
                <th className="px-4">Due Date</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-right">Actions</th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6D8F1]/30">
              {reports.map((report) => {
                const now = new Date();
                const dueDate = report.dueOn ? new Date(report.dueOn) : null;
                const isOverdue =
                  Boolean(report.isOverdue ||
                  (dueDate &&
                    dueDate < now &&
                    report.status !== ReportStatus.SHARED));

                const overdueDays =
                  isOverdue && dueDate ? differenceInDays(now, dueDate) : 0;

                return (
                  <tr
                    key={report.id}
                    onClick={() => handleRowClick(report)}
                    className={cn(
                      'h-[56px] transition-colors cursor-pointer group',
                      isOverdue
                        ? 'bg-danger-bg/25 hover:bg-danger-bg/40'
                        : 'hover:bg-purple-50/50',
                    )}
                  >
                    {/* Client */}
                    <td className="px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink text-sm group-hover:text-purple-600 transition-colors">
                          {report.client?.name ?? 'Unknown Client'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {report.client?.clientCode ?? ''}
                        </span>
                      </div>
                    </td>

                    {/* Title & Type */}
                    <td className="px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-ink">
                          {report.title}
                        </span>
                        <span className="text-xs text-teal-700 capitalize">
                          {report.type.toLowerCase()}
                        </span>
                      </div>
                    </td>

                    {/* Therapist */}
                    <td className="px-4 text-sm text-gray-600">
                      {report.author?.user?.name ?? 'Staff Therapist'}
                    </td>

                    {/* Due Date & Overdue Marker */}
                    <td className="px-4 text-sm">
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            'font-medium',
                            isOverdue ? 'text-danger' : 'text-gray-600',
                          )}
                        >
                          {dueDate ? format(dueDate, 'dd MMM yyyy') : 'No due date'}
                        </span>
                        {isOverdue && (
                          <span className="text-[11px] font-semibold text-danger flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue by {Math.max(1, overdueDays)} day{overdueDays === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td className="px-4">
                      <StatusChip status={report.status} />
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {isOverdue && isDirectorOrManager && onSendReminder && (
                          <Button
                            variant="outline"
                            onClick={() => onSendReminder(report)}
                            className="h-8 px-2.5 text-xs border-danger text-danger hover:bg-danger-bg/50"
                          >
                            <BellRing className="w-3 h-3 mr-1" />
                            Send reminder
                          </Button>
                        )}

                        {isParent && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (report.fileUrl) {
                                window.open(report.fileUrl, '_blank');
                              } else {
                                router.push(`/reports/${report.id}`);
                              }
                            }}
                            className="h-8 px-2.5 text-xs flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </Button>
                        )}
                      </div>
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

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-3">
        {reports.map((report) => {
          const now = new Date();
          const dueDate = report.dueOn ? new Date(report.dueOn) : null;
          const isOverdue =
            Boolean(report.isOverdue ||
            (dueDate &&
              dueDate < now &&
              report.status !== ReportStatus.SHARED));

          const overdueDays =
            isOverdue && dueDate ? differenceInDays(now, dueDate) : 0;

          return (
            <div
              key={report.id}
              onClick={() => handleRowClick(report)}
              className={cn(
                'p-4 rounded-card border bg-white transition-all cursor-pointer space-y-3',
                isOverdue
                  ? 'border-danger/40 bg-danger-bg/15 shadow-sm'
                  : 'border-[#E6D8F1]/60',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-ink text-base">
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {report.client?.name} ({report.client?.clientCode ?? ''})
                  </p>
                </div>
                <StatusChip status={report.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{report.author?.user?.name ?? 'Therapist'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="capitalize">{report.type.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">
                  <span className="text-gray-500">Due: </span>
                  <span className={isOverdue ? 'text-danger font-semibold' : 'text-ink'}>
                    {dueDate ? format(dueDate, 'dd MMM yyyy') : 'No due date'}
                  </span>
                  {isOverdue && (
                    <span className="block text-[11px] text-danger font-bold">
                      Overdue by {Math.max(1, overdueDays)} days
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isOverdue && isDirectorOrManager && onSendReminder && (
                    <Button
                      variant="outline"
                      onClick={() => onSendReminder(report)}
                      className="h-8 px-2 text-xs border-danger text-danger"
                    >
                      Remind
                    </Button>
                  )}
                  {isParent && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (report.fileUrl) {
                          window.open(report.fileUrl, '_blank');
                        } else {
                          router.push(`/reports/${report.id}`);
                        }
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

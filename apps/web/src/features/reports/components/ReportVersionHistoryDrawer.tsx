'use client';

import React from 'react';
import { Drawer, StatusChip } from '@/components/ui';
import type { ReportActivityItem } from '@/lib/api/reports';
import { History, User, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ReportVersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ReportActivityItem[];
  isLoading?: boolean;
}

export function ReportVersionHistoryDrawer({
  isOpen,
  onClose,
  activities,
  isLoading = false,
}: ReportVersionHistoryDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <span>Report Activity & Versions</span>
        </div>
      }
      width="max-w-[440px]"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          All modifications, status changes, and parent sharing events are permanently recorded.
        </p>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-gray-100 rounded-btn" />
            <div className="h-16 bg-gray-100 rounded-btn" />
            <div className="h-16 bg-gray-100 rounded-btn" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 bg-purple-50/50 rounded-card">
            No activity history recorded yet for this report.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-purple-100">
            {activities.map((act) => {
              const date = new Date(act.createdAt);
              return (
                <div key={act.id} className="relative group">
                  {/* Node icon */}
                  <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-purple-600 border-2 border-white ring-2 ring-purple-100" />

                  <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-600">
                        {act.action}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(date, 'dd MMM yyyy, HH:mm')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{act.actor?.name ?? 'Staff member'}</span>
                    </div>

                    {(act.previousStatus || act.newStatus) && (
                      <div className="flex items-center gap-2 text-xs pt-1 border-t border-gray-100">
                        {act.previousStatus && (
                          <StatusChip status={act.previousStatus} />
                        )}
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        {act.newStatus && <StatusChip status={act.newStatus} />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}


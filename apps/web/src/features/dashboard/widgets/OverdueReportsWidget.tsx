'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bell, Check } from 'lucide-react';
import { useToast } from '@/components/ui';

export interface OverdueReportItem {
  id: string;
  clientName: string;
  clientCode?: string;
  type: string;
  therapistName: string;
  dueDate: string;
  isOverdue?: boolean;
}

interface OverdueReportsWidgetProps {
  reports?: OverdueReportItem[];
}

const DEFAULT_REPORTS: OverdueReportItem[] = [
  { id: '1', clientName: 'Aadhya Nair', clientCode: 'PN-001', type: 'Progress Report', therapistName: 'Dr. Ananya S.', dueDate: '28 Oct 2026', isOverdue: true },
  { id: '2', clientName: 'Vihaan Sharma', clientCode: 'PN-004', type: 'Assessment', therapistName: 'Rajesh M.', dueDate: '30 Oct 2026', isOverdue: true },
  { id: '3', clientName: 'Arjun Das', clientCode: 'PN-012', type: 'Treatment Plan', therapistName: 'Kavitha S.', dueDate: '02 Nov 2026', isOverdue: true },
];

export function OverdueReportsWidget({ reports = DEFAULT_REPORTS }: OverdueReportsWidgetProps) {
  const [remindedMap, setRemindedMap] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const handleSendReminder = (report: OverdueReportItem) => {
    setRemindedMap((prev) => ({ ...prev, [report.id]: true }));
    showToast(`Reminder sent to ${report.therapistName} for ${report.clientName}'s ${report.type}.`, 'success');
  };

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D8F1]/40 mb-3">
          <div>
            <h3 className="font-quicksand font-bold text-base text-ink">
              Overdue Reports
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Documentation needing therapist submission
            </p>
          </div>
          <Link
            href="/reports?overdue=true"
            className="text-xs md:text-sm font-semibold text-danger hover:text-danger/80 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reports.map((report) => {
              const reminded = !!remindedMap[report.id];
              return (
                <div
                  key={report.id}
                  className="p-3 bg-danger-bg/50 rounded-btn border border-danger/20 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-ink truncate">
                      {report.clientName}
                    </div>
                    <div className="text-xs text-danger font-medium mt-0.5">
                      {report.type} · {report.therapistName}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Due: {report.dueDate}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendReminder(report)}
                    disabled={reminded}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold bg-white border border-danger/30 text-danger hover:bg-danger hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
                  >
                    {reminded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Send reminder</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

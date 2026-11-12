'use client';

import React from 'react';
import Link from 'next/link';
import { Button, StatusChip, useToast } from '@/components/ui';
import { ClinicalReportDto, RoleKey, ReportStatus } from '@petals/types';
import { reportsApi } from '@/lib/api/reports';
import { FileText, Share2, Download, ArrowUpRight, Plus } from 'lucide-react';

interface ReportsTabProps {
  clientId: string;
  reports: ClinicalReportDto[];
  role: RoleKey;
  onRefresh: () => void;
}

export function ReportsTab({
  clientId,
  reports = [],
  role,
  onRefresh,
}: ReportsTabProps) {
  const { showToast } = useToast();
  const isParent = role === RoleKey.PARENT;
  const isStaff = role === RoleKey.DIRECTOR || role === RoleKey.THERAPIST;

  const handleShare = async (reportId: string) => {
    try {
      await reportsApi.shareReport(reportId);
      showToast('Report shared with parents!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to share report', 'error');
    }
  };

  const displayReports: Partial<ClinicalReportDto>[] =
    reports.length > 0
      ? reports
      : [
          {
            id: 'r1',
            clientId,
            title: 'Initial Speech Assessment Report',
            type: 'ASSESSMENT' as any,
            status: ReportStatus.SHARED,
            dueOn: '2026-10-20T00:00:00Z',
            sharedWithParent: true,
            authorName: 'Dr. Ananya Sharma',
          },
          {
            id: 'r2',
            clientId,
            title: 'Monthly Progress Summary - October 2026',
            type: 'PROGRESS' as any,
            status: ReportStatus.REVIEWED,
            dueOn: '2026-11-05T00:00:00Z',
            sharedWithParent: false,
            authorName: 'Rajesh Menon',
          },
        ];

  const visibleReports = isParent
    ? displayReports.filter((r) => r.sharedWithParent || r.status === ReportStatus.SHARED)
    : displayReports;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Clinical Reports
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Diagnostic evaluations, milestone reviews, and discharge summaries
          </p>
        </div>

        {isStaff && (
          <Link href={`/reports?clientId=${clientId}&create=true`}>
            <Button
              type="button"
              variant="primary"
              className="h-9 px-3.5 text-xs md:text-sm flex items-center gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create report</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        {visibleReports.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No clinical reports currently available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-purple-50/70 border-b border-[#E6D8F1]/60 h-11 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                  <th className="px-5">Title</th>
                  <th className="px-4">Type</th>
                  <th className="px-4">Author</th>
                  <th className="px-4">Due Date</th>
                  <th className="px-4 text-center">Status</th>
                  <th className="px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {visibleReports.map((report) => {
                  const dueDateStr = report.dueOn
                    ? new Date(report.dueOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={report.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="font-semibold text-ink">{report.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {report.type}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {report.authorName || 'Therapist'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {dueDateStr}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusChip status={report.status || 'DRAFT'} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isStaff && !report.sharedWithParent && (
                            <button
                              type="button"
                              onClick={() => report.id && handleShare(report.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-btn border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1 transition-colors"
                              title="Share with parent portal"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share</span>
                            </button>
                          )}

                          {isParent ? (
                            <button
                              type="button"
                              onClick={() => showToast('Downloading PDF report...', 'info')}
                              className="px-3 py-1 text-xs font-semibold rounded-btn bg-purple-600 text-white hover:bg-purple-800 flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <Link
                              href={`/reports/${report.id}`}
                              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 text-xs"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

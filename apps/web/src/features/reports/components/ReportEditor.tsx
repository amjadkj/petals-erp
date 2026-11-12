'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  StatusChip,
  Input,
  Select,
} from '@/components/ui';
import {
  ReportStatus,
  ReportType,
  RoleKey,
} from '@petals/types';
import type { ReportItemDto, ReportActivityItem } from '@/lib/api/reports';
import { reportsApi } from '@/lib/api/reports';
import { ShareReportModal } from './ShareReportModal';
import { ReportVersionHistoryDrawer } from './ReportVersionHistoryDrawer';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  Share2,
  History,
  FileText,
  Calendar,
  User,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';

interface ReportEditorProps {
  initialReport?: ReportItemDto;
  reportId?: string;
  roleKey?: RoleKey | string | null;
  activities?: ReportActivityItem[];
}

const defaultFallbackReport: ReportItemDto = {
  id: 'rep-default',
  clientId: 'c1',
  client: {
    id: 'c1',
    name: 'Aadhya Nair',
    clientCode: 'PTL-001',
  },
  title: 'Progress Evaluation Report',
  type: ReportType.PROGRESS,
  status: ReportStatus.SUBMITTED,
  dueOn: new Date().toISOString(),
  sharedWithParent: false,
  authorId: 'u1',
  authorName: 'Anu Menon',
  createdAt: new Date().toISOString(),
};

export function ReportEditor({
  initialReport,
  reportId,
  roleKey,
  activities = [],
}: ReportEditorProps) {
  const activeReport = initialReport ?? { ...defaultFallbackReport, id: reportId || defaultFallbackReport.id };
  const [report, setReport] = useState<ReportItemDto>(activeReport);
  const [title, setTitle] = useState(activeReport.title);
  const [type, setType] = useState<ReportType>(activeReport.type);
  const [dueOn, setDueOn] = useState(
    activeReport.dueOn ? activeReport.dueOn.split('T')[0] : '',
  );
  const [content, setContent] = useState(
    activeReport.content ??
      `## Summary of Progress\n\nChild continues to demonstrate encouraging improvements in fine motor coordination and social engagement.\n\n### Clinical Observations\n- Active participation during targeted therapy tasks.\n- Sustained attention span increased from 10 to 18 minutes.\n\n### Recommendations & Next Steps\n1. Continue bi-weekly sessions focused on sensory modulation.\n2. Home practice activities shared with family.`,
  );
  const [fileUrl, setFileUrl] = useState(activeReport.fileUrl ?? '');

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const isParent = roleKey === RoleKey.PARENT;
  const isDirectorOrManager =
    roleKey === RoleKey.DIRECTOR || roleKey === RoleKey.MANAGER;

  const canEdit = !isParent && report.status !== ReportStatus.SHARED;

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const res = await reportsApi.updateReport(report.id, {
        title,
        type,
        dueOn: dueOn || null,
        content,
        fileUrl: fileUrl || null,
      });
      setReport(res.data);
      setMessage({ type: 'success', text: 'Draft saved successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save report';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      const res = await reportsApi.updateReport(report.id, {
        title,
        type,
        dueOn: dueOn || null,
        content,
        fileUrl: fileUrl || null,
        status: ReportStatus.SUBMITTED,
      });
      setReport(res.data);
      setMessage({
        type: 'success',
        text: 'Report submitted for clinical review.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async () => {
    try {
      setIsReviewing(true);
      setMessage(null);
      const res = await reportsApi.updateReport(report.id, {
        status: ReportStatus.REVIEWED,
      });
      setReport(res.data);
      setMessage({
        type: 'success',
        text: 'Report reviewed and approved for parent sharing.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to review report';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleConfirmShare = async () => {
    try {
      setIsSharing(true);
      setMessage(null);
      const res = await reportsApi.shareReport(report.id);
      setReport(res.data.report);
      setShareModalOpen(false);
      setMessage({
        type: 'success',
        text: `Report shared with parent! ${res.data.notificationsQueued} notification(s) sent.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to share report';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSharing(false);
    }
  };

  const dueDate = report.dueOn ? new Date(report.dueOn) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Link>

        <div className="flex items-center gap-3">
          <StatusChip status={report.status} />
          <Button
            variant="outline"
            onClick={() => setHistoryDrawerOpen(true)}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Version History</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-btn text-sm font-medium ${
            message.type === 'success'
              ? 'bg-success-bg text-success'
              : 'bg-danger-bg text-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Metadata Card */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6D8F1]/40">
          <div>
            <h1 className="font-quicksand font-bold text-xl md:text-2xl text-ink">
              {report.title}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <span className="font-semibold text-purple-600">
                {report.client?.name ?? 'Client'}
              </span>
              <span>•</span>
              <span>{report.client?.clientCode ?? ''}</span>
              {report.client?.branch && (
                <>
                  <span>•</span>
                  <span>{report.client.branch.name}</span>
                </>
              )}
            </p>
          </div>

          {/* Status Flow Stepper */}
          <div className="flex items-center gap-1 text-xs">
            <span
              className={`px-2 py-1 rounded font-medium ${
                report.status === ReportStatus.DRAFT
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              1. Draft
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2 py-1 rounded font-medium ${
                report.status === ReportStatus.SUBMITTED
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              2. Submitted
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2 py-1 rounded font-medium ${
                report.status === ReportStatus.REVIEWED
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              3. Reviewed
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2 py-1 rounded font-medium ${
                report.status === ReportStatus.SHARED
                  ? 'bg-success-bg text-success'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              4. Shared
            </span>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>Author: </span>
            <span className="font-medium text-ink">
              {report.author?.user?.name ?? 'Therapist'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Target Due: </span>
            <span className="font-medium text-ink">
              {dueDate ? format(dueDate, 'dd MMM yyyy') : 'Not set'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Type: </span>
            <span className="font-medium text-ink capitalize">
              {report.type.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Main Content Card */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6 space-y-6">
        {canEdit ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Report Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select
              label="Report Type"
              required
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              options={[
                { value: ReportType.ASSESSMENT, label: 'Assessment' },
                { value: ReportType.PROGRESS, label: 'Progress Report' },
                { value: ReportType.DISCHARGE, label: 'Discharge Summary' },
                { value: ReportType.OTHER, label: 'Other' },
              ]}
            />
            <Input
              type="date"
              label="Target Due Date"
              value={dueOn}
              onChange={(e) => setDueOn(e.target.value)}
            />
            <Input
              label="Attached Document URL (optional)"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
        ) : null}

        {/* Content Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">
              Report Content & Observations
            </label>
            {report.fileUrl && (
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Attachment</span>
              </a>
            )}
          </div>

          {canEdit ? (
            <textarea
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-btn border border-[#D9D4DE] p-4 text-sm font-mono text-ink focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
              placeholder="Enter detailed clinical report text, developmental milestones, standardized test results, and recommendations..."
            />
          ) : (
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-btn whitespace-pre-wrap text-sm text-ink leading-relaxed font-sans">
              {content}
            </div>
          )}
        </div>

        {/* Desktop Action Buttons Bar */}
        {canEdit && (
          <div className="hidden md:flex items-center justify-between pt-6 border-t border-[#E6D8F1]/40">
            <div className="text-xs text-gray-400">
              Edits preserve original versions in the history log.
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save draft'}</span>
              </Button>

              {report.status === ReportStatus.DRAFT && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSaving}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
                </Button>
              )}

              {isDirectorOrManager && report.status === ReportStatus.SUBMITTED && (
                <Button
                  variant="teal"
                  onClick={handleReview}
                  disabled={isReviewing}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isReviewing ? 'Reviewing...' : 'Review & Approve'}</span>
                </Button>
              )}

              {isDirectorOrManager &&
                (report.status === ReportStatus.REVIEWED ||
                  report.status === ReportStatus.SUBMITTED) && (
                  <Button
                    variant="primary"
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share with parent</span>
                  </Button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {canEdit && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-[#E6D8F1] flex items-center justify-end gap-2 shadow-lg z-30">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex-1 text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Draft
          </Button>

          {report.status === ReportStatus.DRAFT && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Submit
            </Button>
          )}

          {isDirectorOrManager && report.status === ReportStatus.SUBMITTED && (
            <Button
              variant="teal"
              onClick={handleReview}
              disabled={isReviewing}
              className="flex-1 text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Approve
            </Button>
          )}

          {isDirectorOrManager &&
            (report.status === ReportStatus.REVIEWED ||
              report.status === ReportStatus.SUBMITTED) && (
              <Button
                variant="primary"
                onClick={() => setShareModalOpen(true)}
                className="flex-1 text-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                Share
              </Button>
            )}
        </div>
      )}

      {/* Share Confirmation Modal */}
      <ShareReportModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onConfirm={handleConfirmShare}
        reportTitle={report.title}
        clientName={report.client?.name}
        isLoading={isSharing}
      />

      {/* History Drawer */}
      <ReportVersionHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        activities={activities}
      />
    </div>
  );
}


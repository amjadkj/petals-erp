'use client';

import React from 'react';
import { StatusChip, Button, EmptyState } from '@/components/ui';
import { TemplateStatus, RoleKey } from '@petals/types';
import type { CommunicationTemplateDto } from '../types';
import {
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';

interface TemplatesTabProps {
  templates: CommunicationTemplateDto[];
  roleKey?: RoleKey | string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNewTemplate: () => void;
  isLoading?: boolean;
}

export function TemplatesTab({
  templates,
  roleKey,
  onApprove,
  onReject,
  onNewTemplate,
  isLoading = false,
}: TemplatesTabProps) {
  const isDirectorOrManager =
    roleKey === RoleKey.DIRECTOR || roleKey === RoleKey.MANAGER;

  return (
    <div className="space-y-4">
      {/* Notice header */}
      <div className="p-4 bg-purple-50/70 border border-[#E6D8F1]/60 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-ink">
            <span className="font-semibold text-purple-800">
              WhatsApp Compliance Rule:{' '}
            </span>
            Only approved templates can be used to dispatch transactional WhatsApp notifications.
            Clinical evaluations, test scores, or medical diagnostics must not be included.
          </div>
        </div>

        {isDirectorOrManager && (
          <Button
            variant="primary"
            onClick={onNewTemplate}
            className="h-9 px-3 text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create template</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-40 bg-white border border-[#E6D8F1]/40 rounded-card p-5" />
          <div className="h-40 bg-white border border-[#E6D8F1]/40 rounded-card p-5" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8">
          <EmptyState
            headline="No communication templates"
            hint="Create pre-approved WhatsApp and email templates for appointments, fee reminders, and milestones."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const isApproved = tpl.status === TemplateStatus.APPROVED;
            const isPending = tpl.status === TemplateStatus.PENDING_APPROVAL;
            const created = tpl.createdAt ? new Date(tpl.createdAt) : new Date();

            return (
              <div
                key={tpl.id}
                className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">
                        {tpl.name}
                      </h3>
                    </div>
                    <StatusChip status={tpl.status} />
                  </div>

                  {/* Body Preview */}
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn text-xs text-gray-700 whitespace-pre-wrap font-sans line-clamp-4 leading-relaxed">
                    {tpl.body}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6D8F1]/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Lang: {tpl.language.toUpperCase()}</span>
                    <span>Created {format(created, 'dd MMM yyyy')}</span>
                  </div>

                  {/* Approver info or actions */}
                  {isApproved && tpl.approvedBy && (
                    <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approved by {tpl.approvedBy.name}</span>
                    </div>
                  )}

                  {isDirectorOrManager && (isPending || tpl.status === TemplateStatus.DRAFT) && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="teal"
                        onClick={() => onApprove(tpl.id)}
                        className="flex-1 h-8 text-xs flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onReject(tpl.id)}
                        className="flex-1 h-8 text-xs border-danger text-danger hover:bg-danger-bg/40 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

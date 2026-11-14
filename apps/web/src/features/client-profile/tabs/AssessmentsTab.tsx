'use client';

import React, { useState } from 'react';
import { Button, ProgressBar, useToast } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { AssessmentItem, clientsApi } from '@/lib/api/clients';
import { AddAssessmentModal } from '../modals/AddAssessmentModal';
import { Plus, Trash2, Calendar, User, FileText } from 'lucide-react';
import { RoleKey } from '@petals/types';

export interface AssessmentsTabProps {
  clientId: string;
  role: RoleKey;
  assessments: AssessmentItem[];
  onRefresh: () => void;
}

export function AssessmentsTab({
  clientId,
  role,
  assessments = [],
  onRefresh,
}: AssessmentsTabProps) {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (assessmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      await clientsApi.deleteAssessment(assessmentId);
      showToast('Assessment deleted', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete assessment', 'error');
    }
  };

  const isStaff = role === RoleKey.DIRECTOR || role === RoleKey.THERAPIST;

  return (
    <div className="space-y-6">
      {/* Header & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Clinical Assessments
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Standardized evaluations, scores, and developmental summaries
          </p>
        </div>

        {isStaff && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-3.5 text-xs md:text-sm flex items-center gap-1.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add assessment</span>
          </Button>
        )}
      </div>

      {/* Assessments List or Empty State */}
      {assessments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-purple-400" />}
          headline="No Assessments Recorded"
          hint="No clinical assessments have been documented for this client yet."
          action={
            isStaff ? (
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(true)}
                className="text-xs"
              >
                Add First Assessment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {assessments.map((item) => {
            const rawDate = (item as any).assessedOn || item.assessedAt || '';
            const dateObj = rawDate ? new Date(rawDate) : null;
            const dateStr =
              dateObj && !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';
            const obsText = (item as any).observation || item.observations;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 md:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6D8F1]/40">
                  <div>
                    <h3 className="font-quicksand font-bold text-base text-purple-800">
                      {item.tool || 'Clinical Assessment'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>{dateStr}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-teal-700" />
                        <span>Assessor: {item.assessorName || 'Clinical Specialist'}</span>
                      </span>
                    </div>
                  </div>

                  {role === RoleKey.DIRECTOR && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-danger rounded-btn hover:bg-danger-bg transition-colors"
                      title="Delete assessment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Scores as mini progress bars */}
                {item.scores && Object.keys(item.scores).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                      Score Overview
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(item.scores).map(([metric, score]) => (
                        <div
                          key={metric}
                          className="p-3 bg-purple-50/40 rounded-btn border border-[#E6D8F1]/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-ink truncate">{metric}</span>
                            <span className="font-bold text-purple-800">{Number(score)}%</span>
                          </div>
                          <ProgressBar value={Number(score) || 0} max={100} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observations & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm pt-1">
                  {obsText && (
                    <div className="space-y-1 bg-gray-50 p-3 rounded-btn border border-gray-100">
                      <span className="font-semibold text-ink text-xs uppercase tracking-wider text-gray-500">
                        Observations
                      </span>
                      <p className="text-gray-700 leading-relaxed">{obsText}</p>
                    </div>
                  )}
                  {item.summary && (
                    <div className="space-y-1 bg-teal-50/40 p-3 rounded-btn border border-teal-100">
                      <span className="font-semibold text-teal-800 text-xs uppercase tracking-wider">
                        Summary & Recommendations
                      </span>
                      <p className="text-gray-700 leading-relaxed">{item.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddAssessmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        clientId={clientId}
        onSuccess={onRefresh}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button, ProgressBar, useToast } from '@/components/ui';
import { AssessmentItem, clientsApi } from '@/lib/api/clients';
import { AddAssessmentModal } from '../modals/AddAssessmentModal';
import { Plus, Calendar, User, Trash2 } from 'lucide-react';
import { RoleKey } from '@petals/types';

interface AssessmentsTabProps {
  clientId: string;
  assessments: AssessmentItem[];
  role: RoleKey;
  onRefresh: () => void;
}

export function AssessmentsTab({
  clientId,
  assessments = [],
  role,
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

  // Fallback sample if empty
  const displayAssessments: AssessmentItem[] =
    assessments.length > 0
      ? assessments
      : [
          {
            id: 'a1',
            clientId,
            tool: 'Preschool Language Scales (PLS-5)',
            assessedAt: '2026-10-15T09:30:00Z',
            assessorId: 'emp1',
            assessorName: 'Dr. Ananya Sharma',
            scores: {
              'Auditory Comprehension': 78,
              'Expressive Communication': 62,
              'Total Language Score': 70,
            },
            observations:
              'Aadhya engaged warmly with visual stimulus cards. Receptive understanding is ahead of spontaneous phrase assembly.',
            summary:
              'Mild-to-moderate expressive language delay. Recommended 2x weekly speech therapy focusing on syntactic complexity.',
          },
        ];

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Clinical Assessments
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Standardized evaluations, developmental milestones, and scores
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

      {/* Assessments List */}
      <div className="space-y-4">
        {displayAssessments.map((item) => {
          const dateStr = new Date(item.assessedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 md:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6D8F1]/40">
                <div>
                  <h3 className="font-quicksand font-bold text-base text-purple-800">
                    {item.tool}
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
                          <span className="font-bold text-purple-800">{score}%</span>
                        </div>
                        <ProgressBar value={score} max={100} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observations & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm pt-1">
                {item.observations && (
                  <div className="space-y-1 bg-gray-50 p-3 rounded-btn border border-gray-100">
                    <span className="font-semibold text-ink text-xs uppercase tracking-wider text-gray-500">
                      Observations
                    </span>
                    <p className="text-gray-700 leading-relaxed">{item.observations}</p>
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

      <AddAssessmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        clientId={clientId}
        onSuccess={onRefresh}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button, StatusChip } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoalItem, SubgoalItem } from '@/lib/api/clients';
import { AddProgressEntryModal } from '../modals/AddProgressEntryModal';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Target,
  CheckCircle2,
  TrendingUp,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { RoleKey } from '@petals/types';

interface ProgressTabProps {
  clientId: string;
  goals: GoalItem[];
  role: RoleKey;
  onRefresh: () => void;
}

export function ProgressTab({
  clientId,
  goals = [],
  role,
  onRefresh,
}: ProgressTabProps) {
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);
  const [activeSubgoal, setActiveSubgoal] = useState<SubgoalItem | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const toggleGoal = (id: string) => {
    setExpandedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleOpenEntry = (subgoal: SubgoalItem) => {
    setActiveSubgoal(subgoal);
    setIsEntryModalOpen(true);
  };

  const isStaff = role === RoleKey.DIRECTOR || role === RoleKey.THERAPIST;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Clinical Goals & Progress Tracking
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Long-term goals, granular subgoals, and clinical session entry history
          </p>
        </div>
      </div>

      {/* Goals List or Empty State */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8 text-purple-400" />}
          headline="No Clinical Goals Recorded"
          hint="There are currently no treatment goals or progress milestones recorded for this client."
        />
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const isExpanded = expandedGoalIds.includes(goal.id);
            const subgoals = goal.subgoals || [];

            return (
              <div
                key={goal.id}
                className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden shadow-sm"
              >
                {/* Goal Header Accordion Bar */}
                <div
                  onClick={() => toggleGoal(goal.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-purple-50/30 transition-colors select-none"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label="Toggle goal"
                      className="mt-0.5 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wide">
                          {goal.term || 'LONG'}-TERM GOAL
                        </span>
                        {goal.domain && (
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {goal.domain}
                          </span>
                        )}
                        <StatusChip status={goal.status || 'IN_PROGRESS'} />
                      </div>
                      <p className="font-medium text-sm text-ink mt-2 leading-relaxed">
                        {goal.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        <span>Authored by: {goal.authorName || 'Assigned Therapist'}</span>
                        <span>·</span>
                        <span>{subgoals.length} target subgoals</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subgoals Body */}
                {isExpanded && (
                  <div className="border-t border-[#E6D8F1]/40 bg-[#FAF8FB] p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Subgoals & Progress Log
                    </div>

                    {subgoals.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No subgoals defined under this goal.</p>
                    ) : (
                      subgoals.map((subgoal) => {
                        const entries = subgoal.progressEntries || [];
                        return (
                          <div
                            key={subgoal.id}
                            className="bg-white border border-[#E6D8F1]/60 rounded-btn p-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                                <span className="font-semibold text-xs md:text-sm text-ink">
                                  {subgoal.description}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <StatusChip status={subgoal.status || 'IN_PROGRESS'} />
                                {isStaff && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenEntry(subgoal)}
                                    className="h-7 px-2.5 text-xs flex items-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Log progress</span>
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Progress Entries Log */}
                            {entries.length > 0 ? (
                              <div className="space-y-2 pt-1">
                                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                  Recent Session Progress Entries ({entries.length})
                                </div>
                                <div className="space-y-2">
                                  {entries.map((pe) => {
                                    const dateObj = new Date(pe.entryDate);
                                    const dateFormatted = !isNaN(dateObj.getTime())
                                      ? dateObj.toLocaleDateString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : '—';
                                    const responseText = (pe as any).response || pe.clientResponse;

                                    return (
                                      <div
                                        key={pe.id}
                                        className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40 text-xs space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                                            <span className="font-semibold text-ink">{dateFormatted}</span>
                                            <span className="text-gray-400">·</span>
                                            <span className="text-gray-500">
                                              By {pe.authorName || 'Therapist'}
                                            </span>
                                          </div>
                                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                            {pe.level}
                                          </span>
                                        </div>
                                        <p className="text-gray-700">{pe.description}</p>
                                        {responseText && (
                                          <p className="text-gray-600 italic">
                                            Response: "{responseText}"
                                          </p>
                                        )}
                                        {pe.remarks && (
                                          <p className="text-purple-800 font-medium pt-0.5">
                                            Remarks: {pe.remarks}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic pt-1">
                                No progress entries logged yet for this subgoal.
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeSubgoal && (
        <AddProgressEntryModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          subgoalId={activeSubgoal.id}
          subgoalTitle={activeSubgoal.description}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

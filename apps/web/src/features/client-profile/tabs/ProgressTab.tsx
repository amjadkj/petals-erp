'use client';

import React, { useState } from 'react';
import { Button, StatusChip } from '@/components/ui';
import { GoalItem, SubgoalItem } from '@/lib/api/clients';
import { AddProgressEntryModal } from '../modals/AddProgressEntryModal';
import { ChevronDown, ChevronRight, Plus, Target, CheckCircle2, TrendingUp, Calendar, User } from 'lucide-react';
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
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>(['g1']);
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

  const displayGoals: GoalItem[] =
    goals.length > 0
      ? goals
      : [
          {
            id: 'g1',
            planId: 'p1',
            domain: 'Expressive Language',
            term: 'LONG',
            description:
              'Client will use functional 3-to-4 word phrases to request items, express needs, and comment in 80% of communication opportunities.',
            status: 'IN_PROGRESS',
            authorName: 'Dr. Ananya Sharma',
            subgoals: [
              {
                id: 'sg1',
                goalId: 'g1',
                description: 'Combine noun + verb to express immediate desire (e.g. want juice).',
                frequency: 'DAILY',
                status: 'IN_PROGRESS',
                progressEntries: [
                  {
                    id: 'pe1',
                    subgoalId: 'sg1',
                    entryDate: '2026-11-10T10:00:00Z',
                    level: 'PROGRESSING',
                    description: 'Structured play session with toy animals and kitchen set.',
                    clientResponse: 'Spontaneously uttered "want apple" and "give doggy" without prompting.',
                    remarks: 'Great progress. Parents reported similar requests during breakfast.',
                    authorName: 'Dr. Ananya Sharma',
                  },
                  {
                    id: 'pe2',
                    subgoalId: 'sg1',
                    entryDate: '2026-11-03T10:00:00Z',
                    level: 'EMERGING',
                    description: 'Picture exchange card prompts.',
                    clientResponse: 'Required gestural cue to initiate two-word combination.',
                    authorName: 'Dr. Ananya Sharma',
                  },
                ],
              },
              {
                id: 'sg2',
                goalId: 'g1',
                description: 'Use action verbs (jump, run, eat, sleep) during peer play routine.',
                frequency: 'WEEKLY',
                status: 'NOT_STARTED',
                progressEntries: [],
              },
            ],
          },
          {
            id: 'g2',
            planId: 'p2',
            domain: 'Sensory Processing & Bilateral Coordination',
            term: 'LONG',
            description:
              'Client will maintain regulated arousal during fine motor cutting and threading activities for 15 consecutive minutes.',
            status: 'IN_PROGRESS',
            authorName: 'Rajesh Menon',
            subgoals: [
              {
                id: 'sg3',
                goalId: 'g2',
                description: 'Complete 5-piece bead threading with stabilized bilateral grip.',
                frequency: 'DAILY',
                status: 'IN_PROGRESS',
                progressEntries: [
                  {
                    id: 'pe3',
                    subgoalId: 'sg3',
                    entryDate: '2026-11-08T11:00:00Z',
                    level: 'PROGRESSING',
                    description: 'Therapeutic putty resistance followed by wooden bead stringing.',
                    clientResponse: 'Threaded 4 beads independently with steady tripod grip.',
                    authorName: 'Rajesh Menon',
                  },
                ],
              },
            ],
          },
        ];

  return (
    <div className="space-y-6">
      {/* Tab Header & Domain Baselines */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Clinical Goals & Milestones
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Individualised Education and Therapy Plan (IEP) progress tracking
          </p>
        </div>

        {/* Domain Baseline Chips */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <div className="p-3 bg-purple-50/50 rounded-btn border border-[#E6D8F1]/40 flex-1 min-w-[200px]">
            <span className="text-[11px] font-semibold uppercase text-purple-800 tracking-wider">
              Speech & Language Baseline
            </span>
            <div className="text-xs text-ink font-medium mt-1">
              Age equivalent: 32 mos · Receptive &gt; Expressive
            </div>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-btn border border-teal-200/50 flex-1 min-w-[200px]">
            <span className="text-[11px] font-semibold uppercase text-teal-700 tracking-wider">
              Occupational Therapy Baseline
            </span>
            <div className="text-xs text-ink font-medium mt-1">
              Tactile hypersensitivity · Emerging bilateral integration
            </div>
          </div>
        </div>
      </div>

      {/* Goals Accordion Cards */}
      <div className="space-y-4">
        {displayGoals.map((goal) => {
          const isExpanded = expandedGoalIds.includes(goal.id);

          return (
            <div
              key={goal.id}
              className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden shadow-sm transition-all"
            >
              {/* Goal Header (Click to toggle) */}
              <div
                onClick={() => toggleGoal(goal.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-purple-50/30 transition-colors select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {goal.domain}
                      </span>
                      <StatusChip status={goal.status} />
                      {goal.authorName && (
                        <span className="text-xs text-gray-500 font-medium">
                          Author: <strong className="text-purple-800">{goal.authorName}</strong>
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-ink mt-2 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>
                </div>

                <div className="text-gray-400 p-1">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Goal Subgoals & Entries */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#E6D8F1]/40 space-y-4 bg-[#F5EFFA]/20">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">
                    Subgoals & Weekly Milestones
                  </div>

                  <div className="space-y-3">
                    {goal.subgoals?.map((sg) => (
                      <div
                        key={sg.id}
                        className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {sg.frequency}
                            </span>
                            <span className="text-sm font-semibold text-ink">{sg.description}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusChip status={sg.status} />
                            {isStaff && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenEntry(sg)}
                                className="h-8 px-2.5 text-xs flex items-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Entry</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Progress Entries Timeline */}
                        {sg.progressEntries && sg.progressEntries.length > 0 ? (
                          <div className="pt-2 border-t border-[#E6D8F1]/30 space-y-2">
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              Session Log
                            </div>
                            <div className="space-y-2">
                              {sg.progressEntries.map((pe) => {
                                const dateFormatted = new Date(pe.entryDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                });

                                return (
                                  <div
                                    key={pe.id}
                                    className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40 text-xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                                        <span className="font-semibold text-ink">{dateFormatted}</span>
                                        <span className="text-gray-400">·</span>
                                        <span className="text-gray-500">By {pe.authorName || 'Therapist'}</span>
                                      </div>
                                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                        {pe.level}
                                      </span>
                                    </div>
                                    <p className="text-gray-700">{pe.description}</p>
                                    {pe.clientResponse && (
                                      <p className="text-gray-600 italic">
                                        Response: "{pe.clientResponse}"
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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

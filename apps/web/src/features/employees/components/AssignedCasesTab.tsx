'use client';

import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusChip } from '@/components/ui/StatusChip';
import type { AssignedCaseItem } from '../types';

const allMockCases: AssignedCaseItem[] = [
  {
    id: 'case-1',
    clientName: 'Aarav Sharma',
    clientCode: 'PTL-C001',
    status: 'Improving',
    longTermGoal: 'Produce two-word functional phrases spontaneously during play',
    subGoalText: 'Point and verbalize "want toy" or "more bubbles" across 4/5 trials',
    response: 'Consistent verbal imitation; initiated "more please" twice',
    remarks: 'Strong parental reinforcement reported at home',
    progressPercent: 78,
  },
  {
    id: 'case-2',
    clientName: 'Diya Patel',
    clientCode: 'PTL-C002',
    status: 'Active',
    longTermGoal: 'Improve multi-syllabic articulation clarity (/r/ and /s/ blends)',
    subGoalText: 'Correct phonetic placement for initial /s/ clusters in isolation',
    response: '90% accuracy with visual mirror feedback',
    remarks: 'Recommend advancing to sentence level next week',
    progressPercent: 65,
  },
  {
    id: 'case-3',
    clientName: 'Kabir Verma',
    clientCode: 'PTL-C003',
    status: 'Improving',
    longTermGoal: 'Maintain sustained reciprocal eye-contact during structured joint play',
    subGoalText: 'Engage in turn-taking game for 5 uninterrupted cycles',
    response: 'Completed 4 cycles with gentle physical prompting',
    remarks: 'Sensory breaks between turn shifts proved effective',
    progressPercent: 82,
  },
  {
    id: 'case-4',
    clientName: 'Vihaan Joshi',
    clientCode: 'PTL-C004',
    status: 'Active',
    longTermGoal: 'Enhance receptive vocabulary & following 2-step motor instructions',
    subGoalText: 'Execute "pick ball and place in basket" without hand-over-hand help',
    response: '80% mastery across 5 consecutive trials',
    remarks: 'Responds well to rhythm cues',
    progressPercent: 70,
  },
  {
    id: 'case-5',
    clientName: 'Ananya Iyer',
    clientCode: 'PTL-C005',
    status: 'Improving',
    longTermGoal: 'Develop phonological awareness and initial consonant discrimination',
    subGoalText: 'Identify /b/ and /p/ auditory differences in picture cards',
    response: 'Correct discrimination on 8 of 10 word pairs',
    remarks: 'Caregiver attending home programme diligently',
    progressPercent: 85,
  },
];

export function AssignedCasesTab({ employeeId: _employeeId }: { employeeId: string }) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/50">
        <div>
          <h3 className="font-quicksand font-bold text-lg text-purple-600">
            Assigned Therapy Cases
          </h3>
          <p className="text-xs text-gray-500">
            Active client caseload, treatment plan objectives, and clinical milestones
          </p>
        </div>
        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-chip border border-[#E6D8F1]">
          {allMockCases.length} Active Cases
        </span>
      </div>

      <div className="space-y-4">
        {allMockCases.map((c) => (
          <div
            key={c.id}
            className="p-4 border border-[#E6D8F1]/80 rounded-card bg-white space-y-3 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-ink text-base">{c.clientName}</span>
                <span className="text-xs font-mono text-gray-400 ml-2">{c.clientCode}</span>
              </div>
              <StatusChip status={c.status === 'Improving' ? 'paid' : 'active'} label={c.status} />
            </div>

            <div className="text-sm text-gray-800">
              <strong className="text-purple-600">Long-Term Goal: </strong>
              {c.longTermGoal}
            </div>

            <div className="bg-purple-50/50 rounded-btn p-3 text-xs space-y-1.5 text-gray-700">
              <div>
                <strong className="text-ink">Current Subgoal: </strong>
                {c.subGoalText}
              </div>
              <div>
                <strong className="text-ink">Observed Response: </strong>
                {c.response}
              </div>
              {c.remarks && (
                <div className="text-gray-500 italic">
                  <strong>Clinician Remarks: </strong>
                  {c.remarks}
                </div>
              )}
            </div>

            <ProgressBar
              value={c.progressPercent}
              label="Goal Achievement Level"
              showPercentage
            />
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusChip } from '@/components/ui/StatusChip';
import { CheckCircle2, Clock, CalendarCheck, Users, ArrowRight } from 'lucide-react';
import type { EmployeeItem, WeeklyTrendPoint, AssignedCaseItem, ActivityLogEntry } from '../types';

interface PerformanceTabProps {
  employee: EmployeeItem;
  onNavigateToCases?: () => void;
}

const mockWeeklyTrend: WeeklyTrendPoint[] = [
  { week: 'W40 (Oct 5)', completion: 91 },
  { week: 'W41 (Oct 12)', completion: 94 },
  { week: 'W42 (Oct 19)', completion: 89 },
  { week: 'W43 (Oct 26)', completion: 96 },
  { week: 'W44 (Nov 2)', completion: 95 },
];

const mockAssignedCases: AssignedCaseItem[] = [
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
];

const mockRecentActivity: ActivityLogEntry[] = [
  {
    id: 'act-1',
    timestamp: 'Today · 11:30 AM',
    action: 'Session note filed',
    clientName: 'Aarav Sharma',
    detail: 'Documented expressive language trial outcomes; caregiver debrief complete.',
  },
  {
    id: 'act-2',
    timestamp: 'Yesterday · 04:15 PM',
    action: 'Diagnostic report shared',
    clientName: 'Diya Patel',
    detail: 'Mid-term articulation assessment submitted for Director review.',
  },
  {
    id: 'act-3',
    timestamp: '03 Nov 2026 · 02:00 PM',
    action: 'Treatment plan goal updated',
    clientName: 'Kabir Verma',
    detail: 'Revised subgoal frequency from weekly to daily reinforcement.',
  },
];

export function PerformanceTab({ employee: _employee, onNavigateToCases }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* 4 Performance Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions completed"
          value="108"
          helper="114 scheduled · 94.7% completed"
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Report timeliness"
          value="92%"
          helper="11 of 12 on time"
          icon={<Clock className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          label="Attendance"
          value="96%"
          helper="24 of 25 working days"
          icon={<CalendarCheck className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          label="Assigned clients"
          value="18"
          helper="12 primary · 6 shared"
          icon={<Users className="w-5 h-5 text-ink" />}
        />
      </div>

      {/* Main Grid: Session Trend Chart & Care Quality Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Session Completion Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white border border-[#E6D8F1]/60 rounded-card p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Session Completion Trend
              </h3>
              <p className="text-xs text-gray-500">
                Weekly attendance fulfillment rate over the last 5 weeks
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-chip">
              Target: ≥ 90%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeeklyTrend} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B9B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B9B4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFFA" vertical={false} />
                <XAxis dataKey="week" stroke="#8E8B94" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#8E8B94"
                  fontSize={12}
                  tickLine={false}
                  domain={[70, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Completion Rate']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#E6D8F1',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="#00B9B4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#completionGradient)"
                  dot={{ r: 4, fill: '#00B9B4', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#007D7A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Care Quality Snapshot (3 Progress Bars) */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#E6D8F1]/60">
            <h3 className="font-quicksand font-bold text-base text-ink">
              Care Quality Snapshot
            </h3>
            <p className="text-xs text-gray-500">
              Documentation and clinical milestone compliance
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <ProgressBar
              value={94}
              label="Goals updated on time"
              showPercentage
            />

            <ProgressBar
              value={88}
              label="Parent reports shared"
              showPercentage
            />

            <ProgressBar
              value={98}
              label="Session notes complete"
              showPercentage
            />
          </div>

          <div className="p-3 bg-purple-50/60 rounded-btn text-xs text-purple-800 leading-relaxed mt-4">
            Clinical reviews are updated monthly based on audit checklists and parent engagement metrics.
          </div>
        </div>
      </div>

      {/* Assigned Cases Card & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Cases */}
        <div className="lg:col-span-2 bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Assigned Cases
              </h3>
              <p className="text-xs text-gray-500">
                Active therapy caseload and current milestone progress
              </p>
            </div>

            {onNavigateToCases && (
              <button
                type="button"
                onClick={onNavigateToCases}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
              >
                View all 18 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {mockAssignedCases.map((c) => (
              <div
                key={c.id}
                className="p-3.5 border border-[#E6D8F1]/80 rounded-card hover:border-purple-300 transition-colors bg-white space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-ink text-sm">
                      {c.clientName}
                    </span>
                    <span className="text-xs text-gray-400 font-mono ml-2">
                      {c.clientCode}
                    </span>
                  </div>
                  <StatusChip status={c.status === 'Improving' ? 'paid' : 'active'} label={c.status} />
                </div>

                <div className="text-xs text-gray-700">
                  <span className="font-semibold text-purple-600">Long-term Goal: </span>
                  {c.longTermGoal}
                </div>

                <div className="text-xs text-gray-600 bg-purple-50/40 rounded p-2 space-y-1">
                  <div>
                    <strong>Subgoal:</strong> {c.subGoalText}
                  </div>
                  <div>
                    <strong>Response:</strong> {c.response}
                  </div>
                  {c.remarks && (
                    <div className="text-gray-500 italic">
                      Remarks: {c.remarks}
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <ProgressBar
                    value={c.progressPercent}
                    label="Milestone Progress"
                    showPercentage
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#E6D8F1]/60">
            <h3 className="font-quicksand font-bold text-base text-ink">
              Recent Clinical Activity
            </h3>
            <p className="text-xs text-gray-500">
              Audit timeline of logged session notes & reports
            </p>
          </div>

          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-purple-100">
            {mockRecentActivity.map((act) => (
              <div key={act.id} className="relative pl-6 text-xs space-y-1">
                <span className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                <div className="flex items-center justify-between text-gray-400 font-medium">
                  <span>{act.timestamp}</span>
                </div>
                <div className="font-semibold text-ink">
                  {act.action} {act.clientName && <span className="text-purple-600">· {act.clientName}</span>}
                </div>
                <p className="text-gray-600 leading-snug">
                  {act.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

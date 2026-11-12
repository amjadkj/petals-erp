'use client';

import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { LeaveType, LeaveStatus, RoleKey } from '@petals/types';
import { formatDateSafe } from '@/lib/formatters';
import { Download, Calendar, ShieldCheck, Check, X, Clock, CalendarHeart, HeartPulse, Sparkles, UserCheck } from 'lucide-react';
import type { LeaveRequestItem, HolidayItem } from '../types';

interface LeaveTabProps {
  onApplyLeave: () => void;
  onOpenDirectorAvailability: () => void;
  onRequestAction: (request: LeaveRequestItem, action: 'approve' | 'reject') => void;
  isDirectorAway: boolean;
  directorAwayUntil?: string;
  holidays: HolidayItem[];
}

const initialMockLeaveRequests: LeaveRequestItem[] = [
  {
    id: 'lr-1',
    employeeId: 'e1',
    employeeName: 'Anu Menon',
    role: 'Speech Therapist',
    leaveType: LeaveType.CASUAL,
    fromDate: '2026-11-18',
    toDate: '2026-11-19',
    days: 2,
    reason: 'Personal commitment · Sister wedding reception',
    status: LeaveStatus.PENDING,
    requestedAt: '2026-11-03',
  },
  {
    id: 'lr-2',
    employeeId: 'e4',
    employeeName: 'Anita Sen',
    role: 'Behavioural Therapist',
    leaveType: LeaveType.SICK,
    fromDate: '2026-11-20',
    toDate: '2026-11-20',
    days: 1,
    reason: 'Dental appointment & post-op recovery',
    status: LeaveStatus.PENDING,
    requestedAt: '2026-11-05',
  },
  {
    id: 'lr-3',
    employeeId: 'e3',
    employeeName: 'Priya Nair',
    role: 'Lead OT Therapist',
    leaveType: LeaveType.CASUAL,
    fromDate: '2026-11-01',
    toDate: '2026-11-02',
    days: 2,
    reason: 'Family visit out of town',
    status: LeaveStatus.APPROVED,
    requestedAt: '2026-10-28',
    approvedBy: 'Dr. Sunita Rao',
    approvedAt: '2026-10-29',
  },
  {
    id: 'lr-4',
    employeeId: 'e6',
    employeeName: 'Rahul Bose',
    role: 'Special Educator',
    leaveType: LeaveType.PAID,
    fromDate: '2026-10-24',
    toDate: '2026-10-25',
    days: 2,
    reason: 'Annual Diwali travel',
    status: LeaveStatus.APPROVED,
    requestedAt: '2026-10-20',
    approvedBy: 'Priya Nair',
    approvedAt: '2026-10-21',
  },
];

export function LeaveTab({
  onApplyLeave,
  onOpenDirectorAvailability,
  onRequestAction,
  isDirectorAway,
  directorAwayUntil,
  holidays,
}: LeaveTabProps) {
  const { showToast } = useToast();
  const { myRole } = usePermissions();

  const [requests] = useState<LeaveRequestItem[]>(initialMockLeaveRequests);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Can the current user approve leave?
  // RULE: Director approves leave. Manager is backup ONLY when Director is away. Therapists cannot approve.
  const canApprove = useMemo(() => {
    if (myRole === RoleKey.DIRECTOR) return true;
    if (myRole === RoleKey.MANAGER && isDirectorAway) return true;
    // For development testing/mocking if no role set, treat as Director
    if (!myRole) return true;
    return false;
  }, [myRole, isDirectorAway]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      return true;
    });
  }, [requests, statusFilter]);

  const columns: Column<LeaveRequestItem>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.employeeName}</span>
          <span className="block text-xs text-gray-500">{row.reason} · Requested {formatDateSafe(row.requestedAt)}</span>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Leave Type',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-700 capitalize text-sm font-medium">
          {row.leaveType.toLowerCase()} Leave
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-600 text-sm">
          {formatDateSafe(row.fromDate)} – {formatDateSafe(row.toDate)}
        </span>
      ),
    },
    {
      key: 'days',
      header: 'Days',
      isSecondary: true,
      render: (row) => <span className="font-semibold text-ink text-sm">{row.days}d</span>,
    },
    {
      key: 'status',
      header: 'Status / Action',
      isStatus: true,
      render: (row) => {
        if (row.status === LeaveStatus.PENDING) {
          if (canApprove) {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestAction(row, 'approve');
                  }}
                  className="h-8 px-2.5 text-xs text-teal-700 border-teal-500/70 hover:bg-teal-50 font-semibold"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestAction(row, 'reject');
                  }}
                  className="h-8 px-2.5 text-xs text-danger border-danger/50 hover:bg-danger-bg font-semibold"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </div>
            );
          }
          return <StatusChip status="pending" label="Pending approval" />;
        }

        if (row.status === LeaveStatus.APPROVED) {
          return (
            <div>
              <StatusChip status="approved" label="Approved" />
              {row.approvedBy && (
                <span className="block text-[11px] text-gray-400 mt-0.5">
                  by {row.approvedBy} · {formatDateSafe(row.approvedAt || row.requestedAt)}
                </span>
              )}
            </div>
          );
        }

        return <StatusChip status="cancelled" label="Rejected" />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Leave Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="font-quicksand font-bold text-2xl text-purple-600 leading-tight">
            Time to recharge. Space to plan.
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage leave fairly and keep every care team covered.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Director Away delegation control */}
          {(myRole === RoleKey.DIRECTOR || !myRole) && (
            <Button
              variant="outline"
              onClick={onOpenDirectorAvailability}
              className={`flex items-center gap-2 text-xs h-10 ${
                isDirectorAway ? 'border-warning text-warning bg-warning-bg/40 font-semibold' : ''
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isDirectorAway ? `Away until ${directorAwayUntil}` : "I'm away until…"}</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => showToast('Exporting leave log (CSV)...', 'info')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export leave</span>
          </Button>

          <Button
            variant="primary"
            onClick={onApplyLeave}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Apply for leave</span>
          </Button>
        </div>
      </div>

      {/* 4 Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Casual leave"
          value="6 days"
          helper="Your balance · 6 of 12 remaining"
          icon={<CalendarHeart className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          label="Sick leave"
          value="8 days"
          helper="Medical time-off balance"
          icon={<HeartPulse className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          label="Earned leave"
          value="12 days"
          helper="Accrued annual vacation"
          icon={<Sparkles className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Pending requests"
          value="2"
          helper="Director approval required"
          icon={<Clock className="w-5 h-5 text-warning" />}
        />
      </div>

      {/* Main 2-Card Layout (Left: Requests Table, Right: Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leave Requests */}
        <div className="lg:col-span-2 bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Leave Requests
              </h3>
              <p className="text-xs text-gray-500">
                Showing all requests for current billing and duty cycle
              </p>
            </div>

            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
                options={[
                  { value: 'ALL', label: 'All requests' },
                  { value: LeaveStatus.PENDING, label: 'Pending approval' },
                  { value: LeaveStatus.APPROVED, label: 'Approved' },
                  { value: LeaveStatus.REJECTED, label: 'Rejected' },
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredRequests}
            keyExtractor={(item) => item.id}
          />
        </div>

        {/* Right 1 Col: Holiday Calendar Card */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/60">
            <h3 className="font-quicksand font-bold text-base text-ink">
              Clinic Holidays
            </h3>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-chip">
              November 2026
            </span>
          </div>

          {/* Mini Month Visual */}
          <div className="bg-purple-50/50 border border-[#E6D8F1]/50 rounded-btn p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isToday = day === 4;
                const isHoliday = day === 8 || day === 20;

                let cls = 'h-7 flex items-center justify-center rounded-btn transition-colors font-medium';
                if (isToday) cls += ' bg-purple-600 text-white font-bold';
                else if (isHoliday) cls += ' bg-teal-500 text-white font-bold shadow-sm';
                else cls += ' text-ink hover:bg-white';

                return (
                  <div key={day} className={cls}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Holidays List */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Upcoming Closures
            </h4>

            {holidays.slice(0, 3).map((h) => (
              <div
                key={h.id}
                className="p-3 bg-white border border-[#E6D8F1]/70 rounded-btn text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-ink">
                  <span>{h.name}</span>
                  <span className="text-teal-700">{formatDateSafe(h.date, 'dd MMM')}</span>
                </div>
                <div className="text-gray-500">
                  {h.branchName || 'All branches closed'} {h.notes && `· ${h.notes}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Purple-50 Policy Banner */}
      <div className="bg-purple-50 border border-[#E6D8F1] rounded-card p-4 text-xs text-purple-800 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-sm mb-0.5">Clear approvals, consistent coverage</strong>
          Director approves leave. Nikhil Kumar (Manager) is the backup approver only when the Director is unavailable. Approve or reject with a comment; affected appointments are flagged for rescheduling.
        </div>
      </div>
    </div>
  );
}

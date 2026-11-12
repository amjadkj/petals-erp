'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { usePermissionsStore } from '@/lib/permissions/store';
import { hrApi } from '@/lib/api/hr';

import { AttendanceTab } from './AttendanceTab';
import { LeaveTab } from './LeaveTab';
import { HolidayCalendarTab } from './HolidayCalendarTab';
import { ManualEntryModal } from './ManualEntryModal';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { ApproveRejectModal } from './ApproveRejectModal';
import { DirectorAvailabilityModal } from './DirectorAvailabilityModal';
import { AddHolidayModal } from './AddHolidayModal';

import type { LeaveRequestItem, HolidayItem } from '../types';

export function HrmsView() {
  const queryClient = useQueryClient();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'holidays'>('attendance');

  // Modals state
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);

  // Approval modal state
  const [targetLeaveRequest, setTargetLeaveRequest] = useState<LeaveRequestItem | null>(null);
  const [leaveModalAction, setLeaveModalAction] = useState<'approve' | 'reject' | null>(null);
  const [isApproveRejectOpen, setIsApproveRejectOpen] = useState(false);

  // Director away state
  const [isDirectorAway, setIsDirectorAway] = useState(false);
  const [directorAwayUntil, setDirectorAwayUntil] = useState<string | undefined>('2026-11-20');

  // Holidays state
  const initialHolidays: HolidayItem[] = [
    { id: 'hol-1', name: 'Diwali (Deepavali)', date: '2026-11-08', branchName: 'All branches closed', notes: 'Mandatory centre-wide closure' },
    { id: 'hol-2', name: 'Staff Training & Quality Audit', date: '2026-11-20', branchName: 'Indiranagar (Main)', notes: 'No client therapy sessions' },
    { id: 'hol-3', name: 'Kanakadasa Jayanti', date: '2026-11-28', branchName: 'All branches closed', notes: 'Karnataka state public holiday' },
  ];
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);

  // Fetch holidays from API
  useQuery({
    queryKey: ['hr', 'holidays'],
    queryFn: async () => {
      const res = await hrApi.getHolidays();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setHolidays(res.data as unknown as HolidayItem[]);
      }
      return res;
    },
  });

  const handleLeaveActionTrigger = (request: LeaveRequestItem, action: 'approve' | 'reject') => {
    setTargetLeaveRequest(request);
    setLeaveModalAction(action);
    setIsApproveRejectOpen(true);
  };

  const handleApproveRejectSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] });
  };

  const handleAddHolidaySuccess = (newHoliday: HolidayItem) => {
    setHolidays((prev) => [newHoliday, ...prev]);
    queryClient.invalidateQueries({ queryKey: ['hr', 'holidays'] });
  };

  const handleDeleteHolidaySuccess = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    queryClient.invalidateQueries({ queryKey: ['hr', 'holidays'] });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 3 Underline Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
        <TabList className="mb-4">
          <TabTrigger value="attendance">Attendance</TabTrigger>
          <TabTrigger value="leave">Leave</TabTrigger>
          <TabTrigger value="holidays">Holiday Calendar</TabTrigger>
        </TabList>

        <TabContent value="attendance">
          <AttendanceTab
            onOpenManualEntry={() => setIsManualEntryOpen(true)}
            branchName={selectedBranchId === 'ALL' ? 'Indiranagar' : 'Current Branch'}
          />
        </TabContent>

        <TabContent value="leave">
          <LeaveTab
            onApplyLeave={() => setIsApplyLeaveOpen(true)}
            onOpenDirectorAvailability={() => setIsDirectorModalOpen(true)}
            onRequestAction={handleLeaveActionTrigger}
            isDirectorAway={isDirectorAway}
            directorAwayUntil={directorAwayUntil}
            holidays={holidays}
          />
        </TabContent>

        <TabContent value="holidays">
          <HolidayCalendarTab
            holidays={holidays}
            onOpenAddHoliday={() => setIsAddHolidayOpen(true)}
            onDeleteHoliday={handleDeleteHolidaySuccess}
          />
        </TabContent>
      </Tabs>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['hr', 'attendance'] })}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['hr', 'leaves'] })}
      />

      {/* Approve / Reject Modal */}
      <ApproveRejectModal
        request={targetLeaveRequest}
        action={leaveModalAction}
        isOpen={isApproveRejectOpen}
        onClose={() => {
          setIsApproveRejectOpen(false);
          setTargetLeaveRequest(null);
          setLeaveModalAction(null);
        }}
        onSuccess={handleApproveRejectSuccess}
      />

      {/* Director Availability Modal */}
      <DirectorAvailabilityModal
        isOpen={isDirectorModalOpen}
        onClose={() => setIsDirectorModalOpen(false)}
        isAway={isDirectorAway}
        awayUntil={directorAwayUntil}
        onUpdateAvailability={(away, until) => {
          setIsDirectorAway(away);
          setDirectorAwayUntil(until);
        }}
      />

      {/* Add Holiday Modal */}
      <AddHolidayModal
        isOpen={isAddHolidayOpen}
        onClose={() => setIsAddHolidayOpen(false)}
        onSuccess={handleAddHolidaySuccess}
      />
    </div>
  );
}

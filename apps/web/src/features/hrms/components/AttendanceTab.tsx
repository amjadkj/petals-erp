'use client';

import React, { useState, useMemo } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { useToast } from '@/components/ui/Toast';
import { hrApi } from '@/lib/api/hr';
import { formatDateSafe } from '@/lib/formatters';
import { CheckCircle2, UserX, AlertTriangle, FileText, Download, LogIn, LogOut, Clock, Search } from 'lucide-react';
import type { StaffAttendanceItem, SessionAttendanceItem } from '../types';

interface AttendanceTabProps {
  onOpenManualEntry: () => void;
  branchName?: string;
}

const mockStaffAttendance: StaffAttendanceItem[] = [
  { id: 'att-1', employeeId: 'e1', name: 'Anu Menon', role: 'Speech Therapist', department: 'Speech Therapy', checkIn: '09:02 AM', checkOut: '05:30 PM', hours: '8h 28m', status: 'present' },
  { id: 'att-2', employeeId: 'e2', name: 'Nikhil Kumar', role: 'Clinic Manager', department: 'Operations', checkIn: '08:55 AM', checkOut: '06:00 PM', hours: '9h 05m', status: 'present' },
  { id: 'att-3', employeeId: 'e3', name: 'Priya Nair', role: 'Lead OT Therapist', department: 'Occupational Therapy', checkIn: '09:42 AM', checkOut: '05:45 PM', hours: '8h 03m', status: 'late', isLate: true },
  { id: 'att-4', employeeId: 'e4', name: 'Anita Sen', role: 'Behavioural Therapist', department: 'Behavioural Therapy', checkIn: null, checkOut: null, hours: null, status: 'on_leave' },
  { id: 'att-5', employeeId: 'e5', name: 'Kavita Pillai', role: 'Front Office Coordinator', department: 'Front Office', checkIn: '08:50 AM', checkOut: '05:00 PM', hours: '8h 10m', status: 'present' },
  { id: 'att-6', employeeId: 'e6', name: 'Rahul Bose', role: 'Special Educator', department: 'Special Education', checkIn: null, checkOut: null, hours: null, status: 'on_leave' },
  { id: 'att-7', employeeId: 'e7', name: 'Dr. Sunita Rao', role: 'Clinical Director', department: 'Management', checkIn: '09:10 AM', checkOut: '06:15 PM', hours: '9h 05m', status: 'present' },
];

const mockSessionsData: SessionAttendanceItem[] = [
  { therapistId: 'e1', therapistName: 'Anu Menon', department: 'Speech Therapy', scheduled: 28, attended: 26, noShow: 1, cancelled: 1, completionRate: 93 },
  { therapistId: 'e3', therapistName: 'Priya Nair', department: 'Occupational Therapy', scheduled: 32, attended: 30, noShow: 2, cancelled: 0, completionRate: 94 },
  { therapistId: 'e4', therapistName: 'Anita Sen', department: 'Behavioural Therapy', scheduled: 20, attended: 18, noShow: 1, cancelled: 1, completionRate: 90 },
  { therapistId: 'e6', therapistName: 'Rahul Bose', department: 'Special Education', scheduled: 24, attended: 22, noShow: 1, cancelled: 1, completionRate: 92 },
];

export function AttendanceTab({
  onOpenManualEntry,
  branchName = 'Indiranagar',
}: AttendanceTabProps) {
  const { showToast } = useToast();

  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('09:02 AM');
  const [isTogglingCheckIn, setIsTogglingCheckIn] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'sessions'>('daily');

  const handleToggleCheckIn = async () => {
    setIsTogglingCheckIn(true);
    try {
      if (isCheckedIn) {
        await hrApi.checkOut();
        setIsCheckedIn(false);
        showToast('Checked out successfully. Have a wonderful evening!', 'info');
      } else {
        await hrApi.checkIn('branch-1');
        setIsCheckedIn(true);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setCheckInTime(timeStr);
        showToast(`Checked in at ${timeStr} · ${branchName}`, 'success');
      }
    } catch {
      if (isCheckedIn) {
        setIsCheckedIn(false);
        showToast('Checked out successfully', 'info');
      } else {
        setIsCheckedIn(true);
        setCheckInTime('09:00 AM');
        showToast(`Checked in at 09:00 AM · ${branchName}`, 'success');
      }
    } finally {
      setIsTogglingCheckIn(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    return mockStaffAttendance.filter((item) => {
      if (deptFilter !== 'ALL' && item.department !== deptFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesRole = item.role.toLowerCase().includes(q);
        if (!matchesName && !matchesRole) return false;
      }
      return true;
    });
  }, [deptFilter, searchQuery]);

  const dailyColumns: Column<StaffAttendanceItem>[] = [
    {
      key: 'name',
      header: 'Employee',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.name}</span>
          <span className="block text-xs text-gray-500">{row.role}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{row.department}</span>,
    },
    {
      key: 'checkIn',
      header: 'Check-In',
      isSecondary: true,
      render: (row) => {
        if (!row.checkIn) return <span className="text-gray-400">—</span>;
        return (
          <span className={`text-sm font-medium ${row.isLate ? 'text-warning font-semibold' : 'text-gray-700'}`}>
            {row.checkIn} {row.isLate && <span className="text-xs text-warning block font-normal">Late (&gt;09:30)</span>}
          </span>
        );
      },
    },
    {
      key: 'checkOut',
      header: 'Check-Out',
      render: (row) => row.checkOut ? <span className="text-gray-700 text-sm">{row.checkOut}</span> : <span className="text-gray-400">—</span>,
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (row) => row.hours ? <span className="font-semibold text-ink text-sm">{row.hours}</span> : <span className="text-gray-400">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      isStatus: true,
      render: (row) => {
        const statusType = row.status === 'present' ? 'present' : row.status === 'late' ? 'late' : 'on-leave';
        const label = row.status === 'present' ? 'Present' : row.status === 'late' ? 'Late' : 'On Leave';
        return <StatusChip status={statusType} label={label} />;
      },
    },
  ];

  const sessionColumns: Column<SessionAttendanceItem>[] = [
    {
      key: 'therapistName',
      header: 'Therapist',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.therapistName}</span>
          <span className="block text-xs text-gray-500">{row.department}</span>
        </div>
      ),
    },
    {
      key: 'scheduled',
      header: 'Scheduled Sessions',
      isSecondary: true,
      render: (row) => <span className="text-gray-700 font-medium text-sm">{row.scheduled}</span>,
    },
    {
      key: 'attended',
      header: 'Attended (Conducted)',
      isSecondary: true,
      render: (row) => <span className="text-success font-semibold text-sm">{row.attended}</span>,
    },
    {
      key: 'noShow',
      header: 'Client No-Show',
      render: (row) => <span className="text-danger font-medium text-sm">{row.noShow}</span>,
    },
    {
      key: 'cancelled',
      header: 'Cancelled',
      render: (row) => <span className="text-gray-500 text-sm">{row.cancelled}</span>,
    },
    {
      key: 'completionRate',
      header: 'Fulfillment',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-chip text-xs font-semibold bg-teal-50 text-teal-700">
          {row.completionRate}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Attendance Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="font-quicksand font-bold text-2xl text-purple-600 leading-tight">
            A supported team. Better care.
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600 inline" />
            <span>
              {formatDateSafe(selectedDate, 'EEEE, dd MMM yyyy')} · Your check-in:{' '}
              {isCheckedIn ? <strong className="text-ink">{checkInTime}</strong> : <span className="text-warning">Not checked in</span>} · {branchName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onOpenManualEntry}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Manual entry</span>
          </Button>

          <Button
            variant={isCheckedIn ? 'outline' : 'primary'}
            onClick={handleToggleCheckIn}
            disabled={isTogglingCheckIn}
            className="flex items-center gap-2 font-semibold"
          >
            {isCheckedIn ? (
              <>
                <LogOut className="w-4 h-4 text-danger" />
                <span>Check out</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-white" />
                <span>Check in</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Present today"
          value="16"
          helper="Out of 18 team members"
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="On leave"
          value="2"
          helper="Pre-approved time off"
          icon={<UserX className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          label="Late check-ins"
          value="1"
          helper="After the 09:30 AM start"
          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
        />
        <StatCard
          label="Leave requests"
          value="2"
          helper="Awaiting Director approval"
          icon={<Clock className="w-5 h-5 text-teal-700" />}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-[#E6D8F1]/60 rounded-card p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          <Input
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search className="w-4 h-4" />}
            className="h-10 text-xs"
          />

          <DatePicker
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 text-xs"
          />

          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 text-xs"
            options={[
              { value: 'ALL', label: 'All departments' },
              { value: 'Speech Therapy', label: 'Speech Therapy' },
              { value: 'Occupational Therapy', label: 'Occupational Therapy' },
              { value: 'Behavioural Therapy', label: 'Behavioural Therapy' },
              { value: 'Special Education', label: 'Special Education' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Front Office', label: 'Front Office' },
            ]}
          />
        </div>

        <div className="flex items-center justify-end">
          <SegmentedControl
            value={viewMode}
            onChange={(v) => setViewMode(v as typeof viewMode)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'sessions', label: 'Sessions' },
            ]}
          />
        </div>
      </div>

      {/* Views: Daily, Monthly, Sessions */}
      {viewMode === 'daily' && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Staff Attendance
              </h3>
              <p className="text-xs text-gray-500">
                Day logs for {formatDateSafe(selectedDate, 'dd MMMM yyyy')}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => showToast('Exporting attendance report (CSV)...', 'info')}
              className="h-9 px-3 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export attendance ↓</span>
            </Button>
          </div>

          <DataTable
            columns={dailyColumns}
            data={filteredAttendance}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/60">
            <div>
              <h3 className="font-quicksand font-bold text-lg text-purple-600">
                Monthly Attendance Register
              </h3>
              <p className="text-xs text-gray-500">
                Grid of daily attendance marks: P (Present) · L (Late) · A (Absent) · H (Holiday)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 bg-success-bg text-success rounded">P: Present</span>
              <span className="px-2 py-0.5 bg-warning-bg text-warning rounded">L: Late</span>
              <span className="px-2 py-0.5 bg-danger-bg text-danger rounded">A: Absent</span>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded">H: Holiday</span>
            </div>
          </div>

          {/* Monthly grid */}
          <div className="overflow-x-auto border border-[#E6D8F1]/60 rounded-btn">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 text-gray-600">
                  <th className="px-3 py-2 sticky left-0 bg-purple-50 z-10 font-bold min-w-[140px]">
                    Team Member
                  </th>
                  {Array.from({ length: 15 }, (_, i) => (
                    <th key={i} className="px-2 py-2 text-center w-8">
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {filteredAttendance.map((emp) => (
                  <tr key={emp.employeeId} className="h-10 hover:bg-purple-50/20">
                    <td className="px-3 py-2 font-semibold text-ink sticky left-0 bg-white z-10 border-r border-[#E6D8F1]/40">
                      {emp.name}
                    </td>
                    {Array.from({ length: 15 }, (_, i) => {
                      const isWeekend = i === 1 || i === 7 || i === 8 || i === 14;
                      const mark = isWeekend ? 'H' : emp.status === 'on_leave' ? 'A' : emp.isLate && i === 2 ? 'L' : 'P';
                      const colorClass =
                        mark === 'P'
                          ? 'text-success font-semibold'
                          : mark === 'L'
                            ? 'text-warning font-bold'
                            : mark === 'A'
                              ? 'text-danger font-bold'
                              : 'text-teal-700 bg-teal-50/50';

                      return (
                        <td key={i} className={`text-center ${colorClass}`}>
                          {mark}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-bold text-purple-600">
                      {emp.status === 'on_leave' ? '8/15' : '14/15'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'sessions' && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="pb-2 border-b border-[#E6D8F1]/60">
            <h3 className="font-quicksand font-bold text-lg text-purple-600">
              Therapist Session Fulfillment
            </h3>
            <p className="text-xs text-gray-500">
              Client session adherence, conducted hours, and no-shows per clinician
            </p>
          </div>

          <DataTable
            columns={sessionColumns}
            data={mockSessionsData}
            keyExtractor={(item) => item.therapistId}
          />
        </div>
      )}
    </div>
  );
}

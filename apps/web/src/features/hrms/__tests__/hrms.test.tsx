import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AttendanceTab } from '../components/AttendanceTab';
import { LeaveTab } from '../components/LeaveTab';
import { HolidayCalendarTab } from '../components/HolidayCalendarTab';
import { ToastProvider } from '@/components/ui/Toast';
import type { HolidayItem } from '../types';

const mockHolidays: HolidayItem[] = [
  { id: 'hol-1', name: 'Diwali', date: '2026-11-08', branchName: 'All branches closed' },
  { id: 'hol-2', name: 'Staff Training', date: '2026-11-20', branchName: 'Indiranagar' },
];

describe('HRMS Feature Components', () => {
  it('AttendanceTab renders headline, stat cards, check-in actions, and daily table', () => {
    const handleManual = vi.fn();

    render(
      <ToastProvider>
        <AttendanceTab onOpenManualEntry={handleManual} branchName="Indiranagar" />
      </ToastProvider>,
    );

    expect(screen.getByText('A supported team. Better care.')).toBeInTheDocument();
    expect(screen.getByText('Present today')).toBeInTheDocument();
    expect(screen.getByText('On leave')).toBeInTheDocument();
    expect(screen.getByText('Late check-ins')).toBeInTheDocument();
    expect(screen.getByText('Leave requests')).toBeInTheDocument();

    const manualBtn = screen.getByRole('button', { name: /manual entry/i });
    expect(manualBtn).toBeInTheDocument();
    fireEvent.click(manualBtn);
    expect(handleManual).toHaveBeenCalledTimes(1);
  });

  it('LeaveTab renders balance cards, requests table, and mandatory approval policy banner', () => {
    const handleApply = vi.fn();
    const handleDirector = vi.fn();
    const handleAction = vi.fn();

    render(
      <ToastProvider>
        <LeaveTab
          onApplyLeave={handleApply}
          onOpenDirectorAvailability={handleDirector}
          onRequestAction={handleAction}
          isDirectorAway={false}
          holidays={mockHolidays}
        />
      </ToastProvider>,
    );

    expect(screen.getByText('Time to recharge. Space to plan.')).toBeInTheDocument();
    expect(screen.getByText('Casual leave')).toBeInTheDocument();
    expect(screen.getByText('Sick leave')).toBeInTheDocument();
    expect(screen.getByText('Earned leave')).toBeInTheDocument();

    // Verify mandatory policy banner
    expect(screen.getByText('Clear approvals, consistent coverage')).toBeInTheDocument();
    expect(screen.getByText(/Director approves leave\. Nikhil Kumar \(Manager\) is the backup approver only when the Director is unavailable\./i)).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /apply for leave/i });
    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalledTimes(1);
  });

  it('HolidayCalendarTab renders full month calendar and holidays directory', () => {
    const handleAdd = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ToastProvider>
        <HolidayCalendarTab
          holidays={mockHolidays}
          onOpenAddHoliday={handleAdd}
          onDeleteHoliday={handleDelete}
        />
      </ToastProvider>,
    );

    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getByText('Month Calendar Grid')).toBeInTheDocument();
    expect(screen.getAllByText('Diwali')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Staff Training')[0]).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /\+ add holiday/i });
    fireEvent.click(addBtn);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});

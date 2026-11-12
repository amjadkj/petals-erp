import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReportsHero } from '../components/ReportsHero';
import { ReportsStatCards } from '../components/ReportsStatCards';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportsTable } from '../components/ReportsTable';
import { RoleKey, ReportStatus, ReportType } from '@petals/types';
import type { ReportItemDto } from '../types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Reports Feature Components', () => {
  it('renders ReportsHero with role-appropriate titles and buttons', () => {
    const onNewReport = vi.fn();
    const onCheckOverdue = vi.fn();

    // Director / Manager
    const { rerender } = render(
      <ReportsHero
        roleKey={RoleKey.DIRECTOR}
        onNewReport={onNewReport}
        onCheckOverdue={onCheckOverdue}
      />,
    );
    expect(screen.getByText('Clinical Reports')).toBeInTheDocument();
    expect(screen.getByText('Check Overdue')).toBeInTheDocument();
    expect(screen.getByText('+ New report')).toBeInTheDocument();

    // Therapist
    rerender(
      <ReportsHero
        roleKey={RoleKey.THERAPIST}
        onNewReport={onNewReport}
      />,
    );
    expect(screen.getByText('My Clinical Reports')).toBeInTheDocument();

    // Parent
    rerender(
      <ReportsHero
        roleKey={RoleKey.PARENT}
      />,
    );
    expect(screen.getByText("Your Child's Progress Reports")).toBeInTheDocument();
    expect(screen.getByText('Export / Print')).toBeInTheDocument();
  });

  it('renders ReportsStatCards accurately for Director vs Parent', () => {
    const { rerender } = render(
      <ReportsStatCards
        roleKey={RoleKey.DIRECTOR}
        totalDue={7}
        totalOverdue={3}
        dueThisWeek={4}
        totalShared={12}
      />,
    );
    expect(screen.getByText('Reports Due')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3 past deadline')).toBeInTheDocument();

    // Parent
    rerender(
      <ReportsStatCards
        roleKey={RoleKey.PARENT}
        totalDue={0}
        totalOverdue={0}
        dueThisWeek={0}
        totalShared={5}
      />,
    );
    expect(screen.getByText('Shared Reports')).toBeInTheDocument();
    expect(screen.getByText('Available to download')).toBeInTheDocument();
  });

  it('filters reports using ReportsFilterBar', () => {
    const onChange = vi.fn();
    render(
      <ReportsFilterBar
        filters={{
          search: '',
          therapistId: '',
          type: '',
          status: '',
          overdueOnly: false,
        }}
        onChange={onChange}
        roleKey={RoleKey.DIRECTOR}
      />,
    );

    const input = screen.getByPlaceholderText('Search by client or report title...');
    fireEvent.change(input, { target: { value: 'Aarav' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Aarav' }),
    );
  });

  it('renders ReportsTable rows with overdue highlights and actions', () => {
    const mockReports: ReportItemDto[] = [
      {
        id: 'rep-1',
        clientId: 'c-1',
        title: 'Q2 OT Assessment',
        type: ReportType.ASSESSMENT,
        status: ReportStatus.DRAFT,
        dueOn: '2026-01-01', // past due
        sharedWithParent: false,
        authorId: 'emp-1',
        isOverdue: true,
        createdAt: '2026-01-01',
        client: {
          id: 'c-1',
          name: 'Aarav Patel',
          clientCode: 'PET-001',
        },
        author: {
          id: 'emp-1',
          employeeCode: 'EMP-01',
          user: { id: 'u-1', name: 'Dr. Sarah' },
        },
      },
    ];

    const onSendReminder = vi.fn();
    render(
      <ReportsTable
        reports={mockReports}
        roleKey={RoleKey.DIRECTOR}
        onSendReminder={onSendReminder}
      />,
    );

    expect(screen.getAllByText('Aarav Patel')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Q2 OT Assessment')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Overdue by/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('Send reminder')[0]).toBeInTheDocument();
  });
});


import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeesHero } from '../components/EmployeesHero';
import { EmployeesStatCards } from '../components/EmployeesStatCards';
import { EmployeesTable } from '../components/EmployeesTable';
import { PerformanceTab } from '../components/PerformanceTab';
import { RoleKey } from '@petals/types';
import type { EmployeeItem } from '../types';

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock recharts ResponsiveContainer to avoid jsdom zero width/height
vi.mock('recharts', async () => {
  const original = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

const mockEmployees: EmployeeItem[] = [
  {
    id: 'e1',
    name: 'Anu Menon',
    email: 'anu@petals.org',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E002',
    designation: 'Senior Speech Therapist',
    department: 'Speech Therapy',
    branchName: 'Indiranagar',
    salary: 55000,
  },
  {
    id: 'e2',
    name: 'Nikhil Kumar',
    email: 'nikhil@petals.org',
    roleKey: RoleKey.MANAGER,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E001',
    designation: 'Centre Manager',
    department: 'Operations',
    branchName: 'Indiranagar',
    salary: 75000,
  },
];

describe('Employees Feature Components', () => {
  it('EmployeesHero renders title and + Add employee button', () => {
    const handleAdd = vi.fn();
    const handleExport = vi.fn();

    render(<EmployeesHero onAddEmployee={handleAdd} onExport={handleExport} />);

    expect(screen.getByText('The people behind every milestone.')).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: /add employee/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('EmployeesStatCards renders all 4 team stat cards', () => {
    render(
      <EmployeesStatCards
        teamMembers={18}
        therapistsCount={14}
        frontOfficeCount={3}
        onLeaveToday={2}
      />,
    );

    expect(screen.getByText('Team members')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Therapists')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('EmployeesTable hides salary column when hasSalaryPermission is false', () => {
    render(
      <EmployeesTable
        employees={mockEmployees}
        hasSalaryPermission={false}
      />,
    );

    expect(screen.getAllByText('Anu Menon')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Nikhil Kumar')[0]).toBeInTheDocument();

    // Verify salary column is completely omitted
    expect(screen.queryByText(/salary \/ month/i)).not.toBeInTheDocument();
    expect(screen.queryByText('₹55,000')).not.toBeInTheDocument();
  });

  it('EmployeesTable shows salary column when hasSalaryPermission is true', () => {
    render(
      <EmployeesTable
        employees={mockEmployees}
        hasSalaryPermission={true}
      />,
    );

    expect(screen.getAllByText('Anu Menon')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/salary \/ month/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText('₹55,000')[0]).toBeInTheDocument();
    expect(screen.getAllByText('₹75,000')[0]).toBeInTheDocument();
  });

  it('PerformanceTab renders performance stat cards, quality snapshot, and handles real data', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <PerformanceTab employee={mockEmployees[0]} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Sessions completed')).toBeInTheDocument();
    expect(screen.getByText('Report timeliness')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Assigned clients')).toBeInTheDocument();

    // Care quality snapshot progress bars
    expect(screen.getByText('Reports filed on time')).toBeInTheDocument();
    expect(screen.getByText('Reports shared with parent')).toBeInTheDocument();
    expect(screen.getByText('Session attendance fulfillment')).toBeInTheDocument();

    // Empty state rendered cleanly when no assigned cases yet
    expect(screen.getByText('No Cases Assigned')).toBeInTheDocument();
    expect(screen.getByText('No Recent Activity')).toBeInTheDocument();
  });
});

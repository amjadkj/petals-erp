import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, Column } from '../DataTable';

interface TestRow {
  id: string;
  name: string;
  role: string;
  status: string;
}

const mockColumns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', isTitle: true },
  { key: 'role', header: 'Role', isSecondary: true },
  { key: 'status', header: 'Status', isStatus: true },
];

const mockData: TestRow[] = [
  { id: '1', name: 'Aarav Sharma', role: 'Therapist', status: 'Active' },
  { id: '2', name: 'Dr. Sneha', role: 'Director', status: 'Active' },
];

describe('DataTable Component', () => {
  it('renders table headers and rows correctly', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        keyExtractor={(item) => item.id}
      />,
    );

    // Desktop table headers exist
    expect(screen.getAllByText('Name')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Role')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Status')[0]).toBeInTheDocument();

    // Data rendered
    expect(screen.getAllByText('Aarav Sharma').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dr. Sneha').length).toBeGreaterThan(0);
  });

  it('renders pagination and handles page change', () => {
    const handlePageChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        keyExtractor={(item) => item.id}
        page={1}
        pageSize={2}
        total={10}
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('renders empty state when data is empty', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        keyExtractor={(item) => item.id}
      />,
    );

    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });
});

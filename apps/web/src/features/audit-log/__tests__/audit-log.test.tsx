import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuditLogHero } from '../components/AuditLogHero';
import { AuditLogFilterBar } from '../components/AuditLogFilterBar';
import { AuditLogTable } from '../components/AuditLogTable';
import type { AuditLogDto } from '../types';

describe('Audit Log Components', () => {
  it('renders AuditLogHero with title and breadcrumb', () => {
    render(<AuditLogHero />);
    expect(screen.getByText('Every change, accounted for.')).toBeInTheDocument();
    expect(screen.getByText('Role access / Audit log')).toBeInTheDocument();
  });

  it('filters audit logs using AuditLogFilterBar', () => {
    const onChange = vi.fn();
    render(
      <AuditLogFilterBar
        filters={{
          userId: '',
          entity: '',
          branchId: '',
          startDate: '',
          endDate: '',
          search: '',
        }}
        onChange={onChange}
        users={[]}
        branches={[]}
      />,
    );

    const input = screen.getByPlaceholderText('Search action or summary...');
    fireEvent.change(input, { target: { value: 'UPDATE_ROLE' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'UPDATE_ROLE' }),
    );
  });

  it('renders AuditLogTable with event details', () => {
    const mockLogs: AuditLogDto[] = [
      {
        id: 'log-1',
        userId: 'u-1',
        action: 'UPDATE_PERMISSIONS',
        entity: 'RolePermission',
        entityId: 'r-1',
        branchId: 'b-1',
        metadata: { role: 'MANAGER', module: 'REPORTS', granted: true },
        ipAddress: '192.168.1.1',
        createdAt: '2026-02-12T14:30:00Z',
        user: {
          id: 'u-1',
          name: 'Amjad Director',
          email: 'director@petals.com',
        },
      },
    ];

    render(<AuditLogTable logs={mockLogs} />);

    expect(screen.getAllByText('Amjad Director')[0]).toBeInTheDocument();
    expect(screen.getAllByText('UPDATE_PERMISSIONS')[0]).toBeInTheDocument();
    expect(screen.getAllByText('RolePermission')[0]).toBeInTheDocument();
  });
});


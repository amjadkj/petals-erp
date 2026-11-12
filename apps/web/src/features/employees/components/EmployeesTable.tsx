'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { Avatar } from '@/components/ui/Avatar';
import { formatINR } from '@/lib/formatters';
import { Lock, ShieldCheck } from 'lucide-react';
import type { EmployeeItem } from '../types';

interface EmployeesTableProps {
  employees: EmployeeItem[];
  hasSalaryPermission: boolean;
  isLoading?: boolean;
}

export function EmployeesTable({
  employees,
  hasSalaryPermission,
  isLoading = false,
}: EmployeesTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedData = employees.slice((page - 1) * pageSize, page * pageSize);

  const handleRowClick = (employee: EmployeeItem) => {
    router.push(`/employees/${employee.id}`);
  };

  const columns: Column<EmployeeItem>[] = [
    {
      key: 'name',
      header: 'Employee',
      isTitle: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={row.name}
            size="md"
          />
          <div>
            <span className="font-semibold text-ink block">{row.name}</span>
            <span className="text-xs font-mono text-gray-400">{row.employeeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-700 font-medium text-sm capitalize">
          {row.designation || row.roleKey?.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{row.department}</span>,
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (row) => <span className="text-gray-600 text-sm">{row.branchName}</span>,
    },
  ];

  // MANDATORY SPEC: Salary column renders ONLY with EMPLOYEE_SALARY:view permission!
  if (hasSalaryPermission) {
    columns.push({
      key: 'salary',
      header: 'Salary / Month',
      isSecondary: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 font-semibold text-ink text-sm">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          <span>{row.salary ? formatINR(row.salary) : '—'}</span>
        </div>
      ),
    });
  }

  columns.push({
    key: 'isActive',
    header: 'Status',
    isStatus: true,
    render: (row) => (
      <StatusChip
        status={row.isActive ? 'active' : 'cancelled'}
        label={row.isActive ? 'Active' : 'Inactive'}
      />
    ),
  });

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E6D8F1]/60">
        <div>
          <h3 className="font-quicksand font-bold text-lg text-purple-600">
            Our Team
          </h3>
          <p className="text-xs text-gray-500">
            Clinical specialists, therapists, front office, and operational managers
          </p>
        </div>

        <div>
          {hasSalaryPermission ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-chip border border-[#E6D8F1]">
              <Lock className="w-3 h-3" /> Director access · Salary visible
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              Team directory
            </span>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
        page={page}
        pageSize={pageSize}
        total={employees.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Mandatory Purple-50 Note Banner */}
      <div className="bg-purple-50/70 border border-[#E6D8F1] rounded-btn p-3.5 text-xs text-purple-800 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <span>
          Salary is visible only with Employees salary permission. Managers without this permission do not see the salary column.
        </span>
      </div>
    </div>
  );
}

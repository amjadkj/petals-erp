'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search } from 'lucide-react';

interface EmployeesFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleChange: (val: string) => void;
  departmentFilter: string;
  onDepartmentChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

export function EmployeesFilterBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
}: EmployeesFilterBarProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search employee name or code..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search className="w-4 h-4" />}
          className="h-10 text-xs"
        />

        <Select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-10 text-xs"
          options={[
            { value: 'ALL', label: 'All roles' },
            { value: 'THERAPIST', label: 'Therapist' },
            { value: 'MANAGER', label: 'Manager' },
            { value: 'DIRECTOR', label: 'Director' },
          ]}
        />

        <Select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
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

        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 text-xs"
          options={[
            { value: 'ALL', label: 'All statuses' },
            { value: 'ACTIVE', label: 'Active team members' },
            { value: 'INACTIVE', label: 'Inactive / Former' },
          ]}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { usePermissionsStore } from '@/lib/permissions/store';
import { employeesApi } from '@/lib/api/employees';
import { departmentsApi } from '@/lib/api/departments';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';

import { EmployeesHero } from './EmployeesHero';
import { EmployeesStatCards } from './EmployeesStatCards';
import { EmployeesFilterBar } from './EmployeesFilterBar';
import { EmployeesTable } from './EmployeesTable';
import { AddEmployeeModal } from './AddEmployeeModal';
import type { EmployeeItem } from '../types';

export function EmployeesView() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  // Check confidential salary permission
  const hasSalaryPermission = can(AppModule.EMPLOYEE_SALARY, PermissionAction.VIEW);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localEmployees, setLocalEmployees] = useState<EmployeeItem[]>([]);

  // Fetch employees
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['employees', selectedBranchId],
    queryFn: () => employeesApi.getEmployees(),
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await departmentsApi.getDepartments();
      return res?.data || [];
    },
  });

  const allEmployees: EmployeeItem[] = useMemo(() => {
    if (employeesResponse?.data && employeesResponse.data.length > 0) {
      return employeesResponse.data.map((emp, idx) => {
        const raw = emp as any;
        return {
          ...emp,
          id: raw.id || `emp-${idx}`,
          name: raw.name || raw.user?.name || 'Staff Member',
          email: raw.email || raw.user?.email || '',
          phone: raw.phone || raw.user?.phone || '',
          roleKey: raw.roleKey || raw.user?.role?.key || 'THERAPIST',
          isActive: raw.isActive ?? raw.user?.isActive ?? true,
          branchIds: raw.branchIds || raw.user?.branches?.map((b: any) => b.branchId) || [],
          employeeCode: raw.employeeCode || `PTL-E00${idx + 1}`,
          designation: raw.designation || 'Specialist',
          department: raw.department?.name || raw.departmentId || 'Speech Therapy',
          branchName: raw.user?.branches?.[0]?.branch?.name || 'Indiranagar',
        };
      });
    }
    return localEmployees;
  }, [employeesResponse, localEmployees]);

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      if (roleFilter !== 'ALL' && emp.roleKey !== roleFilter) return false;
      if (deptFilter !== 'ALL' && emp.department !== deptFilter) return false;
      if (statusFilter !== 'ALL') {
        const isActive = statusFilter === 'ACTIVE';
        if (emp.isActive !== isActive) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (emp.name || '').toLowerCase().includes(q);
        const matchesCode = (emp.employeeCode || '').toLowerCase().includes(q);
        const matchesDept = (emp.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDept) return false;
      }
      return true;
    });
  }, [allEmployees, roleFilter, deptFilter, statusFilter, searchQuery]);

  const handleAddSuccess = (newEmp: EmployeeItem) => {
    setLocalEmployees((prev) => [newEmp, ...prev]);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <EmployeesHero
        onAddEmployee={() => setIsAddModalOpen(true)}
        onExport={() => showToast('Exporting team directory (CSV)...', 'info')}
      />

      {/* 4 Stat Cards */}
      <EmployeesStatCards isLoading={isLoading} />

      {/* Filters */}
      <EmployeesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        departmentFilter={deptFilter}
        onDepartmentChange={setDeptFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departments={departmentsData || []}
      />

      {/* Table */}
      <EmployeesTable
        employees={filteredEmployees}
        hasSalaryPermission={hasSalaryPermission}
        isLoading={isLoading}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        hasSalaryPermission={hasSalaryPermission}
      />
    </div>
  );
}

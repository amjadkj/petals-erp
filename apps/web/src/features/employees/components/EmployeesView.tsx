'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { usePermissionsStore } from '@/lib/permissions/store';
import { employeesApi } from '@/lib/api/employees';
import { AppModule, PermissionAction, RoleKey } from '@petals/types';

import { EmployeesHero } from './EmployeesHero';
import { EmployeesStatCards } from './EmployeesStatCards';
import { EmployeesFilterBar } from './EmployeesFilterBar';
import { EmployeesTable } from './EmployeesTable';
import { AddEmployeeModal } from './AddEmployeeModal';
import type { EmployeeItem } from '../types';

const mockInitialEmployees: EmployeeItem[] = [
  {
    id: 'e1',
    name: 'Anu Menon',
    email: 'anu.menon@petals.org',
    phone: '+91 98450 11223',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E002',
    designation: 'Senior Speech Therapist',
    department: 'Speech Therapy',
    branchName: 'Indiranagar',
    joiningDate: '2023-06-15',
    salary: 55000,
  },
  {
    id: 'e2',
    name: 'Nikhil Kumar',
    email: 'nikhil.kumar@petals.org',
    phone: '+91 98450 22334',
    roleKey: RoleKey.MANAGER,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E001',
    designation: 'Centre Manager',
    department: 'Operations',
    branchName: 'Indiranagar',
    joiningDate: '2022-03-10',
    salary: 75000,
  },
  {
    id: 'e3',
    name: 'Priya Nair',
    email: 'priya.nair@petals.org',
    phone: '+91 98450 33445',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E003',
    designation: 'Lead OT Therapist',
    department: 'Occupational Therapy',
    branchName: 'Indiranagar',
    joiningDate: '2023-01-20',
    salary: 58000,
  },
  {
    id: 'e4',
    name: 'Anita Sen',
    email: 'anita.sen@petals.org',
    phone: '+91 98450 44556',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: ['branch-2'],
    employeeCode: 'PTL-E004',
    designation: 'Behavioural Therapist',
    department: 'Behavioural Therapy',
    branchName: 'Koramangala',
    joiningDate: '2023-09-01',
    salary: 52000,
  },
  {
    id: 'e5',
    name: 'Kavita Pillai',
    email: 'kavita.p@petals.org',
    phone: '+91 98450 55667',
    roleKey: RoleKey.MANAGER,
    isActive: true,
    branchIds: ['branch-1'],
    employeeCode: 'PTL-E005',
    designation: 'Front Office Coordinator',
    department: 'Front Office',
    branchName: 'Indiranagar',
    joiningDate: '2024-02-15',
    salary: 35000,
  },
  {
    id: 'e6',
    name: 'Rahul Bose',
    email: 'rahul.b@petals.org',
    phone: '+91 98450 66778',
    roleKey: RoleKey.THERAPIST,
    isActive: true,
    branchIds: ['branch-1', 'branch-2'],
    employeeCode: 'PTL-E006',
    designation: 'Special Educator',
    department: 'Special Education',
    branchName: 'Indiranagar',
    joiningDate: '2023-11-10',
    salary: 50000,
  },
];

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
  const [localEmployees, setLocalEmployees] = useState<EmployeeItem[]>(mockInitialEmployees);

  // Fetch employees
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['employees', selectedBranchId],
    queryFn: () => employeesApi.getEmployees(),
  });

  const allEmployees: EmployeeItem[] = useMemo(() => {
    if (employeesResponse?.data && employeesResponse.data.length > 0) {
      return employeesResponse.data.map((emp, idx) => ({
        ...emp,
        employeeCode: `PTL-E00${idx + 1}`,
        designation: emp.designation || 'Specialist',
        department: emp.departmentId || 'Speech Therapy',
        branchName: 'Indiranagar',
      }));
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
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesCode = emp.employeeCode?.toLowerCase().includes(q);
        const matchesDept = emp.department?.toLowerCase().includes(q);
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

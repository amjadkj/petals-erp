'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { AppModule, PermissionAction } from '@petals/types';
import { formatINR, formatDateSafe } from '@/lib/formatters';
import { ArrowLeft, Edit, Lock, Mail, Phone, Calendar } from 'lucide-react';

import { OverviewTab } from './OverviewTab';
import { PerformanceTab } from './PerformanceTab';
import { ReportsSubmittedTab } from './ReportsSubmittedTab';
import { ActivityLogTab } from './ActivityLogTab';
import { SessionsConductedTab } from './SessionsConductedTab';
import { AssignedCasesTab } from './AssignedCasesTab';
import { EditEmployeeModal } from './EditEmployeeModal';
import type { EmployeeItem } from '../types';

interface EmployeeDetailViewProps {
  initialEmployee?: EmployeeItem;
  employeeId: string;
}

const defaultMockEmployee: EmployeeItem = {
  id: 'e1',
  name: 'Anu Menon',
  email: 'anu.menon@petals.org',
  phone: '+91 98450 11223',
  roleKey: 'THERAPIST' as any,
  isActive: true,
  branchIds: ['branch-1'],
  employeeCode: 'PTL-E002',
  designation: 'Senior Speech Therapist',
  department: 'Speech Therapy',
  branchName: 'Indiranagar',
  joiningDate: '2023-06-15',
  salary: 55000,
  qualifications: 'MASLP, RCI Certified Speech-Language Pathologist',
  emergencyContact: '+91 98450 99887 (Spouse)',
};

export function EmployeeDetailView({
  initialEmployee,
  employeeId: _employeeId,
}: EmployeeDetailViewProps) {
  const { can } = usePermissions();
  const [employee, setEmployee] = useState<EmployeeItem>(initialEmployee || defaultMockEmployee);
  const [activeTab, setActiveTab] = useState('performance');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check salary permission
  const hasSalaryPermission = can(AppModule.EMPLOYEE_SALARY, PermissionAction.VIEW);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/employees"
          className="hover:text-purple-600 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Employees
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">{employee.name}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar
            name={employee.name}
            size="lg"
            className="w-16 h-16 text-lg shrink-0"
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-quicksand font-bold text-2xl text-ink">
                {employee.name}
              </h1>
              <StatusChip status="active" label="Active" />
              {hasSalaryPermission && employee.salary && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-chip border border-[#E6D8F1]">
                  <Lock className="w-3 h-3" /> Monthly salary {formatINR(employee.salary)}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-gray-600">
              {employee.designation} · <span className="font-mono text-purple-600">{employee.employeeCode}</span> · {employee.branchName}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                {employee.email}
              </span>
              {employee.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  {employee.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Joined {formatDateSafe(employee.joiningDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit profile</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList>
          <TabTrigger value="performance">Performance</TabTrigger>
          <TabTrigger value="overview">Overview</TabTrigger>
          <TabTrigger value="reports">Reports Submitted</TabTrigger>
          <TabTrigger value="activity">Activity Log</TabTrigger>
          <TabTrigger value="sessions">Sessions Conducted</TabTrigger>
          <TabTrigger value="cases">Assigned Cases</TabTrigger>
        </TabList>

        <TabContent value="performance">
          <PerformanceTab
            employee={employee}
            onNavigateToCases={() => setActiveTab('cases')}
          />
        </TabContent>

        <TabContent value="overview">
          <OverviewTab employee={employee} />
        </TabContent>

        <TabContent value="reports">
          <ReportsSubmittedTab employeeId={employee.id} />
        </TabContent>

        <TabContent value="activity">
          <ActivityLogTab employeeId={employee.id} />
        </TabContent>

        <TabContent value="sessions">
          <SessionsConductedTab employeeId={employee.id} />
        </TabContent>

        <TabContent value="cases">
          <AssignedCasesTab employeeId={employee.id} />
        </TabContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <EditEmployeeModal
        employee={employee}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setEmployee(updated)}
      />
    </div>
  );
}

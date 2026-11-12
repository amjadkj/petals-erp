'use client';

import React from 'react';
import { formatDateSafe } from '@/lib/formatters';
import type { EmployeeItem } from '../types';

interface OverviewTabProps {
  employee: EmployeeItem;
}

export function OverviewTab({ employee }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Professional Information */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
        <h3 className="font-quicksand font-bold text-base text-ink pb-2 border-b border-[#E6D8F1]/50">
          Professional Details
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Employee Code</span>
            <span className="font-mono font-semibold text-ink">{employee.employeeCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Designation</span>
            <span className="font-medium text-ink">{employee.designation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Department</span>
            <span className="font-medium text-purple-600">{employee.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Assigned Branch</span>
            <span className="font-medium text-ink">{employee.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date of Joining</span>
            <span className="font-medium text-ink">{formatDateSafe(employee.joiningDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">System Role</span>
            <span className="font-semibold uppercase text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              {employee.roleKey}
            </span>
          </div>
        </div>
      </div>

      {/* Qualifications & Contacts */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
        <h3 className="font-quicksand font-bold text-base text-ink pb-2 border-b border-[#E6D8F1]/50">
          Credentials & Contact Information
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-ink">{employee.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Number</span>
            <span className="font-medium text-ink">{employee.phone || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qualifications</span>
            <span className="font-medium text-ink">{employee.qualifications || 'BASLP, RCI Registered'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Emergency Contact</span>
            <span className="font-medium text-ink">{employee.emergencyContact || '+91 98450 99887 (Spouse)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account Status</span>
            <span className="font-semibold text-success">Active & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

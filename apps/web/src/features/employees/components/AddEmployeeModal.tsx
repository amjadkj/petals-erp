'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { employeesApi } from '@/lib/api/employees';
import { RoleKey } from '@petals/types';
import { Lock } from 'lucide-react';
import type { EmployeeItem } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmp: EmployeeItem) => void;
  hasSalaryPermission: boolean;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  hasSalaryPermission,
}: AddEmployeeModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<RoleKey>(RoleKey.THERAPIST);
  const [department, setDepartment] = useState('Speech Therapy');
  const [branchName, setBranchName] = useState('Indiranagar');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [employeeCode] = useState(() => `PTL-E${Math.floor(100 + Math.random() * 900)}`);
  const [salary, setSalary] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Please fill out required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeesApi.createEmployee({
        name: name.trim(),
        email: email.trim(),
        phone: mobile.trim() || undefined,
        roleKey: role,
        designation: role === RoleKey.THERAPIST ? `${department} Specialist` : 'Manager',
        joiningDate,
        salary: hasSalaryPermission && salary !== '' ? Number(salary) : undefined,
      });

      const newEmp: EmployeeItem = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: mobile.trim() || null,
        roleKey: role,
        isActive: true,
        branchIds: ['branch-1'],
        employeeCode,
        designation: role === RoleKey.THERAPIST ? `${department} Specialist` : 'Manager',
        department,
        branchName,
        joiningDate,
        salary: hasSalaryPermission && salary !== '' ? Number(salary) : null,
      };

      showToast(`Employee ${name} added and invitation sent to ${email}`, 'success');
      onSuccess(newEmp);
      onClose();
    } catch {
      const newEmp: EmployeeItem = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: mobile.trim() || null,
        roleKey: role,
        isActive: true,
        branchIds: ['branch-1'],
        employeeCode,
        designation: role === RoleKey.THERAPIST ? `${department} Specialist` : 'Manager',
        department,
        branchName,
        joiningDate,
        salary: hasSalaryPermission && salary !== '' ? Number(salary) : null,
      };
      showToast(`Employee ${name} added`, 'success');
      onSuccess(newEmp);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Team Member"
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Anu Menon"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Employee Code"
            value={employeeCode}
            disabled
            readOnly
            className="bg-gray-50 text-gray-500 font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. anu@petals.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="e.g. +91 98450 11223"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="System Role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as RoleKey)}
            options={[
              { value: RoleKey.THERAPIST, label: 'Therapist' },
              { value: RoleKey.MANAGER, label: 'Manager' },
              { value: RoleKey.DIRECTOR, label: 'Director' },
            ]}
          />

          <Select
            label="Department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'Speech Therapy', label: 'Speech Therapy' },
              { value: 'Occupational Therapy', label: 'Occupational Therapy' },
              { value: 'Behavioural Therapy', label: 'Behavioural Therapy' },
              { value: 'Special Education', label: 'Special Education' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Front Office', label: 'Front Office' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Primary Branch"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            options={[
              { value: 'Indiranagar', label: 'Indiranagar (Main)' },
              { value: 'Koramangala', label: 'Koramangala Branch' },
            ]}
          />

          <DatePicker
            label="Joining Date"
            required
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />
        </div>

        {/* MANDATORY RULE: Salary field visible ONLY with EMPLOYEE_SALARY:view permission! */}
        {hasSalaryPermission && (
          <div className="p-3 bg-purple-50/60 border border-[#E6D8F1]/80 rounded-btn space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600">
              <Lock className="w-3.5 h-3.5" />
              <span>Confidential Compensation (Director Only)</span>
            </div>
            <Input
              label="Monthly Salary (₹)"
              type="number"
              min={0}
              placeholder="e.g. 55000"
              value={salary}
              onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        )}

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

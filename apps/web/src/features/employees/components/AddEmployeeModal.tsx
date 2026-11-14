'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { employeesApi } from '@/lib/api/employees';
import { branchesApi } from '@/lib/api/branches';
import { departmentsApi } from '@/lib/api/departments';
import { usePermissionsStore } from '@/lib/permissions/store';
import { BranchDto, DepartmentDto, RoleKey } from '@petals/types';
import { Lock, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import type { EmployeeItem } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmp: EmployeeItem) => void;
  hasSalaryPermission: boolean;
}

const INDIAN_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  hasSalaryPermission,
}: AddEmployeeModalProps) {
  const { showToast } = useToast();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [mobile, setMobile] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [role, setRole] = useState<RoleKey>(RoleKey.THERAPIST);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch branches and departments from the database
  useEffect(() => {
    let isMounted = true;
    branchesApi
      .getBranches()
      .then((res) => {
        if (isMounted && res?.data) {
          setBranches(res.data);
        }
      })
      .catch(() => {});

    departmentsApi
      .getDepartments()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setDepartments(res.data);
          setDepartmentId(res.data[0].id);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeDept = departments.find((d) => d.id === departmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPhoneError('');

    if (!name.trim() || !email.trim()) {
      showToast('Please fill out full name and email address', 'error');
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (mobile.trim() && !INDIAN_PHONE_REGEX.test(mobile.trim())) {
      setPhoneError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (!selectedBranchId) {
      showToast('Please select a specific branch from the header switcher first', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await employeesApi.createEmployee({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: mobile.trim() || undefined,
        roleKey: role,
        branchId: selectedBranchId,
        departmentId: departmentId || undefined,
        departmentName: activeDept?.name,
        designation:
          role === RoleKey.THERAPIST
            ? `${activeDept?.name || 'Therapy'} Specialist`
            : role === RoleKey.MANAGER
            ? 'Manager'
            : 'Director',
        joinedOn: joiningDate,
        salary: hasSalaryPermission && salary !== '' ? Number(salary) : undefined,
      });

      const created = res?.data as any;
      const newEmp: EmployeeItem = {
        id: created?.id || `emp-${Date.now()}`,
        name: created?.user?.name || name.trim(),
        email: created?.user?.email || email.trim(),
        phone: created?.user?.phone || mobile.trim() || null,
        roleKey: created?.user?.role?.key || role,
        isActive: true,
        branchIds: [selectedBranchId],
        employeeCode: created?.employeeCode || `PTL-E${Math.floor(100 + Math.random() * 900)}`,
        designation:
          created?.designation ||
          (role === RoleKey.THERAPIST
            ? `${activeDept?.name || 'Therapy'} Specialist`
            : 'Manager'),
        department: created?.department?.name || activeDept?.name || 'General',
        departmentId: created?.department?.id || departmentId,
        branchName: activeBranch?.name || 'Assigned Branch',
        joiningDate,
        salary: hasSalaryPermission && salary !== '' ? Number(salary) : null,
      };

      showToast(`Employee ${name} added successfully`, 'success');
      onSuccess(newEmp);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create employee';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Team Member"
      maxWidth="max-w-[520px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedBranchId && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Please select a specific branch in the top header switcher before creating an employee.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Anu Menon"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. anu@petals.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Initial Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Min. 8 characters"
            value={password}
            error={passwordError}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError && e.target.value.length >= 8) {
                setPasswordError('');
              }
            }}
            trailingIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="e.g. 9845011223"
            value={mobile}
            error={phoneError}
            onChange={(e) => {
              setMobile(e.target.value);
              if (phoneError) setPhoneError('');
            }}
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
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={
              departments.length > 0
                ? departments.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.code})`,
                  }))
                : [{ value: '', label: 'Loading departments...' }]
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Primary Branch"
            value={
              activeBranch?.name ||
              (selectedBranchId ? 'Selected Branch' : 'No branch selected in header')
            }
            disabled
            readOnly
            className="bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
            helperText="Inherited from the active branch in header"
            leadingIcon={<Building2 className="w-3.5 h-3.5 text-gray-400" />}
          />

          <DatePicker
            label="Joining Date"
            required
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />
        </div>

        {/* Confidential Salary - Director Only */}
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
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !selectedBranchId}
          >
            {isSubmitting ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

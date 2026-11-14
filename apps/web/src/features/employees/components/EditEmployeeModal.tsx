'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { employeesApi } from '@/lib/api/employees';
import { departmentsApi } from '@/lib/api/departments';
import { branchesApi } from '@/lib/api/branches';
import { BranchDto, DepartmentDto } from '@petals/types';
import type { EmployeeItem } from '../types';

const INDIAN_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;

interface EditEmployeeModalProps {
  employee: EmployeeItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: EmployeeItem) => void;
}

export function EditEmployeeModal({
  employee,
  isOpen,
  onClose,
  onSuccess,
}: EditEmployeeModalProps) {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [designation, setDesignation] = useState(employee.designation);
  const [departmentId, setDepartmentId] = useState(employee.departmentId || '');
  const [branchId, setBranchId] = useState(employee.branchIds?.[0] || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [qualifications, setQualifications] = useState(employee.qualifications || '');
  const [emergencyContact, setEmergencyContact] = useState(employee.emergencyContact || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever employee changes or modal opens
  useEffect(() => {
    setDesignation(employee.designation);
    setDepartmentId(employee.departmentId || '');
    setBranchId(employee.branchIds?.[0] || '');
    setPhone(employee.phone || '');
    setQualifications(employee.qualifications || '');
    setEmergencyContact(employee.emergencyContact || '');
    setPhoneError('');
  }, [employee, isOpen]);

  // Load departments and branches from database
  useEffect(() => {
    let isMounted = true;
    departmentsApi
      .getDepartments()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setDepartments(res.data);
          if (!employee.departmentId) {
            const match = res.data.find(
              (d) => d.name.toLowerCase() === (employee.department || '').toLowerCase(),
            );
            if (match) setDepartmentId(match.id);
            else setDepartmentId(res.data[0].id);
          }
        }
      })
      .catch(() => {});

    branchesApi
      .getBranches()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setBranches(res.data);
          if (!employee.branchIds?.[0]) {
            const match = res.data.find(
              (b) => b.name.toLowerCase() === (employee.branchName || '').toLowerCase(),
            );
            if (match) setBranchId(match.id);
            else setBranchId(res.data[0].id);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [employee.departmentId, employee.department, employee.branchIds, employee.branchName]);

  const activeDept = departments.find((d) => d.id === departmentId);
  const activeBranch = branches.find((b) => b.id === branchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (phone.trim() && !INDIAN_PHONE_REGEX.test(phone.trim())) {
      setPhoneError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeesApi.updateEmployee(employee.id, {
        designation,
        departmentId: departmentId || undefined,
        phone: phone.trim() || undefined,
        branchId: branchId || undefined,
      });

      const updated: EmployeeItem = {
        ...employee,
        designation,
        department: activeDept?.name || employee.department,
        departmentId: departmentId || employee.departmentId,
        phone: phone.trim() || null,
        branchName: activeBranch?.name || employee.branchName,
        branchIds: branchId ? [branchId] : employee.branchIds,
        qualifications,
        emergencyContact,
      };

      showToast(`Profile updated for ${employee.name}`, 'success');
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Failed to update employee';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile · ${employee.name}`}
      maxWidth="max-w-[480px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Designation / Title"
          required
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
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

          <Select
            label="Assigned Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={
              branches.length > 0
                ? branches.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))
                : [
                    { value: employee.branchIds?.[0] || '', label: employee.branchName },
                  ]
            }
          />
        </div>

        <Input
          label="Mobile Phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (phoneError) setPhoneError('');
          }}
          error={phoneError}
          placeholder="e.g. 9876543210"
        />

        <Input
          label="Professional Qualifications & Licences"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
        />

        <Input
          label="Emergency Contact"
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


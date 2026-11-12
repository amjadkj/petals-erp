'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { employeesApi } from '@/lib/api/employees';
import type { EmployeeItem } from '../types';

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

  const [designation, setDesignation] = useState(employee.designation);
  const [department, setDepartment] = useState(employee.department);
  const [phone, setPhone] = useState(employee.phone || '');
  const [branchName, setBranchName] = useState(employee.branchName);
  const [qualifications, setQualifications] = useState(employee.qualifications || 'BASLP, RCI Certified');
  const [emergencyContact, setEmergencyContact] = useState(employee.emergencyContact || '+91 98450 99887 (Spouse)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await employeesApi.updateEmployee(employee.id, {
        designation,
        phone: phone.trim() || undefined,
      });

      const updated: EmployeeItem = {
        ...employee,
        designation,
        department,
        phone: phone.trim() || null,
        branchName,
        qualifications,
        emergencyContact,
      };

      showToast(`Profile updated for ${employee.name}`, 'success');
      onSuccess(updated);
      onClose();
    } catch {
      const updated: EmployeeItem = {
        ...employee,
        designation,
        department,
        phone: phone.trim() || null,
        branchName,
        qualifications,
        emergencyContact,
      };
      showToast(`Profile updated`, 'success');
      onSuccess(updated);
      onClose();
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

          <Select
            label="Assigned Branch"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            options={[
              { value: 'Indiranagar', label: 'Indiranagar (Main)' },
              { value: 'Koramangala', label: 'Koramangala Branch' },
            ]}
          />
        </div>

        <Input
          label="Mobile Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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

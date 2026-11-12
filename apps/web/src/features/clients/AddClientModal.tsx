'use client';

import React, { useState } from 'react';
import { Modal, Input, Select, DatePicker, Checkbox, Button, useToast } from '@/components/ui';
import { clientsApi } from '@/lib/api/clients';
import { usePermissionsStore } from '@/lib/permissions/store';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClientId: string) => void;
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

export function AddClientModal({
  isOpen,
  onClose,
  onSuccess,
  branches,
  departments,
}: AddClientModalProps) {
  const { selectedBranchId } = usePermissionsStore();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [branchId, setBranchId] = useState(
    selectedBranchId && selectedBranchId !== 'ALL'
      ? selectedBranchId
      : branches[0]?.id || '',
  );
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [relation, setRelation] = useState('Mother');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default branchId if changed
  React.useEffect(() => {
    if (selectedBranchId && selectedBranchId !== 'ALL') {
      setBranchId(selectedBranchId);
    } else if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [selectedBranchId, branches, branchId]);

  React.useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  const isValid =
    name.trim().length > 0 &&
    dob.length > 0 &&
    branchId.length > 0 &&
    guardianName.trim().length > 0 &&
    phone.trim().length >= 10 &&
    consent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Format phone with +91 prefix if not present
    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+91')
      ? cleanPhone
      : `+91${cleanPhone.replace(/^0+/, '')}`;

    try {
      const res = await clientsApi.createClient({
        name: name.trim(),
        dob: new Date(dob).toISOString(),
        branchId,
        guardians: [
          {
            name: guardianName.trim(),
            phone: formattedPhone,
            email: email.trim() || undefined,
            relation,
            isPrimary: true,
            whatsappConsent: consent,
            emailConsent: consent,
          },
        ],
      });

      showToast('Client added successfully!', 'success');
      onSuccess(res.data.id);
      onClose();
      // Reset form
      setName('');
      setDob('');
      setGuardianName('');
      setPhone('');
      setEmail('');
      setConsent(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to add client. Please verify information and try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const relationOptions = [
    { value: 'Mother', label: 'Mother' },
    { value: 'Father', label: 'Father' },
    { value: 'Guardian', label: 'Legal Guardian' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add client"
      maxWidth="max-w-[560px]"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-4 text-xs md:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="h-10 px-5 text-xs md:text-sm font-semibold"
          >
            {isSubmitting ? 'Adding...' : 'Add client'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn border border-danger/30 font-medium">
            {error}
          </div>
        )}

        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Child & Guardian Details
        </div>

        {/* Row 1: Child Full Name & DOB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Child's full name"
            required
            placeholder="e.g. Aadhya Nair"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <DatePicker
            label="Date of birth"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Row 2: Branch & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Branch"
            required
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={branchOptions}
          />

          <Select
            label="Department"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={deptOptions}
          />
        </div>

        {/* Row 3: Guardian Name & Relation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Guardian name"
            required
            placeholder="e.g. Deepa Nair"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />

          <Select
            label="Relation"
            required
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            options={relationOptions}
          />
        </div>

        {/* Row 4: Mobile & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Mobile number"
            required
            type="tel"
            placeholder="9876543210"
            leadingIcon={<span className="text-xs font-semibold text-gray-500">+91</span>}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Guardian email"
            type="email"
            placeholder="parent@example.com"
            helperText="Needed for parent portal login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <div className="flex items-start gap-2.5 p-3 bg-purple-50/50 rounded-btn border border-[#E6D8F1]/60">
            <Checkbox
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              id="consent-checkbox"
              className="mt-0.5"
            />
            <label htmlFor="consent-checkbox" className="text-xs text-ink leading-relaxed cursor-pointer">
              Guardian consents to storing care information and receiving clinic updates. Read the{' '}
              <span className="text-purple-600 underline font-semibold">privacy notice</span>.
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

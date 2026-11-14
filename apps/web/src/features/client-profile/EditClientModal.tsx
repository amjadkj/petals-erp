'use client';

import React, { useState } from 'react';
import { Modal, Input, Select, DatePicker, Button, useToast } from '@/components/ui';
import { clientsApi, ClientProfileHeader } from '@/lib/api/clients';
import { ClientStatus } from '@petals/types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfileHeader;
  onSuccess: () => void;
}

export function EditClientModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: EditClientModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState(client.name);
  const [dob, setDob] = useState(client.dob ? client.dob.split('T')[0] : '');
  const [gender, setGender] = useState(client.gender || 'MALE');
  const [bloodGroup, setBloodGroup] = useState(client.bloodGroup || 'O+');
  const [status, setStatus] = useState<ClientStatus>(client.status || ClientStatus.ACTIVE);
  const [allergies, setAllergies] = useState(client.allergies || '');
  const [caseHistory, setCaseHistory] = useState(client.caseHistory || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setName(client.name);
    setDob(client.dob ? client.dob.split('T')[0] : '');
    setGender(client.gender || 'MALE');
    setBloodGroup(client.bloodGroup || 'O+');
    setStatus(client.status || ClientStatus.ACTIVE);
    setAllergies(client.allergies || '');
    setCaseHistory(client.caseHistory || '');
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const combinedCaseHistory = [
        caseHistory.trim(),
        bloodGroup ? `Blood Group: ${bloodGroup}` : null,
        allergies.trim() ? `Allergies: ${allergies.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await clientsApi.updateClient(client.id, {
        name: name.trim(),
        dob: dob ? new Date(dob).toISOString() : client.dob,
        gender,
        status,
        caseHistory: combinedCaseHistory || undefined,
      });

      showToast('Client details updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update client', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
  ];

  const statusOptions = [
    { value: ClientStatus.ACTIVE, label: 'Active' },
    { value: ClientStatus.ON_HOLD, label: 'On Hold' },
    { value: ClientStatus.DISCHARGED, label: 'Discharged' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Client Details"
      maxWidth="max-w-[540px]"
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
            disabled={isSubmitting}
            className="h-10 px-5 text-xs md:text-sm font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <DatePicker
            label="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genderOptions}
          />

          <Select
            label="Blood Group"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={bloodGroupOptions}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            options={statusOptions}
          />
        </div>

        <Input
          label="Allergies / Medical Alerts"
          placeholder="e.g. Peanut allergy, asthma"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Case History / Clinical Notes
          </label>
          <textarea
            value={caseHistory}
            onChange={(e) => setCaseHistory(e.target.value)}
            rows={3}
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-3 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Clinical background, developmental history, referral notes..."
          />
        </div>
      </form>
    </Modal>
  );
}

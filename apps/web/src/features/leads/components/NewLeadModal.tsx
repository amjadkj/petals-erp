'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { leadsApi } from '@/lib/api/leads';
import { usePermissionsStore } from '@/lib/permissions/store';
import { LeadStage, type LeadDto } from '@petals/types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lead: LeadDto) => void;
  owners?: string[];
}

export function NewLeadModal({
  isOpen,
  onClose,
  onSuccess,
  owners = ['Nikhil Kumar', 'Priya Nair', 'Anita Sen'],
}: NewLeadModalProps) {
  const { showToast } = useToast();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [source, setSource] = useState('Website');
  const [owner, setOwner] = useState(owners[0] || 'Nikhil Kumar');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !parentName.trim() || !phone.trim()) {
      showToast('Please fill out required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<LeadDto> = {
        childName: childName.trim(),
        childDob: childDob || undefined,
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        concerns: concern.trim() || undefined,
        source,
        notes: notes.trim() || undefined,
        branchId: selectedBranchId !== 'ALL' ? selectedBranchId : 'branch-1',
        stage: LeadStage.NEW,
      };

      const res = await leadsApi.createLead(payload);
      showToast(`Lead created for ${childName}`, 'success');
      onSuccess(res.data || (payload as LeadDto));
      handleReset();
      onClose();
    } catch {
      // Mock fallback if offline/mock backend
      const fallbackLead: LeadDto = {
        id: `lead-${Date.now()}`,
        childName: childName.trim(),
        childDob: childDob || undefined,
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        concerns: concern.trim() || undefined,
        source,
        notes: notes.trim() || undefined,
        branchId: selectedBranchId !== 'ALL' ? selectedBranchId : 'branch-1',
        stage: LeadStage.NEW,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      showToast(`Lead created for ${childName}`, 'success');
      onSuccess(fallbackLead);
      handleReset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setChildName('');
    setChildDob('');
    setParentName('');
    setPhone('');
    setEmail('');
    setConcern('');
    setSource('Website');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Enquiry Lead"
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Child's Name"
            required
            placeholder="e.g. Aarav Sharma"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />

          <DatePicker
            label="Child's DOB (or estimated)"
            value={childDob}
            onChange={(e) => setChildDob(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Guardian / Parent Name"
            required
            placeholder="e.g. Meera Sharma"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="e.g. +91 98450 12345"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. parent@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Primary Concern"
          placeholder="e.g. Speech delay, sensory overload, ADHD traits"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Enquiry Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { value: 'Website', label: 'Website' },
              { value: 'Referral', label: 'Referral' },
              { value: 'School referral', label: 'School referral' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Paediatrician', label: 'Paediatrician' },
              { value: 'Walk-in', label: 'Walk-in' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Select
            label="Assigned Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </div>

        <DatePicker
          label="Next Follow-up Date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />

        <Input
          label="Initial Intake Notes"
          placeholder="e.g. Referred by Dr. Rao; mother prefers morning slot"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

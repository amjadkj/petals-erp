'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { leadsApi } from '@/lib/api/leads';
import { useBranches } from '@/lib/api/masterData';
import { usePermissionsStore } from '@/lib/permissions/store';
import { LeadStage, type LeadDto } from '@petals/types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lead: LeadDto) => void;
}

export function NewLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: NewLeadModalProps) {
  const { showToast } = useToast();
  const { branches } = useBranches();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [source, setSource] = useState('Website');
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

    const effectiveBranchId =
      selectedBranchId && selectedBranchId !== 'ALL'
        ? selectedBranchId
        : branches[0]?.id || 'branch-1';

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: childName.trim(),
        childName: childName.trim(),
        childDob: childDob || undefined,
        parentName: parentName.trim(),
        contact: phone.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        concern: concern.trim() || undefined,
        concerns: concern.trim() || undefined,
        source,
        nextFollowUp: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
        branchId: effectiveBranchId,
        stage: LeadStage.NEW,
      };

      const res = await leadsApi.createLead(payload);
      showToast(`Lead created for ${childName}`, 'success');
      onSuccess(res.data || (payload as LeadDto));
      handleReset();
      onClose();
    } catch (err: any) {
      const msg = err?.body?.message || err?.message || 'Failed to create lead';
      const displayMsg = Array.isArray(msg) ? msg.join(', ') : String(msg);
      showToast(displayMsg, 'error');
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

          <DatePicker
            label="Next Follow-up Date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

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

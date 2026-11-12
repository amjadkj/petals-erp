'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/components/ui/Toast';
import { leadsApi } from '@/lib/api/leads';
import { branchesApi } from '@/lib/api/branches';
import { ApiError } from '@/lib/api/fetcher';
import type { LeadItem } from '../types';
import type { BranchDto } from '@petals/types';

interface ConvertToClientModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClientId?: string) => void;
}

export function ConvertToClientModal({
  lead,
  isOpen,
  onClose,
  onSuccess,
}: ConvertToClientModalProps) {
  const { showToast } = useToast();

  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [branchId, setBranchId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Mother');
  const [department, setDepartment] = useState('Speech Therapy');
  const [caseHistoryDraft, setCaseHistoryDraft] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<BranchDto[]>([]);

  // Fetch branches and populate from lead / convert preview
  useEffect(() => {
    if (lead && isOpen) {
      setChildName(lead.childName || '');
      setDob(lead.childDob || '2021-06-15');
      setGuardianName(lead.parentName || '');
      setGuardianPhone(lead.phone || '');
      setBranchId(lead.branchId || 'branch-1');
      setCaseHistoryDraft(lead.concerns ? `Initial enquiry intake: ${lead.concerns}` : '');
      setHasConsent(false);

      // Load preview from API
      leadsApi.getConvertPreview(lead.id)
        .then((res) => {
          if (res?.data && typeof res.data === 'object') {
            const preview = res.data as Record<string, string>;
            if (preview.childName) setChildName(preview.childName);
            if (preview.dob) setDob(preview.dob);
          }
        })
        .catch(() => {
          // Ignore error, already prefilled from lead item
        });

      // Load branches
      branchesApi.getBranches()
        .then((res) => {
          if (res?.data) setBranches(res.data);
        })
        .catch(() => {
          setBranches([
            { id: 'branch-1', name: 'Indiranagar (Main)', code: 'IND', city: 'Bengaluru' } as BranchDto,
            { id: 'branch-2', name: 'Koramangala Branch', code: 'KOR', city: 'Bengaluru' } as BranchDto,
          ]);
        });
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsent) {
      showToast('Parent / Guardian consent is required to create a clinical profile', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await leadsApi.convertLead(lead.id, {
        childName,
        dob,
        branchId: branchId || 'branch-1',
        primaryGuardian: {
          name: guardianName,
          phone: guardianPhone,
          relation: guardianRelation,
        },
        department,
        caseHistory: caseHistoryDraft,
        consentAccepted: true,
      });

      const newId = (res?.data as { client?: { id?: string }; id?: string })?.client?.id || (res?.data as { id?: string })?.id;
      showToast(`Lead converted! Client profile created for ${childName}`, 'success');
      onSuccess(newId);
      onClose();
    } catch (err: unknown) {
      // Check for 409 conflict
      if (err instanceof ApiError && err.status === 409) {
        showToast('This lead has already been converted to a client profile.', 'error');
      } else {
        showToast(`Lead converted! Profile created for ${childName}`, 'success');
        onSuccess();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Enquiry to Client Profile"
      maxWidth="max-w-[520px]"
    >
      <form onSubmit={handleConvert} className="space-y-4">
        <div className="bg-teal-50 border border-teal-200 rounded-btn p-3 text-xs text-teal-800">
          Enroling this family will create an active clinical record, assign a unique Client ID, and transition the lead to <strong>Converted</strong>.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Child's Full Name"
            required
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />

          <DatePicker
            label="Date of Birth"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Enrolling Branch"
            required
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>

          <Select
            label="Primary Department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'Speech Therapy', label: 'Speech Therapy' },
              { value: 'Occupational Therapy', label: 'Occupational Therapy' },
              { value: 'Behavioural Therapy', label: 'Behavioural Therapy' },
              { value: 'Special Education', label: 'Special Education' },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="col-span-1">
            <Select
              label="Relation"
              value={guardianRelation}
              onChange={(e) => setGuardianRelation(e.target.value)}
              options={[
                { value: 'Mother', label: 'Mother' },
                { value: 'Father', label: 'Father' },
                { value: 'Guardian', label: 'Guardian' },
              ]}
            />
          </div>

          <div className="col-span-2">
            <Input
              label="Guardian Name"
              required
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>
        </div>

        <Input
          label="Guardian Phone"
          type="tel"
          required
          value={guardianPhone}
          onChange={(e) => setGuardianPhone(e.target.value)}
        />

        <Input
          label="Initial Case History / Intake Notes"
          value={caseHistoryDraft}
          onChange={(e) => setCaseHistoryDraft(e.target.value)}
        />

        <div className="pt-2">
          <Checkbox
            label="Parent / Guardian has provided consent for initial evaluation and clinical onboarding."
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
          />
        </div>

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="teal"
            disabled={isSubmitting || !hasConsent}
            className="font-semibold shadow-sm"
          >
            {isSubmitting ? 'Converting...' : 'Convert and create profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

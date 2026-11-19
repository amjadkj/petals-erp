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
import { ApiError } from '@/lib/api/fetcher';
import type { LeadItem } from '../types';

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
  const [gender, setGender] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Mother');
  const [caseHistoryDraft, setCaseHistoryDraft] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate from lead / convert preview
  useEffect(() => {
    if (lead && isOpen) {
      setChildName(lead.childName || lead.name || '');
      setDob(lead.childDob || '2021-06-15');
      setGuardianName(lead.parentName || '');
      setGuardianPhone(lead.phone || lead.contact || '');
      setGuardianEmail(lead.email || '');
      setCaseHistoryDraft(lead.concerns || lead.concern ? `Initial enquiry intake: ${lead.concerns || lead.concern}` : '');
      setHasConsent(false);

      // Load preview from API to get any enriched fields from backend
      leadsApi
        .getConvertPreview(lead.id)
        .then((res) => {
          if (res?.data && typeof res.data === 'object') {
            const preview = res.data as Record<string, any>;
            if (preview.name || preview.childName) setChildName(preview.name || preview.childName);
            if (preview.dob) setDob(preview.dob);
            if (preview.guardianName) setGuardianName(preview.guardianName);
            if (preview.guardianPhone) setGuardianPhone(preview.guardianPhone);
            if (preview.guardianEmail) setGuardianEmail(preview.guardianEmail);
            if (preview.guardianRelation) setGuardianRelation(preview.guardianRelation);
            if (preview.caseHistory) setCaseHistoryDraft(preview.caseHistory);
          }
        })
        .catch(() => {
          // Keep prefilled state from lead
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

    if (!childName.trim() || !dob || !guardianName.trim() || !guardianPhone.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: childName.trim(),
        dob,
        gender: gender || undefined,
        caseHistory: caseHistoryDraft.trim() || undefined,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim() || undefined,
        guardianWhatsApp: guardianPhone.trim() || undefined,
        guardianRelation: guardianRelation || 'Parent',
        guardianConsent: hasConsent,
      };

      const res = await leadsApi.convertLead(lead.id, payload);

      const newId =
        (res?.data as { client?: { id?: string }; id?: string })?.client?.id ||
        (res?.data as { id?: string })?.id;
      showToast(`Lead converted! Client profile created for ${childName}`, 'success');
      onSuccess(newId);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        showToast('This lead has already been converted to a client profile.', 'error');
      } else {
        const msg = err?.body?.message || err?.message || 'Failed to convert lead';
        const displayMsg = Array.isArray(msg) ? msg.join(', ') : String(msg);
        showToast(displayMsg, 'error');
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
          Enrolling this family will create an active clinical record, assign a unique Client ID, and transition the lead to <strong>Converted</strong>.
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
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: '', label: 'Select Gender (Optional)' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Select
            label="Guardian Relation"
            value={guardianRelation}
            onChange={(e) => setGuardianRelation(e.target.value)}
            options={[
              { value: 'Mother', label: 'Mother' },
              { value: 'Father', label: 'Father' },
              { value: 'Guardian', label: 'Guardian' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Guardian Name"
            required
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />

          <Input
            label="Guardian Phone"
            type="tel"
            required
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
          />
        </div>

        <Input
          label="Guardian Email"
          type="email"
          placeholder="e.g. parent@example.com"
          value={guardianEmail}
          onChange={(e) => setGuardianEmail(e.target.value)}
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

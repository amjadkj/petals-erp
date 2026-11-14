'use client';

import React, { useState } from 'react';
import { Modal, Input, Select, DatePicker, Button, useToast } from '@/components/ui';
import { clientsApi } from '@/lib/api/clients';
import { ProgressLevel } from '@petals/types';

interface AddProgressEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subgoalId: string;
  subgoalTitle?: string;
  onSuccess: () => void;
}

export function AddProgressEntryModal({
  isOpen,
  onClose,
  subgoalId,
  subgoalTitle,
  onSuccess,
}: AddProgressEntryModalProps) {
  const { showToast } = useToast();

  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [level, setLevel] = useState<ProgressLevel>(ProgressLevel.PROGRESSING);
  const [description, setDescription] = useState('');
  const [clientResponse, setClientResponse] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !subgoalId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await clientsApi.createProgressEntry(subgoalId, {
        entryDate: new Date(entryDate).toISOString(),
        level,
        description: description.trim(),
        response: clientResponse.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      showToast('Progress entry recorded!', 'success');
      onSuccess();
      onClose();
      setDescription('');
      setClientResponse('');
      setRemarks('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to record progress entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const levelOptions = [
    { value: ProgressLevel.REGRESSED, label: 'Regressed' },
    { value: ProgressLevel.NO_CHANGE, label: 'No Change' },
    { value: ProgressLevel.EMERGING, label: 'Emerging' },
    { value: ProgressLevel.PROGRESSING, label: 'Progressing' },
    { value: ProgressLevel.ACHIEVED, label: 'Achieved' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Progress Entry"
      maxWidth="max-w-[500px]"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-3 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!description.trim() || isSubmitting}
            className="h-9 px-4 text-xs font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {subgoalTitle && (
          <div className="p-3 bg-purple-50/50 rounded-btn border border-[#E6D8F1]/60 text-xs">
            <span className="font-semibold text-purple-800">Target Subgoal:</span>{' '}
            <span className="text-gray-700">{subgoalTitle}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <DatePicker
            label="Entry Date"
            required
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />

          <Select
            label="Progress Level"
            required
            value={level}
            onChange={(e) => setLevel(e.target.value as ProgressLevel)}
            options={levelOptions}
          />
        </div>

        <Input
          label="Session Activity / Milestone Prompt"
          required
          placeholder="e.g. Produces 3-word sentence with tactile prompt"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Client Response
          </label>
          <textarea
            value={clientResponse}
            onChange={(e) => setClientResponse(e.target.value)}
            rows={2}
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-2.5 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Child spontaneously imitated target words on 7/10 trials..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Therapist Remarks / Home Strategy
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-2.5 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Advised parents to reinforce during dinner routine..."
          />
        </div>
      </form>
    </Modal>
  );
}

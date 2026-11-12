'use client';

import React, { useState } from 'react';
import { Modal, Input, DatePicker, Button, useToast } from '@/components/ui';
import { clientsApi, AssessmentItem } from '@/lib/api/clients';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess: () => void;
}

export function AddAssessmentModal({
  isOpen,
  onClose,
  clientId,
  onSuccess,
}: AddAssessmentModalProps) {
  const { showToast } = useToast();

  const [tool, setTool] = useState('');
  const [assessedAt, setAssessedAt] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [summary, setSummary] = useState('');
  const [scoreReceptive, setScoreReceptive] = useState('75');
  const [scoreExpressive, setScoreExpressive] = useState('60');
  const [scorePragmatics, setScorePragmatics] = useState('70');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool.trim() || !assessedAt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await clientsApi.createAssessment(clientId, {
        tool: tool.trim(),
        assessedAt: new Date(assessedAt).toISOString(),
        observations: observations.trim() || undefined,
        summary: summary.trim() || undefined,
        scores: {
          Receptive: Number(scoreReceptive) || 0,
          Expressive: Number(scoreExpressive) || 0,
          Pragmatics: Number(scorePragmatics) || 0,
        },
      });

      showToast('Assessment recorded successfully!', 'success');
      onSuccess();
      onClose();
      setTool('');
      setObservations('');
      setSummary('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Clinical Assessment"
      maxWidth="max-w-[540px]"
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
            disabled={!tool.trim() || isSubmitting}
            className="h-9 px-4 text-xs font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Add Assessment'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Assessment Tool / Protocol"
            required
            placeholder="e.g. PLS-5, SPM-2, REELS"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
          />

          <DatePicker
            label="Assessment Date"
            required
            value={assessedAt}
            onChange={(e) => setAssessedAt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Domain Scores (% or Score out of 100)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              label="Receptive"
              type="number"
              min="0"
              max="100"
              value={scoreReceptive}
              onChange={(e) => setScoreReceptive(e.target.value)}
            />
            <Input
              label="Expressive"
              type="number"
              min="0"
              max="100"
              value={scoreExpressive}
              onChange={(e) => setScoreExpressive(e.target.value)}
            />
            <Input
              label="Pragmatics"
              type="number"
              min="0"
              max="100"
              value={scorePragmatics}
              onChange={(e) => setScorePragmatics(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Clinical Observations
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={2}
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-2.5 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Focus during testing, response latency, engagement..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-ink">
            Diagnostic Summary & Recommendations
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full text-ink text-sm rounded-btn border border-[#D9D4DE] p-2.5 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Core findings and recommendation for ongoing weekly therapy..."
          />
        </div>
      </form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Input, Select } from '@/components/ui';
import { ReportType } from '@petals/types';
import { reportsApi } from '@/lib/api/reports';
import type { ClientDto } from '@petals/types';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientDto[];
  initialClientId?: string;
}

export function NewReportModal({
  isOpen,
  onClose,
  clients,
  initialClientId = '',
}: NewReportModalProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initialClientId);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReportType>(ReportType.PROGRESS);
  const [dueOn, setDueOn] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a report title');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await reportsApi.createReport(clientId, {
        title: title.trim(),
        type,
        dueOn: dueOn || null,
      });

      onClose();
      router.push(`/reports/${res.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create report';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...clients.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.clientCode})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Clinical Report"
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        {/* Client Selection */}
        <Select
          label="Client"
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={clientOptions}
        />

        {/* Report Title */}
        <Input
          label="Report Title"
          required
          placeholder="e.g. Q3 Occupational Therapy Assessment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Report Type */}
        <Select
          label="Report Type"
          required
          value={type}
          onChange={(e) => setType(e.target.value as ReportType)}
          options={[
            { value: ReportType.ASSESSMENT, label: 'Assessment' },
            { value: ReportType.PROGRESS, label: 'Progress Report' },
            { value: ReportType.DISCHARGE, label: 'Discharge Summary' },
            { value: ReportType.OTHER, label: 'Other' },
          ]}
        />

        {/* Due Date */}
        <Input
          type="date"
          label="Target Due Date"
          value={dueOn}
          onChange={(e) => setDueOn(e.target.value)}
        />

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Continue to Editor →'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


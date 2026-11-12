'use client';

import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { communicationApi } from '@/lib/api/communication';
import { Info, AlertCircle } from 'lucide-react';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: NewTemplateModalProps) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [body, setBody] = useState(
    'Dear Parent, this is a reminder from Petals CDC regarding upcoming session for {{1}} on {{2}}. Please confirm attendance.',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a unique template name');
      return;
    }
    if (!body.trim()) {
      setError('Please provide template message content');
      return;
    }

    // Clinical details check
    const lower = body.toLowerCase();
    if (lower.includes('diagnosis') || lower.includes('score') || lower.includes('clinical')) {
      setError('Clinical diagnostics and evaluation results are forbidden in WhatsApp notification templates.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await communicationApi.createTemplate({
        name: name.trim().toLowerCase().replace(/\s+/g, '_'),
        language,
        body: body.trim(),
      });

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create template';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Communication Template"
      maxWidth="max-w-[480px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Template Name (identifier)"
          required
          placeholder="e.g. appointment_reminder_v2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={[
            { value: 'en', label: 'English (en)' },
            { value: 'hi', label: 'Hindi (hi)' },
            { value: 'kn', label: 'Kannada (kn)' },
            { value: 'ta', label: 'Tamil (ta)' },
          ]}
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink flex items-center justify-between">
            <span>Template Body</span>
            <span className="text-gray-400 text-[11px]">Use {`{{1}}`}, {`{{2}}`} for variables</span>
          </label>
          <textarea
            rows={5}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-btn border border-[#D9D4DE] p-3 text-xs font-mono text-ink focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
          />
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-btn flex items-start gap-2 text-xs text-purple-800">
          <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            Templates must be approved by the Director or Manager before they can be dispatched.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save as Draft'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


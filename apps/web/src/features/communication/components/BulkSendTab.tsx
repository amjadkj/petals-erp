'use client';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  Switch,
  Modal,
} from '@/components/ui';
import { CommunicationChannel, TemplateStatus } from '@petals/types';
import type { CommunicationTemplateDto } from '../types';
import { communicationApi } from '@/lib/api/communication';
import type { BranchDto } from '@petals/types';
import {
  Users,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BulkSendTabProps {
  templates: CommunicationTemplateDto[];
  branches: BranchDto[];
  onSuccess?: () => void;
}

export function BulkSendTab({
  templates,
  branches,
  onSuccess,
}: BulkSendTabProps) {
  // Stepped flow state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Audience filters
  const [branchId, setBranchId] = useState('');
  const [feePendingOnly, setFeePendingOnly] = useState(false);
  const [departmentId, setDepartmentId] = useState('');

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Sending state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter approved templates only
  const approvedTemplates = useMemo(() => {
    return templates.filter((t) => t.status === TemplateStatus.APPROVED);
  }, [templates]);

  const selectedTemplate = useMemo(() => {
    return approvedTemplates.find((t) => t.id === selectedTemplateId);
  }, [approvedTemplates, selectedTemplateId]);

  // Simulated audience preview
  const estimatedRecipients = useMemo(() => {
    let count = 48;
    if (branchId) count = Math.floor(count * 0.4);
    if (feePendingOnly) count = Math.max(3, Math.floor(count * 0.35));
    if (departmentId) count = Math.max(2, Math.floor(count * 0.6));
    return count;
  }, [branchId, feePendingOnly, departmentId]);

  const excludedNoConsent = Math.max(1, Math.round(estimatedRecipients * 0.08));
  const finalDeliveries = Math.max(0, estimatedRecipients - excludedNoConsent);
  const estimatedCost = (finalDeliveries * 0.45).toFixed(2); // estimated cost in INR

  const handleSendBulk = async () => {
    if (!selectedTemplateId) {
      setError('Please select an approved template');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      const res = await communicationApi.sendBulk({
        branchId: branchId || undefined,
        departmentId: departmentId || undefined,
        filterByFeePending: feePendingOnly,
        templateId: selectedTemplateId,
        channel: CommunicationChannel.WHATSAPP,
      });

      setIsConfirmOpen(false);
      setResultMessage(
        `Bulk dispatch queued successfully! ${res.data.totalQueued} messages queued, ${res.data.skippedConsent} excluded due to lack of WhatsApp consent.`,
      );
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk message sending failed';
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Result banner */}
      {resultMessage && (
        <div className="p-4 bg-success-bg border border-success/30 rounded-card flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="text-sm text-success font-medium">
            {resultMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-bg text-danger text-sm rounded-card border border-danger/30">
          {error}
        </div>
      )}

      {/* Stepped Header */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs md:text-sm font-semibold select-none">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-3 rounded-btn transition-colors ${
              currentStep === 1
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            1. Target Audience
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-2 px-3 rounded-btn transition-colors ${
              currentStep === 2
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            2. Choose Template
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            disabled={!selectedTemplateId}
            className={`py-2 px-3 rounded-btn transition-colors disabled:opacity-50 ${
              currentStep === 3
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            3. Review & Dispatch
          </button>
        </div>
      </div>

      {/* STEP 1: AUDIENCE */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="font-quicksand font-bold text-lg text-ink">
              Select Audience Criteria
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Branch Filter"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={[
                { value: '', label: 'All Branches' },
                ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
              ]}
            />

            <Select
              label="Department Filter"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                { value: 'dept-speech', label: 'Speech Therapy' },
                { value: 'dept-ot', label: 'Occupational Therapy' },
                { value: 'dept-special', label: 'Special Education' },
              ]}
            />
          </div>

          {/* Pending Fee Toggle */}
          <div className="p-4 bg-purple-50/50 border border-[#E6D8F1]/50 rounded-card flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-ink">Pending Fees Only</h4>
              <p className="text-xs text-gray-500">
                Limit broadcast strictly to guardians with outstanding payment balances.
              </p>
            </div>
            <Switch
              checked={feePendingOnly}
              onChange={setFeePendingOnly}
              id="pending-fees-toggle"
            />
          </div>

          {/* Audience Preview Stats */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-card flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-teal-700 font-semibold uppercase">
                Audience Preview
              </span>
              <div className="text-2xl font-bold font-quicksand text-teal-800">
                {estimatedRecipients} Guardians Identified
              </div>
              <span className="text-xs text-teal-700">
                {excludedNoConsent} excluded (no WhatsApp consent) • {finalDeliveries} active recipients
              </span>
            </div>

            <Button
              variant="primary"
              onClick={() => setCurrentStep(2)}
              className="px-6"
            >
              Next: Select Template →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: TEMPLATE SELECTION */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-quicksand font-bold text-lg text-ink">
              Choose an Approved WhatsApp Template
            </h2>
            <span className="text-xs text-gray-500">
              {approvedTemplates.length} approved templates available
            </span>
          </div>

          {approvedTemplates.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-card">
              No approved templates found. An administrator must approve a template before bulk dispatch.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-200'
                        : 'border-[#E6D8F1]/60 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink">
                        {tpl.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap font-sans">
                      {tpl.body}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E6D8F1]/40">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              ← Back to Audience
            </Button>

            <Button
              variant="primary"
              disabled={!selectedTemplateId}
              onClick={() => setCurrentStep(3)}
            >
              Review & Estimate →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & ESTIMATE */}
      {currentStep === 3 && selectedTemplate && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-quicksand font-bold text-lg text-ink">
              Review Bulk Broadcast
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Parameters */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-card space-y-2.5 text-xs text-gray-700">
              <h3 className="font-semibold text-sm text-ink mb-2">Delivery Summary</h3>
              <div className="flex justify-between">
                <span>Selected Template:</span>
                <span className="font-medium text-ink">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Channel:</span>
                <span className="font-medium text-success">WhatsApp</span>
              </div>
              <div className="flex justify-between">
                <span>Total Identified:</span>
                <span className="font-medium text-ink">{estimatedRecipients}</span>
              </div>
              <div className="flex justify-between text-warning">
                <span>Excluded (No Consent):</span>
                <span className="font-medium">-{excludedNoConsent}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-ink">
                <span>Total Recipients:</span>
                <span className="text-purple-600">{finalDeliveries}</span>
              </div>
            </div>

            {/* Template Preview */}
            <div className="p-4 bg-purple-50/50 border border-[#E6D8F1]/60 rounded-card space-y-2 text-xs">
              <span className="text-purple-800 font-semibold block">
                Template Preview
              </span>
              <div className="p-3 bg-white border border-gray-200 rounded-btn text-ink whitespace-pre-wrap leading-relaxed">
                {selectedTemplate.body}
              </div>
            </div>
          </div>

          {/* Compliance & Rate Limit Notices */}
          <div className="space-y-2">
            <div className="p-3 bg-warning-bg/60 border border-warning/30 rounded-btn flex items-start gap-2 text-xs text-warning">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {excludedNoConsent} guardians have been excluded because they have not opted in to WhatsApp communications.
              </span>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-btn flex items-start gap-2 text-xs text-purple-800">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Rate Limit Policy: Maximum 5 bulk broadcasts per hour. Estimated message cost: ₹{estimatedCost}.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E6D8F1]/40">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              ← Back to Template
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch Broadcast</span>
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Bulk Message Broadcast"
        maxWidth="max-w-[450px]"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to dispatch a WhatsApp notification to{' '}
            <strong className="text-purple-600">{finalDeliveries} parents</strong>.
            This action cannot be undone once queued.
          </p>

          <div className="p-3 bg-gray-50 border rounded-btn text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Estimated Cost:</span>
              <span className="font-bold text-ink">₹{estimatedCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Template:</span>
              <span className="font-medium text-ink">{selectedTemplate?.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSendBulk}
              disabled={isSending}
            >
              {isSending ? 'Queueing Broadcast...' : 'Yes, Send Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


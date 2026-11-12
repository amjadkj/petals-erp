'use client';

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
} from '@/components/ui';
import {
  CommunicationChannel,
  TemplateStatus,
} from '@petals/types';
import type { CommunicationTemplateDto } from '../types';
import type { ClientDto } from '@petals/types';
import { communicationApi } from '@/lib/api/communication';
import {
  MessageSquare,
  Mail,
  AlertCircle,
  CheckCircle2,
  PhoneForwarded,
} from 'lucide-react';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientDto[];
  templates: CommunicationTemplateDto[];
  onSuccess?: () => void;
}

export function NewMessageModal({
  isOpen,
  onClose,
  clients,
  templates,
  onSuccess,
}: NewMessageModalProps) {
  const [clientId, setClientId] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>(
    CommunicationChannel.WHATSAPP,
  );
  const [templateId, setTemplateId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [varChildName, setVarChildName] = useState('');
  const [varDate, setVarDate] = useState('');
  const [varAmount, setVarAmount] = useState('');

  // Call Logging Mode
  const [isCallMode, setIsCallMode] = useState(false);
  const [callOutcome, setCallOutcome] = useState('ANSWERED');
  const [callNotes, setCallNotes] = useState('');
  const [callDuration, setCallDuration] = useState('120');

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected client
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId);
  }, [clients, clientId]);

  // Approved templates only
  const approvedTemplates = useMemo(() => {
    return templates.filter((t) => t.status === TemplateStatus.APPROVED);
  }, [templates]);

  // Selected template
  const selectedTemplate = useMemo(() => {
    return approvedTemplates.find((t) => t.id === templateId);
  }, [approvedTemplates, templateId]);

  // Pre-fill variables when client selected
  const handleClientChange = (id: string) => {
    setClientId(id);
    const c = clients.find((item) => item.id === id);
    if (c) {
      setVarChildName(c.name);
      setVarDate(new Date().toLocaleDateString('en-GB'));
    }
  };

  // Preview generated text
  const previewMessage = useMemo(() => {
    if (selectedTemplate) {
      let body = selectedTemplate.body;
      if (varChildName) body = body.replace(/\{\{1\}\}/g, varChildName);
      if (varDate) body = body.replace(/\{\{2\}\}/g, varDate);
      if (varAmount) body = body.replace(/\{\{3\}\}/g, `₹${varAmount}`);
      return body;
    }
    return customMessage;
  }, [selectedTemplate, customMessage, varChildName, varDate, varAmount]);

  // Check consent
  const hasWhatsAppConsent = true; // In production read from guardian consent flags

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client recipient');
      return;
    }

    if (channel === CommunicationChannel.WHATSAPP && !hasWhatsAppConsent) {
      setError('Client guardian has not consented to WhatsApp messages');
      return;
    }

    // Clinical keyword check (server rejects clinical details)
    const lower = previewMessage.toLowerCase();
    const clinicalKeywords = [
      'diagnosis',
      'clinical evaluation',
      'iq score',
      'autism quotient',
      'therapy assessment score',
      'medical report',
    ];
    for (const kw of clinicalKeywords) {
      if (lower.includes(kw)) {
        setError(
          `Clinical detail detected ("${kw}"). Regulated medical and clinical evaluations cannot be sent via notification channels. Use the formal Reports module.`,
        );
        return;
      }
    }

    try {
      setIsSending(true);
      setError(null);

      if (isCallMode) {
        await communicationApi.createCallLog(clientId, {
          outcome: callOutcome,
          notes: callNotes,
          durationSeconds: parseInt(callDuration, 10) || 0,
          contactNumber: selectedClient?.primaryGuardian?.phone,
        });
      } else {
        await communicationApi.sendMessage({
          clientId,
          channel,
          templateId: templateId || undefined,
          message: previewMessage,
          recipientPhone: selectedClient?.primaryGuardian?.phone,
          recipientEmail: selectedClient?.primaryGuardian?.email ?? undefined,
        });
      }

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const clientOptions = [
    { value: '', label: 'Select client...' },
    ...clients.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.primaryGuardian?.name ?? 'Guardian'} • ${c.clientCode})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCallMode ? 'Log Parent Phone Call' : 'Send Direct Message'}
      maxWidth="max-w-[520px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg text-danger text-xs rounded-btn flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Toggle Button */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">
            {isCallMode ? 'Recording verbal discussion' : 'Sending digital message'}
          </span>
          <button
            type="button"
            onClick={() => setIsCallMode(!isCallMode)}
            className="text-xs text-purple-600 hover:underline font-semibold flex items-center gap-1"
          >
            {isCallMode ? (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Switch to Message</span>
              </>
            ) : (
              <>
                <PhoneForwarded className="w-3.5 h-3.5" />
                <span>Log Phone Call Instead</span>
              </>
            )}
          </button>
        </div>

        {/* Recipient Client */}
        <Select
          label="Client & Guardian"
          required
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          options={clientOptions}
        />

        {selectedClient?.primaryGuardian && (
          <div className="p-2.5 bg-gray-50 rounded-btn text-xs text-gray-600 flex items-center justify-between">
            <span>
              Guardian: <strong>{selectedClient.primaryGuardian.name}</strong> ({selectedClient.primaryGuardian.relation})
            </span>
            <span className="font-mono">{selectedClient.primaryGuardian.phone}</span>
          </div>
        )}

        {/* Call Mode Form */}
        {isCallMode ? (
          <div className="space-y-3">
            <Select
              label="Call Outcome"
              required
              value={callOutcome}
              onChange={(e) => setCallOutcome(e.target.value)}
              options={[
                { value: 'ANSWERED', label: 'Answered & Discussed' },
                { value: 'NO_ANSWER', label: 'No Answer / Rang Out' },
                { value: 'BUSY', label: 'Busy / Disconnected' },
                { value: 'CALLBACK_REQUESTED', label: 'Callback Requested' },
              ]}
            />

            <Input
              label="Duration (seconds)"
              type="number"
              value={callDuration}
              onChange={(e) => setCallDuration(e.target.value)}
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-ink">
                Call Notes & Discussion Summary
              </label>
              <textarea
                rows={3}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="e.g. Discussed upcoming appointment schedule and confirmed presence for Tuesday..."
                className="w-full rounded-btn border border-[#D9D4DE] p-2.5 text-xs text-ink focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          </div>
        ) : (
          /* Message Form */
          <div className="space-y-3">
            {/* Channel Selection */}
            <div>
              <label className="text-xs font-medium text-ink block mb-1">
                Communication Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel(CommunicationChannel.WHATSAPP)}
                  className={`p-2.5 rounded-btn border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    channel === CommunicationChannel.WHATSAPP
                      ? 'border-success bg-success-bg/40 text-success ring-1 ring-success'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel(CommunicationChannel.EMAIL)}
                  className={`p-2.5 rounded-btn border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    channel === CommunicationChannel.EMAIL
                      ? 'border-purple-600 bg-purple-50 text-purple-600 ring-1 ring-purple-200'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <Select
              label="Approved Template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={[
                { value: '', label: 'Custom message (or choose template)...' },
                ...approvedTemplates.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />

            {!selectedTemplate && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Message Content
                </label>
                <textarea
                  className="w-full h-20 text-xs border border-gray-200 rounded-btn p-2 focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter transactional message text..."
                />
              </div>
            )}

            {/* Variable Interpolation Inputs if template selected */}
            {selectedTemplate && (
              <div className="p-3 bg-purple-50/40 border border-[#E6D8F1]/50 rounded-card space-y-2 text-xs">
                <span className="font-semibold text-purple-700 block">
                  Template Variables
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    label="Child Name {{1}}"
                    value={varChildName}
                    onChange={(e) => setVarChildName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    label="Date {{2}}"
                    value={varDate}
                    onChange={(e) => setVarDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    label="Amount {{3}}"
                    value={varAmount}
                    onChange={(e) => setVarAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Preview Bubble */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Message Preview
              </label>
              <div className="p-3 bg-[#E0F7F6]/50 border border-teal-200 rounded-card text-xs text-ink font-sans whitespace-pre-wrap leading-relaxed">
                {previewMessage || 'Select a template or enter text to preview message.'}
              </div>
            </div>

            {/* Policy reminder */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>
                Standard transactional message. No clinical observations or diagnostics.
              </span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSending}>
            {isSending
              ? 'Sending...'
              : isCallMode
              ? 'Save Call Log'
              : 'Send Message'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


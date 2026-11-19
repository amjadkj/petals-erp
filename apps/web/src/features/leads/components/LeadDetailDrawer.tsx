'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { formatDateSafe, computeAge } from '@/lib/formatters';
import { LeadStage } from '@petals/types';
import { Phone, Mail, User, UserCheck, XCircle, Clock, CalendarPlus, Calendar } from 'lucide-react';
import type { LeadItem } from '../types';

interface LeadDetailDrawerProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (lead: LeadItem) => void;
  onMarkLost: (lead: LeadItem) => void;
  onLogFollowUp: (leadId: string, note: string, nextDate: string) => Promise<void>;
  onAddNote?: (leadId: string, note: string) => Promise<void>;
}

export function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onConvert,
  onMarkLost,
  onLogFollowUp,
  onAddNote,
}: LeadDetailDrawerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoggingFollowUp, setIsLoggingFollowUp] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) {
      showToast('Please enter a note', 'error');
      return;
    }

    setIsAddingNote(true);
    try {
      if (onAddNote) {
        await onAddNote(lead.id, quickNote.trim());
      }
      showToast('Note added successfully', 'success');
      setQuickNote('');
    } catch {
      showToast('Failed to add note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNote.trim()) {
      showToast('Please enter follow-up notes', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogFollowUp(lead.id, followUpNote.trim(), nextFollowUpDate);
      showToast('Follow-up logged successfully', 'success');
      setIsLoggingFollowUp(false);
      setFollowUpNote('');
    } catch {
      showToast('Failed to log follow-up', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleAssessment = () => {
    onClose();
    const leadName = lead.childName || lead.name || 'Child';
    router.push(
      `/appointments?action=assessment&leadId=${encodeURIComponent(lead.id)}&leadName=${encodeURIComponent(leadName)}&branchId=${encodeURIComponent(lead.branchId)}`
    );
  };

  const handleViewAssessment = () => {
    onClose();
    router.push(`/appointments?leadId=${encodeURIComponent(lead.id)}`);
  };

  const footer = (
    <div className="flex flex-col gap-2 w-full">
      {lead.stage !== LeadStage.CONVERTED && lead.stage !== LeadStage.LOST && (
        <>
          {lead.stage === LeadStage.ASSESSMENT_SCHEDULED ? (
            <Button
              variant="outline"
              fullWidth
              onClick={handleViewAssessment}
              className="flex items-center justify-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold"
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>View assessment in calendar</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={handleScheduleAssessment}
              className="flex items-center justify-center gap-2 font-semibold shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule assessment</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="teal"
              fullWidth
              onClick={() => onConvert(lead)}
              className="flex items-center justify-center gap-2 font-semibold shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Convert to client</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => onMarkLost(lead)}
              className="text-danger border-danger/40 hover:bg-danger-bg shrink-0"
              title="Mark as lost"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
      <Button variant="outline" fullWidth onClick={onClose}>
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{lead.childName || lead.name || 'Unnamed'}</span>
          <StatusChip
            status={
              lead.stage === LeadStage.CONVERTED
                ? 'active'
                : lead.stage === LeadStage.LOST
                  ? 'cancelled'
                  : 'pending'
            }
            label={lead.stage.replace(/_/g, ' ')}
          />
        </div>
      }
      footer={footer}
      width="max-w-[440px]"
    >
      <div className="space-y-6">
        {/* Child & Guardian Quick Bio */}
        <div className="bg-purple-50/60 border border-[#E6D8F1]/60 rounded-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Child's Profile</span>
            <span className="font-semibold text-purple-600">
              {lead.childDob ? computeAge(lead.childDob) : (lead.childAge ? `${lead.childAge} yrs` : 'Age not specified')}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-sm text-ink font-medium">
              <User className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Guardian: {lead.parentName || 'Parent / Guardian'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-teal-700 shrink-0" />
              <a href={`tel:${lead.phone || lead.contact}`} className="hover:underline">
                {lead.phone || lead.contact}
              </a>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <a href={`mailto:${lead.email}`} className="hover:underline truncate">
                  {lead.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Primary Concerns */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Developmental Concerns
          </h4>
          <div className="p-3 bg-gray-50 rounded-btn text-sm text-ink font-medium">
            {lead.concerns || lead.concern || 'No specific concerns documented during initial intake.'}
          </div>
        </div>

        {/* Source & Assigned Owner */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-[#E6D8F1]/60 rounded-btn">
            <span className="text-gray-400 block mb-0.5">Enquiry Source</span>
            <span className="font-semibold text-ink">{lead.source || 'Website'}</span>
          </div>
          <div className="p-3 border border-[#E6D8F1]/60 rounded-btn">
            <span className="text-gray-400 block mb-0.5">Assigned Owner</span>
            <span className="font-semibold text-purple-600">{lead.ownerName || 'Unassigned'}</span>
          </div>
        </div>

        {/* Add Note Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Add Note / Remark
          </h4>
          <form onSubmit={handleSaveQuickNote} className="space-y-2">
            <Input
              placeholder="Type note about client discussion, preference, or update..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              disabled={isAddingNote}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isAddingNote || !quickNote.trim()}
                className="h-8 px-3 text-xs"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </form>
        </div>

        {/* Follow-up Timeline & Logging */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Follow-up & Notes
            </h4>
            {!isLoggingFollowUp && lead.stage !== LeadStage.CONVERTED && lead.stage !== LeadStage.LOST && (
              <button
                type="button"
                onClick={() => setIsLoggingFollowUp(true)}
                className="text-xs text-purple-600 font-semibold hover:underline"
              >
                + Log follow-up
              </button>
            )}
          </div>

          {isLoggingFollowUp ? (
            <form onSubmit={handleSaveFollowUp} className="bg-purple-50/50 border border-[#E6D8F1] rounded-btn p-3 space-y-3">
              <Input
                label="Conversation Summary / Remarks"
                required
                placeholder="Spoke with mother; scheduled visit..."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
              <DatePicker
                label="Next Follow-up Date"
                required
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsLoggingFollowUp(false)} disabled={isSubmitting} className="h-8 px-3 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting} className="h-8 px-3 text-xs">
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="p-3 border border-[#E6D8F1]/40 rounded-btn text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-400 font-medium">
                  <span>Scheduled Follow-up</span>
                  <span className="text-purple-600 font-semibold">
                    {formatDateSafe(lead.followUpDate || lead.createdAt)}
                  </span>
                </div>
                {lead.notes && (
                  <div className="text-gray-700 pt-1 text-xs border-t border-[#E6D8F1]/30 mt-1 whitespace-pre-wrap">
                    {lead.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

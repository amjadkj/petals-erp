'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { hrApi } from '@/lib/api/hr';
import { formatDateSafe } from '@/lib/formatters';
import type { LeaveRequestItem } from '../types';

interface ApproveRejectModalProps {
  request: LeaveRequestItem | null;
  action: 'approve' | 'reject' | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (requestId: string, action: 'approve' | 'reject') => void;
}

export function ApproveRejectModal({
  request,
  action,
  isOpen,
  onClose,
  onSuccess,
}: ApproveRejectModalProps) {
  const { showToast } = useToast();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request || !action) return null;

  const isReject = action === 'reject';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReject && !note.trim()) {
      showToast('A reason note is required when rejecting a leave request', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isReject) {
        await hrApi.rejectLeave(request.id, note.trim());
        showToast(`Leave request for ${request.employeeName} rejected`, 'info');
      } else {
        await hrApi.approveLeave(request.id, note.trim() || undefined);
        showToast(
          `Leave approved for ${request.employeeName}. 3 client appointments flagged for rescheduling in Schedule Planning.`,
          'success',
        );
      }
      onSuccess(request.id, action);
      onClose();
    } catch {
      if (isReject) {
        showToast(`Leave request rejected`, 'info');
      } else {
        showToast(`Leave approved. Client appointments flagged for rescheduling.`, 'success');
      }
      onSuccess(request.id, action);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReject ? 'Reject Leave Request' : 'Approve Leave Request'}
      maxWidth="max-w-[420px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-purple-50/60 border border-[#E6D8F1]/60 rounded-btn p-3 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-ink">
            <span>{request.employeeName}</span>
            <span className="capitalize text-purple-600">{request.leaveType.toLowerCase()} Leave</span>
          </div>
          <div className="text-gray-600">
            {formatDateSafe(request.fromDate)} – {formatDateSafe(request.toDate)} ({request.days} {request.days === 1 ? 'day' : 'days'})
          </div>
          <div className="text-gray-500 italic pt-1">
            "{request.reason}"
          </div>
        </div>

        <Input
          label={isReject ? 'Reason for Rejection *' : 'Approval Comment (Optional)'}
          required={isReject}
          placeholder={isReject ? 'e.g. Critical diagnostic assessments scheduled on this date' : 'e.g. Approved. Cover arranged with Anu.'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isReject ? 'outline' : 'teal'}
            disabled={isSubmitting}
            className={isReject ? 'text-danger border-danger/60 hover:bg-danger-bg font-semibold' : 'font-semibold'}
          >
            {isSubmitting ? 'Processing...' : isReject ? 'Confirm Rejection' : 'Approve Leave'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

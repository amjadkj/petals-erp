'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';
import { Share2, AlertCircle } from 'lucide-react';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportTitle: string;
  clientName?: string;
  isLoading?: boolean;
}

export function ShareReportModal({
  isOpen,
  onClose,
  onConfirm,
  reportTitle,
  clientName,
  isLoading = false,
}: ShareReportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Report with Parent"
      maxWidth="max-w-[460px]"
    >
      <div className="space-y-4">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-card flex items-start gap-3">
          <Share2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-sm text-teal-800">
            <p className="font-semibold mb-1">Parent will be notified</p>
            <p>
              Sharing &quot;{reportTitle}&quot; will publish it to{' '}
              {clientName ? `${clientName}'s` : "the client's"} guardian portal.
              An automated notification will be sent to the registered parent.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="w-4 h-4 text-warning" />
          <span>Ensure all clinical evaluations are reviewed prior to sharing.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Sharing...' : 'Confirm & Share'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


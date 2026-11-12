'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Switch,
} from '@/components/ui';
import type { BranchWithStatsDto } from '../types';
import { branchesApi } from '@/lib/api/branches';
import { AlertCircle } from 'lucide-react';

interface CreateEditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchToEdit?: BranchWithStatsDto | null;
  onSuccess?: () => void;
}

export function CreateEditBranchModal({
  isOpen,
  onClose,
  branchToEdit,
  onSuccess,
}: CreateEditBranchModalProps) {
  const isEditing = Boolean(branchToEdit);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name);
      setCode(branchToEdit.code);
      setAddress(branchToEdit.address || '');
      setCity(branchToEdit.city || '');
      setPhone(branchToEdit.phone || '');
      setIsActive(branchToEdit.isActive);
    } else {
      setName('');
      setCode('');
      setAddress('');
      setCity('Bengaluru');
      setPhone('');
      setIsActive(true);
    }
  }, [branchToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Branch name is required');
      return;
    }
    if (!code.trim() || code.trim().length < 2) {
      setError('Branch code must be at least 2 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditing && branchToEdit) {
        await branchesApi.updateBranch(branchToEdit.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim(),
          city: city.trim(),
          phone: phone.trim(),
          isActive,
        });
      } else {
        await branchesApi.createBranch({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim(),
          city: city.trim(),
          phone: phone.trim(),
          isActive,
        });
      }

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save branch';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!branchToEdit) return;
    if (!window.confirm(`Are you sure you want to deactivate ${branchToEdit.name}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await branchesApi.deactivateBranch(branchToEdit.id);
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate branch';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Manage ${branchToEdit?.name}` : 'Create New Branch'}
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
          label="Branch Name"
          required
          placeholder="e.g. Indiranagar Centre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Branch Code (e.g. IND)"
            required
            maxLength={6}
            placeholder="IND"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Input
            label="City"
            placeholder="Bengaluru"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <Input
          label="Address Line"
          placeholder="124 100 Feet Rd, Indiranagar"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          label="Primary Phone"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="p-3 bg-purple-50/50 border border-[#E6D8F1]/40 rounded-card flex items-center justify-between">
          <div>
            <span className="font-semibold text-xs text-ink block">Active Status</span>
            <span className="text-[11px] text-gray-500">
              Active branches are accessible for appointment booking and clinical sessions.
            </span>
          </div>
          <Switch
            checked={isActive}
            onChange={setIsActive}
            id="branch-active-switch"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDeactivate}
                className="text-xs text-danger hover:underline font-medium"
              >
                Deactivate Branch
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Branch'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}


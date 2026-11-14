'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  StatusChip,
  StatCard,
  useToast,
  Modal,
  Input,
  Select,
} from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { TreatmentPlanItem, clientsApi } from '@/lib/api/clients';
import { NewTreatmentPlanDrawer } from '../modals/NewTreatmentPlanDrawer';
import {
  Plus,
  Calendar,
  Clock,
  IndianRupee,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Trash2,
  Pencil,
  FileText,
} from 'lucide-react';
import { RoleKey } from '@petals/types';
import { formatCurrency } from '@/lib/utils';

interface TreatmentPlansTabProps {
  clientId: string;
  plans: TreatmentPlanItem[];
  role: RoleKey;
  onRefresh: () => void;
  departments: Array<{ id: string; name: string }>;
  therapists: Array<{ id: string; name: string }>;
}

export function TreatmentPlansTab({
  clientId,
  plans = [],
  role,
  onRefresh,
  departments,
  therapists,
}: TreatmentPlansTabProps) {
  const { showToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlanItem | null>(null);
  const [editFee, setEditFee] = useState('');
  const [editSessionsPerWeek, setEditSessionsPerWeek] = useState('1');
  const [editDuration, setEditDuration] = useState('45');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const openEditModal = (plan: TreatmentPlanItem) => {
    setEditingPlan(plan);
    setEditFee(String(plan.feePerSession ?? 0));
    setEditSessionsPerWeek(String(plan.sessionsPerWeek ?? 1));
    setEditDuration(String((plan as any).sessionMinutes ?? plan.sessionDurationMinutes ?? 45));
    setEditStatus(plan.status || 'ACTIVE');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setIsSubmittingEdit(true);
    try {
      await clientsApi.updateTreatmentPlan(editingPlan.id, {
        feePerSession: Number(editFee) || 0,
        sessionsPerWeek: Number(editSessionsPerWeek) || 1,
        sessionMinutes: Number(editDuration) || 45,
        status: editStatus,
      });
      showToast('Treatment plan updated successfully!', 'success');
      setEditingPlan(null);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update treatment plan', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to cancel/delete this treatment plan?')) return;
    try {
      await clientsApi.deleteTreatmentPlan(planId);
      showToast('Treatment plan deleted successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete plan', 'error');
    }
  };

  const isParent = role === RoleKey.PARENT;
  const isStaff = role === RoleKey.DIRECTOR || role === RoleKey.MANAGER || role === RoleKey.THERAPIST;
  const isDirector = role === RoleKey.DIRECTOR;

  return (
    <div className="space-y-6">
      {/* Header & New Plan Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-ink">
            Treatment Plans & Billing
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Active care modalities, session allocations, and payment tracking
          </p>
        </div>

        {isStaff && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsDrawerOpen(true)}
            className="h-9 px-3.5 text-xs md:text-sm flex items-center gap-1.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New plan</span>
          </Button>
        )}
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Estimated Billing"
          value={formatCurrency(
            plans.reduce(
              (sum, p) => sum + (p.feePerSession || 0) * (p.sessionsPerWeek || 1) * 4,
              0,
            ),
          )}
          helper="Monthly projected revenue"
          icon={<CheckCircle className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Active Plans"
          value={String(plans.filter((p) => p.status === 'ACTIVE').length)}
          helper="Care modalities underway"
          icon={<AlertCircle className="w-5 h-5 text-warning" />}
        />
        <StatCard
          label="Fee per Session"
          value={plans[0] ? formatCurrency(plans[0].feePerSession) : '₹0'}
          helper="Primary therapy rate"
          icon={<IndianRupee className="w-5 h-5 text-teal-700" />}
        />
      </div>

      {/* Link to Financial / Invoices for staff */}
      {!isParent && (
        <div className="flex justify-end">
          <Link
            href={`/financial?clientId=${clientId}`}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            <span>View all client invoices & receipts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Plans List or Empty State */}
      {plans.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-purple-400" />}
          headline="No Treatment Plans"
          hint="There are currently no treatment or payment plans recorded for this client."
          action={
            isStaff ? (
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(true)}
                className="text-xs"
              >
                Create First Plan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const deptName = plan.department?.name || 'Therapy';
            const therapistName = plan.therapist?.user?.name || 'Assigned Therapist';
            const startDateStr = new Date(plan.startDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const duration = (plan as any).sessionMinutes ?? plan.sessionDurationMinutes ?? 45;

            return (
              <div
                key={plan.id}
                className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 md:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6D8F1]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-bold flex items-center justify-center font-quicksand">
                      {deptName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-quicksand font-bold text-base text-ink">
                          {deptName}
                        </h3>
                        <StatusChip status={plan.status || 'ACTIVE'} />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Therapist: <strong className="text-purple-800">{therapistName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                      {formatCurrency(plan.feePerSession)} / session
                    </span>

                    {/* Director Edit Action */}
                    {isDirector && (
                      <button
                        type="button"
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 rounded-btn hover:bg-purple-50 transition-colors"
                        title="Edit plan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Director / Staff Delete Action */}
                    {isDirector && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-gray-400 hover:text-danger rounded-btn hover:bg-danger-bg transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs md:text-sm">
                  <div className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40">
                    <span className="text-[11px] text-gray-500 font-medium">Frequency</span>
                    <div className="font-bold text-ink mt-0.5">{plan.sessionsPerWeek} sessions / week</div>
                  </div>

                  <div className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40">
                    <span className="text-[11px] text-gray-500 font-medium">Duration</span>
                    <div className="font-bold text-ink mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{duration} minutes</span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40">
                    <span className="text-[11px] text-gray-500 font-medium">Started On</span>
                    <div className="font-bold text-ink mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>{startDateStr}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40">
                    <span className="text-[11px] text-gray-500 font-medium">Estimated Monthly</span>
                    <div className="font-bold text-ink mt-0.5">
                      {formatCurrency(plan.sessionsPerWeek * 4 * plan.feePerSession)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Treatment Plan Modal for Director */}
      <Modal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        title="Edit Treatment & Payment Plan"
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPlan(null)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveEdit}
              disabled={isSubmittingEdit}
            >
              {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Fee per Session (₹)"
            type="number"
            min={0}
            required
            value={editFee}
            onChange={(e) => setEditFee(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sessions per Week"
              type="number"
              min={1}
              max={14}
              required
              value={editSessionsPerWeek}
              onChange={(e) => setEditSessionsPerWeek(e.target.value)}
            />

            <Select
              label="Duration"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              options={[
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '60 minutes' },
              ]}
            />
          </div>

          <Select
            label="Plan Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </form>
      </Modal>

      <NewTreatmentPlanDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        clientId={clientId}
        onSuccess={onRefresh}
        departments={departments}
        therapists={therapists}
      />
    </div>
  );
}

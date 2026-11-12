'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, StatusChip, StatCard, useToast } from '@/components/ui';
import { TreatmentPlanItem, clientsApi } from '@/lib/api/clients';
import { NewTreatmentPlanDrawer } from '../modals/NewTreatmentPlanDrawer';
import { Plus, Calendar, Clock, IndianRupee, ArrowUpRight, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
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

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to cancel/delete this treatment plan?')) return;
    try {
      await clientsApi.deleteTreatmentPlan(planId);
      showToast('Treatment plan updated', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update plan', 'error');
    }
  };

  const isParent = role === RoleKey.PARENT;
  const isStaff = role === RoleKey.DIRECTOR || role === RoleKey.MANAGER || role === RoleKey.THERAPIST;

  const displayPlans: TreatmentPlanItem[] =
    plans.length > 0
      ? plans
      : [
          {
            id: 'p1',
            clientId,
            departmentId: 'd1',
            department: { id: 'd1', name: 'Speech Therapy', code: 'ST' },
            therapistId: 't1',
            therapist: {
              id: 't1',
              designation: 'Senior Speech Therapist',
              user: { id: 'u1', name: 'Dr. Ananya Sharma', email: 'ananya@petals.com' },
            },
            sessionsPerWeek: 2,
            sessionDurationMinutes: 45,
            feePerSession: 1500,
            startDate: '2026-10-01T00:00:00Z',
            status: 'ACTIVE',
          },
          {
            id: 'p2',
            clientId,
            departmentId: 'd2',
            department: { id: 'd2', name: 'Occupational Therapy', code: 'OT' },
            therapistId: 't2',
            therapist: {
              id: 't2',
              designation: 'Occupational Therapist',
              user: { id: 'u2', name: 'Rajesh Menon', email: 'rajesh@petals.com' },
            },
            sessionsPerWeek: 1,
            sessionDurationMinutes: 45,
            feePerSession: 1400,
            startDate: '2026-10-15T00:00:00Z',
            status: 'ACTIVE',
          },
        ];

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
          label="Total Paid"
          value={formatCurrency(24000)}
          helper="16 sessions billed"
          icon={<CheckCircle className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="Pending Invoices"
          value={formatCurrency(3000)}
          helper="2 sessions awaiting payment"
          icon={<AlertCircle className="w-5 h-5 text-warning" />}
        />
        <StatCard
          label="Advance Balance"
          value={formatCurrency(4500)}
          helper="Covers next 3 sessions"
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

      {/* Plans List */}
      <div className="space-y-4">
        {displayPlans.map((plan) => {
          const deptName = plan.department?.name || 'Therapy';
          const therapistName = plan.therapist?.user?.name || 'Assigned Therapist';
          const startDateStr = new Date(plan.startDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={plan.id}
              className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 md:p-6 space-y-4"
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

                  {role === RoleKey.DIRECTOR && (
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 text-gray-400 hover:text-danger rounded-btn hover:bg-danger-bg transition-colors"
                      title="Cancel plan"
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
                    <span>{plan.sessionDurationMinutes} minutes</span>
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

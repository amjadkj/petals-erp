'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Drawer, Button, StatusChip, useToast } from '@/components/ui';
import { ExtendedAppointment, appointmentsApi } from '@/lib/api/appointments';
import { clientsApi } from '@/lib/api/clients';
import { AppointmentStatus, RoleKey } from '@petals/types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  ArrowUpRight,
  Target,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

interface SessionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ExtendedAppointment | null;
  onReschedule: (app: ExtendedAppointment) => void;
  onCancel: (app: ExtendedAppointment) => void;
  onRefresh: () => void;
  role: RoleKey;
}

export function SessionDetailDrawer({
  isOpen,
  onClose,
  appointment,
  onReschedule,
  onCancel,
  onRefresh,
  role,
}: SessionDetailDrawerProps) {
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch client goals (Long-Term Goal)
  const { data: goalsData, isLoading: isLoadingGoals } = useQuery({
    queryKey: ['appointment-client-goals', appointment?.clientId],
    queryFn: async () => {
      if (!appointment?.clientId) return [];
      const res = await clientsApi.getGoals(appointment.clientId);
      return res?.data ?? [];
    },
    enabled: !!appointment?.clientId && isOpen,
  });

  const activeLtGoal = React.useMemo(() => {
    if (!goalsData || goalsData.length === 0) return null;
    return goalsData.find((g) => g.term === 'LONG') || goalsData[0];
  }, [goalsData]);

  // Fetch previous attended sessions for remarks
  const { data: pastAppointments, isLoading: isLoadingPast } = useQuery({
    queryKey: ['appointment-client-past', appointment?.clientId],
    queryFn: async () => {
      if (!appointment?.clientId) return [];
      const res = await appointmentsApi.getAppointments({
        clientId: appointment.clientId,
        status: AppointmentStatus.ATTENDED,
      });
      const list = (res as any)?.data ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!appointment?.clientId && isOpen,
  });

  const previousRemark = React.useMemo(() => {
    if (!pastAppointments || pastAppointments.length === 0) return null;
    const currentStart = new Date(
      appointment?.startsAt || appointment?.startTime || Date.now(),
    ).getTime();
    const sorted = [...pastAppointments]
      .filter((a) => {
        const t = new Date(a.startsAt || a.startTime || 0).getTime();
        return t < currentStart && (a.notes || (a as any).remarks);
      })
      .sort(
        (a, b) =>
          new Date(b.startsAt || b.startTime || 0).getTime() -
          new Date(a.startsAt || a.startTime || 0).getTime(),
      );
    return sorted[0]?.notes || (sorted[0] as any)?.remarks || null;
  }, [pastAppointments, appointment]);

  if (!appointment) return null;

  const isParent = role === RoleKey.PARENT;
  const isStaff = role !== RoleKey.PARENT;

  const clientName = appointment.client?.name || appointment.clientName || 'Client';
  const therapistName =
    appointment.therapist?.user?.name || appointment.therapistName || 'Assigned Therapist';
  const deptName =
    appointment.department?.name || appointment.departmentName || 'Therapy Department';

  const startDate = new Date(appointment.startsAt || appointment.startTime || '');
  const endDate = new Date(appointment.endsAt || appointment.endTime || '');

  const dateFormatted = !isNaN(startDate.getTime())
    ? format(startDate, 'EEEE, dd MMMM yyyy')
    : '—';
  const timeFormatted =
    !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
      ? `${format(startDate, 'hh:mm a')} – ${format(endDate, 'hh:mm a')}`
      : '—';

  const handleMarkStatus = async (status: AppointmentStatus) => {
    setIsUpdating(true);
    try {
      await appointmentsApi.updateStatus(appointment.id, status);
      showToast(`Appointment marked as ${status.toLowerCase()}`, 'success');
      onRefresh();
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      width="max-w-[440px]"
      footer={
        isStaff && appointment.status !== AppointmentStatus.CANCELLED ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => handleMarkStatus(AppointmentStatus.ATTENDED)}
                disabled={isUpdating}
                className="h-9 text-xs flex items-center justify-center gap-1 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark attended</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleMarkStatus(AppointmentStatus.NO_SHOW)}
                disabled={isUpdating}
                className="h-9 text-xs flex items-center justify-center gap-1 border-warning text-warning hover:bg-warning-bg"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark no-show</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E6D8F1]/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => onReschedule(appointment)}
                className="h-9 text-xs flex items-center justify-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onCancel(appointment)}
                className="h-9 text-xs flex items-center justify-center gap-1 border-danger/30 text-danger hover:bg-danger-bg"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* Status Chip Banner */}
        <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-card border border-[#E6D8F1]/60">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Current Status
          </span>
          <StatusChip status={appointment.status} />
        </div>

        {/* Cancellation Notice */}
        {appointment.status === AppointmentStatus.CANCELLED && (
          <div className="p-3.5 bg-danger-bg/60 rounded-card border border-danger/30 text-xs space-y-1">
            <span className="font-bold text-danger uppercase tracking-wider text-[10px]">
              Cancellation Notice
            </span>
            <p className="text-gray-800">
              {appointment.cancelReason ||
                appointment.cancellationReason ||
                'Cancelled by clinic administration.'}
            </p>
          </div>
        )}

        {/* Client Record link */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Client
          </span>
          <div className="flex items-center justify-between p-3 bg-white border border-[#E6D8F1]/60 rounded-card">
            <div>
              <div className="font-bold text-sm text-ink">{clientName}</div>
              {appointment.clientCode && (
                <div className="text-xs text-purple-800 font-medium">
                  Code: {appointment.clientCode}
                </div>
              )}
            </div>
            {!isParent && (
              <Link
                href={`/clients/${appointment.clientId}`}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Clinical Modality & Therapist */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-ink">{therapistName}</span>
              <p className="text-xs text-gray-500">{deptName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-ink">{dateFormatted}</span>
              <p className="text-xs text-teal-700 font-medium">{timeFormatted}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-ink">
                {appointment.roomName || 'Therapy Room 1'}
              </span>
              <p className="text-xs text-gray-500">Main Facility</p>
            </div>
          </div>
        </div>

        {/* Long-Term Goal set by therapist */}
        <div className="space-y-1.5 pt-3 border-t border-[#E6D8F1]/40">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-purple-600" />
            <span>Active Long-Term Goal</span>
          </div>
          {isLoadingGoals ? (
            <div className="h-14 bg-gray-100 rounded-btn animate-pulse" />
          ) : activeLtGoal ? (
            <div className="p-3 bg-purple-50/50 rounded-btn border border-purple-100 text-xs text-ink space-y-1">
              <div className="font-semibold text-purple-900">
                {activeLtGoal.domain || 'Primary Clinical Goal'}
              </div>
              <p className="text-gray-700 leading-relaxed">{activeLtGoal.description}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No long-term goal set yet for this client.</p>
          )}
        </div>

        {/* Remark from Previous Session */}
        <div className="space-y-1.5 pt-3 border-t border-[#E6D8F1]/40">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Remark from Previous Session</span>
          </div>
          {isLoadingPast ? (
            <div className="h-14 bg-gray-100 rounded-btn animate-pulse" />
          ) : previousRemark ? (
            <div className="p-3 bg-teal-50/50 rounded-btn border border-teal-100 text-xs text-teal-950 leading-relaxed italic">
              "{previousRemark}"
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No previous session remarks recorded.</p>
          )}
        </div>

        {/* Session Prep Notes */}
        {appointment.notes && (
          <div className="space-y-1 pt-3 border-t border-[#E6D8F1]/40">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Session Prep Notes
            </span>
            <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-btn border border-gray-100 leading-relaxed">
              {appointment.notes}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

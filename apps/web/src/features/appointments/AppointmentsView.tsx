'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { usePermissionsStore } from '@/lib/permissions/store';
import { appointmentsApi, ExtendedAppointment } from '@/lib/api/appointments';
import { employeesApi } from '@/lib/api/employees';
import { departmentsApi } from '@/lib/api/departments';
import { clientsApi } from '@/lib/api/clients';
import { AppointmentsHero } from './AppointmentsHero';
import { AppointmentsToolbar } from './AppointmentsToolbar';
import { CalendarSurface } from './CalendarSurface';
import { SessionDetailDrawer } from './SessionDetailDrawer';
import { NewAppointmentModal } from './NewAppointmentModal';
import { NewScheduleModal } from '@/features/schedule-planning/NewScheduleModal';
import { RescheduleModal } from './RescheduleModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { AppointmentFiltersState, INITIAL_APPOINTMENT_FILTERS, ScheduleSlot } from './types';
import { RoleKey, AppModule, PermissionAction } from '@petals/types';

export function AppointmentsView() {
  usePageTitle('Appointments');
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { myRole, can } = usePermissions();
  const role = myRole || RoleKey.DIRECTOR;
  const isDirectorOrManager = role === RoleKey.DIRECTOR || role === RoleKey.MANAGER;
  const canCreate = can(AppModule.APPOINTMENTS, PermissionAction.CREATE);
  const { selectedBranchId } = usePermissionsStore();

  const actionParam = searchParams?.get('action');
  const leadIdParam = searchParams?.get('leadId') || undefined;
  const leadNameParam = searchParams?.get('leadName') || undefined;
  const isAssessmentAction = actionParam === 'assessment';
  const isScheduleAction = actionParam === 'schedule-planning';

  const [assessmentLead, setAssessmentLead] = useState<{ id: string; name: string } | null>(() =>
    leadIdParam && leadNameParam ? { id: leadIdParam, name: leadNameParam } : null,
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<AppointmentFiltersState>(INITIAL_APPOINTMENT_FILTERS);

  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [appointmentToModify, setAppointmentToModify] = useState<ExtendedAppointment | null>(null);
  const [prefilledSlot, setPrefilledSlot] = useState<{
    time?: string;
    therapistId?: string;
    date?: string;
  } | null>(null);

  // Sync assessmentLead from URL
  useEffect(() => {
    if (leadIdParam && leadNameParam) {
      setAssessmentLead({ id: leadIdParam, name: leadNameParam });
    }
  }, [leadIdParam, leadNameParam]);

  // Check URL query parameters (e.g. ?clientId=xyz&openNew=true or ?action=assessment or ?action=schedule-planning)
  useEffect(() => {
    if (canCreate && (searchParams?.get('openNew') === 'true' || isAssessmentAction)) {
      setIsNewModalOpen(true);
    } else if (canCreate && isScheduleAction) {
      setIsScheduleModalOpen(true);
    }
  }, [searchParams, canCreate, isAssessmentAction, isScheduleAction]);

  // Load employees (therapists)
  const { data: allEmployeesData } = useQuery({
    queryKey: ['employees', selectedBranchId],
    queryFn: async () => {
      const res = await employeesApi.getEmployees(selectedBranchId ? { branchId: selectedBranchId } : {});
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter active therapists
  const therapistsList = React.useMemo(() => {
    if (!allEmployeesData || !Array.isArray(allEmployeesData)) return [];
    return allEmployeesData.filter((emp: any) => {
      const roleStr = (emp.user?.role?.key || emp.roleKey || emp.designation || '').toUpperCase();
      return roleStr.includes('THERAPIST') || emp.isClinicalStaff;
    });
  }, [allEmployeesData]);

  // Load departments
  // const { data: departmentsData } = useQuery({
  //   queryKey: ['departments'],
  //   queryFn: async () => {
  //     const res = await departmentsApi.getDepartments();
  //     return res?.data ?? [];
  //   },
  //   staleTime: 5 * 60 * 1000,
  // });

  // Load clients for appointment booking modal
  const { data: clientsData } = useQuery({
    queryKey: ['all-clients-list'],
    queryFn: async () => {
      const res = await clientsApi.getClients({ page: 1, pageSize: 100 });
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Calculate date window based on role:
  // Director / Manager: single day of currentDate
  // Therapist: whole week of currentDate
  const { fromIso, toIso } = React.useMemo(() => {
    if (isDirectorOrManager) {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);
      return { fromIso: start.toISOString(), toIso: end.toISOString() };
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return { fromIso: weekStart.toISOString(), toIso: weekEnd.toISOString() };
  }, [currentDate, isDirectorOrManager]);

  // Load appointments
  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['appointments', selectedBranchId, fromIso, toIso, filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        from: fromIso,
        to: toIso,
      };

      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      if (filters.therapistId && filters.therapistId !== 'ALL') {
        params.therapistId = filters.therapistId;
      }
      if (filters.departmentId && filters.departmentId !== 'ALL') {
        params.departmentId = filters.departmentId;
      }
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }

      const res = await appointmentsApi.getAppointments(params);
      const list = (res as any)?.data ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
  });

  // Real appointments without any mock fallbacks
  const activeAppointments: ExtendedAppointment[] = appointmentsData ?? [];

  const handleSelectAppointment = (app: ExtendedAppointment) => {
    setSelectedAppointment(app);
    setIsDrawerOpen(true);
  };

  const handleBookSlot = (slot: ScheduleSlot, therapistId?: string, dayDate?: Date) => {
    if (!canCreate) return;
    if (dayDate) setCurrentDate(dayDate);
    setPrefilledSlot({
      time: slot.startTime,
      therapistId,
      date: dayDate ? format(dayDate, 'yyyy-MM-dd') : undefined,
    });
    setIsNewModalOpen(true);
  };

  const handleOpenReschedule = (app: ExtendedAppointment) => {
    setIsDrawerOpen(false);
    setAppointmentToModify(app);
    setIsRescheduleOpen(true);
  };

  const handleOpenCancel = (app: ExtendedAppointment) => {
    setIsDrawerOpen(false);
    setAppointmentToModify(app);
    setIsCancelOpen(true);
  };

  const handleFilterChange = (updates: Partial<AppointmentFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleSuccessMutation = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  // Format therapists for select controls
  const therapistSelectOptions = therapistsList.map((t: any) => ({
    id: t.id,
    name: t.user?.name || t.name || 'Therapist',
  }));

  // const departmentSelectOptions = (departmentsData || []).map((d: any) => ({
  //   id: d.id,
  //   name: d.name,
  // }));

  return (
    <div className="space-y-5 animate-fade-in">
      <AppointmentsHero
        onNewAppointment={() => {
          setPrefilledSlot(null);
          setIsNewModalOpen(true);
        }}
        onSchedulePlanning={() => setIsScheduleModalOpen(true)}
      />

      {assessmentLead && (
        <div className="bg-purple-50 border border-purple-200 rounded-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <span>
              Scheduling Initial Clinical Assessment for <strong>{assessmentLead.name}</strong>. Select an open therapist slot on the schedule grid below or open the booking form.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="px-3 py-1.5 rounded-btn bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors shadow-xs"
            >
              Open Booking Form
            </button>
            <button
              type="button"
              onClick={() => setAssessmentLead(null)}
              className="text-gray-500 hover:text-danger font-medium text-xs ml-1"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      <AppointmentsToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        filters={filters}
        onFilterChange={handleFilterChange}
        therapists={therapistSelectOptions}
        role={role}
      />

      <CalendarSurface
        currentDate={currentDate}
        appointments={activeAppointments}
        onSelectAppointment={handleSelectAppointment}
        onBookSlot={canCreate ? handleBookSlot : undefined}
        isLoading={isLoading}
        role={role}
        therapists={
          (filters.therapistId !== 'ALL'
            ? therapistsList.filter((t: any) => t.id === filters.therapistId)
            : therapistsList
          ).map((t: any) => ({
            id: t.id,
            name: t.user?.name || t.name,
            designation: t.designation ?? undefined,
            departmentName: t.department?.name || t.departmentName,
            user: t.user,
          }))
        }
      />

      <SessionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        appointment={selectedAppointment}
        onReschedule={handleOpenReschedule}
        onCancel={handleOpenCancel}
        onRefresh={handleSuccessMutation}
        role={role}
      />

      {canCreate && (
        <NewAppointmentModal
          isOpen={isNewModalOpen}
          onClose={() => {
            setIsNewModalOpen(false);
            setPrefilledSlot(null);
          }}
          onSuccess={() => {
            handleSuccessMutation();
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setAssessmentLead(null);
          }}
          clients={clientsData || []}
          therapists={therapistSelectOptions}
          prefilledTherapistId={prefilledSlot?.therapistId}
          prefilledTime={prefilledSlot?.time}
          prefilledDate={prefilledSlot?.date}
          assessmentLead={assessmentLead || undefined}
          onClearAssessmentLead={() => setAssessmentLead(null)}
          onOpenSchedulePlanning={() => {
            setIsNewModalOpen(false);
            setIsScheduleModalOpen(true);
          }}
        />
      )}

      {canCreate && (
        <NewScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={() => {
            handleSuccessMutation();
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
          }}
          clients={clientsData || []}
        />
      )}

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={appointmentToModify}
        onSuccess={handleSuccessMutation}
      />

      <CancelAppointmentModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        appointment={appointmentToModify}
        onSuccess={handleSuccessMutation}
      />
    </div>
  );
}

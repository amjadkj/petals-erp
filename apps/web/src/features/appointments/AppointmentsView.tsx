'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
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
import { MobileAgendaView } from './MobileAgendaView';
import { SessionDetailDrawer } from './SessionDetailDrawer';
import { NewAppointmentModal } from './NewAppointmentModal';
import { RescheduleModal } from './RescheduleModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { CalendarViewMode, AppointmentFiltersState, INITIAL_APPOINTMENT_FILTERS } from './types';
import { RoleKey, AppointmentStatus } from '@petals/types';
import { Plus } from 'lucide-react';

export function AppointmentsView() {
  usePageTitle('Appointments');
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { myRole } = usePermissions();
  const role = myRole || RoleKey.DIRECTOR;
  const { selectedBranchId } = usePermissionsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [filters, setFilters] = useState<AppointmentFiltersState>(INITIAL_APPOINTMENT_FILTERS);

  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [appointmentToModify, setAppointmentToModify] = useState<ExtendedAppointment | null>(null);

  // Check URL query parameters (e.g. ?clientId=xyz&openNew=true)
  useEffect(() => {
    if (searchParams?.get('openNew') === 'true') {
      setIsNewModalOpen(true);
    }
  }, [searchParams]);

  // Load therapists
  const { data: therapistsData } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const res = await employeesApi.getEmployees();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await departmentsApi.getDepartments();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load clients for appointment booking modal
  const { data: clientsData } = useQuery({
    queryKey: ['all-clients-list'],
    queryFn: async () => {
      const res = await clientsApi.getClients({ page: 1, pageSize: 100 });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Calculate current week date window
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const fromIso = weekStart.toISOString();
  const toIso = weekEnd.toISOString();

  // Load appointments
  const {
    data: appointmentsData,
    isLoading,
    isError,
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
      return res.data;
    },
  });

  // Fallback demo appointments if backend has none in current window
  const demoAppointments: ExtendedAppointment[] = React.useMemo(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });

    const makeSlot = (
      id: string,
      dayOffset: number,
      startHour: number,
      durationMin: number,
      clientName: string,
      clientCode: string,
      therapistName: string,
      deptName: string,
      status: AppointmentStatus = AppointmentStatus.SCHEDULED,
    ): ExtendedAppointment => {
      const start = addDays(monday, dayOffset);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(start.getTime() + durationMin * 60 * 1000);

      return {
        id,
        branchId: 'b1',
        clientId: `c-${id}`,
        clientName,
        clientCode,
        therapistId: `t-${id}`,
        therapistName,
        departmentName: deptName,
        roomName: 'Therapy Room 1',
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status,
      };
    };

    return [
      makeSlot('demo-1', 0, 9, 45, 'Aadhya Nair', 'PN-001', 'Dr. Ananya Sharma', 'Speech Therapy', AppointmentStatus.ATTENDED),
      makeSlot('demo-2', 0, 11, 45, 'Vihaan Sharma', 'PN-004', 'Rajesh Menon', 'Occupational Therapy', AppointmentStatus.ATTENDED),
      makeSlot('demo-3', 1, 10, 45, 'Arjun Das', 'PN-012', 'Dr. Ananya Sharma', 'Speech Therapy', AppointmentStatus.SCHEDULED),
      makeSlot('demo-4', 2, 14, 45, 'Diya Patel', 'PN-018', 'Kavitha Sundaram', 'Behavioural Therapy', AppointmentStatus.SCHEDULED),
      makeSlot('demo-5', 3, 10, 45, 'Kabir Verma', 'PN-022', 'Dr. Ananya Sharma', 'Speech Therapy', AppointmentStatus.CANCELLED),
      makeSlot('demo-6', 4, 15, 45, 'Aadhya Nair', 'PN-001', 'Rajesh Menon', 'Occupational Therapy', AppointmentStatus.SCHEDULED),
    ];
  }, [currentDate]);

  const appointments = (appointmentsData && appointmentsData.length > 0)
    ? appointmentsData
    : demoAppointments;

  const handleSelectAppointment = (app: ExtendedAppointment) => {
    setSelectedAppointment(app);
    setIsDrawerOpen(true);
  };

  const handleOpenReschedule = (app: ExtendedAppointment) => {
    setAppointmentToModify(app);
    setIsRescheduleOpen(true);
    setIsDrawerOpen(false);
  };

  const handleOpenCancel = (app: ExtendedAppointment) => {
    setAppointmentToModify(app);
    setIsCancelOpen(true);
    setIsDrawerOpen(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    refetch();
  };

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6 pb-16 md:pb-6 relative">
      {/* Hero Section */}
      <AppointmentsHero
        onNewAppointment={() => setIsNewModalOpen(true)}
      />

      {/* Toolbar */}
      <AppointmentsToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        therapists={therapistsData || []}
        departments={departmentsData || []}
        role={role}
      />

      {isError && (
        <div className="p-3.5 bg-danger-bg text-danger border border-danger/30 rounded-card flex items-center justify-between text-xs md:text-sm">
          <span>Failed to load appointments from server. Showing local schedule cache.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="underline font-semibold hover:text-danger/80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Calendar Surface (>= 768px) */}
      <div className="hidden md:block">
        <CalendarSurface
          currentDate={currentDate}
          appointments={appointments}
          onSelectAppointment={handleSelectAppointment}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile Agenda View (< 768px) */}
      <div className="md:hidden">
        <MobileAgendaView
          currentDate={currentDate}
          onSelectDate={setCurrentDate}
          daysOfWeek={daysOfWeek}
          appointments={appointments}
          onSelectAppointment={handleSelectAppointment}
        />
      </div>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-20 right-5 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-xl flex items-center justify-center hover:bg-purple-800 active:scale-95 transition-transform"
          aria-label="New appointment"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Appointment Detail Drawer */}
      <SessionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        appointment={selectedAppointment}
        onReschedule={handleOpenReschedule}
        onCancel={handleOpenCancel}
        onRefresh={handleRefresh}
        role={role}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleRefresh}
        clients={clientsData || []}
        therapists={therapistsData || []}
        departments={departmentsData || []}
        prefilledClientId={searchParams?.get('clientId') || undefined}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={appointmentToModify}
        onSuccess={handleRefresh}
      />

      {/* Cancel Modal */}
      <CancelAppointmentModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        appointment={appointmentToModify}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

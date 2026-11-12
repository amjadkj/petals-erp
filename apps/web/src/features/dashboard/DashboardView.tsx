'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoleKey } from '@petals/types';
import { dashboardApi } from '@/lib/api/dashboard';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { usePermissionsStore } from '@/lib/permissions/store';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { DashboardHero } from './DashboardHero';
import { DashboardStats } from './DashboardStats';
import { TherapistUtilisationWidget } from './widgets/TherapistUtilisationWidget';
import { CentrePulseWidget } from './widgets/CentrePulseWidget';
import { TodaySessionsWidget } from './widgets/TodaySessionsWidget';
import { OverdueReportsWidget } from './widgets/OverdueReportsWidget';
import { TherapistScheduleWidget } from './widgets/TherapistScheduleWidget';
import { ParentUpcomingWidget } from './widgets/ParentUpcomingWidget';
import { ConfigureWidgetsModal } from './ConfigureWidgetsModal';
import {
  WidgetConfig,
  DEFAULT_DIRECTOR_WIDGETS,
  DEFAULT_MANAGER_WIDGETS,
  DEFAULT_THERAPIST_WIDGETS,
  DEFAULT_PARENT_WIDGETS,
} from './types';

export function DashboardView() {
  const { myRole } = usePermissions();
  const role = myRole || RoleKey.DIRECTOR;
  const { selectedBranchId } = usePermissionsStore();

  // Dynamic header title per role
  const title =
    role === RoleKey.DIRECTOR
      ? 'Director dashboard'
      : role === RoleKey.MANAGER
        ? 'Dashboard'
        : role === RoleKey.THERAPIST
          ? 'My dashboard'
          : 'Home';

  usePageTitle(title);

  // TanStack Query for dashboard payload
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', role, selectedBranchId],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard(selectedBranchId);
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Widget configuration state
  const storageKey = `petals.dashboard.widgets.${role}`;
  const getDefaultWidgets = () => {
    switch (role) {
      case RoleKey.MANAGER:
        return DEFAULT_MANAGER_WIDGETS;
      case RoleKey.THERAPIST:
        return DEFAULT_THERAPIST_WIDGETS;
      case RoleKey.PARENT:
        return DEFAULT_PARENT_WIDGETS;
      default:
        return DEFAULT_DIRECTOR_WIDGETS;
    }
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(getDefaultWidgets());
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setWidgets(JSON.parse(stored));
      } else {
        setWidgets(getDefaultWidgets());
      }
    } catch {
      setWidgets(getDefaultWidgets());
    }
  }, [role, storageKey]);

  const handleSaveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newWidgets));
    } catch {
      // ignore
    }
  };

  const handleResetWidgets = () => {
    const defaults = getDefaultWidgets();
    setWidgets(defaults);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const metrics = dashboardData?.metrics || {};

  const renderWidget = (id: string) => {
    switch (id) {
      case 'therapist-utilisation':
        return <TherapistUtilisationWidget />;
      case 'centre-pulse':
        return (
          <CentrePulseWidget
            leadFollowupsCount={metrics.leads?.newCount ?? 6}
            reportsDueCount={metrics.overdueReports ?? 4}
            leaveRequestsCount={2}
          />
        );
      case 'today-sessions':
        return <TodaySessionsWidget />;
      case 'overdue-reports':
        return <OverdueReportsWidget />;
      case 'therapist-schedule':
        return <TherapistScheduleWidget sessions={metrics.todaySessions} />;
      case 'parent-upcoming':
        return (
          <ParentUpcomingWidget
            childrenList={metrics.children}
            sessions={metrics.upcomingSessions}
          />
        );
      default:
        return null;
    }
  };

  const enabledWidgets = widgets.filter((w) => w.enabled);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <DashboardHero
        onConfigureWidgets={() => setIsConfigureOpen(true)}
      />

      {/* Global query error banner */}
      {isError && (
        <div className="p-4 bg-danger-bg text-danger border border-danger/30 rounded-card flex items-center justify-between text-sm">
          <span>Failed to load dashboard metrics. Showing cached or fallback view.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="underline font-semibold hover:text-danger/80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <DashboardStats
        role={role}
        metrics={metrics}
        isLoading={isLoading}
      />

      {/* Dynamic 2-column Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {enabledWidgets.map((w) => (
          <div key={w.id} className="min-h-[280px]">
            {renderWidget(w.id)}
          </div>
        ))}
      </div>

      {enabledWidgets.length === 0 && (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8 text-center text-sm text-gray-500">
          All widgets are currently hidden.{' '}
          <button
            type="button"
            onClick={() => setIsConfigureOpen(true)}
            className="text-purple-600 font-semibold underline hover:text-purple-800"
          >
            Configure widgets
          </button>{' '}
          to display them.
        </div>
      )}

      {/* Configure Widgets Modal */}
      <ConfigureWidgetsModal
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        widgets={widgets}
        onSave={handleSaveWidgets}
        onReset={handleResetWidgets}
      />
    </div>
  );
}

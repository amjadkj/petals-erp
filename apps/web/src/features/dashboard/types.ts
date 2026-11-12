export type WidgetId =
  | 'therapist-utilisation'
  | 'centre-pulse'
  | 'today-sessions'
  | 'overdue-reports'
  | 'therapist-schedule'
  | 'parent-upcoming';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  enabled: boolean;
}

export const DEFAULT_DIRECTOR_WIDGETS: WidgetConfig[] = [
  { id: 'therapist-utilisation', label: 'Therapist Utilisation', enabled: true },
  { id: 'centre-pulse', label: 'Centre Pulse', enabled: true },
  { id: 'today-sessions', label: "Today's Sessions", enabled: true },
  { id: 'overdue-reports', label: 'Overdue Reports', enabled: true },
];

export const DEFAULT_MANAGER_WIDGETS: WidgetConfig[] = [
  { id: 'today-sessions', label: "Today's Sessions", enabled: true },
  { id: 'centre-pulse', label: 'Centre Pulse', enabled: true },
  { id: 'therapist-utilisation', label: 'Therapist Utilisation', enabled: true },
  { id: 'overdue-reports', label: 'Overdue Reports', enabled: true },
];

export const DEFAULT_THERAPIST_WIDGETS: WidgetConfig[] = [
  { id: 'therapist-schedule', label: "Today's Schedule", enabled: true },
  { id: 'overdue-reports', label: 'Pending Reports', enabled: true },
];

export const DEFAULT_PARENT_WIDGETS: WidgetConfig[] = [
  { id: 'parent-upcoming', label: 'Upcoming Sessions', enabled: true },
];

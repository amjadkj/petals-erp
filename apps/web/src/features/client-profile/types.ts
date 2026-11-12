export type ProfileTabId =
  | 'overview'
  | 'assessments'
  | 'treatment-plans'
  | 'progress'
  | 'reports'
  | 'documents'
  | 'sessions';

export interface TabDefinition {
  id: ProfileTabId;
  label: string;
}

export const ALL_PROFILE_TABS: TabDefinition[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'treatment-plans', label: 'Treatment & Payments' },
  { id: 'progress', label: 'Progress & Goals' },
  { id: 'reports', label: 'Reports' },
  { id: 'documents', label: 'Documents' },
  { id: 'sessions', label: 'Session History' },
];

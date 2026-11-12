import { AppModule, PermissionAction } from '@petals/types';
import type { MatrixRowDefinition } from './types';

export const MATRIX_ROWS: MatrixRowDefinition[] = [
  {
    module: AppModule.DASHBOARD,
    label: 'Dashboard',
    notApplicableActions: [
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
      PermissionAction.VIEW_ALL,
      PermissionAction.DELETE,
    ],
  },
  {
    module: AppModule.APPOINTMENTS,
    label: 'Appointments',
  },
  {
    module: AppModule.CLIENTS,
    label: 'Clients',
  },
  {
    module: AppModule.PROFILE_OVERVIEW,
    label: 'Profile Overview',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
    notApplicableActions: [PermissionAction.CREATE, PermissionAction.DELETE],
  },
  {
    module: AppModule.PROFILE_ASSESSMENT,
    label: 'Assessment (Clinical)',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
    clinicalOnly: true,
  },
  {
    module: AppModule.PROFILE_PAYMENT_PLAN,
    label: 'Payment & Treatment Plans',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
  },
  {
    module: AppModule.PROFILE_PROGRESS,
    label: 'Progress Notes & Milestones',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
  },
  {
    module: AppModule.PROFILE_REPORTS,
    label: 'Clinical Reports',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
  },
  {
    module: AppModule.PROFILE_DOCUMENTS,
    label: 'Documents & Attachments',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
  },
  {
    module: AppModule.PROFILE_SESSIONS,
    label: 'Client Sessions & History',
    isSubModule: true,
    parentModule: AppModule.CLIENTS,
  },
  {
    module: AppModule.FINANCIAL,
    label: 'Financial & Invoicing',
  },
  {
    module: AppModule.FINANCIAL_PNL,
    label: 'Financial P&L Report',
    isSubModule: true,
    parentModule: AppModule.FINANCIAL,
    notApplicableActions: [
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
      PermissionAction.VIEW_ALL,
      PermissionAction.DELETE,
    ],
  },
  {
    module: AppModule.COMMUNICATION,
    label: 'Communication & Templates',
  },
  {
    module: AppModule.SCHEDULE_PLANNING,
    label: 'Schedule Planning',
    directorOnly: true,
  },
  {
    module: AppModule.HRMS,
    label: 'HRMS (Attendance & Leaves)',
  },
  {
    module: AppModule.EMPLOYEES,
    label: 'Employees Directory',
  },
  {
    module: AppModule.EMPLOYEE_SALARY,
    label: 'Employee Salary',
    isSubModule: true,
    parentModule: AppModule.EMPLOYEES,
    notApplicableActions: [
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
      PermissionAction.VIEW_ALL,
      PermissionAction.DELETE,
    ],
  },
  {
    module: AppModule.LEADS,
    label: 'Leads & Inquiries',
  },
  {
    module: AppModule.REPORTS,
    label: 'Reports Dashboard',
  },
  {
    module: AppModule.ROLE_ACCESS,
    label: 'Role Access & Governance',
    directorOnly: true,
  },
];


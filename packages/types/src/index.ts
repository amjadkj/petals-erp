export enum RoleKey {
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  THERAPIST = 'THERAPIST',
  PARENT = 'PARENT',
}

export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  CLIENTS = 'CLIENTS',
  CLIENT_PROFILE = 'CLIENT_PROFILE',
  FINANCIAL = 'FINANCIAL',
  FINANCIAL_PNL = 'FINANCIAL_PNL',
  COMMUNICATION = 'COMMUNICATION',
  SCHEDULE_PLANNING = 'SCHEDULE_PLANNING',
  HRMS = 'HRMS',
  EMPLOYEES = 'EMPLOYEES',
  EMPLOYEE_SALARY = 'EMPLOYEE_SALARY',
  LEADS = 'LEADS',
  REPORTS = 'REPORTS',
  ROLE_PERMISSIONS = 'ROLE_PERMISSIONS',
  AUDIT_LOGS = 'AUDIT_LOGS',
  PROFILE_OVERVIEW = 'PROFILE_OVERVIEW',
  PROFILE_ASSESSMENT = 'PROFILE_ASSESSMENT',
  PROFILE_PAYMENTS = 'PROFILE_PAYMENTS',
  PROFILE_PROGRESS = 'PROFILE_PROGRESS',
  PROFILE_REPORTS = 'PROFILE_REPORTS',
  PROFILE_DOCUMENTS = 'PROFILE_DOCUMENTS',
  PROFILE_SESSIONS = 'PROFILE_SESSIONS',
}

export enum PermissionAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  VIEW = 'VIEW',
  VIEW_ALL = 'VIEW_ALL',
  DELETE = 'DELETE',
}

export interface PaginationMetaOffset {
  page: number;
  pageSize: number;
  total?: number;
  hasNext: boolean;
}

export interface PaginationMetaCursor {
  nextCursor?: string | null;
  hasNext: boolean;
}

export interface ApiResponse<T, M = PaginationMetaOffset | PaginationMetaCursor> {
  data: T;
  meta?: M;
}


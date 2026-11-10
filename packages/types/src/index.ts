export enum RoleKey {
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  THERAPIST = 'THERAPIST',
  PARENT = 'PARENT',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  DISCHARGED = 'DISCHARGED',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  ATTENDED = 'ATTENDED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  CLIENTS = 'CLIENTS',
  PROFILE_OVERVIEW = 'PROFILE_OVERVIEW',
  PROFILE_ASSESSMENT = 'PROFILE_ASSESSMENT',
  PROFILE_PAYMENT_PLAN = 'PROFILE_PAYMENT_PLAN',
  PROFILE_PROGRESS = 'PROFILE_PROGRESS',
  PROFILE_REPORTS = 'PROFILE_REPORTS',
  PROFILE_DOCUMENTS = 'PROFILE_DOCUMENTS',
  PROFILE_SESSIONS = 'PROFILE_SESSIONS',
  FINANCIAL = 'FINANCIAL',
  FINANCIAL_PNL = 'FINANCIAL_PNL',
  COMMUNICATION = 'COMMUNICATION',
  SCHEDULE_PLANNING = 'SCHEDULE_PLANNING',
  HRMS = 'HRMS',
  EMPLOYEES = 'EMPLOYEES',
  EMPLOYEE_SALARY = 'EMPLOYEE_SALARY',
  LEADS = 'LEADS',
  REPORTS = 'REPORTS',
  ROLE_ACCESS = 'ROLE_ACCESS',
}

export enum PermissionAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  VIEW = 'VIEW',
  VIEW_ALL = 'VIEW_ALL',
  DELETE = 'DELETE',
}

export enum PermissionScope {
  OWN = 'OWN',
  ASSIGNED = 'ASSIGNED',
  ALL = 'ALL',
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

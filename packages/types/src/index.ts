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

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum GoalTerm {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ACHIEVED = 'ACHIEVED',
  DISCONTINUED = 'DISCONTINUED',
}

export enum SubgoalFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ProgressLevel {
  REGRESSED = 'REGRESSED',
  NO_CHANGE = 'NO_CHANGE',
  EMERGING = 'EMERGING',
  PROGRESSING = 'PROGRESSING',
  ACHIEVED = 'ACHIEVED',
}

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ReportType {
  ASSESSMENT = 'ASSESSMENT',
  PROGRESS = 'PROGRESS',
  DISCHARGE = 'DISCHARGE',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  SHARED = 'SHARED',
}

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  ASSESSMENT_SCHEDULED = 'ASSESSMENT_SCHEDULED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum CommunicationChannel {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  CALL = 'CALL',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RevenueCategory {
  CLINICAL_THERAPY = 'CLINICAL_THERAPY',
  ASSESSMENT_FEE = 'ASSESSMENT_FEE',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  ADVANCE = 'ADVANCE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
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

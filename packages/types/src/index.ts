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

// ─────────────────────────────────────────────────────────────
// Client-Facing DTOs & Entity Types for Web App
// ─────────────────────────────────────────────────────────────

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roleKey: RoleKey;
  isActive: boolean;
  branchIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: UserSummary;
}

export interface BranchDto {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  timezone: string;
  isActive: boolean;
}

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface ClientDto {
  id: string;
  branchId: string;
  clientCode: string;
  name: string;
  dob: string;
  gender?: string | null;
  status: ClientStatus;
  bloodGroup?: string | null;
  allergies?: string | null;
  caseHistory?: string | null;
  sessionCount?: number;
  primaryGuardian?: {
    name: string;
    phone: string;
    email?: string | null;
    relation: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentDto {
  id: string;
  branchId: string;
  clientId: string;
  clientName?: string;
  therapistId: string;
  therapistName?: string;
  roomId?: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancellationReason?: string | null;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  branchId: string;
  clientId: string;
  clientName?: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  revenueCategory: RevenueCategory;
  dueDate: string;
  createdAt: string;
}

export interface PaymentDto {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string | null;
  createdAt: string;
}

export interface LeadDto {
  id: string;
  branchId: string;
  parentName: string;
  childName: string;
  childDob?: string | null;
  phone: string;
  email?: string | null;
  stage: LeadStage;
  source?: string | null;
  concerns?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalReportDto {
  id: string;
  clientId: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  dueOn: string;
  content?: string | null;
  fileUrl?: string | null;
  sharedWithParent: boolean;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface AttendanceRecordDto {
  id: string;
  employeeId: string;
  employeeName?: string;
  branchId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
}

export interface DashboardMetricsDto {
  role: RoleKey;
  branchId?: string | null;
  metrics: Record<string, any>;
}


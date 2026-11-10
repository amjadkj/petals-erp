-- CreateEnum
CREATE TYPE "AppModule" AS ENUM ('DASHBOARD', 'APPOINTMENTS', 'CLIENTS', 'PROFILE_OVERVIEW', 'PROFILE_ASSESSMENT', 'PROFILE_PAYMENT_PLAN', 'PROFILE_PROGRESS', 'PROFILE_REPORTS', 'PROFILE_DOCUMENTS', 'PROFILE_SESSIONS', 'FINANCIAL', 'FINANCIAL_PNL', 'COMMUNICATION', 'SCHEDULE_PLANNING', 'HRMS', 'EMPLOYEES', 'EMPLOYEE_SALARY', 'LEADS', 'REPORTS', 'ROLE_ACCESS');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'UPDATE', 'VIEW', 'VIEW_ALL', 'DELETE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'ASSESSMENT_SCHEDULED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GoalTerm" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "SubgoalFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ProgressLevel" AS ENUM ('REGRESSED', 'NO_CHANGE', 'EMERGING', 'PROGRESSING', 'ACHIEVED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'ATTENDED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ASSESSMENT', 'PROGRESS', 'DISCHARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'SHARED');

-- CreateEnum
CREATE TYPE "RevenueCategory" AS ENUM ('CLINICAL_THERAPY', 'ASSESSMENT_FEE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'ADVANCE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'CALL');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK', 'PAID', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('EDIT', 'DELETE', 'RESTORE');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('DIRECTOR', 'MANAGER', 'THERAPIST', 'PARENT');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_branches" (
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_branches_pkey" PRIMARY KEY ("user_id","branch_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "key" "RoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_modules" (
    "role_id" UUID NOT NULL,
    "module" "AppModule" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_modules_pkey" PRIMARY KEY ("role_id","module")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "module" "AppModule" NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","module","action")
);

-- CreateTable
CREATE TABLE "user_overrides" (
    "user_id" UUID NOT NULL,
    "module" "AppModule" NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "user_overrides_pkey" PRIMARY KEY ("user_id","module","action")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "away_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID,
    "employee_code" TEXT NOT NULL,
    "designation" TEXT,
    "salary" DECIMAL(12,2),
    "joined_on" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp_no" TEXT,
    "whatsapp_consent" BOOLEAN NOT NULL DEFAULT false,
    "email_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_recorded_at" TIMESTAMP(3),

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "lead_id" UUID,
    "client_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "gender" TEXT,
    "case_history" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_guardians" (
    "client_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relation" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "can_view_overview" BOOLEAN NOT NULL DEFAULT true,
    "can_view_assessment" BOOLEAN NOT NULL DEFAULT false,
    "can_view_payment_plan" BOOLEAN NOT NULL DEFAULT true,
    "can_view_reports" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "client_guardians_pkey" PRIMARY KEY ("client_id","guardian_id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "owner_id" UUID,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "child_age" INTEGER,
    "concern" TEXT,
    "source" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "next_follow_up" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "assessed_on" DATE NOT NULL,
    "tool" TEXT,
    "observation" TEXT,
    "scores" JSONB,
    "summary" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plans" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "sessions_per_week" INTEGER NOT NULL,
    "session_minutes" INTEGER NOT NULL DEFAULT 45,
    "fee_per_session" DECIMAL(12,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "term" "GoalTerm" NOT NULL,
    "title" TEXT NOT NULL,
    "baseline" TEXT,
    "description" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "target_date" DATE,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subgoals" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "frequency" "SubgoalFrequency" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "start_date" DATE,
    "end_date" DATE,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subgoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_entries" (
    "id" UUID NOT NULL,
    "subgoal_id" UUID NOT NULL,
    "appointment_id" UUID,
    "author_id" UUID NOT NULL,
    "entry_date" DATE NOT NULL,
    "description" TEXT,
    "response" TEXT,
    "remarks" TEXT,
    "level" "ProgressLevel" NOT NULL DEFAULT 'NO_CHANGE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "file_url" TEXT,
    "due_on" DATE,
    "submitted_at" TIMESTAMP(3),
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "shared_with_parent" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "shared_with_parent" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_entry_versions" (
    "id" UUID NOT NULL,
    "changed_by_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "change_type" "ChangeType" NOT NULL,
    "previous_content" JSONB NOT NULL,
    "reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_entry_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "recurrence_rule" TEXT NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "schedule_id" UUID,
    "client_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cancel_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "plan_id" UUID,
    "invoice_no" TEXT NOT NULL,
    "revenue_category" "RevenueCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "issued_on" DATE NOT NULL,
    "due_on" DATE NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "recorded_by_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "recorded_by_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "spent_on" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" UUID NOT NULL,
    "approved_by_id" UUID,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "body" TEXT NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "provider_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "sent_by_id" UUID NOT NULL,
    "template_id" UUID,
    "channel" "CommunicationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
    "provider_ref" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "decided_by_id" UUID,
    "leave_type" "LeaveType" NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "backup_approval" BOOLEAN NOT NULL DEFAULT false,
    "decision_note" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID,
    "branch_id" UUID,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "target" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN',
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "branch_id" UUID,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "year" INTEGER NOT NULL,
    "allowed" DECIMAL(5,1) NOT NULL,
    "used" DECIMAL(5,1) NOT NULL DEFAULT 0,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE INDEX "user_branches_branch_id_idx" ON "user_branches"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE INDEX "employees_department_id_idx" ON "employees"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_user_id_key" ON "guardians"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_lead_id_key" ON "clients"("lead_id");

-- CreateIndex
CREATE INDEX "clients_branch_id_status_idx" ON "clients"("branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "clients_branch_id_client_code_key" ON "clients"("branch_id", "client_code");

-- CreateIndex
CREATE INDEX "client_guardians_guardian_id_idx" ON "client_guardians"("guardian_id");

-- CreateIndex
CREATE INDEX "leads_branch_id_stage_next_follow_up_idx" ON "leads"("branch_id", "stage", "next_follow_up");

-- CreateIndex
CREATE INDEX "leads_owner_id_idx" ON "leads"("owner_id");

-- CreateIndex
CREATE INDEX "assessments_client_id_assessed_on_idx" ON "assessments"("client_id", "assessed_on");

-- CreateIndex
CREATE INDEX "assessments_assessor_id_idx" ON "assessments"("assessor_id");

-- CreateIndex
CREATE INDEX "treatment_plans_client_id_status_idx" ON "treatment_plans"("client_id", "status");

-- CreateIndex
CREATE INDEX "treatment_plans_therapist_id_status_idx" ON "treatment_plans"("therapist_id", "status");

-- CreateIndex
CREATE INDEX "treatment_plans_department_id_idx" ON "treatment_plans"("department_id");

-- CreateIndex
CREATE INDEX "goals_plan_id_term_idx" ON "goals"("plan_id", "term");

-- CreateIndex
CREATE INDEX "subgoals_goal_id_frequency_idx" ON "subgoals"("goal_id", "frequency");

-- CreateIndex
CREATE INDEX "progress_entries_subgoal_id_entry_date_idx" ON "progress_entries"("subgoal_id", "entry_date");

-- CreateIndex
CREATE INDEX "progress_entries_author_id_entry_date_idx" ON "progress_entries"("author_id", "entry_date");

-- CreateIndex
CREATE INDEX "progress_entries_appointment_id_idx" ON "progress_entries"("appointment_id");

-- CreateIndex
CREATE INDEX "reports_status_due_on_idx" ON "reports"("status", "due_on");

-- CreateIndex
CREATE INDEX "reports_client_id_idx" ON "reports"("client_id");

-- CreateIndex
CREATE INDEX "reports_author_id_status_idx" ON "reports"("author_id", "status");

-- CreateIndex
CREATE INDEX "documents_client_id_idx" ON "documents"("client_id");

-- CreateIndex
CREATE INDEX "documents_uploaded_by_id_idx" ON "documents"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "clinical_entry_versions_changed_by_id_changed_at_idx" ON "clinical_entry_versions"("changed_by_id", "changed_at");

-- CreateIndex
CREATE INDEX "clinical_entry_versions_changed_at_id_idx" ON "clinical_entry_versions"("changed_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_entry_versions_entity_type_entity_id_version_no_key" ON "clinical_entry_versions"("entity_type", "entity_id", "version_no");

-- CreateIndex
CREATE INDEX "schedules_plan_id_idx" ON "schedules"("plan_id");

-- CreateIndex
CREATE INDEX "appointments_branch_id_starts_at_idx" ON "appointments"("branch_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_therapist_id_starts_at_idx" ON "appointments"("therapist_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_client_id_starts_at_idx" ON "appointments"("client_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_status_starts_at_idx" ON "appointments"("status", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_schedule_id_idx" ON "appointments"("schedule_id");

-- CreateIndex
CREATE INDEX "invoices_branch_id_status_due_on_idx" ON "invoices"("branch_id", "status", "due_on");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_plan_id_idx" ON "invoices"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_branch_id_invoice_no_key" ON "invoices"("branch_id", "invoice_no");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_no_key" ON "payments"("receipt_no");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE INDEX "payments_recorded_by_id_idx" ON "payments"("recorded_by_id");

-- CreateIndex
CREATE INDEX "expenses_branch_id_spent_on_idx" ON "expenses"("branch_id", "spent_on");

-- CreateIndex
CREATE INDEX "expenses_recorded_by_id_idx" ON "expenses"("recorded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_templates_name_key" ON "whatsapp_templates"("name");

-- CreateIndex
CREATE INDEX "whatsapp_templates_approved_by_id_idx" ON "whatsapp_templates"("approved_by_id");

-- CreateIndex
CREATE INDEX "communication_logs_client_id_sent_at_idx" ON "communication_logs"("client_id", "sent_at");

-- CreateIndex
CREATE INDEX "communication_logs_sent_by_id_idx" ON "communication_logs"("sent_by_id");

-- CreateIndex
CREATE INDEX "communication_logs_sent_at_id_idx" ON "communication_logs"("sent_at", "id");

-- CreateIndex
CREATE INDEX "communication_logs_template_id_idx" ON "communication_logs"("template_id");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_status_idx" ON "leave_requests"("employee_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_status_from_date_idx" ON "leave_requests"("status", "from_date");

-- CreateIndex
CREATE INDEX "leave_requests_decided_by_id_idx" ON "leave_requests"("decided_by_id");

-- CreateIndex
CREATE INDEX "attendance_records_branch_id_work_date_idx" ON "attendance_records"("branch_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employee_id_work_date_key" ON "attendance_records"("employee_id", "work_date");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_id_idx" ON "audit_logs"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_revoked_at_idx" ON "sessions"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "sessions_family_id_idx" ON "sessions"("family_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "otp_codes_target_purpose_created_at_idx" ON "otp_codes"("target", "purpose", "created_at");

-- CreateIndex
CREATE INDEX "otp_codes_expires_at_idx" ON "otp_codes"("expires_at");

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_branch_id_date_key" ON "holidays"("branch_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employee_id_leave_type_year_key" ON "leave_balances"("employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_modules" ADD CONSTRAINT "role_modules_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_overrides" ADD CONSTRAINT "user_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_guardians" ADD CONSTRAINT "client_guardians_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_guardians" ADD CONSTRAINT "client_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "treatment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subgoals" ADD CONSTRAINT "subgoals_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_subgoal_id_fkey" FOREIGN KEY ("subgoal_id") REFERENCES "subgoals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_entry_versions" ADD CONSTRAINT "clinical_entry_versions_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "treatment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "treatment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_sent_by_id_fkey" FOREIGN KEY ("sent_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

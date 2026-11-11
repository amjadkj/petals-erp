-- ─────────────────────────────────────────────────────────────
-- 1. DATABASE ROLE & PERMISSIONS: app_user (NOBYPASSRLS)
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN PASSWORD 'app_user_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ─────────────────────────────────────────────────────────────
-- 2. HELPER FUNCTIONS: app_branch_ids() & app_all_branches()
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION app_branch_ids() RETURNS uuid[] AS $$
BEGIN
  RETURN string_to_array(nullif(current_setting('app.branch_ids', true), ''), ',')::uuid[];
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_all_branches() RETURNS boolean AS $$
BEGIN
  RETURN coalesce(current_setting('app.all_branches', true)::boolean, false);
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────────────────────
-- 3. RLS ON DIRECT BRANCH TABLES (branch_id column)
-- ─────────────────────────────────────────────────────────────

-- clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON clients;
CREATE POLICY branch_isolation ON clients
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON leads;
CREATE POLICY branch_isolation ON leads
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON appointments;
CREATE POLICY branch_isolation ON appointments
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON invoices;
CREATE POLICY branch_isolation ON invoices
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON expenses;
CREATE POLICY branch_isolation ON expenses
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- attendance_records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON attendance_records;
CREATE POLICY branch_isolation ON attendance_records
  FOR ALL
  TO PUBLIC
  USING (app_all_branches() OR branch_id = ANY(app_branch_ids()))
  WITH CHECK (app_all_branches() OR branch_id = ANY(app_branch_ids()));

-- ─────────────────────────────────────────────────────────────
-- 4. RLS ON SENSITIVE CHILD TABLES (EXISTS-based via Parent)
-- ─────────────────────────────────────────────────────────────

-- treatment_plans (child of clients)
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON treatment_plans;
CREATE POLICY branch_isolation ON treatment_plans
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = treatment_plans.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = treatment_plans.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  );

-- assessments (child of clients)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON assessments;
CREATE POLICY branch_isolation ON assessments
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = assessments.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = assessments.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  );

-- reports (child of clients)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON reports;
CREATE POLICY branch_isolation ON reports
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = reports.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = reports.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  );

-- payments (child of invoices)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON payments;
CREATE POLICY branch_isolation ON payments
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = payments.invoice_id AND (app_all_branches() OR i.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = payments.invoice_id AND (app_all_branches() OR i.branch_id = ANY(app_branch_ids()))
    )
  );

-- documents (child of clients)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON documents;
CREATE POLICY branch_isolation ON documents
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = documents.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = documents.client_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  );

-- progress_entries (child of subgoals -> goals -> treatment_plans -> clients)
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branch_isolation ON progress_entries;
CREATE POLICY branch_isolation ON progress_entries
  FOR ALL
  TO PUBLIC
  USING (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM subgoals s
      JOIN goals g ON g.id = s.goal_id
      JOIN treatment_plans p ON p.id = g.plan_id
      JOIN clients c ON c.id = p.client_id
      WHERE s.id = progress_entries.subgoal_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  )
  WITH CHECK (
    app_all_branches() OR EXISTS (
      SELECT 1 FROM subgoals s
      JOIN goals g ON g.id = s.goal_id
      JOIN treatment_plans p ON p.id = g.plan_id
      JOIN clients c ON c.id = p.client_id
      WHERE s.id = progress_entries.subgoal_id AND (app_all_branches() OR c.branch_id = ANY(app_branch_ids()))
    )
  );


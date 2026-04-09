CREATE TABLE testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  current_round integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tester_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  os text NOT NULL,
  os_version text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'blocked', 'skip', 'acknowledged', 'fix_in_progress', 'ready_for_retest', 'retest_pass', 'retest_fail')),
  round integer DEFAULT 1,
  severity text CHECK (severity IN ('critical', 'major', 'minor')),
  defect_description text,
  acknowledged_by text,
  acknowledged_at timestamptz,
  device text,
  notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tester_id, check_id, round)
);

CREATE TABLE test_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  step_index int NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE path_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  path_id text NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (tester_id, path_id)
);

CREATE INDEX idx_test_results_tester ON test_results(tester_id);
CREATE INDEX idx_test_results_round ON test_results(tester_id, round);
CREATE INDEX idx_test_notes_tester ON test_notes(tester_id, scenario_id, step_index);
CREATE INDEX idx_screenshots_tester ON screenshots(tester_id, check_id);
CREATE INDEX idx_path_assignments_tester ON path_assignments(tester_id);
CREATE INDEX idx_tester_devices_tester ON tester_devices(tester_id);

-- ─── Role system ───
ALTER TABLE testers ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'tester';

-- ─── Assignments ───
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  persona text NOT NULL,
  assigned_by uuid REFERENCES testers(id),
  notes text,
  status text NOT NULL DEFAULT 'assigned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tester_id, scenario_id)
);

CREATE INDEX idx_assignments_tester ON assignments(tester_id);
CREATE INDEX idx_assignments_scenario ON assignments(scenario_id);

-- ─── Bugs ───
CREATE TABLE bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id text,
  scenario_id text,
  step_title text,
  platform text,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'P1',
  status text NOT NULL DEFAULT 'open',
  assignee text,
  created_by uuid REFERENCES testers(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bugs_status ON bugs(status);

-- ─── Failure clusters ───
CREATE TABLE failure_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text,
  check_ids text[] NOT NULL,
  bug_id uuid REFERENCES bugs(id),
  notes text,
  created_by uuid REFERENCES testers(id),
  created_at timestamptz DEFAULT now()
);

-- ─── Retest requests ───
CREATE TABLE retest_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  scenario_id text NOT NULL,
  requested_by uuid REFERENCES testers(id),
  reason text NOT NULL,
  what_to_verify text NOT NULL,
  original_status text,
  original_notes text,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  retest_result text,
  retest_notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_retest_requests_tester ON retest_requests(tester_id);
CREATE INDEX idx_retest_requests_status ON retest_requests(status);

-- ─── Notifications ───
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_tester ON notifications(tester_id, is_read);

-- ─── Test evidence (enhanced) ───
CREATE TABLE test_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size int,
  caption text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_test_evidence_tester ON test_evidence(tester_id, check_id);

-- ─── Admin comments on checkpoint results ───
CREATE TABLE admin_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  author_id uuid REFERENCES testers(id),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_admin_comments_checkpoint ON admin_comments(tester_id, check_id);

-- ─── Email log & settings ───
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  email_type text NOT NULL,
  html text,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  related_tester_id uuid REFERENCES testers(id),
  related_scenario_id text,
  related_check_id text,
  sent_by uuid REFERENCES testers(id),
  triggered_by text NOT NULL DEFAULT 'automated',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);

CREATE TABLE IF NOT EXISTS email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES testers(id),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO email_settings (setting_key, enabled) VALUES
  ('auto_assignment_email', true),
  ('auto_completion_email', true),
  ('auto_retest_request_email', true),
  ('auto_retest_completed_email', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ─── Scenario completions ───
CREATE TABLE IF NOT EXISTS scenario_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  pass_count int NOT NULL,
  fail_count int NOT NULL,
  blocked_count int NOT NULL,
  skip_count int NOT NULL,
  final_notes text,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(tester_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_scenario_completions_tester ON scenario_completions(tester_id);

-- ─── Defect lifecycle ───
CREATE TABLE IF NOT EXISTS defect_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  scenario_id text NOT NULL,
  step_index int NOT NULL,
  status text NOT NULL DEFAULT 'fail',
  admin_notes text,
  original_notes text,
  retest_notes text,
  retest_result text,
  retested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tester_id, check_id)
);

CREATE INDEX IF NOT EXISTS idx_defect_lifecycle_tester ON defect_lifecycle(tester_id);
CREATE INDEX IF NOT EXISTS idx_defect_lifecycle_status ON defect_lifecycle(status);

-- Migration for existing databases:
-- ALTER TABLE testers ADD COLUMN IF NOT EXISTS current_round integer DEFAULT 1;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS round integer DEFAULT 1;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS severity text;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS defect_description text;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS acknowledged_by text;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz;
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS device text;
-- ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_tester_id_check_id_key;
-- ALTER TABLE test_results ADD CONSTRAINT test_results_tester_id_check_id_round_key UNIQUE (tester_id, check_id, round);
-- ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_status_check;
-- ALTER TABLE test_results ADD CONSTRAINT test_results_status_check CHECK (status IN ('pass', 'fail', 'blocked', 'skip', 'acknowledged', 'fix_in_progress', 'ready_for_retest', 'retest_pass', 'retest_fail'));
-- CREATE TABLE IF NOT EXISTS tester_devices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tester_id uuid REFERENCES testers(id) ON DELETE CASCADE, device_name text NOT NULL, os text NOT NULL, os_version text, is_primary boolean DEFAULT false, created_at timestamptz DEFAULT now());
-- CREATE INDEX IF NOT EXISTS idx_tester_devices_tester ON tester_devices(tester_id);

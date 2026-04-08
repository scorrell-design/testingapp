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

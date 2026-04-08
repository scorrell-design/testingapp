CREATE TABLE testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id uuid REFERENCES testers(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'blocked', 'skip')),
  notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tester_id, check_id)
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
CREATE INDEX idx_test_notes_tester ON test_notes(tester_id, scenario_id, step_index);
CREATE INDEX idx_screenshots_tester ON screenshots(tester_id, check_id);
CREATE INDEX idx_path_assignments_tester ON path_assignments(tester_id);

-- Migration for existing databases:
-- ALTER TABLE test_results ADD COLUMN IF NOT EXISTS notes text;
-- CREATE TABLE IF NOT EXISTS screenshots ( ... );
-- CREATE TABLE IF NOT EXISTS path_assignments ( ... );

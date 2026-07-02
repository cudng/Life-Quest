-- Home dashboard extras: character attributes + profile role & longest streak.
-- Run once in the Supabase SQL Editor. Idempotent.

-- ---------------------------------------------------------------------------
-- attributes (character stat bars: Problem Solving, System Design, ...)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attributes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value INT NOT NULL DEFAULT 0 CHECK (value BETWEEN 0 AND 100),
    position INT NOT NULL DEFAULT 0
);

ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read attributes" ON attributes;
CREATE POLICY "public read attributes" ON attributes
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin write attributes" ON attributes;
CREATE POLICY "admin write attributes" ON attributes
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- -------------------------------------------------------------------------    --
-- profile: player role label + longest streak record
-- ---------------------------------------------------------------------------
ALTER TABLE profile
    ADD COLUMN IF NOT EXISTS role TEXT,
    ADD COLUMN IF NOT EXISTS longest_streak INT NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- seed defaults
-- ---------------------------------------------------------------------------
INSERT INTO attributes (id, name, value, position) VALUES
  ('problem-solving', 'Problem Solving', 82, 0),
  ('system-design',   'System Design',   61, 1),
  ('code-quality',    'Code Quality',    74, 2),
  ('communication',   'Communication',   68, 3)
ON CONFLICT (id) DO NOTHING;

UPDATE profile
    SET role = COALESCE(role, 'Backend Engineer Path')
    WHERE id = 1;

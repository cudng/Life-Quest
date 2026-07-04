-- Insert a "Path" level between tracks and stages:
--   tracks -> paths -> stages -> milestones
-- A track (e.g. Education) now groups several paths (e.g. CS Degree, Courses),
-- and each path owns its own stages + milestones. Existing stages are moved
-- into one default "Main" path per track so nothing is lost.
-- Run once in the Supabase SQL Editor. Idempotent.

-- 1. paths table -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS paths (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon TEXT,
    position INT NOT NULL DEFAULT 0
);

-- 2. one default path per existing track, holding that track's stages -------
INSERT INTO paths (id, track_id, title, icon, position)
SELECT id || '-main', id, 'Main', icon, 0 FROM tracks
ON CONFLICT (id) DO NOTHING;

-- 3. re-parent stages from track_id to path_id -----------------------------
ALTER TABLE stages ADD COLUMN IF NOT EXISTS path_id TEXT;

UPDATE stages SET path_id = track_id || '-main'
WHERE path_id IS NULL AND track_id IS NOT NULL;

ALTER TABLE stages ALTER COLUMN path_id SET NOT NULL;

ALTER TABLE stages DROP CONSTRAINT IF EXISTS stages_path_id_fkey;
ALTER TABLE stages
    ADD CONSTRAINT stages_path_id_fkey
    FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE CASCADE;

ALTER TABLE stages DROP COLUMN IF EXISTS track_id;

-- 4. RLS for paths (public read / admin write) -----------------------------
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read paths" ON paths;
CREATE POLICY "public read paths" ON paths
    FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin write paths" ON paths;
CREATE POLICY "admin write paths" ON paths
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

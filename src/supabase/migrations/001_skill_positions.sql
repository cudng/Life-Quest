-- Persisted skill-tree node coordinates. Run once in the Supabase SQL Editor.
-- Existing policies already cover these columns (admin-only UPDATE on skills).
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS pos_x REAL,
  ADD COLUMN IF NOT EXISTS pos_y REAL;

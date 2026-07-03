-- One shared trunk for the skill tree: a "Programming" root that Python,
-- JavaScript and SQL now branch from (shared-trunk model, PROJECT.md → SKILLS
-- TREE §3). The trunk is the crowned origin (expert) so its children keep their
-- current unlocked state — gating still requires the parent to be >= learning.
-- Run once in the Supabase SQL Editor. Idempotent.

INSERT INTO skills (id, name, icon, parent_id, mastery, position) VALUES
  ('programming', 'Programming', '⌨️', NULL, 'expert', 0)
ON CONFLICT (id) DO NOTHING;

-- Reparent the former roots under the trunk. Position keeps their left-to-right
-- order (Python, JavaScript, SQL).
UPDATE skills SET parent_id = 'programming', position = 0 WHERE id = 'python';
UPDATE skills SET parent_id = 'programming', position = 1 WHERE id = 'javascript';
UPDATE skills SET parent_id = 'programming', position = 2 WHERE id = 'sql';

-- Drop any admin-dragged coordinates on the reparented roots so the recomputed
-- depth/row layout (now one column deeper) applies instead of stale spots.
UPDATE skills SET pos_x = NULL, pos_y = NULL
  WHERE id IN ('programming', 'python', 'javascript', 'sql');

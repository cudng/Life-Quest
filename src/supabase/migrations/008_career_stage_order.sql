-- Fix the Career track roadmap into a logical job-search → first-job path and
-- add the missing Internship stage. Left→right order:
--   Job Hunt (0) → Interview (1) → Internship (2) → First Job (3)
-- Run once in the Supabase SQL Editor. Idempotent. Matches on lower(title) so it
-- works whatever slug ids the stages were created with.

INSERT INTO stages (id, track_id, title, position) VALUES
  ('internship', 'career', 'Internship', 2)
ON CONFLICT (id) DO NOTHING;

UPDATE stages SET position = 0 WHERE track_id = 'career' AND lower(title) = 'job hunt';
UPDATE stages SET position = 1 WHERE track_id = 'career' AND lower(title) = 'interview';
UPDATE stages SET position = 2 WHERE track_id = 'career' AND lower(title) = 'internship';
UPDATE stages SET position = 3 WHERE track_id = 'career' AND lower(title) = 'first job';

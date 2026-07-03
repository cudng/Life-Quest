-- Attribute-linked daily quests: an optional attribute a quest trains.
-- Completing the quest bumps the attribute +1 (unchecking reverts it).
-- Run once in the Supabase SQL Editor. Idempotent.

ALTER TABLE daily_quests
    ADD COLUMN IF NOT EXISTS attribute_id TEXT REFERENCES attributes(id) ON DELETE SET NULL;

-- Link quests to attributes to taste, e.g.:
-- UPDATE daily_quests SET attribute_id = 'problem-solving' WHERE id = 'solve-leetcode';

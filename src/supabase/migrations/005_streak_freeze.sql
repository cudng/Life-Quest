-- Streak-freeze tokens: a rare reward that saves the streak across one missed
-- day. Earned automatically every 7th consecutive check-in (capped at 3),
-- spent automatically when checking in after a single missed day.
-- Run once in the Supabase SQL Editor. Idempotent.

ALTER TABLE profile
    ADD COLUMN IF NOT EXISTS streak_freeze_tokens INT NOT NULL DEFAULT 0;

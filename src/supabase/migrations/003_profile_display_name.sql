-- Player display name shown on the HUD instead of the email-derived guess.
-- Run once in the Supabase SQL Editor. Idempotent.

ALTER TABLE profile
    ADD COLUMN IF NOT EXISTS display_name TEXT;

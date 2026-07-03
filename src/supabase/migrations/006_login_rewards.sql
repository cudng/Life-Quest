-- Daily login reward calendar: one claim per day on a 7-day cycle (day 7 is
-- the chest). Missing a day restarts the cycle. Plus a dark-fantasy character
-- attribute. Run once in the Supabase SQL Editor. Idempotent.

-- ---------------------------------------------------------------------------
-- login_rewards (one row per claimed day)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_rewards (
    claimed_on DATE PRIMARY KEY,
    cycle_day INT NOT NULL CHECK (cycle_day BETWEEN 1 AND 7),
    xp INT NOT NULL
);

ALTER TABLE login_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read login_rewards" ON login_rewards;
CREATE POLICY "public read login_rewards" ON login_rewards
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin write login_rewards" ON login_rewards;
CREATE POLICY "admin write login_rewards" ON login_rewards
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- ---------------------------------------------------------------------------
-- dark-fantasy attribute
-- ---------------------------------------------------------------------------
INSERT INTO attributes (id, name, value, position) VALUES
  ('arcane-focus', 'Arcane Focus', 30, 4)
ON CONFLICT (id) DO NOTHING;

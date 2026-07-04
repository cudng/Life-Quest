-- RLS policies for DevQuest
-- Model: public read for everyone, writes only for the admin UID.
-- Admin UID: ce4086d6-30ad-487b-b1f3-50c151a00d6a

-- tracks
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tracks" ON tracks
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write tracks" ON tracks
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- paths
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read paths" ON paths
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write paths" ON paths
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- stages
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stages" ON stages
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write stages" ON stages
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read milestones" ON milestones
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write milestones" ON milestones
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- sub_tasks
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sub_tasks" ON sub_tasks
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write sub_tasks" ON sub_tasks
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read skills" ON skills
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write skills" ON skills
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- daily_quests
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read daily_quests" ON daily_quests
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write daily_quests" ON daily_quests
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- daily_completions
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read daily_completions" ON daily_completions
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write daily_completions" ON daily_completions
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read job_applications" ON job_applications
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write job_applications" ON job_applications
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- achievements_unlocked
ALTER TABLE achievements_unlocked ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read achievements_unlocked" ON achievements_unlocked
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write achievements_unlocked" ON achievements_unlocked
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- profile
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profile" ON profile
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write profile" ON profile
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');

-- attributes
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read attributes" ON attributes
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write attributes" ON attributes
    FOR ALL TO authenticated
    USING (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a')
    WITH CHECK (auth.uid() = 'ce4086d6-30ad-487b-b1f3-50c151a00d6a');
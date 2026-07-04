-- Seed / starter content for DevQuest
-- Run AFTER schema.sql and policies.sql.
-- Insert order respects FKs: tracks -> stages -> milestones -> sub_tasks,
-- skills roots before children.

-- ---------------------------------------------------------------------------
-- tracks
-- ---------------------------------------------------------------------------
INSERT INTO tracks (id, title, icon, position) VALUES
  ('education', 'Education', '🎓', 0),
  ('career',    'Career',    '💼', 1),
  ('side-projects', 'Side Projects', '🚀', 2)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- paths (one per track — a track groups several paths; here a default "Main")
-- ---------------------------------------------------------------------------
INSERT INTO paths (id, track_id, title, icon, position) VALUES
  ('education-main',     'education',     'Main', '🎓', 0),
  ('career-main',        'career',        'Main', '💼', 0),
  ('side-projects-main', 'side-projects', 'Main', '🚀', 0)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- stages
-- ---------------------------------------------------------------------------
INSERT INTO stages (id, path_id, title, position) VALUES
  ('cs-fundamentals', 'education-main',     'CS Fundamentals', 0),
  ('cs-bachelor',     'education-main',     'CS Bachelor',     1),
  ('job-hunt',        'career-main',        'Job Hunt',        0),
  ('interview',       'career-main',        'Interview',       1),
  ('internship',      'career-main',        'Internship',      2),
  ('first-job',       'career-main',        'First Job',       3),
  ('portfolio',       'side-projects-main', 'Portfolio',       0)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
INSERT INTO milestones (id, stage_id, title, description, xp, prerequisites) VALUES
  ('learn-git',        'cs-fundamentals', 'Learn Git basics',        'Branches, commits, merges, rebases.', 100, '[]'),
  ('learn-python',     'cs-fundamentals', 'Learn Python basics',     'Syntax, data structures, functions.', 150, '[]'),
  ('learn-sql',        'cs-fundamentals', 'Learn SQL',               'Queries, joins, indexes, constraints.', 150, '["learn-python"]'),
  ('data-structures',  'cs-bachelor',     'Data Structures & Algorithms', 'Big-O, lists, trees, graphs, sorting.', 300, '["learn-python"]'),
  ('build-portfolio',  'portfolio',       'Build portfolio site',    'Personal site showcasing projects.', 200, '[]'),
  ('apply-internships','job-hunt',        'Apply to internships',    'Send 20 tailored applications.', 250, '["build-portfolio"]')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- sub_tasks
-- ---------------------------------------------------------------------------
INSERT INTO sub_tasks (id, milestone_id, title, position) VALUES
  ('git-init',       'learn-git',    'Init a repo and make first commit', 0),
  ('git-branch',     'learn-git',    'Create and merge a branch',         1),
  ('git-rebase',     'learn-git',    'Do an interactive rebase',          2),
  ('py-syntax',      'learn-python', 'Variables, loops, conditionals',    0),
  ('py-functions',   'learn-python', 'Functions and modules',             1),
  ('py-oop',         'learn-python', 'Classes and OOP',                   2),
  ('sql-select',     'learn-sql',    'SELECT, WHERE, ORDER BY',           0),
  ('sql-joins',      'learn-sql',    'INNER and LEFT joins',              1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- skills (trunk first, then domains + children via parent_id)
-- ---------------------------------------------------------------------------
-- Shared trunk: everything branches from Programming (crowned origin).
INSERT INTO skills (id, name, icon, parent_id, mastery, position) VALUES
  ('programming', 'Programming', '⌨️', NULL, 'expert', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (id, name, icon, parent_id, mastery, position) VALUES
  ('python',     'Python',     '🐍', 'programming', 'learning',  0),
  ('javascript', 'JavaScript', '🟨', 'programming', 'learning',  1),
  ('sql',        'SQL',        '🗄️', 'programming', 'learning',  2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (id, name, icon, parent_id, mastery, position) VALUES
  ('flask',      'Flask',      '🌶️', 'python',     'locked',    0),
  ('flet',       'Flet',       '📱', 'python',     'locked',    1),
  ('typescript', 'TypeScript', '🔷', 'javascript', 'learning',  0),
  ('react',      'React',      '⚛️', 'javascript', 'locked',    1),
  ('nextjs',     'Next.js',    '▲',  'javascript', 'locked',    2),
  ('postgres',   'PostgreSQL', '🐘', 'sql',        'learning',  0)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- daily_quests (templates)
-- ---------------------------------------------------------------------------
INSERT INTO daily_quests (id, title, xp, active, position) VALUES
  ('leetcode',   'Solve 1 LeetCode problem', 50, true, 0),
  ('read-docs',  'Read tech docs 30 min',    30, true, 1),
  ('commit',     'Make at least 1 commit',   40, true, 2),
  ('exercise',   'Exercise 20 min',          20, true, 3),
  ('english',    'Practice English 15 min',  20, true, 4)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- profile (single row, id = 1)
-- ---------------------------------------------------------------------------
INSERT INTO profile (id, streak_count, role, longest_streak) VALUES
  (1, 0, 'Backend Engineer Path', 0)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- attributes (character stat bars)
-- ---------------------------------------------------------------------------
INSERT INTO attributes (id, name, value, position) VALUES
  ('problem-solving', 'Problem Solving', 82, 0),
  ('system-design',   'System Design',   61, 1),
  ('code-quality',    'Code Quality',    74, 2),
  ('communication',   'Communication',   68, 3)
ON CONFLICT (id) DO NOTHING;

-- daily_completions, job_applications, achievements_unlocked start empty.
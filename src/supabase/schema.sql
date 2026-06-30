CREATE TABLE tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT,
    position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stages (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    xp INT NOT NULL DEFAULT 0,
    prerequisites JSONB NOT NULL DEFAULT '[]',
    resources JSONB NOT NULL DEFAULT '[]',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sub_tasks(
    id TEXT PRIMARY KEY,
    milestone_id TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE skills(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    parent_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
    description TEXT,
    resources JSONB NOT NULL DEFAULT '[]',
    mastery TEXT NOT NULL DEFAULT 'locked'
        CHECK (mastery IN ('locked','learning','proficient','expert')),
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE daily_quests(
    id text primary key,
    title text not null,
    xp int not null DEFAULT 0,
    active boolean not null default true,
    position int not null default 0
);

CREATE TABLE daily_completions(
    id uuid primary key default gen_random_uuid(),
    quest_id text not null references daily_quests(id) ON DELETE CASCADE,
    completed_on date not null default current_date,
    UNIQUE(quest_id, completed_on)
);

CREATE INDEX idx_daily_completions_completed_on ON daily_completions(completed_on);

CREATE TABLE job_applications(
    id uuid primary key default gen_random_uuid(),
    company text not null,
    role text not null,
    url text,
    status text not null default 'applied'
        CHECK (status IN ('applied','screening','interview','offer','rejected','ghosted')),
    applied_at date not null default current_date,
    notes text,
    created_at timestamptz not null default now()
);

CREATE TABLE achievements_unlocked(
    id text primary key,
    unlocked_at timestamptz not null default now()
);

CREATE TABLE profile(
    id int primary key default 1 check(id = 1),
    streak_count int not null default 0,
    last_check_in date,
    reminder_time time
);
// Domain types for DevQuest — hand-written to match supabase/schema.sql.
// If you later add the Supabase CLI, you can regenerate raw DB types and
// alias them here instead.

/** jsonb resources column: [{ label, url }] */
export interface Resource {
  label: string;
  url: string;
}

export type Mastery = "locked" | "learning" | "proficient" | "expert";

export type JobStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

// ---------------------------------------------------------------------------
// Content tables (text slug PKs)
// ---------------------------------------------------------------------------

export interface Track {
  id: string;
  title: string;
  icon: string | null;
  position: number;
}

export interface Stage {
  id: string;
  track_id: string;
  title: string;
  position: number;
}

export interface Milestone {
  id: string;
  stage_id: string;
  title: string;
  description: string;
  xp: number;
  /** array of milestone ids */
  prerequisites: string[];
  resources: Resource[];
  completed: boolean;
  completed_at: string | null;
}

export interface SubTask {
  id: string;
  milestone_id: string;
  title: string;
  position: number;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  /** null = root language */
  parent_id: string | null;
  description: string | null;
  resources: Resource[];
  mastery: Mastery;
  position: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  xp: number;
  active: boolean;
  position: number;
}

// ---------------------------------------------------------------------------
// Transactional tables (uuid PKs)
// ---------------------------------------------------------------------------

export interface DailyCompletion {
  id: string;
  quest_id: string;
  /** date (YYYY-MM-DD) */
  completed_on: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url: string | null;
  status: JobStatus;
  /** date (YYYY-MM-DD) */
  applied_at: string;
  notes: string | null;
  created_at: string;
}

export interface AchievementUnlocked {
  id: string;
  unlocked_at: string;
}

export interface Profile {
  id: 1;
  streak_count: number;
  /** date (YYYY-MM-DD) or null */
  last_check_in: string | null;
  /** time (HH:MM:SS) or null */
  reminder_time: string | null;
}
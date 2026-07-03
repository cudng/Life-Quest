// Domain types for DevQuest — hand-written to match supabase/schema.sql.
// If you later add the Supabase CLI, you can regenerate raw DB types and
// alias them here instead.

/** jsonb resources column: [{ label, url? }]. url omitted = no link (e.g. a book). */
export interface Resource {
  label: string;
  url?: string;
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
  /** admin-dragged canvas x; null = use computed layout spot */
  pos_x: number | null;
  /** admin-dragged canvas y; null = use computed layout spot */
  pos_y: number | null;
}

export interface DailyQuest {
  id: string;
  title: string;
  xp: number;
  active: boolean;
  position: number;
  /** attribute this quest trains (+1 on completion), or null */
  attribute_id: string | null;
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

/** One claimed daily login reward (7-day cycle; day 7 = chest). */
export interface LoginReward {
  /** date (YYYY-MM-DD) */
  claimed_on: string;
  cycle_day: number;
  xp: number;
}

export interface Profile {
  id: 1;
  streak_count: number;
  /** date (YYYY-MM-DD) or null */
  last_check_in: string | null;
  /** time (HH:MM:SS) or null */
  reminder_time: string | null;
  /** player role label shown on the HUD, e.g. "Backend Engineer Path" */
  role: string | null;
  /** best streak ever reached */
  longest_streak: number;
  /** player name shown on the HUD; falls back to the email-derived guess */
  display_name: string | null;
  /** streak-freeze tokens held (each saves the streak across one missed day) */
  streak_freeze_tokens: number;
}

/** Character stat bar (Home HUD): value is 0..100. */
export interface Attribute {
  id: string;
  name: string;
  value: number;
  position: number;
}
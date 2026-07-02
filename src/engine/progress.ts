// Aggregates fetched Supabase rows into the in-memory ProgressSnapshot the rest
// of the app reads, and derives level / completion %. Pure: all inputs passed in
// (including `today`), nothing fetched or read from the clock here.

import type {
  Milestone,
  SubTask,
  Skill,
  DailyQuest,
  DailyCompletion,
  JobApplication,
  AchievementUnlocked,
  Profile,
  Mastery,
} from "@/data/types";
import { xpToLevel, xpForLevel } from "@/engine/levels";
import { addDays } from "@/lib/date";

/** XP granted per skill by its current mastery (cumulative, tunable). */
const MASTERY_XP: Record<Mastery, number> = {
  locked: 0,
  learning: 50,
  proficient: 150,
  expert: 300,
};

/** In-memory snapshot derived each render from fetched rows. Not stored. */
export interface ProgressSnapshot {
  totalXp: number;
  completedNodeIds: string[];
  completedSubTaskIds: string[];
  skillMastery: Record<string, Mastery>;
  todayCompletedQuestIds: string[];
  jobApplications: JobApplication[];
  unlockedAchievementIds: string[];
  streak: { count: number; lastCheckIn: string | null };
  /** player role label (HUD), or null if unset */
  role: string | null;
  /** best streak ever reached */
  longestStreak: number;
  /**
   * Last 7 days of activity for the streak dots, oldest → today (index 6 = today).
   * A day is active when ≥1 daily quest was completed on it.
   */
  weeklyActivity: boolean[];
}

/** Raw rows fetched from Supabase, plus today's date (YYYY-MM-DD). */
export interface ProgressInput {
  milestones: Milestone[];
  subTasks: SubTask[];
  skills: Skill[];
  dailyQuests: DailyQuest[];
  dailyCompletions: DailyCompletion[];
  jobApplications: JobApplication[];
  unlockedAchievements: AchievementUnlocked[];
  profile: Profile;
  today: string;
}

export function buildSnapshot(input: ProgressInput): ProgressSnapshot {
  const completedMilestones = input.milestones.filter((m) => m.completed);

  const questXp = new Map(input.dailyQuests.map((q) => [q.id, q.xp]));
  const dailyXp = input.dailyCompletions.reduce(
    (sum, c) => sum + (questXp.get(c.quest_id) ?? 0),
    0,
  );

  const milestoneXp = completedMilestones.reduce((sum, m) => sum + m.xp, 0);
  const skillXp = input.skills.reduce((sum, s) => sum + MASTERY_XP[s.mastery], 0);

  const skillMastery: Record<string, Mastery> = {};
  for (const s of input.skills) skillMastery[s.id] = s.mastery;

  const activeDays = new Set(input.dailyCompletions.map((c) => c.completed_on));
  const weeklyActivity = Array.from({ length: 7 }, (_, i) =>
    activeDays.has(addDays(input.today, i - 6)),
  );

  return {
    totalXp: milestoneXp + skillXp + dailyXp,
    completedNodeIds: completedMilestones.map((m) => m.id),
    completedSubTaskIds: input.subTasks.filter((t) => t.completed).map((t) => t.id),
    skillMastery,
    todayCompletedQuestIds: input.dailyCompletions
      .filter((c) => c.completed_on === input.today)
      .map((c) => c.quest_id),
    jobApplications: input.jobApplications,
    unlockedAchievementIds: input.unlockedAchievements.map((a) => a.id),
    streak: {
      count: input.profile.streak_count,
      lastCheckIn: input.profile.last_check_in,
    },
    role: input.profile.role,
    longestStreak: input.profile.longest_streak,
    weeklyActivity,
  };
}

/** Current level from total XP. */
export function getLevel(snapshot: ProgressSnapshot): number {
  return xpToLevel(snapshot.totalXp);
}

/** Where the player sits within their current level, for rendering the XP bar. */
export interface LevelProgress {
  level: number;
  totalXp: number;
  /** XP earned past the current level's floor. */
  intoLevel: number;
  /** XP between the current level's floor and the next level's threshold. */
  span: number;
  /** intoLevel / span, clamped to 0..1. */
  ratio: number;
}

export function getLevelProgress(snapshot: ProgressSnapshot): LevelProgress {
  const level = xpToLevel(snapshot.totalXp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const intoLevel = snapshot.totalXp - floor;
  const ratio = span > 0 ? Math.min(1, Math.max(0, intoLevel / span)) : 0;
  return { level, totalXp: snapshot.totalXp, intoLevel, span, ratio };
}

/** Overall completion %: completed milestones ÷ total milestones (0 when none). */
export function getCompletionPercent(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.completed).length;
  return (done / milestones.length) * 100;
}

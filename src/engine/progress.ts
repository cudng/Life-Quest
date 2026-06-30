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
import { xpToLevel } from "@/engine/levels";

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
  };
}

/** Current level from total XP. */
export function getLevel(snapshot: ProgressSnapshot): number {
  return xpToLevel(snapshot.totalXp);
}

/** Overall completion %: completed milestones ÷ total milestones (0 when none). */
export function getCompletionPercent(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.completed).length;
  return (done / milestones.length) * 100;
}

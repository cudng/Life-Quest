// Centralized TanStack Query keys. One entry per Supabase table so hooks and
// invalidations reference the same canonical key.

export const queryKeys = {
  tracks: ["tracks"] as const,
  paths: ["paths"] as const,
  stages: ["stages"] as const,
  milestones: ["milestones"] as const,
  subTasks: ["sub_tasks"] as const,
  skills: ["skills"] as const,
  dailyQuests: ["daily_quests"] as const,
  dailyCompletions: ["daily_completions"] as const,
  jobApplications: ["job_applications"] as const,
  achievementsUnlocked: ["achievements_unlocked"] as const,
  profile: ["profile"] as const,
  attributes: ["attributes"] as const,
  loginRewards: ["login_rewards"] as const,
} as const;
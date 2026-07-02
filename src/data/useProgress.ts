// Combines the per-table read hooks and feeds their rows (plus today's local
// date) through the pure engine to derive the in-memory ProgressSnapshot the
// UI reads. Returns the snapshot only once every underlying query has loaded.

import { useMemo } from "react";
import { buildSnapshot, type ProgressSnapshot } from "@/engine/progress";
import { localToday } from "@/lib/date";
import {
  useMilestones,
  useSubTasks,
  useSkills,
  useDailyQuests,
  useDailyCompletions,
  useJobApplications,
  useAchievementsUnlocked,
  useProfile,
} from "@/data/queries";

export interface UseProgressResult {
  snapshot: ProgressSnapshot | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProgress(): UseProgressResult {
  const milestones = useMilestones();
  const subTasks = useSubTasks();
  const skills = useSkills();
  const dailyQuests = useDailyQuests();
  const dailyCompletions = useDailyCompletions();
  const jobApplications = useJobApplications();
  const achievements = useAchievementsUnlocked();
  const profile = useProfile();

  const queries = [
    milestones,
    subTasks,
    skills,
    dailyQuests,
    dailyCompletions,
    jobApplications,
    achievements,
    profile,
  ];

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error ?? null;

  const refetch = () => {
    for (const q of queries) {
      if (q.isError) void q.refetch();
    }
  };

  const snapshot = useMemo<ProgressSnapshot | undefined>(() => {
    if (
      !milestones.data ||
      !subTasks.data ||
      !skills.data ||
      !dailyQuests.data ||
      !dailyCompletions.data ||
      !jobApplications.data ||
      !achievements.data ||
      !profile.data
    ) {
      return undefined;
    }
    return buildSnapshot({
      milestones: milestones.data,
      subTasks: subTasks.data,
      skills: skills.data,
      dailyQuests: dailyQuests.data,
      dailyCompletions: dailyCompletions.data,
      jobApplications: jobApplications.data,
      unlockedAchievements: achievements.data,
      profile: profile.data,
      today: localToday(),
    });
  }, [
    milestones.data,
    subTasks.data,
    skills.data,
    dailyQuests.data,
    dailyCompletions.data,
    jobApplications.data,
    achievements.data,
    profile.data,
  ]);

  return { snapshot, isLoading, isError, error, refetch };
}
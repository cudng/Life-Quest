// Fetch functions + read hooks, one per 'Supabase' table. Fetch functions throw on
// error so TanStack Query surfaces them; hooks just wire key → fetcher.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/data/keys";
import type {
  Track,
  Stage,
  Milestone,
  SubTask,
  Skill,
  DailyQuest,
  DailyCompletion,
  JobApplication,
  AchievementUnlocked,
  Profile,
  Attribute,
} from "@/data/types";

/** Select all rows of a table, optionally ordered. Throws on error. */
async function fetchTable<T>(
  table: string,
  order?: { column: string; ascending?: boolean },
): Promise<T[]> {
  let query = supabase.from(table).select("*");
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await query.overrideTypes<T[], { merge: false }>();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export const fetchTracks = () =>
  fetchTable<Track>("tracks", { column: "position" });

export const fetchStages = () =>
  fetchTable<Stage>("stages", { column: "position" });

export const fetchMilestones = () => fetchTable<Milestone>("milestones");

export const fetchSubTasks = () =>
  fetchTable<SubTask>("sub_tasks", { column: "position" });

export const fetchSkills = () =>
  fetchTable<Skill>("skills", { column: "position" });

export const fetchDailyQuests = () =>
  fetchTable<DailyQuest>("daily_quests", { column: "position" });

export const fetchDailyCompletions = () =>
  fetchTable<DailyCompletion>("daily_completions");

export const fetchJobApplications = () =>
  fetchTable<JobApplication>("job_applications", {
    column: "created_at",
    ascending: false,
  });

export const fetchAchievementsUnlocked = () =>
  fetchTable<AchievementUnlocked>("achievements_unlocked");

export const fetchAttributes = () =>
  fetchTable<Attribute>("attributes", { column: "position" });

/** Singleton profile row (id = 1). Throws on error. */
export async function fetchProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as Profile;
}

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

export const useTracks = () =>
  useQuery({ queryKey: queryKeys.tracks, queryFn: fetchTracks });

export const useStages = () =>
  useQuery({ queryKey: queryKeys.stages, queryFn: fetchStages });

export const useMilestones = () =>
  useQuery({ queryKey: queryKeys.milestones, queryFn: fetchMilestones });

export const useSubTasks = () =>
  useQuery({ queryKey: queryKeys.subTasks, queryFn: fetchSubTasks });

export const useSkills = () =>
  useQuery({ queryKey: queryKeys.skills, queryFn: fetchSkills });

export const useDailyQuests = () =>
  useQuery({ queryKey: queryKeys.dailyQuests, queryFn: fetchDailyQuests });

export const useDailyCompletions = () =>
  useQuery({
    queryKey: queryKeys.dailyCompletions,
    queryFn: fetchDailyCompletions,
  });

export const useJobApplications = () =>
  useQuery({
    queryKey: queryKeys.jobApplications,
    queryFn: fetchJobApplications,
  });

export const useAchievementsUnlocked = () =>
  useQuery({
    queryKey: queryKeys.achievementsUnlocked,
    queryFn: fetchAchievementsUnlocked,
  });

export const useProfile = () =>
  useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });

export const useAttributes = () =>
  useQuery({ queryKey: queryKeys.attributes, queryFn: fetchAttributes });
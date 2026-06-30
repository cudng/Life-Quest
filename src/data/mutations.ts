// Write hooks. Each mutation performs one Supabase write (throwing on error) and
// invalidates the affected query keys on success so reads refetch. Achievement
// unlocking is layered on separately (see sub-step 6), not done here.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/data/keys";
import type { JobApplication, JobStatus, Mastery, Profile } from "@/data/types";
import { nextStreak } from "@/engine/streak";

// ---------------------------------------------------------------------------
// Roadmap: milestones & sub-tasks
// ---------------------------------------------------------------------------

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("milestones")
        .update({
          completed: vars.completed,
          completed_at: vars.completed ? new Date().toISOString() : null,
        })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.milestones });
    },
  });
}

export function useToggleSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("sub_tasks")
        .update({ completed: vars.completed })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subTasks });
    },
  });
}

// ---------------------------------------------------------------------------
// Skill tree
// ---------------------------------------------------------------------------

export function useSetSkillMastery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; mastery: Mastery }) => {
      const { error } = await supabase
        .from("skills")
        .update({ mastery: vars.mastery })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.skills });
    },
  });
}

// ---------------------------------------------------------------------------
// Daily quests
// ---------------------------------------------------------------------------

/** Mark a quest done (insert) or undone (delete) for the given local date. */
export function useToggleDailyQuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      questId: string;
      today: string;
      completed: boolean;
    }) => {
      if (vars.completed) {
        const { error } = await supabase
          .from("daily_completions")
          .insert({ quest_id: vars.questId, completed_on: vars.today });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_completions")
          .delete()
          .eq("quest_id", vars.questId)
          .eq("completed_on", vars.today);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.dailyCompletions });
    },
  });
}

// ---------------------------------------------------------------------------
// Job applications (CRUD)
// ---------------------------------------------------------------------------

export type NewJobApplication = Omit<JobApplication, "id" | "created_at">;
export type JobApplicationUpdate = Partial<NewJobApplication>;

export function useAddJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewJobApplication) => {
      const { error } = await supabase.from("job_applications").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobApplications });
    },
  });
}

export function useUpdateJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: JobApplicationUpdate }) => {
      const { error } = await supabase
        .from("job_applications")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobApplications });
    },
  });
}

export function useDeleteJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobApplications });
    },
  });
}

// Re-export for callers that build job rows.
export type { JobStatus };

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/** Persist newly-unlocked achievement ids. Idempotent: existing ids are ignored. */
export function useUnlockAchievements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      const rows = ids.map((id) => ({ id }));
      const { error } = await supabase
        .from("achievements_unlocked")
        .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.achievementsUnlocked });
    },
  });
}

// ---------------------------------------------------------------------------
// Profile & streak
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<
  Pick<Profile, "streak_count" | "last_check_in" | "reminder_time">
>;

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      const { error } = await supabase
        .from("profile")
        .update(patch)
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/** Record today's check-in, updating streak_count from the current profile state. */
export function useStreakCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      today: string;
      lastCheckIn: string | null;
      streakCount: number;
    }) => {
      const next = nextStreak(vars.today, vars.lastCheckIn, vars.streakCount);
      const { error } = await supabase.from("profile").update(next).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
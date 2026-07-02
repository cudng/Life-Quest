// Write hooks. Each mutation performs one Supabase write (throwing on error) and
// invalidates the affected query keys on success so reads refetch. Achievement
// unlocking is layered on separately (see sub-step 6), not done here.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/data/keys";
import type {
  Attribute,
  DailyCompletion,
  JobApplication,
  JobStatus,
  Mastery,
  Milestone,
  Profile,
  Resource,
  Skill,
} from "@/data/types";
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
// Roadmap admin: create content (tracks / stages / milestones), edit & delete
// milestones. Ids are caller-generated slugs (see lib/slug.ts). Each write
// throws on error and invalidates the affected read key.
// ---------------------------------------------------------------------------

export interface NewTrack {
  id: string;
  title: string;
  icon: string | null;
  position: number;
}

export interface NewStage {
  id: string;
  track_id: string;
  title: string;
  position: number;
}

export interface NewMilestone {
  id: string;
  stage_id: string;
  title: string;
  description: string;
  xp: number;
  prerequisites: string[];
  resources: Resource[];
}

export type MilestoneUpdate = Partial<
  Pick<
    Milestone,
    "title" | "description" | "xp" | "prerequisites" | "resources" | "stage_id"
  >
>;

export function useAddTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewTrack) => {
      const { error } = await supabase.from("tracks").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tracks });
    },
  });
}

export function useAddStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewStage) => {
      const { error } = await supabase.from("stages").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.stages });
    },
  });
}

export function useAddMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewMilestone) => {
      const { error } = await supabase.from("milestones").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.milestones });
    },
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: MilestoneUpdate }) => {
      const { error } = await supabase
        .from("milestones")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.milestones });
    },
  });
}

/** Delete a milestone. sub_tasks cascade in the DB (ON DELETE CASCADE). */
export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.milestones });
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

// Admin: create / edit / delete skills. Ids are caller-generated slugs.

export interface NewSkill {
  id: string;
  name: string;
  icon: string;
  parent_id: string | null;
  description: string | null;
  resources: Resource[];
  position: number;
}

export type SkillUpdate = Partial<
  Pick<Skill, "name" | "icon" | "description" | "resources" | "parent_id">
>;

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewSkill) => {
      const { error } = await supabase.from("skills").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.skills });
    },
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: SkillUpdate }) => {
      const { error } = await supabase
        .from("skills")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.skills });
    },
  });
}

/**
 * Persist an admin-dragged node position. No query invalidation: the canvas
 * already shows the new spot, so refetching would be wasted work (and could
 * snap the node mid-drag).
 */
export function useUpdateSkillPosition() {
  return useMutation({
    mutationFn: async (vars: { id: string; x: number; y: number }) => {
      const { error } = await supabase
        .from("skills")
        .update({ pos_x: vars.x, pos_y: vars.y })
        .eq("id", vars.id);
      if (error) throw error;
    },
  });
}

/** Delete a skill. Child skills cascade in the DB (parent_id ON DELETE CASCADE). */
export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
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

/**
 * Mark a quest done (insert) or undone (delete) for the given local date.
 * Optimistic: the cached completions list is patched immediately so the UI
 * flips without waiting for the round-trip, then rolled back on error.
 */
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
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.dailyCompletions });
      const previous = qc.getQueryData<DailyCompletion[]>(
        queryKeys.dailyCompletions,
      );
      qc.setQueryData<DailyCompletion[]>(
        queryKeys.dailyCompletions,
        (rows = []) =>
          vars.completed
            ? [
                ...rows,
                {
                  id: `optimistic-${vars.questId}-${vars.today}`,
                  quest_id: vars.questId,
                  completed_on: vars.today,
                },
              ]
            : rows.filter(
                (r) =>
                  !(
                    r.quest_id === vars.questId &&
                    r.completed_on === vars.today
                  ),
              ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.dailyCompletions, ctx.previous);
      }
    },
    onSettled: () => {
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
  Pick<
    Profile,
    | "streak_count"
    | "last_check_in"
    | "reminder_time"
    | "role"
    | "longest_streak"
    | "display_name"
  >
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

// ---------------------------------------------------------------------------
// Attributes (Home HUD stat bars) — admin CRUD. Ids are caller-generated slugs.
// ---------------------------------------------------------------------------

export type NewAttribute = Attribute;
export type AttributeUpdate = Partial<Pick<Attribute, "name" | "value" | "position">>;

export function useAddAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: NewAttribute) => {
      const { error } = await supabase.from("attributes").insert(vars);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.attributes });
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: AttributeUpdate }) => {
      const { error } = await supabase
        .from("attributes")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.attributes });
    },
  });
}

export function useDeleteAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attributes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.attributes });
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
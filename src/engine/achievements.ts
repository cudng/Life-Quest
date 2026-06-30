// Evaluates achievement conditions against a snapshot. Pure.

import type { ProgressSnapshot } from "@/engine/progress";
import { ACHIEVEMENTS } from "@/data/achievements";

/**
 * Ids of achievements whose condition is now met but that are not yet recorded
 * as unlocked in the snapshot. Caller persists these to Supabase and fires rewards.
 */
export function evaluateAchievements(snapshot: ProgressSnapshot): string[] {
  const already = new Set(snapshot.unlockedAchievementIds);
  return ACHIEVEMENTS.filter(
    (a) => !already.has(a.id) && a.condition(snapshot),
  ).map((a) => a.id);
}

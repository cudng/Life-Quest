// Achievement definitions live in code (their conditions are functions); only
// unlocked ids + timestamps are stored in Supabase. Each condition is a pure
// predicate over the derived ProgressSnapshot.

import type { ProgressSnapshot } from "@/engine/progress";
import { xpToLevel } from "@/engine/levels";

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (p: ProgressSnapshot) => boolean;
  /** Numeric progress toward the unlock (drives the "next unlock" hint). */
  progress: (p: ProgressSnapshot) => AchievementProgress;
}

const masteredCount = (p: ProgressSnapshot): number =>
  Object.values(p.skillMastery).filter(
    (m) => m === "proficient" || m === "expert",
  ).length;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first milestone.",
    icon: "👣",
    condition: (p) => p.completedNodeIds.length >= 1,
    progress: (p) => ({ current: p.completedNodeIds.length, target: 1 }),
  },
  {
    id: "trailblazer",
    title: "Trailblazer",
    description: "Complete 10 milestones.",
    icon: "🧭",
    condition: (p) => p.completedNodeIds.length >= 10,
    progress: (p) => ({ current: p.completedNodeIds.length, target: 10 }),
  },
  {
    id: "apprentice",
    title: "Apprentice",
    description: "Reach level 5.",
    icon: "⭐",
    condition: (p) => xpToLevel(p.totalXp) >= 5,
    progress: (p) => ({ current: xpToLevel(p.totalXp), target: 5 }),
  },
  {
    id: "polyglot",
    title: "Polyglot",
    description: "Reach proficient or higher in 3 skills.",
    icon: "🧠",
    condition: (p) => masteredCount(p) >= 3,
    progress: (p) => ({ current: masteredCount(p), target: 3 }),
  },
  {
    id: "on-the-hunt",
    title: "On the Hunt",
    description: "Log your first job application.",
    icon: "🎯",
    condition: (p) => p.jobApplications.length >= 1,
    progress: (p) => ({ current: p.jobApplications.length, target: 1 }),
  },
  {
    id: "first-interview",
    title: "In the Room",
    description: "Land your first interview.",
    icon: "🤝",
    condition: (p) => p.jobApplications.some((j) => j.status === "interview"),
    progress: (p) => ({
      current: p.jobApplications.some((j) => j.status === "interview") ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: "first-offer",
    title: "The Offer",
    description: "Receive your first job offer.",
    icon: "🏆",
    condition: (p) => p.jobApplications.some((j) => j.status === "offer"),
    progress: (p) => ({
      current: p.jobApplications.some((j) => j.status === "offer") ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: "week-streak",
    title: "Consistency",
    description: "Reach a 7-day streak.",
    icon: "🔥",
    condition: (p) => p.streak.count >= 7,
    progress: (p) => ({ current: p.streak.count, target: 7 }),
  },
  {
    id: "month-streak",
    title: "Unstoppable",
    description: "Reach a 30-day streak.",
    icon: "🌟",
    condition: (p) => p.streak.count >= 30,
    progress: (p) => ({ current: p.streak.count, target: 30 }),
  },
];

export interface NextUnlock {
  achievement: Achievement;
  /** Clamped to target for display. */
  current: number;
  target: number;
  /** 0..1 completion toward the unlock. */
  ratio: number;
}

/** Locked achievement closest to unlocking (highest progress ratio), or null. */
export function nextUnlock(
  p: ProgressSnapshot,
  unlockedIds: ReadonlySet<string>,
): NextUnlock | null {
  let best: NextUnlock | null = null;
  for (const a of ACHIEVEMENTS) {
    if (unlockedIds.has(a.id)) continue;
    const { current, target } = a.progress(p);
    const ratio = Math.min(current / target, 1);
    if (!best || ratio > best.ratio) {
      best = { achievement: a, current: Math.min(current, target), target, ratio };
    }
  }
  return best;
}

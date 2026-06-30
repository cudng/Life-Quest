// Achievement definitions live in code (their conditions are functions); only
// unlocked ids + timestamps are stored in Supabase. Each condition is a pure
// predicate over the derived ProgressSnapshot.

import type { ProgressSnapshot } from "@/engine/progress";
import { xpToLevel } from "@/engine/levels";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (p: ProgressSnapshot) => boolean;
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
  },
  {
    id: "trailblazer",
    title: "Trailblazer",
    description: "Complete 10 milestones.",
    icon: "🧭",
    condition: (p) => p.completedNodeIds.length >= 10,
  },
  {
    id: "apprentice",
    title: "Apprentice",
    description: "Reach level 5.",
    icon: "⭐",
    condition: (p) => xpToLevel(p.totalXp) >= 5,
  },
  {
    id: "polyglot",
    title: "Polyglot",
    description: "Reach proficient or higher in 3 skills.",
    icon: "🧠",
    condition: (p) => masteredCount(p) >= 3,
  },
  {
    id: "on-the-hunt",
    title: "On the Hunt",
    description: "Log your first job application.",
    icon: "🎯",
    condition: (p) => p.jobApplications.length >= 1,
  },
  {
    id: "first-interview",
    title: "In the Room",
    description: "Land your first interview.",
    icon: "🤝",
    condition: (p) => p.jobApplications.some((j) => j.status === "interview"),
  },
  {
    id: "first-offer",
    title: "The Offer",
    description: "Receive your first job offer.",
    icon: "🏆",
    condition: (p) => p.jobApplications.some((j) => j.status === "offer"),
  },
  {
    id: "week-streak",
    title: "Consistency",
    description: "Reach a 7-day streak.",
    icon: "🔥",
    condition: (p) => p.streak.count >= 7,
  },
  {
    id: "month-streak",
    title: "Unstoppable",
    description: "Reach a 30-day streak.",
    icon: "🌟",
    condition: (p) => p.streak.count >= 30,
  },
];

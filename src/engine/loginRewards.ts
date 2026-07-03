// Daily login reward cycle. Pure math — the caller passes dates in.

import { shiftDate } from "@/engine/streak";

/** XP per cycle day (index 0 = day 1). Day 7 is the chest. */
export const LOGIN_REWARD_XP = [10, 10, 15, 15, 20, 25, 50] as const;

export const CHEST_DAY = 7;

/**
 * Cycle day for today's claim: continues the cycle if yesterday was claimed
 * (wrapping 7 → 1), otherwise restarts at day 1.
 */
export function nextCycleDay(
  today: string,
  lastClaimedOn: string | null,
  lastCycleDay: number,
): number {
  if (lastClaimedOn === shiftDate(today, -1)) return (lastCycleDay % 7) + 1;
  return 1;
}

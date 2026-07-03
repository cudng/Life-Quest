// Pure streak math for the daily check-in. No clock or fetch — caller passes
// today's date and the current profile values in.

/** Shift a YYYY-MM-DD date string by whole days, returning YYYY-MM-DD. */
export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Most freeze tokens the player can hold. */
export const MAX_FREEZE_TOKENS = 3;

/**
 * Next streak from a check-in: +1 if the last check-in was yesterday,
 * unchanged if already today. A single missed day consumes one freeze token
 * and continues the streak; anything longer resets to 1. Every 7th
 * consecutive day earns one token, capped at MAX_FREEZE_TOKENS.
 */
export function nextStreak(
  today: string,
  lastCheckIn: string | null,
  count: number,
  freezeTokens: number,
  longest: number,
): {
  streak_count: number;
  last_check_in: string;
  streak_freeze_tokens: number;
  longest_streak: number;
} {
  if (lastCheckIn === today) {
    return {
      streak_count: count,
      last_check_in: today,
      streak_freeze_tokens: freezeTokens,
      longest_streak: Math.max(longest, count),
    };
  }

  let tokens = freezeTokens;
  let nextCount: number;
  if (lastCheckIn === shiftDate(today, -1)) {
    nextCount = count + 1;
  } else if (lastCheckIn === shiftDate(today, -2) && tokens > 0) {
    tokens -= 1;
    nextCount = count + 1;
  } else {
    nextCount = 1;
  }
  if (nextCount % 7 === 0 && tokens < MAX_FREEZE_TOKENS) tokens += 1;

  return {
    streak_count: nextCount,
    last_check_in: today,
    streak_freeze_tokens: tokens,
    longest_streak: Math.max(longest, nextCount),
  };
}
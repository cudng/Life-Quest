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

/** Next streak from a check-in: +1 if yesterday, unchanged if already today, else reset to 1. */
export function nextStreak(
  today: string,
  lastCheckIn: string | null,
  count: number,
): { streak_count: number; last_check_in: string } {
  if (lastCheckIn === today) return { streak_count: count, last_check_in: today };
  const continued = lastCheckIn === shiftDate(today, -1);
  return { streak_count: continued ? count + 1 : 1, last_check_in: today };
}
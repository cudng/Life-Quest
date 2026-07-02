function formatLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local calendar date as YYYY-MM-DD (not UTC, so day boundaries match the user). */
export function localToday(): string {
  return formatLocal(new Date());
}

/** Shift a YYYY-MM-DD date by `delta` days (local), returning YYYY-MM-DD. */
export function addDays(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return formatLocal(new Date(y, m - 1, d + delta));
}

/** Milliseconds from now until the next local midnight (daily quest reset). */
export function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** Compact duration for countdowns, e.g. "6h 12m" or "42m". Rounds up to 1m. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

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

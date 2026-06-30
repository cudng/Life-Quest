// XP / level curve. Pure math, no app state.
// Rising cost: advancing from level L to L+1 costs BASE_XP * L, so the
// cumulative XP to *reach* level L is BASE_XP * (L-1) * L / 2.
// Thresholds with BASE_XP = 100: L1=0, L2=100, L3=300, L4=600, L5=1000, ...

const BASE_XP = 100;

/** Total cumulative XP required to reach a given level. Level 1 = 0 XP. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (BASE_XP * (level - 1) * level) / 2;
}

/** Current level for a given total XP (>= 1). */
export function xpToLevel(xp: number): number {
  if (xp <= 0) return 1;
  // Invert xp = BASE_XP * (L-1) * L / 2  ->  L = (1 + sqrt(1 + 8*xp/BASE_XP)) / 2.
  return Math.floor((1 + Math.sqrt(1 + (8 * xp) / BASE_XP)) / 2);
}

/** Cumulative XP threshold needed to reach the level after `level`. */
export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1);
}
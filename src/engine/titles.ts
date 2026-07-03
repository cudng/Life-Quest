// Level tiers: title + HUD portrait per level range. Pure lookup, no app state.
// Ordered by minLevel ascending; tierForLevel picks the highest reached tier.

export interface LevelTier {
  /** Lowest level (inclusive) at which this tier applies. */
  minLevel: number;
  title: string;
  /** Character portrait shown in the HUD for this tier. */
  portrait: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { minLevel: 1, title: "Novice", portrait: "🐣" },
  { minLevel: 5, title: "Apprentice", portrait: "⚔️" },
  { minLevel: 10, title: "Adept", portrait: "🛡️" },
  { minLevel: 18, title: "Expert", portrait: "🏹" },
  { minLevel: 28, title: "Master", portrait: "🧙" },
  { minLevel: 40, title: "Grandmaster", portrait: "🐉" },
];

/** Tier for a given level (falls back to the first tier for level <= 1). */
export function tierForLevel(level: number): LevelTier {
  let tier = LEVEL_TIERS[0];
  for (const t of LEVEL_TIERS) {
    if (level >= t.minLevel) tier = t;
    else break;
  }
  return tier;
}

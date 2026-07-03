// Rarity tier styling shared by every achievement surface (Home carousel,
// achievements page, unlock toasts). Dark-fantasy palette: bone gray,
// spectral blue, blood violet, ember.

import type { Rarity } from "@/data/achievements";

export interface RarityStyle {
  /** Display label, e.g. "RARE". */
  label: string;
  /** Text color for the label. */
  color: string;
  /** Border color (translucent). */
  ring: string;
  /** box-shadow glow for earned cards / icon tiles. */
  glow: string;
  /** Icon tile background tint. */
  tileBg: string;
}

export const RARITY_STYLES: Record<Rarity, RarityStyle> = {
  common: {
    label: "COMMON",
    color: "#a8a29e",
    ring: "rgba(168, 162, 158, 0.3)",
    glow: "0 0 10px rgba(168, 162, 158, 0.18)",
    tileBg: "rgba(168, 162, 158, 0.12)",
  },
  rare: {
    label: "RARE",
    color: "#6b9bd1",
    ring: "rgba(107, 155, 209, 0.4)",
    glow: "0 0 14px rgba(107, 155, 209, 0.35)",
    tileBg: "rgba(107, 155, 209, 0.14)",
  },
  epic: {
    label: "EPIC",
    color: "#9d6ec9",
    ring: "rgba(157, 110, 201, 0.45)",
    glow: "0 0 16px rgba(157, 110, 201, 0.45)",
    tileBg: "rgba(157, 110, 201, 0.15)",
  },
  legendary: {
    label: "LEGENDARY",
    color: "#d97706",
    ring: "rgba(217, 119, 6, 0.5)",
    glow: "0 0 20px rgba(217, 119, 6, 0.5)",
    tileBg: "rgba(217, 119, 6, 0.15)",
  },
};

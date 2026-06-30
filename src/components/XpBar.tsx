// Animated XP progress bar. Presentational: takes a 0..1 ratio plus the raw
// numbers to label it, and animates the fill width whenever the ratio changes.

import { motion } from "framer-motion";

interface XpBarProps {
  /** Fill fraction, 0..1. */
  ratio: number;
  /** XP earned within the current level. */
  intoLevel: number;
  /** XP span of the current level. */
  span: number;
}

export function XpBar({ ratio, intoLevel, span }: XpBarProps) {
  return (
    <div className="w-full">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-1 text-right text-sm text-muted-foreground">
        {intoLevel} / {span} XP
      </div>
    </div>
  );
}

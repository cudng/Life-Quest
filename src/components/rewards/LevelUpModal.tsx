// Celebratory modal shown when the derived level increases. Driven by
// RewardsLayer: pass the new level to open, null to stay closed. Click the
// backdrop or the button to dismiss. framer-motion handles the enter/exit.

import { AnimatePresence, motion } from "framer-motion";

interface LevelUpModalProps {
  /** New level to celebrate, or null when nothing to show. */
  level: number | null;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-2xl border border-[var(--accent-border)] bg-card p-8 text-center text-card-foreground shadow-xl"
          >
            <div className="text-5xl">🎉</div>
            <div className="mt-4 text-sm uppercase tracking-wide text-[var(--accent)]">
              Level Up
            </div>
            <div className="mt-1 text-5xl font-bold text-foreground">
              {level}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You reached level {level}. Keep going!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Nice!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

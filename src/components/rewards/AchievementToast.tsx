// Stacked toast notifications for newly unlocked achievements. Each toast slides
// in from the right (framer-motion) and auto-dismisses after a few seconds. The
// queue itself is owned by RewardsLayer; this is the presentational host.

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ToastItem {
  key: number;
  icon: string;
  title: string;
}

const DISMISS_MS = 4000;

interface ToastProps {
  toast: ToastItem;
  onDismiss: (key: number) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.key), DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.key, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onClick={() => onDismiss(toast.key)}
      className="flex w-72 cursor-pointer items-center gap-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] p-4 text-left shadow-lg"
    >
      <span className="text-3xl">{toast.icon}</span>
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--accent)]">
          Achievement unlocked
        </div>
        <div className="font-medium text-foreground">{toast.title}</div>
      </div>
    </motion.div>
  );
}

interface AchievementToastsProps {
  toasts: ToastItem[];
  onDismiss: (key: number) => void;
}

export function AchievementToasts({
  toasts,
  onDismiss,
}: AchievementToastsProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.key} className="pointer-events-auto">
            <Toast toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

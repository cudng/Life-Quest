// App-wide reward feedback, mounted once in the root layout. It runs the single
// achievement sync (evaluates the derived snapshot, persists newly-earned ids),
// and on each unlock batch fires confetti plus an achievement toast naming what
// was earned. Centralizing here means pages no longer mount their own sync.

import { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "@/data/useProgress";
import { useAchievementSync } from "@/data/useAchievementSync";
import { ACHIEVEMENTS } from "@/data/achievements";
import { xpToLevel } from "@/engine/levels";
import { fireConfetti } from "@/lib/reward";
import { AchievementToasts, type ToastItem } from "./AchievementToast";
import { LevelUpModal } from "./LevelUpModal";

const DEF_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function RewardsLayer() {
  const { snapshot } = useProgress();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextKey = useRef(0);

  // Track the derived level so we can celebrate increases. Seeded on the first
  // loaded snapshot (no modal for the level you already have on page load).
  const prevLevel = useRef<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    const level = xpToLevel(snapshot.totalXp);
    if (prevLevel.current !== null && level > prevLevel.current) {
      setLevelUp(level);
      fireConfetti();
    }
    prevLevel.current = level;
  }, [snapshot]);

  const handleUnlock = useCallback((ids: string[]) => {
    fireConfetti();
    setToasts((prev) => [
      ...prev,
      ...ids.map((id) => {
        const def = DEF_BY_ID.get(id);
        return {
          key: nextKey.current++,
          icon: def?.icon ?? "🏅",
          title: def?.title ?? id,
        };
      }),
    ]);
  }, []);

  useAchievementSync(snapshot, handleUnlock);

  const dismiss = useCallback((key: number) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  return (
    <>
      <AchievementToasts toasts={toasts} onDismiss={dismiss} />
      <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />
    </>
  );
}

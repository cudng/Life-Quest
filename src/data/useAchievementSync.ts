// Watches the derived snapshot and persists any achievements whose condition is
// now met but not yet recorded. After a write the achievements query refetches,
// the snapshot updates with the new ids, and the next evaluation is empty — so
// this self-terminates rather than looping. onUnlock fires once per batch so the
// UI can play rewards (confetti, etc.).

import { useEffect, useRef } from "react";
import { evaluateAchievements } from "@/engine/achievements";
import type { ProgressSnapshot } from "@/engine/progress";
import { useUnlockAchievements } from "@/data/mutations";

export function useAchievementSync(
  snapshot: ProgressSnapshot | undefined,
  onUnlock?: (ids: string[]) => void,
): void {
  const unlock = useUnlockAchievements();
  const inFlight = useRef(false);

  useEffect(() => {
    if (!snapshot || inFlight.current) return;
    const newly = evaluateAchievements(snapshot);
    if (newly.length === 0) return;

    inFlight.current = true;
    unlock.mutate(newly, {
      onSuccess: () => onUnlock?.(newly),
      onSettled: () => {
        inFlight.current = false;
      },
    });
    // Re-runs only when the snapshot changes; the in-flight guard prevents a
    // duplicate insert before the refetch lands. unlock/onUnlock intentionally
    // omitted (unstable identities would cause spurious re-runs).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);
}
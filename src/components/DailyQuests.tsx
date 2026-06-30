// Today's daily quests + streak counter. Reads the active quest templates and
// reconciles them against today's completions from the snapshot. Toggling a
// quest and checking in are admin-only writes (RLS enforces it; this just gates
// the controls for UX). Visitors see a read-only view.

import type { ProgressSnapshot } from "@/engine/progress";
import { useDailyQuests } from "@/data/queries";
import { useToggleDailyQuest, useStreakCheckIn } from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";

interface DailyQuestsProps {
  snapshot: ProgressSnapshot;
  today: string;
}

export function DailyQuests({ snapshot, today }: DailyQuestsProps) {
  const quests = useDailyQuests();
  const toggle = useToggleDailyQuest();
  const checkIn = useStreakCheckIn();
  const isAdmin = useIsAdmin();

  const doneIds = new Set(snapshot.todayCompletedQuestIds);
  const active = (quests.data ?? []).filter((q) => q.active);
  const completedCount = active.filter((q) => doneIds.has(q.id)).length;

  const checkedInToday = snapshot.streak.lastCheckIn === today;

  return (
    <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Daily Quests</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{active.length} done
          </span>
          <span
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            title={`${snapshot.streak.count}-day streak`}
          >
            🔥 {snapshot.streak.count}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {active.length === 0 && (
          <li className="text-sm text-muted-foreground">No active quests.</li>
        )}
        {active.map((q) => {
          const done = doneIds.has(q.id)
          return (
            <li key={q.id}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={done}
                  disabled={!isAdmin || toggle.isPending}
                  onChange={() =>
                    toggle.mutate({
                      questId: q.id,
                      today,
                      completed: !done,
                    })
                  }
                  className="size-4 accent-[var(--primary)]"
                />
                <span
                  className={
                    done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }
                >
                  {q.title}
                </span>
                <span className="ml-auto text-sm text-muted-foreground">
                  +{q.xp} XP
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {isAdmin && (
        <button
          type="button"
          disabled={checkedInToday || checkIn.isPending}
          onClick={() =>
            checkIn.mutate({
              today,
              lastCheckIn: snapshot.streak.lastCheckIn,
              streakCount: snapshot.streak.count,
            })
          }
          className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {checkedInToday ? "Checked in today" : "Check in today"}
        </button>
      )}
    </section>
  )
}

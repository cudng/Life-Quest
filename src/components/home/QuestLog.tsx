import { useEffect, useState } from 'react'
import type { ProgressSnapshot } from '@/engine/progress'
import { Card } from '@/components/ui/card'
import { useDailyQuests } from '@/data/queries'
import { useToggleDailyQuest } from '@/data/mutations'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { formatDuration, msUntilMidnight } from '@/lib/date'

/** Time left until the next local midnight, refreshed twice a minute. */
function useResetCountdown(): string {
    const [label, setLabel] = useState(() => formatDuration(msUntilMidnight()))
    useEffect(() => {
        const id = setInterval(
            () => setLabel(formatDuration(msUntilMidnight())),
            30_000,
        )
        return () => clearInterval(id)
    }, [])
    return label
}

interface QuestLogProps {
    snapshot: ProgressSnapshot
    today: string
}

export function QuestLog({ snapshot, today }: QuestLogProps) {
    const quests = useDailyQuests()
    const toggle = useToggleDailyQuest()
    const isAdmin = useIsAdmin()

    const doneIds = new Set(snapshot.todayCompletedQuestIds)
    const active = (quests.data ?? []).filter((q) => q.active)
    const completedCount = active.filter((q) => doneIds.has(q.id)).length
    const countdown = useResetCountdown()

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-4 !py-[15px] ring-1 ring-q-border">
            <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.1em] text-q-accent">
                    QUEST LOG
                </span>
                <span className="rounded-full bg-q-accent/[.12] px-[7px] py-0.5 font-mono text-[10px] text-q-accent-bright">
                    {completedCount}/{active.length}
                </span>
                <span
                    className="ml-auto whitespace-nowrap font-mono text-[9.5px] text-q-dim"
                    title="Daily quests reset at midnight"
                >
                    resets in {countdown}
                </span>
            </div>

            <div className="dq-scroll flex max-h-[200px] flex-col gap-px overflow-y-auto overflow-x-hidden pr-1">
                {active.length === 0 && (
                    <p className="px-1.5 py-2 text-[12px] text-q-muted">No active quests.</p>
                )}
                {active.map((q) => {
                    const done = doneIds.has(q.id)
                    return (
                        <button
                            key={q.id}
                            type="button"
                            disabled={!isAdmin}
                            onClick={() =>
                                toggle.mutate({ questId: q.id, today, completed: !done })
                            }
                            className="dq-quest flex items-center gap-2.5 rounded-lg px-[7px] py-1.5 text-left transition-colors disabled:cursor-default"
                        >
                            <span
                                className={`flex size-[18px] shrink-0 rotate-45 items-center justify-center rounded-[4px] border-[1.5px] transition ${
                                    done
                                        ? 'border-q-accent bg-q-accent'
                                        : 'border-q-line bg-transparent'
                                }`}
                            >
                                <span className="-rotate-45 text-[9px] font-bold text-white">
                                    {done ? '✓' : ''}
                                </span>
                            </span>
                            <span
                                className={`min-w-0 flex-1 truncate text-[12.5px] ${
                                    done ? 'text-q-dim line-through' : 'text-q-fg-2'
                                }`}
                            >
                                {q.title}
                            </span>
                            <span
                                className={`shrink-0 font-mono text-[11px] ${
                                    done ? 'text-q-faint' : 'text-q-accent-bright'
                                }`}
                            >
                                +{q.xp} XP
                            </span>
                        </button>
                    )
                })}
            </div>
        </Card>
    )
}

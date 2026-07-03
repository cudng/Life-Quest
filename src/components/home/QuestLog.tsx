import { useEffect, useState } from 'react'
import { PERFECT_DAY_BONUS_XP, type ProgressSnapshot } from '@/engine/progress'
import { Card } from '@/components/ui/card'
import { useAttributes, useDailyQuests } from '@/data/queries'
import { useToggleDailyQuest } from '@/data/mutations'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { formatDuration, msUntilMidnight } from '@/lib/date'
import { announce, floatOverAttribute, flyXp } from '@/lib/fx'
import { fireDailyClear } from '@/lib/reward'
import { playFanfare, playTick } from '@/lib/sound'
import { FANTASY } from '@/components/ui/talent'

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
    const attributes = useAttributes()
    const toggle = useToggleDailyQuest()
    const isAdmin = useIsAdmin()
    const attrNames = new Map((attributes.data ?? []).map((a) => [a.id, a.name]))

    const doneIds = new Set(snapshot.todayCompletedQuestIds)
    const active = (quests.data ?? []).filter((q) => q.active)
    const completedCount = active.filter((q) => doneIds.has(q.id)).length
    const countdown = useResetCountdown()

    return (
        <Card className="min-h-0 flex-1 gap-0 rounded-2xl border-0 bg-q-panel px-4 !py-[15px] ring-1 ring-q-border">
            <div className="mb-3 flex items-center gap-2">
                <span
                    className="font-mono text-[10px] tracking-[0.1em]"
                    style={{ color: FANTASY.eyebrow }}
                >
                    QUEST LOG
                </span>
                <span
                    className="rounded-full px-[7px] py-0.5 font-mono text-[10px]"
                    style={{
                        color: FANTASY.emberText,
                        background: 'rgba(217,96,16,.12)',
                        boxShadow: 'inset 0 0 0 1px rgba(217,120,40,.3)',
                    }}
                >
                    {completedCount}/{active.length}
                </span>
                <span
                    className="ml-auto whitespace-nowrap font-mono text-[9.5px]"
                    style={{ color: FANTASY.goldFaint }}
                    title="Daily quests reset at midnight"
                >
                    resets in {countdown}
                </span>
            </div>

            <div className="dq-scroll flex max-h-[200px] min-h-0 flex-1 flex-col gap-px overflow-y-auto overflow-x-hidden pr-1 lg:max-h-none">
                {active.length === 0 && (
                    <p
                        className="px-1.5 py-2 text-[12px]"
                        style={{ color: FANTASY.goldFaint }}
                    >
                        No active quests.
                    </p>
                )}
                {active.map((q) => {
                    const done = doneIds.has(q.id)
                    return (
                        <button
                            key={q.id}
                            type="button"
                            disabled={!isAdmin}
                            onClick={(e) => {
                                if (!done) {
                                    const source =
                                        e.currentTarget.querySelector('[data-xp-label]') ??
                                        e.currentTarget
                                    const rect = source.getBoundingClientRect()
                                    flyXp(`+${q.xp} XP`, rect)
                                    playTick()
                                    const attrName =
                                        q.attribute_id && attrNames.get(q.attribute_id)
                                    if (q.attribute_id && attrName) {
                                        floatOverAttribute(
                                            q.attribute_id,
                                            `+1 ${attrName.toUpperCase()}`,
                                        )
                                    }
                                    // This click completes the last open daily.
                                    if (completedCount + 1 === active.length) {
                                        fireDailyClear()
                                        announce('DAILY CLEAR!')
                                        playFanfare()
                                        setTimeout(
                                            () =>
                                                flyXp(
                                                    `+${PERFECT_DAY_BONUS_XP} XP BONUS`,
                                                    rect,
                                                ),
                                            450,
                                        )
                                    }
                                }
                                toggle.mutate({
                                    questId: q.id,
                                    today,
                                    completed: !done,
                                    attributeId: q.attribute_id,
                                })
                            }}
                            className="dq-quest flex items-center gap-1.5 rounded-lg px-0.5 py-[3px] text-left transition-colors disabled:cursor-default"
                        >
                            <span
                                className="flex size-[13px] shrink-0 rotate-45 items-center justify-center rounded-[3px] transition"
                                style={
                                    done
                                        ? {
                                              background:
                                                  'linear-gradient(150deg,#ffe7a6,#d99f36,#8a5c17)',
                                              boxShadow:
                                                  '0 0 6px rgba(220,170,70,.55), inset 0 1px 1px rgba(255,244,214,.5)',
                                          }
                                        : {
                                              boxShadow:
                                                  'inset 0 0 0 1.5px rgba(160,120,50,.4)',
                                          }
                                }
                            >
                                <span className="-rotate-45 text-[7px] font-bold text-[#1a1105]">
                                    {done ? '✓' : ''}
                                </span>
                            </span>
                            <span
                                className="min-w-0 flex-1 truncate text-[11.5px]"
                                style={{
                                    color: done
                                        ? FANTASY.goldFaint
                                        : FANTASY.goldText,
                                    textDecoration: done ? 'line-through' : undefined,
                                }}
                            >
                                {q.title}
                            </span>
                            <span
                                data-xp-label
                                className="shrink-0 font-mono text-[11px]"
                                style={{
                                    color: done
                                        ? FANTASY.goldFaint
                                        : FANTASY.emberText,
                                }}
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

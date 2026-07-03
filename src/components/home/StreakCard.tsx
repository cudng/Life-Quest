import { useEffect, useState } from 'react'
import type { ProgressSnapshot } from '@/engine/progress'
import { Card } from '@/components/ui/card'
import { useStreakCheckIn } from '@/data/mutations'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { addDays, formatDuration, msUntilMidnight } from '@/lib/date'
import { nextStreak } from '@/engine/streak'
import { announce } from '@/lib/fx'

/** Evening hour (local) from which an unchecked streak counts as at risk. */
const AT_RISK_FROM_HOUR = 18

/** Current time, refreshed once a minute (drives the at-risk countdown). */
function useNow(): Date {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000)
        return () => clearInterval(id)
    }, [])
    return now
}

/** Single-letter weekday for the dot `offset` days before today. */
function weekdayLetter(today: string, offset: number): string {
    const [y, m, d] = today.split('-').map(Number)
    return 'SMTWTFS'[new Date(y, m - 1, d - offset).getDay()]
}

/** Flame grows with streak length (7+ bigger) and turns blue at 30+. */
function flameClasses(count: number, atRisk: boolean): string {
    const size =
        count >= 30 ? 'text-[24px]' : count >= 7 ? 'text-[20px]' : 'text-base'
    if (atRisk) return `${size} opacity-50 grayscale`
    const glow =
        count >= 30
            ? '[filter:hue-rotate(185deg)_saturate(1.6)_drop-shadow(0_0_10px_rgba(56,189,248,.75))]'
            : count >= 7
              ? '[filter:drop-shadow(0_0_10px_rgba(249,115,22,.75))]'
              : '[filter:drop-shadow(0_0_8px_rgba(249,115,22,.6))]'
    return `${size} ${glow}`
}

interface StreakCardProps {
    snapshot: ProgressSnapshot
    today: string
}

export function StreakCard({ snapshot, today }: StreakCardProps) {
    const checkIn = useStreakCheckIn()
    const isAdmin = useIsAdmin()
    const now = useNow()
    const checkedInToday = snapshot.streak.lastCheckIn === today

    // The streak survives only if checked in today; warn from evening on.
    const streakAlive =
        snapshot.streak.count > 0 &&
        snapshot.streak.lastCheckIn === addDays(today, -1)
    const atRisk =
        streakAlive && !checkedInToday && now.getHours() >= AT_RISK_FROM_HOUR

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-gradient-to-br from-q-flame/10 to-q-panel px-4 !py-3.5 ring-1 ring-q-flame/25">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="font-mono text-[9px] tracking-[0.1em] text-q-flame-bright">
                    DAILY STREAK
                </div>
                <div className="flex items-start gap-1">
                    {snapshot.weeklyActivity.map((active, i) => {
                        const isToday = i === 6
                        // Today lights up on check-in too, not just quest activity.
                        const on = active || (isToday && checkedInToday)
                        const cls = on
                            ? 'border-q-flame/40 bg-q-flame/[.16]'
                            : isToday
                              ? 'border-dashed border-q-flame/50 bg-q-flame/[.06]'
                              : 'border-q-border bg-q-overlay'
                        return (
                            <span key={i} className="flex flex-col items-center gap-0.5">
                                <span
                                    className={`flex size-[16px] items-center justify-center rounded-[5px] border text-[8px] ${cls}`}
                                >
                                    {on ? '🔥' : ''}
                                </span>
                                <span
                                    className={`font-mono text-[8px] leading-none ${
                                        isToday ? 'text-q-flame-bright' : 'text-q-faint'
                                    }`}
                                >
                                    {weekdayLetter(today, 6 - i)}
                                </span>
                            </span>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                    <span
                        className={`leading-none ${flameClasses(
                            snapshot.streak.count,
                            atRisk,
                        )}`}
                    >
                        🔥
                    </span>
                    <div>
                        <div className="text-[14px] font-bold leading-none text-q-fg">
                            {snapshot.streak.count}{' '}
                            <span className="text-[10px] font-medium text-q-muted">
                                day streak
                            </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[9px] text-q-flame-bright">
                            <span>Longest: {snapshot.longestStreak} days</span>
                            {snapshot.streakFreezeTokens > 0 && (
                                <span
                                    className="text-sky-400"
                                    title="Streak freezes — each saves your streak across one missed day"
                                >
                                    ❄️ ×{snapshot.streakFreezeTokens}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        disabled={checkedInToday || checkIn.isPending}
                        onClick={() => {
                            const next = nextStreak(
                                today,
                                snapshot.streak.lastCheckIn,
                                snapshot.streak.count,
                                snapshot.streakFreezeTokens,
                                snapshot.longestStreak,
                            )
                            if (
                                next.streak_freeze_tokens >
                                snapshot.streakFreezeTokens
                            ) {
                                announce('STREAK FREEZE EARNED ❄️')
                            }
                            checkIn.mutate({
                                today,
                                lastCheckIn: snapshot.streak.lastCheckIn,
                                streakCount: snapshot.streak.count,
                                freezeTokens: snapshot.streakFreezeTokens,
                                longest: snapshot.longestStreak,
                            })
                        }}
                        className="shrink-0 rounded-md border border-q-flame/30 px-2 py-0.5 text-[10px] font-medium text-q-flame-bright transition-colors hover:bg-q-flame/10 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        {checkedInToday ? 'Checked in today' : 'Check in today'}
                    </button>
                )}
            </div>

            {atRisk && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-q-flame/30 bg-q-flame/10 px-2 py-1 text-[10px] font-medium text-q-flame-bright">
                    <span aria-hidden>⚠️</span>
                    Streak at risk — {formatDuration(msUntilMidnight(now))} left to
                    check in
                </div>
            )}
        </Card>
    )
}

import type { ProgressSnapshot } from '@/engine/progress'
import { Card } from '@/components/ui/card'
import { useStreakCheckIn } from '@/data/mutations'
import { useIsAdmin } from '@/auth/useIsAdmin'

interface StreakCardProps {
    snapshot: ProgressSnapshot
    today: string
}

export function StreakCard({ snapshot, today }: StreakCardProps) {
    const checkIn = useStreakCheckIn()
    const isAdmin = useIsAdmin()
    const checkedInToday = snapshot.streak.lastCheckIn === today

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-gradient-to-br from-q-flame/10 to-q-panel px-4 !py-3.5 ring-1 ring-q-flame/25">
            <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none [filter:drop-shadow(0_0_8px_rgba(249,115,22,.6))]">
                        🔥
                    </span>
                    <div>
                        <div className="text-base font-bold leading-none text-q-fg">
                            {snapshot.streak.count}{' '}
                            <span className="text-[11px] font-medium text-q-muted">
                                day streak
                            </span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-q-flame-bright">
                            Longest: {snapshot.longestStreak} days
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {snapshot.weeklyActivity.map((on, i) => {
                        const isToday = i === 6
                        const cls = on
                            ? 'border-q-flame/40 bg-q-flame/[.16]'
                            : isToday
                              ? 'border-q-accent/50 bg-q-accent/[.14]'
                              : 'border-q-border bg-q-overlay'
                        return (
                            <span
                                key={i}
                                className={`flex size-[15px] items-center justify-center rounded-[5px] border text-[8px] ${cls}`}
                            >
                                {on ? '🔥' : ''}
                            </span>
                        )
                    })}
                </div>
            </div>

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
                    className="mt-3 self-start rounded-lg border border-q-flame/30 px-2.5 py-1 text-[11px] font-medium text-q-flame-bright transition-colors hover:bg-q-flame/10 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    {checkedInToday ? 'Checked in today' : 'Check in today'}
                </button>
            )}
        </Card>
    )
}

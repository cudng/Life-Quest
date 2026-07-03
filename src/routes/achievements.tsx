import { createFileRoute } from '@tanstack/react-router'
import { ACHIEVEMENTS } from '@/data/achievements'
import { useAchievementsUnlocked } from '@/data/queries'
import { RARITY_STYLES } from '@/lib/rarity'

export const Route = createFileRoute('/achievements')({
    component: Achievements,
})

function Achievements() {
    const unlocked = useAchievementsUnlocked()

    if (unlocked.isLoading) {
        return <div className="p-6 text-muted-foreground">Loading…</div>
    }
    if (unlocked.isError) {
        return (
            <div className="p-6 text-destructive">
                Failed to load: {unlocked.error?.message ?? 'unknown error'}
            </div>
        )
    }

    const unlockedAt = new Map(
        (unlocked.data ?? []).map((r) => [r.id, r.unlocked_at]),
    )
    const earnedCount = ACHIEVEMENTS.filter((a) => unlockedAt.has(a.id)).length

    return (
        <div className="p-6 text-left">
            <div className="flex items-baseline justify-between">
                <h1 className="text-lg font-semibold text-foreground">
                    Achievements
                </h1>
                <span className="text-sm text-muted-foreground">
                    {earnedCount}/{ACHIEVEMENTS.length} earned
                </span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {ACHIEVEMENTS.map((a) => {
                    const earnedOn = unlockedAt.get(a.id)
                    const earned = earnedOn !== undefined
                    const rs = RARITY_STYLES[a.rarity]
                    return (
                        <li
                            key={a.id}
                            className={
                                earned
                                    ? 'flex flex-col items-center gap-2 rounded-xl border bg-[var(--accent-bg)] p-5 text-center'
                                    : 'flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center opacity-60'
                            }
                            style={
                                earned
                                    ? { borderColor: rs.ring, boxShadow: rs.glow }
                                    : undefined
                            }
                        >
                            <span
                                className="font-mono text-[9px] tracking-[0.12em]"
                                style={{
                                    color: earned ? rs.color : undefined,
                                }}
                            >
                                {rs.label}
                            </span>
                            <span className="text-4xl">
                                {earned ? a.icon : '🔒'}
                            </span>
                            <span className="font-medium text-foreground">
                                {a.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {a.description}
                            </span>
                            {earned && (
                                <span className="mt-1 text-xs text-[var(--accent)]">
                                    {earnedOn.slice(0, 10)}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

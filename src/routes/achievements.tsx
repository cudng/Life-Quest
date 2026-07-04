import { createFileRoute } from '@tanstack/react-router'
import { ACHIEVEMENTS } from '@/data/achievements'
import { useAchievementsUnlocked } from '@/data/queries'
import { RARITY_STYLES } from '@/lib/rarity'
import { FANTASY, Medallion } from '@/components/ui/talent'

export const Route = createFileRoute('/achievements')({
    component: Achievements,
})

function Achievements() {
    const unlocked = useAchievementsUnlocked()

    if (unlocked.isLoading) {
        return (
            <div
                className="p-6 font-mono text-sm tracking-wide"
                style={{ color: FANTASY.goldDim }}
            >
                Polishing the trophies…
            </div>
        )
    }
    if (unlocked.isError) {
        return (
            <div className="p-6 font-mono text-sm text-destructive">
                Failed to load: {unlocked.error?.message ?? 'unknown error'}
            </div>
        )
    }

    const unlockedAt = new Map(
        (unlocked.data ?? []).map((r) => [r.id, r.unlocked_at]),
    )
    const earnedCount = ACHIEVEMENTS.filter((a) => unlockedAt.has(a.id)).length

    return (
        <div className="flex h-[calc(100svh-64px)] flex-col p-4 text-left">
            <div className="flex items-center gap-2.5">
                <Medallion metal="gold" size={34}>
                    🏆
                </Medallion>
                <div className="leading-tight">
                    <p
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        Hall of Fame
                    </p>
                    <h1
                        className="font-serif font-semibold leading-tight"
                        style={{
                            fontSize: '2rem',
                            margin: 0,
                            color: FANTASY.goldText,
                            textShadow: '0 1px 2px rgba(0,0,0,.6)',
                        }}
                    >
                        Achievements
                    </h1>
                </div>
                <span
                    className="ml-auto font-mono text-xs uppercase tracking-wider"
                    style={{ color: FANTASY.goldDim }}
                >
                    {earnedCount}/{ACHIEVEMENTS.length} earned
                </span>
            </div>

            <div
                className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl"
                style={{
                    background: '#0a0705',
                    boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.25)',
                }}
            >
                <ul className="grid min-w-0 flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
                    {ACHIEVEMENTS.map((a) => {
                        const earnedOn = unlockedAt.get(a.id)
                        const earned = earnedOn !== undefined
                        const rs = RARITY_STYLES[a.rarity]
                        return (
                            <li
                                key={a.id}
                                className={
                                    earned
                                        ? 'flex flex-col items-center gap-2 rounded-xl border p-5 text-center'
                                        : 'flex flex-col items-center gap-2 rounded-xl border border-[#a07832]/20 p-5 text-center opacity-55'
                                }
                                style={
                                    earned
                                        ? {
                                              borderColor: rs.ring,
                                              boxShadow: rs.glow,
                                              background:
                                                  'linear-gradient(#161009,#0d0a07)',
                                          }
                                        : {
                                              background:
                                                  'linear-gradient(#100c08,#0a0705)',
                                          }
                                }
                            >
                                <span
                                    className="font-mono text-[9px] uppercase tracking-[0.12em]"
                                    style={{
                                        color: earned
                                            ? rs.color
                                            : FANTASY.goldFaint,
                                    }}
                                >
                                    {rs.label}
                                </span>
                                <span className="text-4xl">
                                    {earned ? a.icon : '🔒'}
                                </span>
                                <span
                                    className="font-serif font-medium"
                                    style={{ color: FANTASY.goldText }}
                                >
                                    {a.title}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{ color: FANTASY.goldDim }}
                                >
                                    {a.description}
                                </span>
                                {earned && (
                                    <span
                                        className="mt-1 font-mono text-[10px] uppercase tracking-wider"
                                        style={{ color: FANTASY.goldLink }}
                                    >
                                        {earnedOn.slice(0, 10)}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

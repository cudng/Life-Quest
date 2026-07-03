import { Link } from '@tanstack/react-router'
import { ACHIEVEMENTS, nextUnlock, type Rarity } from '@/data/achievements'
import { useAchievementsUnlocked } from '@/data/queries'
import type { ProgressSnapshot } from '@/engine/progress'
import { RARITY_STYLES } from '@/lib/rarity'
import { FANTASY } from '@/components/ui/talent'

interface Card {
    id: string
    title: string
    description: string
    icon: string
    rarity: Rarity
    earned: boolean
    at: string | null
}

function earnedSub(at: string): string {
    const d = new Date(at)
    if (Number.isNaN(d.getTime())) return 'Earned'
    return `Earned ${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`
}

function AchievementCard({ card }: { card: Card }) {
    const rs = RARITY_STYLES[card.rarity]
    return (
        <div
            className={`relative flex w-[290px] shrink-0 items-center gap-[15px] rounded-[15px] border px-[18px] py-4 ${
                card.earned
                    ? 'bg-q-panel'
                    : 'border-q-border bg-q-panel opacity-55'
            }`}
            style={
                card.earned
                    ? { borderColor: rs.ring, boxShadow: rs.glow }
                    : undefined
            }
        >
            <span
                className={`absolute right-3 top-1.5 font-mono text-[7.5px] tracking-[0.1em] ${
                    card.earned ? '' : 'text-q-faint'
                }`}
                style={card.earned ? { color: rs.color } : undefined}
            >
                {rs.label}
            </span>
            <div
                className={`flex size-[54px] shrink-0 items-center justify-center rounded-[14px] text-[26px] ${
                    card.earned ? '' : 'bg-q-panel-locked'
                }`}
                style={
                    card.earned
                        ? { background: rs.tileBg, boxShadow: rs.glow }
                        : undefined
                }
            >
                {card.earned ? card.icon : '🔒'}
            </div>
            <div className="min-w-0">
                <div
                    className={`text-[15px] font-semibold leading-tight ${
                        card.earned ? 'text-q-fg' : 'text-q-dim'
                    }`}
                >
                    {card.title}
                </div>
                <div className="mt-[3px] truncate text-[11.5px] text-q-dim">
                    {card.earned && card.at ? earnedSub(card.at) : card.description}
                </div>
            </div>
        </div>
    )
}

export function AchievementsCarousel({ snapshot }: { snapshot: ProgressSnapshot }) {
    const unlocked = useAchievementsUnlocked()
    const at = new Map((unlocked.data ?? []).map((r) => [r.id, r.unlocked_at]))
    const next = nextUnlock(snapshot, new Set(at.keys()))

    const cards: Card[] = ACHIEVEMENTS.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        rarity: a.rarity,
        earned: at.has(a.id),
        at: at.get(a.id) ?? null,
    })).sort((x, y) => {
        if (x.earned !== y.earned) return x.earned ? -1 : 1
        if (x.earned && y.earned) return (y.at ?? '').localeCompare(x.at ?? '')
        return 0
    })

    const earnedCount = cards.filter((c) => c.earned).length
    const loop = [...cards, ...cards]

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span
                        className="font-mono text-[10px] tracking-[0.1em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        ACHIEVEMENTS
                    </span>
                    <span
                        className="whitespace-nowrap text-xs"
                        style={{ color: FANTASY.goldFaint }}
                    >
                        {earnedCount} earned
                    </span>
                </div>
                {next && (
                    <div
                        className="hidden min-w-0 items-center gap-2 rounded-full bg-q-panel px-3 py-1 sm:flex"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.28)' }}
                        title={next.achievement.description}
                    >
                        <span
                            className="font-mono text-[8.5px] tracking-[0.08em]"
                            style={{ color: FANTASY.eyebrow }}
                        >
                            NEXT
                        </span>
                        <span className="text-[13px] leading-none">
                            {next.achievement.icon}
                        </span>
                        <span
                            className="truncate text-[11.5px] font-medium"
                            style={{ color: FANTASY.goldText }}
                        >
                            {next.achievement.title}
                        </span>
                        <span
                            className="h-1 w-16 shrink-0 overflow-hidden rounded-full"
                            style={{
                                background: 'linear-gradient(#0a0704,#141009)',
                                boxShadow:
                                    'inset 0 1px 2px rgba(0,0,0,.9), inset 0 0 0 1px rgba(160,120,50,.14)',
                            }}
                        >
                            <span
                                className="block h-full rounded-full"
                                style={{
                                    width: `${Math.round(next.ratio * 100)}%`,
                                    background:
                                        'linear-gradient(90deg,#db5f10,#f8b45a,#ffe0a0)',
                                    boxShadow: '0 0 8px rgba(220,96,16,.5)',
                                }}
                            />
                        </span>
                        <span
                            className="whitespace-nowrap font-mono text-[10px]"
                            style={{ color: FANTASY.emberText }}
                        >
                            {next.current}/{next.target}
                        </span>
                    </div>
                )}
                <Link
                    to="/achievements"
                    className="whitespace-nowrap text-xs hover:underline"
                    style={{ color: FANTASY.goldLink }}
                >
                    View all →
                </Link>
            </div>

            <div className="dq-carousel relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
                <div
                    className="dq-track flex w-max gap-4"
                    style={{ animation: 'dq-marquee 32s linear infinite' }}
                >
                    {loop.map((card, i) => (
                        <AchievementCard key={`${card.id}-${i}`} card={card} />
                    ))}
                </div>
            </div>
        </div>
    )
}

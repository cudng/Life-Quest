import { Link } from '@tanstack/react-router'
import { ACHIEVEMENTS } from '@/data/achievements'
import { useAchievementsUnlocked } from '@/data/queries'

interface Card {
    id: string
    title: string
    description: string
    icon: string
    earned: boolean
    at: string | null
}

function earnedSub(at: string): string {
    const d = new Date(at)
    if (Number.isNaN(d.getTime())) return 'Earned'
    return `Earned ${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`
}

function AchievementCard({ card }: { card: Card }) {
    return (
        <div
            className={`flex w-[290px] shrink-0 items-center gap-[15px] rounded-[15px] border px-[18px] py-4 ${
                card.earned
                    ? 'border-q-border bg-q-panel'
                    : 'border-q-border bg-q-panel opacity-55'
            }`}
        >
            <div
                className={`flex size-[54px] shrink-0 items-center justify-center rounded-[14px] text-[26px] ${
                    card.earned
                        ? 'bg-q-accent/20 shadow-[0_0_14px_rgba(99,102,241,.35)]'
                        : 'bg-q-panel-locked'
                }`}
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

export function AchievementsCarousel() {
    const unlocked = useAchievementsUnlocked()
    const at = new Map((unlocked.data ?? []).map((r) => [r.id, r.unlocked_at]))

    const cards: Card[] = ACHIEVEMENTS.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
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
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] tracking-[0.1em] text-q-accent">
                        ACHIEVEMENTS
                    </span>
                    <span className="whitespace-nowrap text-xs text-q-dim">
                        {earnedCount} earned
                    </span>
                </div>
                <Link
                    to="/achievements"
                    className="text-xs text-q-accent-bright hover:underline"
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

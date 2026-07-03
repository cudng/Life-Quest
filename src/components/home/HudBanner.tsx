import { Card } from '@/components/ui/card'
import { useSession } from '@/auth/session'
import { getLevelProgress, type ProgressSnapshot } from '@/engine/progress'
import { tierForLevel } from '@/engine/titles'
import { XP_BAR_ANCHOR_ID } from '@/lib/fx'
import { METAL, FANTASY } from '@/components/ui/talent'
import { AttributesCard } from '@/components/home/AttributesCard'

/** Fallback name when the profile has none: capitalized guess from the email. */
function nameFromEmail(email: string | undefined): string {
    if (!email) return 'Player'
    const local = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim()
    if (!local) return 'Player'
    return local.charAt(0).toUpperCase() + local.slice(1)
}

const num = (n: number) => n.toLocaleString('en-US')

/** Recessed obsidian socket, used for the portrait and level plaque interior. */
const SOCKET =
    'radial-gradient(circle at 50% 32%, #241a0e, #0c0803)'

/** Decorative gold corner bracket. `pos` picks which corner. */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
    const base = 'pointer-events-none absolute size-[13px] border-[#a9803a]/45'
    const map = {
        tl: 'top-2 left-2 border-l-2 border-t-2 rounded-tl-[5px]',
        tr: 'top-2 right-2 border-r-2 border-t-2 rounded-tr-[5px]',
        bl: 'bottom-2 left-2 border-l-2 border-b-2 rounded-bl-[5px]',
        br: 'bottom-2 right-2 border-r-2 border-b-2 rounded-br-[5px]',
    }
    return <span className={`${base} ${map[pos]}`} />
}

/** Tiny top-corner stat: value over a mono label. */
function MiniStat({ value, label }: { value: number; label: string }) {
    return (
        <div className="text-right">
            <div
                className="font-mono text-[16px] font-semibold leading-none"
                style={{ color: FANTASY.goldText }}
            >
                {num(value)}
            </div>
            <div
                className="mt-0.5 font-mono text-[10px] tracking-[0.06em]"
                style={{ color: FANTASY.goldFaint }}
            >
                {label}
            </div>
        </div>
    )
}

export function HudBanner({ snapshot }: { snapshot: ProgressSnapshot }) {
    const session = useSession()
    const lp = getLevelProgress(snapshot)
    const tier = tierForLevel(lp.level)
    const pct = Math.round(lp.ratio * 100)
    const nearLevel = lp.ratio >= 0.9
    const toNext = lp.span - lp.intoLevel
    const name = snapshot.displayName ?? nameFromEmail(session?.user.email)
    const milestones = snapshot.completedNodeIds.length
    const badges = snapshot.unlockedAchievementIds.length

    return (
        <Card
            className="relative flex-col justify-center overflow-hidden rounded-2xl border-0 px-[31px] !py-[26px]"
            style={{
                background:
                    'radial-gradient(130% 120% at 50% 0%, #1b1712 0%, #100c08 62%, #0a0705 100%)',
                boxShadow:
                    'inset 0 2px 14px rgba(0,0,0,.7), inset 0 0 0 1px rgba(160,120,50,.16)',
            }}
        >
            {/* decorative layers — an ember glow, not arcade indigo */}
            <div
                className="pointer-events-none absolute -top-10 right-[120px] size-[220px]"
                style={{
                    background:
                        'radial-gradient(circle, rgba(219,120,40,.13), transparent 65%)',
                }}
            />
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />

            <div className="relative z-[1] flex min-w-0 flex-col justify-center gap-3">
                {/* identity row: forged plaque + name | mini stats + portrait */}
                <div className="flex items-center gap-4">
                    {/* level plaque — forged gold, pulses when the next level is close */}
                    <div
                        className="relative flex h-[64px] w-[58px] shrink-0 items-center justify-center rounded-[13px]"
                        style={{
                            background: METAL.gold.ring,
                            boxShadow: [
                                'inset 0 1.5px 1px rgba(255,244,214,.55)',
                                'inset 0 -2px 4px rgba(0,0,0,.55)',
                                nearLevel
                                    ? '0 0 22px rgba(232,180,80,.85)'
                                    : METAL.gold.glow,
                            ].join(', '),
                            ...(nearLevel
                                ? { animation: 'dq-pulse 1.6s ease-in-out infinite' }
                                : {}),
                        }}
                    >
                        <div
                            className="absolute inset-[3px] flex flex-col items-center justify-center rounded-[10px]"
                            style={{
                                background: SOCKET,
                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,.85)',
                            }}
                        >
                            <span
                                className="font-mono text-[9px] font-semibold tracking-[0.12em]"
                                style={{ color: FANTASY.goldDim }}
                            >
                                LEVEL
                            </span>
                            <span
                                className="text-[28px] font-bold leading-none"
                                style={{
                                    color: FANTASY.goldText,
                                    textShadow: '0 1px 2px rgba(0,0,0,.75)',
                                }}
                            >
                                {lp.level}
                            </span>
                        </div>
                    </div>

                    {/* name / role / tier title */}
                    <div className="min-w-0 flex-1">
                        <div
                            className="truncate font-serif text-[21px] font-semibold leading-tight"
                            style={{
                                color: FANTASY.goldText,
                                textShadow: '0 1px 2px rgba(0,0,0,.6)',
                            }}
                        >
                            {name}
                        </div>
                        <div
                            className="truncate text-[15.5px]"
                            style={{ color: FANTASY.goldDim }}
                        >
                            {snapshot.role ?? 'Adventurer'}
                        </div>
                        <span
                            className="mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[9.5px] leading-none tracking-[0.08em]"
                            style={{
                                color: FANTASY.emberText,
                                background: 'rgba(217,96,16,.12)',
                                boxShadow: 'inset 0 0 0 1px rgba(217,120,40,.3)',
                            }}
                        >
                            {tier.title.toUpperCase()}
                        </span>
                    </div>

                    {/* top-right mini info: milestones, badges, portrait */}
                    <div className="flex shrink-0 items-center gap-4 self-start">
                        <MiniStat value={milestones} label="MILESTONES" />
                        <MiniStat value={badges} label="BADGES" />
                        <div
                            className="flex size-[42px] items-center justify-center rounded-[10px] text-[22px] leading-none"
                            style={{
                                background: SOCKET,
                                boxShadow:
                                    'inset 0 2px 6px rgba(0,0,0,.85), inset 0 0 0 1px rgba(160,120,50,.3)',
                            }}
                            title={tier.title}
                        >
                            {tier.portrait}
                        </div>
                    </div>
                </div>

                {/* hero XP bar */}
                <div>
                    <div className="mb-1.5 flex items-baseline justify-between">
                        <span
                            className="font-mono text-[8px] tracking-[0.14em]"
                            style={{ color: FANTASY.eyebrow }}
                        >
                            EXPERIENCE
                        </span>
                        <span
                            className="whitespace-nowrap font-mono text-[10px]"
                            style={{ color: FANTASY.emberText }}
                        >
                            {num(lp.intoLevel)} / {num(lp.span)} XP ·{' '}
                            <span style={{ color: FANTASY.goldFaint }}>
                                {num(toNext)} to next
                            </span>
                        </span>
                    </div>
                    <div
                        id={XP_BAR_ANCHOR_ID}
                        className="relative h-2 overflow-hidden rounded-full"
                        style={{
                            background: 'linear-gradient(#0a0704,#141009)',
                            boxShadow:
                                'inset 0 1px 2px rgba(0,0,0,.9), inset 0 0 0 1px rgba(160,120,50,.14)',
                        }}
                    >
                        <div
                            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                            style={{
                                width: `${pct}%`,
                                background:
                                    'linear-gradient(90deg,#db5f10,#f8b45a,#ffe0a0)',
                                boxShadow: nearLevel
                                    ? '0 0 26px rgba(232,180,80,.95)'
                                    : '0 0 16px rgba(220,96,16,.6)',
                            }}
                        >
                            <div
                                className="absolute left-0 top-0 h-full w-2/5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                style={{
                                    animation: `dq-shimmer ${nearLevel ? '1.4s' : '2.6s'} infinite`,
                                }}
                            />
                        </div>
                        {/* RPG-style notches every 10% */}
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    'repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 2px), rgba(10,7,4,.85) calc(10% - 2px), rgba(10,7,4,.85) 10%)',
                            }}
                        />
                    </div>
                </div>

                {/* attributes */}
                <AttributesCard />
            </div>
        </Card>
    )
}

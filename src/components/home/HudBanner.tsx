import { Card } from '@/components/ui/card'
import { useSession } from '@/auth/session'
import { getLevelProgress, type ProgressSnapshot } from '@/engine/progress'

/** Capitalized display name from the signed-in email, fallback "Player". */
function displayName(email: string | undefined): string {
    if (!email) return 'Player'
    const local = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim()
    if (!local) return 'Player'
    return local.charAt(0).toUpperCase() + local.slice(1)
}

const num = (n: number) => n.toLocaleString('en-US')

/** Small decorative corner bracket. `pos` picks which corner. */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
    const base = 'absolute size-[13px] border-q-accent-bright/40'
    const map = {
        tl: 'top-2 left-2 border-l-2 border-t-2 rounded-tl-[5px]',
        tr: 'top-2 right-2 border-r-2 border-t-2 rounded-tr-[5px]',
        bl: 'bottom-2 left-2 border-l-2 border-b-2 rounded-bl-[5px]',
        br: 'bottom-2 right-2 border-r-2 border-b-2 rounded-br-[5px]',
    }
    return <span className={`${base} ${map[pos]}`} />
}

function StatChip({ value, label }: { value: number; label: string }) {
    return (
        <div className="min-w-[66px] rounded-[10px] border border-q-border bg-q-overlay px-3 py-2.5 text-center">
            <div className="text-[18px] font-semibold leading-none text-q-fg">
                {num(value)}
            </div>
            <div className="mt-1 font-mono text-[8.5px] tracking-[0.06em] text-q-dim">
                {label}
            </div>
        </div>
    )
}

export function HudBanner({ snapshot }: { snapshot: ProgressSnapshot }) {
    const session = useSession()
    const lp = getLevelProgress(snapshot)
    const pct = Math.round(lp.ratio * 100)
    const toNext = lp.span - lp.intoLevel
    const name = displayName(session?.user.email)
    const milestones = snapshot.completedNodeIds.length
    const badges = snapshot.unlockedAchievementIds.length

    return (
        <Card className="relative flex-row items-center gap-[22px] overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-q-panel-raised to-q-panel-2 px-[22px] !py-[18px] ring-1 ring-q-border">
            {/* decorative layers */}
            <div
                className="pointer-events-none absolute -top-10 right-[120px] size-[220px]"
                style={{
                    background:
                        'radial-gradient(circle, rgba(99,102,241,.14), transparent 65%)',
                }}
            />
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />

            {/* level medallion */}
            <div className="relative z-[1] flex h-[66px] w-[60px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-gradient-to-br from-q-accent-deep to-q-accent-bright shadow-[0_6px_22px_rgba(99,102,241,.55)] ring-1 ring-white/20">
                <span className="font-mono text-[8px] font-semibold tracking-[0.12em] text-white/85">
                    LEVEL
                </span>
                <span className="text-[30px] font-bold leading-none text-white">
                    {lp.level}
                </span>
            </div>

            {/* name + role */}
            <div className="relative z-[1] min-w-0 flex-1">
                <div className="truncate text-[19px] font-semibold text-q-fg">
                    {name}
                </div>
                <div className="mt-1 truncate text-[13px] text-q-muted">
                    {snapshot.role ?? 'Adventurer'}
                </div>
            </div>

            {/* hero XP bar */}
            <div className="relative z-[1] min-w-0 flex-1 px-1.5">
                <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-mono text-[9px] tracking-[0.14em] text-q-dim">
                        EXPERIENCE
                    </span>
                    <span className="whitespace-nowrap font-mono text-[11px] text-q-accent-bright">
                        {num(lp.intoLevel)} / {num(lp.span)} XP ·{' '}
                        <span className="text-q-dim">{num(toNext)} to next</span>
                    </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full border border-white/5 bg-q-track">
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-q-accent-deep to-q-accent-bright shadow-[0_0_16px_rgba(99,102,241,.6)]"
                        style={{ width: `${pct}%` }}
                    >
                        <div
                            className="absolute left-0 top-0 h-full w-2/5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            style={{ animation: 'dq-shimmer 2.6s infinite' }}
                        />
                    </div>
                </div>
            </div>

            {/* stat chips */}
            <div className="relative z-[1] flex shrink-0 gap-2">
                <StatChip value={milestones} label="MILESTONES" />
                <StatChip value={badges} label="BADGES" />
            </div>
        </Card>
    )
}

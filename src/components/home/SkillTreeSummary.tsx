// Home preview of the skill tree: just the first level. The shared Programming
// trunk sits at the bottom and conduits grow upward to its domain roots
// (Python, JavaScript, SQL, …). Deeper skills are NOT drawn here — a small row
// of dots above a domain hints how many child talents wait down that branch.
// Preview only (PROJECT.md → SKILLS TREE §5); "Enter tree →" opens the full
// canvas. Built from the shared dark-fantasy primitives; state reads via metal,
// conduits glow gold when allocated (domain unlocked) and stay dashed iron when
// locked.

import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import {
    FANTASY,
    Medallion,
    Pips,
    TalentSlab,
    type Metal,
    type PipState,
} from '@/components/ui/talent'
import { useSkills } from '@/data/queries'
import type { Mastery, Skill } from '@/data/types'

const MASTERY_METAL: Record<Mastery, Metal> = {
    expert: 'gold',
    proficient: 'bronze',
    learning: 'ember',
    locked: 'iron',
}

const isMastered = (m: Mastery) => m === 'proficient' || m === 'expert'

const pipState = (m: Mastery): PipState =>
    isMastered(m) ? 'lit' : m === 'learning' ? 'ember' : 'off'

const badgeFor = (m: Mastery) =>
    m === 'expert' ? '♛' : m === 'locked' ? '🔒' : undefined

// Preview slice caps.
const MAX_DOMAINS = 6
const MAX_DOTS = 4

// Geometry (px). Two tiers: trunk (bottom) and its domains (above).
const TRUNK = 46
const DOMAIN = 40
const SLOT = 92
const PAD_X = 16
const Y_DOMAIN = 56
const Y_TRUNK = 150
const HEIGHT = 196

/** One conduit between the trunk and a domain, as a vertical S-curve. */
function Conduit({
    px,
    py,
    cx,
    cy,
    active,
}: {
    px: number
    py: number
    cx: number
    cy: number
    active: boolean
}) {
    const my = (py + cy) / 2
    return (
        <path
            d={`M ${px} ${py} C ${px} ${my}, ${cx} ${my}, ${cx} ${cy}`}
            fill="none"
            strokeLinecap="round"
            stroke={active ? '#d9a341' : '#3a3a42'}
            strokeWidth={active ? 2.5 : 2}
            strokeDasharray={active ? undefined : '1 7'}
            style={
                active
                    ? { filter: 'drop-shadow(0 0 3px rgba(224,168,72,.6))' }
                    : undefined
            }
        />
    )
}

/**
 * A medallion centered on (x, y) with an optional label and a row of depth dots
 * above it. The label sits below by default, or above (`labelAbove`) to clear a
 * conduit entering from below.
 */
function TreeNode({
    x,
    y,
    size,
    metal,
    icon,
    name,
    badge,
    dim,
    pulse,
    faint,
    labelAbove,
    dots,
}: {
    x: number
    y: number
    size: number
    metal: Metal
    icon: string
    name: string
    badge?: string
    dim?: boolean
    pulse?: boolean
    faint?: boolean
    labelAbove?: boolean
    dots?: PipState[]
}) {
    const labelPos: CSSProperties = labelAbove
        ? { bottom: '100%', marginBottom: 3 }
        : { top: '100%', marginTop: 3 }
    return (
        <div
            className="absolute flex justify-center"
            style={{ left: x - SLOT / 2, top: y - size / 2, width: SLOT }}
        >
            <div className="relative">
                {dots && dots.length > 0 && (
                    <div className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2">
                        <Pips states={dots} />
                    </div>
                )}
                <Medallion
                    metal={metal}
                    size={size}
                    badge={badge}
                    dim={dim}
                    pulse={pulse}
                >
                    {icon}
                </Medallion>
                <div
                    className="absolute left-1/2 -translate-x-1/2 truncate text-center font-serif text-[10px] font-semibold tracking-wide"
                    style={{
                        width: SLOT,
                        ...labelPos,
                        color: faint ? FANTASY.goldFaint : FANTASY.goldText,
                        textShadow: '0 1px 2px rgba(0,0,0,.6)',
                    }}
                >
                    {name}
                </div>
            </div>
        </div>
    )
}

export function SkillTreeSummary() {
    const skills = useSkills()
    if (!skills.data) return null

    const all = skills.data
    const childrenOf = (id: string): Skill[] =>
        all.filter((s) => s.parent_id === id).sort((a, b) => a.position - b.position)

    const root = all
        .filter((s) => s.parent_id === null)
        .sort((a, b) => a.position - b.position)[0]
    if (!root) return null

    const unlocked = all.filter((s) => s.mastery !== 'locked').length
    const learning = all.filter((s) => s.mastery === 'learning').length

    const domainsAll = childrenOf(root.id)
    const domains = domainsAll.slice(0, MAX_DOMAINS)
    const extraDomains = domainsAll.length - domains.length
    const cols = domains.length + (extraDomains > 0 ? 1 : 0)

    const xOf = (col: number) => PAD_X + col * SLOT + SLOT / 2
    const width = PAD_X * 2 + Math.max(cols, 1) * SLOT
    // Trunk centers under the span of domains (evenly spaced → midpoint of ends).
    const trunkX =
        domains.length > 0 ? (xOf(0) + xOf(domains.length - 1)) / 2 : width / 2

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-[18px] !py-4 ring-1 ring-q-border">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <div
                        className="mb-[5px] font-mono text-[10px] tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        TALENT TREE
                    </div>
                    <div className="font-serif text-[15px] font-semibold text-q-fg">
                        {unlocked} of {all.length} talents forged
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                    <span
                        className="whitespace-nowrap rounded-full px-2.5 py-[3px] font-mono text-[11px]"
                        style={{
                            color: FANTASY.emberText,
                            background: 'rgba(217,96,16,.12)',
                            boxShadow: 'inset 0 0 0 1px rgba(217,120,40,.3)',
                        }}
                    >
                        {learning} learning
                    </span>
                    <Link
                        to="/skill-tree"
                        className="whitespace-nowrap text-xs hover:underline"
                        style={{ color: FANTASY.goldLink }}
                    >
                        Enter tree →
                    </Link>
                </div>
            </div>

            <TalentSlab className="justify-center overflow-x-auto">
                <div className="relative mx-auto" style={{ width, height: HEIGHT }}>
                    <svg
                        className="pointer-events-none absolute inset-0"
                        width={width}
                        height={HEIGHT}
                    >
                        {domains.map((domain, i) => (
                            <Conduit
                                key={domain.id}
                                px={trunkX}
                                py={Y_TRUNK - TRUNK / 2}
                                cx={xOf(i)}
                                cy={Y_DOMAIN + DOMAIN / 2}
                                active={domain.mastery !== 'locked'}
                            />
                        ))}
                        {extraDomains > 0 && (
                            <Conduit
                                px={trunkX}
                                py={Y_TRUNK - TRUNK / 2}
                                cx={xOf(domains.length)}
                                cy={Y_DOMAIN + DOMAIN / 2}
                                active={false}
                            />
                        )}
                    </svg>

                    {/* Domains (first level) */}
                    {domains.map((domain, i) => (
                        <TreeNode
                            key={domain.id}
                            x={xOf(i)}
                            y={Y_DOMAIN}
                            size={DOMAIN}
                            metal={MASTERY_METAL[domain.mastery]}
                            icon={domain.icon}
                            name={domain.name}
                            badge={badgeFor(domain.mastery)}
                            dim={domain.mastery === 'locked'}
                            pulse={domain.mastery === 'learning'}
                            dots={childrenOf(domain.id)
                                .slice(0, MAX_DOTS)
                                .map((c) => pipState(c.mastery))}
                        />
                    ))}

                    {/* "+k more branches" ghost domain */}
                    {extraDomains > 0 && (
                        <TreeNode
                            x={xOf(domains.length)}
                            y={Y_DOMAIN}
                            size={DOMAIN}
                            metal="iron"
                            icon={`+${extraDomains}`}
                            name="more"
                            dim
                            faint
                        />
                    )}

                    {/* Trunk (bottom) */}
                    <TreeNode
                        x={trunkX}
                        y={Y_TRUNK}
                        size={TRUNK}
                        metal={MASTERY_METAL[root.mastery]}
                        icon={root.icon}
                        name={root.name}
                        badge={badgeFor(root.mastery)}
                        dim={root.mastery === 'locked'}
                        pulse={root.mastery === 'learning'}
                    />
                </div>
            </TalentSlab>
        </Card>
    )
}

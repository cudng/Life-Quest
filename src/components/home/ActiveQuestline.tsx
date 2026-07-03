import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { FANTASY, Medallion, TalentSlab, type Metal } from '@/components/ui/talent'
import { useTracks, useStages, useMilestones } from '@/data/queries'
import type { Milestone, Stage } from '@/data/types'

type StageStatus = 'done' | 'active' | 'locked'

interface QuestNode {
    id: string
    name: string
    status: StageStatus
    xp: number
}

const STATUS_GLYPH: Record<StageStatus, string> = {
    done: '✓',
    active: '▶',
    locked: '🔒',
}

const STATUS_METAL: Record<StageStatus, Metal> = {
    done: 'gold',
    active: 'ember',
    locked: 'iron',
}

/** milestones grouped by stage id */
function groupByStage(milestones: Milestone[]): Map<string, Milestone[]> {
    const map = new Map<string, Milestone[]>()
    for (const m of milestones) {
        const list = map.get(m.stage_id)
        if (list) list.push(m)
        else map.set(m.stage_id, [m])
    }
    return map
}

/** Derive node statuses for a track's stages: done up to the first unfinished, then locked. */
function buildNodes(
    stages: Stage[],
    byStage: Map<string, Milestone[]>,
): { nodes: QuestNode[]; activeIndex: number } {
    const done = stages.map((s) => {
        const ms = byStage.get(s.id) ?? []
        return ms.length > 0 && ms.every((m) => m.completed)
    })
    const activeIndex = done.findIndex((d) => !d)
    const nodes = stages.map((s, i) => {
        const xp = (byStage.get(s.id) ?? []).reduce((sum, m) => sum + m.xp, 0)
        const status: StageStatus =
            done[i] || (activeIndex !== -1 && i < activeIndex)
                ? 'done'
                : i === activeIndex
                  ? 'active'
                  : 'locked'
        return { id: s.id, name: s.title, status, xp }
    })
    return { nodes, activeIndex }
}

// Timeline geometry (px). Nodes are evenly spaced along one horizontal conduit.
const NODE = 46
const SLOT = 96
const PAD_X = 16
const CY = 29 // node center y — the connecting line runs through here
const MAP_H = 100

/** A stage node placed at (x, CY): medallion + title + XP, label below. */
function StageNode({ x, node }: { x: number; node: QuestNode }) {
    return (
        <div
            className="absolute flex flex-col items-center gap-1"
            style={{ left: x - SLOT / 2, top: CY - NODE / 2, width: SLOT }}
        >
            <Medallion
                metal={STATUS_METAL[node.status]}
                size={NODE}
                pulse={node.status === 'active'}
                dim={node.status === 'locked'}
            >
                {STATUS_GLYPH[node.status]}
            </Medallion>
            <div
                className="w-full truncate px-1 text-center font-serif text-[11px] font-semibold leading-tight tracking-wide"
                style={{
                    color: node.status === 'locked' ? FANTASY.goldFaint : FANTASY.goldText,
                    textShadow: '0 1px 2px rgba(0,0,0,.6)',
                }}
            >
                {node.name}
            </div>
            <div
                className="font-mono text-[9px] tracking-wide"
                style={{
                    color:
                        node.status === 'active'
                            ? FANTASY.emberText
                            : node.status === 'done'
                              ? FANTASY.goldDim
                              : FANTASY.goldFaint,
                }}
            >
                {node.status === 'locked' ? `${node.xp} XP` : `+${node.xp}`}
            </div>
        </div>
    )
}

export function ActiveQuestline() {
    const tracks = useTracks()
    const stages = useStages()
    const milestones = useMilestones()
    const [selected, setSelected] = useState<string | null>(null)

    const byStage = useMemo(
        () => groupByStage(milestones.data ?? []),
        [milestones.data],
    )

    // Default to the first track that still has an unfinished milestone.
    const defaultTrackId = useMemo(() => {
        const list = tracks.data ?? []
        for (const t of list) {
            const trackStages = (stages.data ?? []).filter((s) => s.track_id === t.id)
            const hasOpen = trackStages.some((s) =>
                (byStage.get(s.id) ?? []).some((m) => !m.completed),
            )
            if (hasOpen) return t.id
        }
        return list[0]?.id ?? null
    }, [tracks.data, stages.data, byStage])

    const trackId = selected ?? defaultTrackId

    const model = useMemo(() => {
        if (!trackId) return null
        const trackStages = (stages.data ?? [])
            .filter((s) => s.track_id === trackId)
            .sort((a, b) => a.position - b.position)
        const { nodes, activeIndex } = buildNodes(trackStages, byStage)

        // Current objective: first incomplete milestone at/after the active stage.
        const startIdx = activeIndex === -1 ? trackStages.length : activeIndex
        let objective: Milestone | null = null
        for (let i = startIdx; i < trackStages.length && !objective; i++) {
            objective =
                (byStage.get(trackStages[i].id) ?? []).find((m) => !m.completed) ?? null
        }
        return { nodes, objective }
    }, [trackId, stages.data, byStage])

    if (!tracks.data || !stages.data || !milestones.data || !trackId || !model) {
        return null
    }

    const track = tracks.data.find((t) => t.id === trackId)

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-[18px] !py-4 ring-1 ring-q-border">
            {/* header row */}
            <div className="mb-2 flex items-center justify-between gap-3">
                <span
                    className="font-mono text-[10px] tracking-[0.18em]"
                    style={{ color: FANTASY.eyebrow }}
                >
                    ROADMAP
                </span>
                <Link
                    to="/roadmap"
                    className="shrink-0 whitespace-nowrap text-xs hover:underline"
                    style={{ color: FANTASY.goldLink }}
                >
                    Roadmap →
                </Link>
            </div>

            {/* track chips: full-width, horizontally scrollable (wheel-enabled) */}
            <div
                onWheel={(e) => {
                    if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY
                }}
                className="mb-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex w-max items-center gap-1.5">
                    {tracks.data.map((t) => {
                        const on = t.id === trackId
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelected(t.id)}
                                className="inline-flex h-[22px] shrink-0 items-center whitespace-nowrap rounded-full px-[11px] text-[11px] font-medium leading-none transition-colors"
                                style={
                                    on
                                        ? {
                                              color: '#1a1105',
                                              background:
                                                  'linear-gradient(150deg,#ffe7a6,#c9922f)',
                                          }
                                        : {
                                              color: FANTASY.goldDim,
                                              boxShadow:
                                                  'inset 0 0 0 1px rgba(160,120,50,.3)',
                                          }
                                }
                            >
                                {t.title}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="mb-3 font-serif text-[15px] font-semibold text-q-fg">
                {track?.title}
            </div>

            {/* node map — evenly-spaced stages on one connected conduit */}
            {(() => {
                const nodes = model.nodes
                const xOf = (i: number) => PAD_X + i * SLOT + SLOT / 2
                const width = PAD_X * 2 + Math.max(nodes.length, 1) * SLOT
                return (
                    <TalentSlab className="justify-center overflow-x-auto">
                        <div
                            className="relative mx-auto"
                            style={{ width, height: MAP_H }}
                        >
                            <svg
                                className="pointer-events-none absolute inset-0"
                                width={width}
                                height={MAP_H}
                            >
                                {nodes.slice(0, -1).map((n, i) => {
                                    const done = n.status === 'done'
                                    const color = done ? '#d9a341' : '#3a3a42'
                                    const glow = done
                                        ? {
                                              filter: 'drop-shadow(0 0 3px rgba(224,168,72,.6))',
                                          }
                                        : undefined
                                    // Arrowhead just before the next node, pointing forward.
                                    const ax = xOf(i + 1) - NODE / 2 - 6
                                    return (
                                        <g key={n.id}>
                                            <line
                                                x1={xOf(i)}
                                                y1={CY}
                                                x2={xOf(i + 1)}
                                                y2={CY}
                                                strokeLinecap="round"
                                                stroke={color}
                                                strokeWidth={done ? 3 : 2}
                                                strokeDasharray={done ? undefined : '1 7'}
                                                style={glow}
                                            />
                                            <path
                                                d={`M ${ax - 5} ${CY - 4} L ${ax} ${CY} L ${ax - 5} ${CY + 4}`}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={glow}
                                            />
                                        </g>
                                    )
                                })}
                            </svg>
                            {nodes.map((n, i) => (
                                <StageNode key={n.id} x={xOf(i)} node={n} />
                            ))}
                        </div>
                    </TalentSlab>
                )
            })()}

            {/* current objective footer */}
            {model.objective && (
                <div
                    className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-3"
                    style={{
                        background:
                            'radial-gradient(130% 130% at 0% 0%, rgba(219,95,16,.14), rgba(20,14,8,.9))',
                        boxShadow: 'inset 0 0 0 1px rgba(217,120,40,.28)',
                    }}
                >
                    <Medallion metal="ember" pulse size={34}>
                        ▶
                    </Medallion>
                    <div className="min-w-0 flex-1">
                        <div
                            className="font-mono text-[9px] tracking-[0.14em]"
                            style={{ color: FANTASY.goldDim }}
                        >
                            CURRENT OBJECTIVE
                        </div>
                        <div
                            className="mt-0.5 truncate font-serif text-[13.5px] font-medium"
                            style={{ color: FANTASY.goldText }}
                        >
                            {model.objective.title}
                        </div>
                    </div>
                    <span
                        className="shrink-0 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                        style={{
                            color: '#1a1105',
                            background: 'linear-gradient(150deg,#ffe7a6,#c9922f)',
                        }}
                    >
                        +{model.objective.xp} XP
                    </span>
                </div>
            )}
        </Card>
    )
}

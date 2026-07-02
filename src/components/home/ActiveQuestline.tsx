import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useTracks, useStages, useMilestones } from '@/data/queries'
import type { Milestone, Stage } from '@/data/types'

type StageStatus = 'done' | 'active' | 'locked'

interface QuestNode {
    id: string
    name: string
    status: StageStatus
    xp: number
}

const STATUS_ICON: Record<StageStatus, string> = {
    done: '✓',
    active: '▶',
    locked: '🔒',
}

const NODE_CLASS: Record<StageStatus, string> = {
    done: 'border border-q-accent bg-q-accent/[.18] shadow-[0_0_10px_rgba(99,102,241,.4)]',
    active: 'border-[1.5px] border-q-accent-bright bg-q-accent-bright/[.18]',
    locked: 'border border-q-border-strong bg-q-panel-locked',
}

const LABEL_CLASS: Record<StageStatus, string> = {
    done: 'text-q-muted',
    active: 'text-q-fg',
    locked: 'text-q-faint',
}

const XP_CLASS: Record<StageStatus, string> = {
    done: 'text-q-accent',
    active: 'text-q-accent-bright',
    locked: 'text-q-faint',
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

function StageNode({ node, last }: { node: QuestNode; last: boolean }) {
    const connClass =
        node.status === 'done'
            ? 'bg-q-accent'
            : node.status === 'active'
              ? 'bg-gradient-to-r from-q-accent-bright to-q-line'
              : 'bg-q-track'
    return (
        <>
            <div className="dq-node flex w-[62px] shrink-0 cursor-default flex-col items-center gap-2.5 transition-transform">
                <div
                    className={`flex size-[46px] items-center justify-center rounded-[13px] text-[17px] ${NODE_CLASS[node.status]}`}
                    style={node.status === 'active' ? { animation: 'dq-pulse 2.2s infinite' } : undefined}
                >
                    {STATUS_ICON[node.status]}
                </div>
                <div className="text-center">
                    <div
                        className={`whitespace-nowrap text-[11px] font-medium leading-tight ${LABEL_CLASS[node.status]}`}
                    >
                        {node.name}
                    </div>
                    <div className={`mt-0.5 font-mono text-[9.5px] ${XP_CLASS[node.status]}`}>
                        {node.status === 'locked' ? `${node.xp} XP` : `+${node.xp}`}
                    </div>
                </div>
            </div>
            {!last && <div className={`mt-[22px] h-0.5 min-w-2 flex-1 ${connClass}`} />}
        </>
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

        const allMs = trackStages.flatMap((s) => byStage.get(s.id) ?? [])
        const percent =
            allMs.length === 0
                ? 0
                : Math.round(
                      (allMs.filter((m) => m.completed).length / allMs.length) * 100,
                  )

        // Current objective: first incomplete milestone at/after the active stage.
        const startIdx = activeIndex === -1 ? trackStages.length : activeIndex
        let objective: Milestone | null = null
        for (let i = startIdx; i < trackStages.length && !objective; i++) {
            objective =
                (byStage.get(trackStages[i].id) ?? []).find((m) => !m.completed) ?? null
        }
        return { nodes, percent, objective }
    }, [trackId, stages.data, byStage])

    if (!tracks.data || !stages.data || !milestones.data || !trackId || !model) {
        return null
    }

    const track = tracks.data.find((t) => t.id === trackId)

    return (
        <Card className="relative gap-0 overflow-hidden rounded-2xl border-0 bg-q-panel px-5 !py-[18px] ring-1 ring-q-border">
            {/* header row */}
            <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-q-accent">
                        ACTIVE QUESTLINE
                    </span>
                    <span className="rounded-full bg-q-accent/[.12] px-2 py-0.5 font-mono text-[10.5px] text-q-accent-bright">
                        {model.percent}%
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {tracks.data.map((t) => {
                        const on = t.id === trackId
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelected(t.id)}
                                className={
                                    on
                                        ? 'rounded-full border border-q-accent-bright/40 bg-q-accent/[.16] px-[11px] py-[3px] text-[11px] font-medium text-q-accent-fg'
                                        : 'rounded-full border border-q-border px-[11px] py-[3px] text-[11px] text-q-muted transition-colors hover:text-q-fg'
                                }
                            >
                                {t.title}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="mb-[22px] text-[17px] font-semibold text-q-fg">
                {track?.title}
            </div>

            {/* node map */}
            <div className="flex items-start px-0.5">
                {model.nodes.map((n, i) => (
                    <StageNode key={n.id} node={n} last={i === model.nodes.length - 1} />
                ))}
            </div>

            {/* current objective footer */}
            {model.objective && (
                <div className="mt-[22px] flex items-center gap-3 rounded-xl border border-q-accent-bright/30 bg-gradient-to-br from-q-accent/[.14] to-q-accent/[.03] px-3.5 py-3">
                    <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] border border-q-accent-bright bg-q-accent-bright/20 text-[13px]">
                        ▶
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-mono text-[9px] tracking-[0.12em] text-q-dim">
                            CURRENT OBJECTIVE
                        </div>
                        <div className="mt-0.5 truncate text-[13.5px] font-medium text-q-fg">
                            {model.objective.title}
                        </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-q-accent/[.16] px-2.5 py-1.5 font-mono text-xs text-q-accent-fg">
                        +{model.objective.xp} XP
                    </span>
                </div>
            )}
        </Card>
    )
}

import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { useTracks, useStages, useMilestones } from '@/data/queries'
import { buildRoadmapFlow } from '@/engine/roadmapLayout'
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas'
import { MilestoneDetail } from '@/components/roadmap/MilestoneDetail'
import { AddMilestoneForm } from '@/components/roadmap/AddMilestoneForm'
import { AddStageForm } from '@/components/roadmap/AddStageForm'
import { AddTrackForm } from '@/components/roadmap/AddTrackForm'
import { useAchievementSync } from '@/data/useAchievementSync'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { fireConfetti } from '@/lib/reward'

export const Route = createFileRoute('/roadmap')({
    component: Roadmap,
})

function Roadmap() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const tracks = useTracks()
    const stages = useStages()
    const milestones = useMilestones()

    // Completing a milestone here can unlock achievements — celebrate them.
    useAchievementSync(snapshot, fireConfetti)

    const isAdmin = useIsAdmin()
    const [trackId, setTrackId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [addPanel, setAddPanel] = useState<'none' | 'milestone' | 'stage' | 'track'>(
        'none',
    )

    const allTracks = tracks.data ?? []
    const activeTrackId = trackId ?? allTracks[0]?.id ?? null

    const completedSet = useMemo(
        () => new Set(snapshot?.completedNodeIds ?? []),
        [snapshot],
    )

    const trackStages = useMemo(
        () => (stages.data ?? []).filter((s) => s.track_id === activeTrackId),
        [stages.data, activeTrackId],
    )

    const { nodes, edges } = useMemo(
        () => buildRoadmapFlow(trackStages, milestones.data ?? [], completedSet),
        [trackStages, milestones.data, completedSet],
    )

    if (isLoading) {
        return <div className="p-6 text-muted-foreground">Loading…</div>
    }
    if (isError || !snapshot) {
        return (
            <div className="p-6 text-destructive">
                Failed to load: {error?.message ?? 'unknown error'}
            </div>
        )
    }
    const selectedNode = nodes.find((n) => n.id === selectedId)
    const trackMilestones = nodes.map((n) => n.data.milestone)
    const existingMilestoneIds = new Set((milestones.data ?? []).map((m) => m.id))
    const existingTrackIds = new Set(allTracks.map((t) => t.id))
    const existingStageIds = new Set((stages.data ?? []).map((s) => s.id))
    const nextTrackPosition =
        allTracks.reduce((max, t) => Math.max(max, t.position), -1) + 1
    const nextStagePosition =
        trackStages.reduce((max, s) => Math.max(max, s.position), -1) + 1

    const switchTrack = (id: string) => {
        setTrackId(id)
        setSelectedId(null)
        setAddPanel('none')
    }

    // Selecting a node and the add forms share the right panel — keep exclusive.
    const selectNode = (id: string | null) => {
        setSelectedId(id)
        if (id) setAddPanel('none')
    }

    const openPanel = (kind: 'milestone' | 'stage' | 'track') => {
        setAddPanel(kind)
        setSelectedId(null)
    }

    return (
        <div className="flex h-[calc(100svh-64px)] flex-col p-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
                {allTracks.map((t) => {
                    const active = t.id === activeTrackId
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => switchTrack(t.id)}
                            className={
                                active
                                    ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground'
                                    : 'rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary'
                            }
                        >
                            {t.icon ? `${t.icon} ` : ''}
                            {t.title}
                        </button>
                    )
                })}

                {isAdmin && (
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openPanel('track')}
                            className="rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
                        >
                            ＋ Track
                        </button>
                        <button
                            type="button"
                            disabled={!activeTrackId}
                            onClick={() => openPanel('stage')}
                            className="rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            ＋ Stage
                        </button>
                        <button
                            type="button"
                            disabled={!activeTrackId}
                            onClick={() => openPanel('milestone')}
                            className="rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            ＋ Milestone
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border">
                <div className="min-w-0 flex-1">
                    {nodes.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            {allTracks.length === 0
                                ? 'No tracks yet.'
                                : 'No milestones in this track yet.'}
                        </div>
                    ) : (
                        <RoadmapCanvas
                            nodes={nodes}
                            edges={edges}
                            onSelect={selectNode}
                        />
                    )}
                </div>

                {addPanel === 'milestone' && activeTrackId && (
                    <div className="w-80 shrink-0">
                        <AddMilestoneForm
                            stages={trackStages}
                            trackMilestones={trackMilestones}
                            existingIds={existingMilestoneIds}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'stage' && activeTrackId && (
                    <div className="w-80 shrink-0">
                        <AddStageForm
                            trackId={activeTrackId}
                            existingIds={existingStageIds}
                            nextPosition={nextStagePosition}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'track' && (
                    <div className="w-80 shrink-0">
                        <AddTrackForm
                            existingIds={existingTrackIds}
                            nextPosition={nextTrackPosition}
                            onCreated={(id) => {
                                setTrackId(id)
                                setAddPanel('none')
                            }}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'none' && selectedNode && (
                    <div className="w-80 shrink-0">
                        <MilestoneDetail
                            key={selectedNode.id}
                            milestone={selectedNode.data.milestone}
                            status={selectedNode.data.status}
                            trackMilestones={trackMilestones}
                            onClose={() => setSelectedId(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

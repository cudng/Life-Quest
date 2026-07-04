import { useCallback, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { useTracks, usePaths, useStages, useMilestones } from '@/data/queries'
import { useDeleteTrack } from '@/data/mutations'
import { buildRoadmapFlow } from '@/engine/roadmapLayout'
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas'
import { MilestoneDetail } from '@/components/roadmap/MilestoneDetail'
import { AddMilestoneForm } from '@/components/roadmap/AddMilestoneForm'
import { AddStageForm } from '@/components/roadmap/AddStageForm'
import { EditStageForm } from '@/components/roadmap/EditStageForm'
import { AddTrackForm } from '@/components/roadmap/AddTrackForm'
import { EditTrackForm } from '@/components/roadmap/EditTrackForm'
import { AddPathForm } from '@/components/roadmap/AddPathForm'
import { EditPathForm } from '@/components/roadmap/EditPathForm'
import { FANTASY, Medallion } from '@/components/ui/talent'
import { useIsAdmin } from '@/auth/useIsAdmin'

export const Route = createFileRoute('/roadmap')({
    component: Roadmap,
})

type Panel =
    | 'none'
    | 'milestone'
    | 'stage'
    | 'edit-stage'
    | 'track'
    | 'edit-track'
    | 'path'
    | 'edit-path'

function Roadmap() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const tracks = useTracks()
    const paths = usePaths()
    const stages = useStages()
    const milestones = useMilestones()

    const isAdmin = useIsAdmin()
    const deleteTrack = useDeleteTrack()
    const [trackId, setTrackId] = useState<string | null>(null)
    const [pathId, setPathId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [editStageId, setEditStageId] = useState<string | null>(null)
    const [confirmDeleteTrack, setConfirmDeleteTrack] = useState(false)
    const [addPanel, setAddPanel] = useState<Panel>('none')

    const allTracks = tracks.data ?? []
    const activeTrackId = trackId ?? allTracks[0]?.id ?? null
    const activeTrack = allTracks.find((t) => t.id === activeTrackId) ?? null

    const trackPaths = useMemo(
        () => (paths.data ?? []).filter((p) => p.track_id === activeTrackId),
        [paths.data, activeTrackId],
    )
    const activePathId = pathId ?? trackPaths[0]?.id ?? null
    const activePath = trackPaths.find((p) => p.id === activePathId) ?? null

    const completedSet = useMemo(
        () => new Set(snapshot?.completedNodeIds ?? []),
        [snapshot],
    )

    const pathStages = useMemo(
        () => (stages.data ?? []).filter((s) => s.path_id === activePathId),
        [stages.data, activePathId],
    )

    const { nodes, stageNodes, edges } = useMemo(
        () => buildRoadmapFlow(pathStages, milestones.data ?? [], completedSet),
        [pathStages, milestones.data, completedSet],
    )

    const openStageEditor = useCallback((stageId: string) => {
        setEditStageId(stageId)
        setAddPanel('edit-stage')
        setSelectedId(null)
        setConfirmDeleteTrack(false)
    }, [])

    if (isLoading) {
        return (
            <div
                className="p-6 font-mono text-sm tracking-wide"
                style={{ color: FANTASY.goldDim }}
            >
                Charting the journey…
            </div>
        )
    }
    if (isError || !snapshot) {
        return (
            <div className="p-6 font-mono text-sm text-destructive">
                Failed to load: {error?.message ?? 'unknown error'}
            </div>
        )
    }
    const selectedNode = nodes.find((n) => n.id === selectedId)
    const editingStage = (stages.data ?? []).find((s) => s.id === editStageId) ?? null
    const trackMilestones = nodes.map((n) => n.data.milestone)
    const existingMilestoneIds = new Set((milestones.data ?? []).map((m) => m.id))
    const existingTrackIds = new Set(allTracks.map((t) => t.id))
    const existingPathIds = new Set((paths.data ?? []).map((p) => p.id))
    const existingStageIds = new Set((stages.data ?? []).map((s) => s.id))
    const nextTrackPosition =
        allTracks.reduce((max, t) => Math.max(max, t.position), -1) + 1
    const nextPathPosition =
        trackPaths.reduce((max, p) => Math.max(max, p.position), -1) + 1
    const nextStagePosition =
        pathStages.reduce((max, s) => Math.max(max, s.position), -1) + 1

    const switchTrack = (id: string) => {
        setTrackId(id)
        setPathId(null)
        setSelectedId(null)
        setAddPanel('none')
        setConfirmDeleteTrack(false)
    }

    const switchPath = (id: string) => {
        setPathId(id)
        setSelectedId(null)
        setAddPanel('none')
        setConfirmDeleteTrack(false)
    }

    const removeActiveTrack = () => {
        if (!activeTrack) return
        deleteTrack.mutate(activeTrack.id, {
            onSuccess: () => {
                setTrackId(null)
                setPathId(null)
                setSelectedId(null)
                setAddPanel('none')
                setConfirmDeleteTrack(false)
            },
        })
    }

    // Selecting a node and the add forms share the right panel — keep exclusive.
    const selectNode = (id: string | null) => {
        setSelectedId(id)
        if (id) setAddPanel('none')
    }

    const openPanel = (kind: Panel) => {
        setAddPanel(kind)
        setSelectedId(null)
        setConfirmDeleteTrack(false)
    }

    return (
        <div className="flex h-[calc(100svh-64px)] flex-col p-4 text-left">
            <div className="flex items-center gap-2.5">
                <Medallion metal="gold" size={34}>
                    ⚑
                </Medallion>
                <div className="leading-tight">
                    <p
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        Journey
                    </p>
                    <h1
                        className="font-serif font-semibold leading-tight"
                        style={{
                            color: FANTASY.goldText,
                            textShadow: '0 1px 2px rgba(0,0,0,.6)',
                            fontSize: '2rem',
                        }}
                    >
                        Roadmap
                    </h1>
                </div>

                {isAdmin && (
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openPanel('track')}
                            className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70"
                            style={{ color: FANTASY.emberText }}
                        >
                            ＋ Track
                        </button>
                        <button
                            type="button"
                            disabled={!activeTrackId}
                            onClick={() => openPanel('path')}
                            className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70 disabled:opacity-50"
                            style={{ color: FANTASY.emberText }}
                        >
                            ＋ Path
                        </button>
                        <button
                            type="button"
                            disabled={!activePathId}
                            onClick={() => openPanel('stage')}
                            className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70 disabled:opacity-50"
                            style={{ color: FANTASY.emberText }}
                        >
                            ＋ Stage
                        </button>
                        <button
                            type="button"
                            disabled={pathStages.length === 0}
                            onClick={() => openPanel('milestone')}
                            className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70 disabled:opacity-50"
                            style={{ color: FANTASY.emberText }}
                        >
                            ＋ Milestone
                        </button>
                    </div>
                )}
            </div>

            {allTracks.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {allTracks.map((t) => {
                        const active = t.id === activeTrackId
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => switchTrack(t.id)}
                                className={
                                    active
                                        ? 'rounded-md border border-[#db5f10]/55 bg-linear-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider'
                                        : 'rounded-md border border-[#4c4c55]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#4c4c55]/70'
                                }
                                style={{
                                    color: active
                                        ? FANTASY.emberText
                                        : FANTASY.goldDim,
                                }}
                            >
                                {t.icon ? `${t.icon} ` : ''}
                                {t.title}
                            </button>
                        )
                    })}

                    {isAdmin && activeTrack && (
                        <div className="ml-auto flex items-center gap-2">
                            {confirmDeleteTrack ? (
                                <>
                                    <span
                                        className="font-mono text-xs"
                                        style={{ color: FANTASY.goldDim }}
                                    >
                                        Delete “{activeTrack.title}” and all its paths?
                                    </span>
                                    <button
                                        type="button"
                                        disabled={deleteTrack.isPending}
                                        onClick={removeActiveTrack}
                                        className="rounded-md border border-destructive/60 bg-linear-to-b from-[#2a1010] to-[#160808] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive disabled:opacity-50"
                                    >
                                        {deleteTrack.isPending
                                            ? 'Deleting…'
                                            : 'Confirm'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteTrack(false)}
                                        className="rounded-md border border-[#4c4c55]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#4c4c55]/70"
                                        style={{ color: FANTASY.goldDim }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => openPanel('edit-track')}
                                        aria-label="Edit track"
                                        className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70"
                                        style={{ color: FANTASY.emberText }}
                                    >
                                        ✎
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteTrack(true)}
                                        aria-label="Delete track"
                                        className="rounded-md border border-destructive/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive/70"
                                    >
                                        🗑
                                    </button>
                                </>
                            )}
                            {deleteTrack.isError && (
                                <span className="font-mono text-xs text-destructive">
                                    {deleteTrack.error?.message ??
                                        'Failed to delete track'}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTrack && trackPaths.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                    <span
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        Path
                    </span>
                    <select
                        value={activePathId ?? ''}
                        onChange={(e) => switchPath(e.target.value)}
                        className="rounded-md border border-[#a07832]/35 bg-[#100c08] px-2.5 py-1.5 font-mono text-xs tracking-wider outline-none transition-colors focus:border-[#db5f10]/60"
                        style={{ color: FANTASY.goldText }}
                    >
                        {trackPaths.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.icon ? `${p.icon} ` : ''}
                                {p.title}
                            </option>
                        ))}
                    </select>
                    {isAdmin && activePath && (
                        <button
                            type="button"
                            onClick={() => openPanel('edit-path')}
                            aria-label="Edit path"
                            className="rounded-md border border-[#db5f10]/40 bg-linear-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70"
                            style={{ color: FANTASY.emberText }}
                        >
                            ✎
                        </button>
                    )}
                </div>
            )}

            <div
                className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl"
                style={{
                    background: '#0a0705',
                    boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.25)',
                }}
            >
                <div className="min-w-0 flex-1">
                    {nodes.length === 0 && stageNodes.length === 0 ? (
                        <div
                            className="flex h-full items-center justify-center font-serif text-sm"
                            style={{ color: FANTASY.goldFaint }}
                        >
                            {allTracks.length === 0
                                ? 'No tracks charted yet.'
                                : trackPaths.length === 0
                                  ? 'No paths on this track yet.'
                                  : 'No stages on this path yet.'}
                        </div>
                    ) : (
                        <RoadmapCanvas
                            nodes={nodes}
                            stageNodes={stageNodes}
                            edges={edges}
                            onSelect={selectNode}
                            isAdmin={isAdmin}
                            onEditStage={openStageEditor}
                        />
                    )}
                </div>

                {addPanel === 'milestone' && activePathId && (
                    <div className="w-80 shrink-0">
                        <AddMilestoneForm
                            stages={pathStages}
                            trackMilestones={trackMilestones}
                            existingIds={existingMilestoneIds}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'stage' && activePathId && (
                    <div className="w-80 shrink-0">
                        <AddStageForm
                            pathId={activePathId}
                            existingIds={existingStageIds}
                            nextPosition={nextStagePosition}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'edit-stage' && editingStage && (
                    <div className="w-80 shrink-0">
                        <EditStageForm
                            key={editingStage.id}
                            stage={editingStage}
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
                                setPathId(null)
                                setAddPanel('none')
                            }}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'edit-track' && activeTrack && (
                    <div className="w-80 shrink-0">
                        <EditTrackForm
                            key={activeTrack.id}
                            track={activeTrack}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'path' && activeTrackId && (
                    <div className="w-80 shrink-0">
                        <AddPathForm
                            trackId={activeTrackId}
                            existingIds={existingPathIds}
                            nextPosition={nextPathPosition}
                            onCreated={(id) => {
                                setPathId(id)
                                setAddPanel('none')
                            }}
                            onClose={() => setAddPanel('none')}
                        />
                    </div>
                )}

                {addPanel === 'edit-path' && activePath && (
                    <div className="w-80 shrink-0">
                        <EditPathForm
                            key={activePath.id}
                            path={activePath}
                            onClose={() => setAddPanel('none')}
                            onDeleted={() => {
                                setPathId(null)
                                setAddPanel('none')
                            }}
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

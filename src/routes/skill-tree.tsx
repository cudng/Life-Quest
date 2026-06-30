import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { useSkills } from '@/data/queries'
import { buildSkillFlow } from '@/engine/skillTree'
import { SkillCanvas } from '@/components/skill-tree/SkillCanvas'
import { SkillDetail } from '@/components/skill-tree/SkillDetail'
import { AddSkillForm } from '@/components/skill-tree/AddSkillForm'
import { useIsAdmin } from '@/auth/useIsAdmin'

export const Route = createFileRoute('/skill-tree')({
    component: SkillTree,
})

function SkillTree() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const skills = useSkills()

    const isAdmin = useIsAdmin()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [adding, setAdding] = useState(false)

    const allSkills = skills.data ?? []

    const { nodes, edges } = useMemo(
        () => buildSkillFlow(allSkills),
        [allSkills],
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

    // Selecting a node and the add form share the right panel — keep exclusive.
    const selectNode = (id: string | null) => {
        setSelectedId(id)
        if (id) setAdding(false)
    }

    const openAdd = () => {
        setAdding(true)
        setSelectedId(null)
    }

    return (
        <div className="flex h-[calc(100svh-64px)] flex-col p-4 text-left">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">Skill Tree</h1>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="ml-auto rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
                    >
                        ＋ Skill
                    </button>
                )}
            </div>

            <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border">
                <div className="min-w-0 flex-1">
                    {nodes.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No skills yet.
                        </div>
                    ) : (
                        <SkillCanvas
                            nodes={nodes}
                            edges={edges}
                            onSelect={selectNode}
                        />
                    )}
                </div>

                {adding && (
                    <div className="w-80 shrink-0">
                        <AddSkillForm
                            allSkills={allSkills}
                            onClose={() => setAdding(false)}
                        />
                    </div>
                )}

                {!adding && selectedNode && (
                    <div className="w-80 shrink-0">
                        <SkillDetail
                            key={selectedNode.id}
                            skill={selectedNode.data.skill}
                            gated={selectedNode.data.gated}
                            allSkills={allSkills}
                            onClose={() => setSelectedId(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

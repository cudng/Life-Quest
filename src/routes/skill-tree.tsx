import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { useSkills } from '@/data/queries'
import { buildSkillFlow } from '@/engine/skillTree'
import { SkillCanvas } from '@/components/skill-tree/SkillCanvas'
import { SkillDetail } from '@/components/skill-tree/SkillDetail'
import { AddSkillForm } from '@/components/skill-tree/AddSkillForm'
import { FANTASY, Medallion } from '@/components/ui/talent'
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
        return (
            <div
                className="p-6 font-mono text-sm tracking-wide"
                style={{ color: FANTASY.goldDim }}
            >
                Forging the tree…
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
            <div className="flex items-center gap-2.5">
                <Medallion metal="gold" size={34}>
                    ❖
                </Medallion>
                <div className="leading-tight">
                    <p
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        Progression
                    </p>
                    <h1
                        className="font-serif text-base font-semibold leading-tight"
                        style={{
                            color: FANTASY.goldText,
                            textShadow: '0 1px 2px rgba(0,0,0,.6)',
                        }}
                    >
                        Skill Tree
                    </h1>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="ml-auto rounded-md border border-[#db5f10]/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70"
                        style={{ color: FANTASY.emberText }}
                    >
                        ＋ Skill
                    </button>
                )}
            </div>

            <div
                className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl"
                style={{
                    background: '#0a0705',
                    boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.25)',
                }}
            >
                <div className="min-w-0 flex-1">
                    {nodes.length === 0 ? (
                        <div
                            className="flex h-full items-center justify-center font-serif text-sm"
                            style={{ color: FANTASY.goldFaint }}
                        >
                            No skills forged yet.
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

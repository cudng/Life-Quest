import { Card } from '@/components/ui/card'
import { useSkills } from '@/data/queries'
import type { Mastery, Skill } from '@/data/types'

const CHILD_CLASS: Record<Mastery, string> = {
    expert: 'border border-q-accent bg-q-accent/[.14]',
    proficient: 'border border-q-accent bg-q-accent/[.14]',
    learning: 'border border-dashed border-q-accent-bright/40 bg-q-accent-bright/[.06]',
    locked: 'border border-q-border-strong bg-q-panel-locked opacity-55',
}

function MasteryDot({ mastery }: { mastery: Mastery }) {
    if (mastery === 'locked') return <span className="shrink-0 text-[11px]">🔒</span>
    if (mastery === 'expert')
        return (
            <span className="size-[7px] shrink-0 rounded-full bg-q-accent-bright shadow-[0_0_8px_var(--q-accent-bright)]" />
        )
    if (mastery === 'proficient')
        return <span className="size-[7px] shrink-0 rounded-full bg-q-accent" />
    return (
        <span className="size-[7px] shrink-0 rounded-full border border-dashed border-q-accent-bright" />
    )
}

function ChildPill({ skill }: { skill: Skill }) {
    return (
        <div className="flex items-center">
            <div className="h-0.5 w-1.5 shrink-0 bg-q-line" />
            <div
                className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-[9px] px-2 py-1.5 ${CHILD_CLASS[skill.mastery]}`}
            >
                <span className="text-xs">{skill.icon}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-q-fg">
                    {skill.name}
                </span>
                <MasteryDot mastery={skill.mastery} />
            </div>
        </div>
    )
}

function Branch({ root, items }: { root: Skill; items: Skill[] }) {
    const expert = root.mastery === 'expert'
    return (
        <div className="flex min-w-[200px] flex-1 items-center">
            <div
                className={`flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl ${
                    expert
                        ? 'border-[1.5px] border-q-accent-bright bg-q-accent/[.18] shadow-[0_0_14px_rgba(129,140,248,.5)]'
                        : 'border border-q-accent bg-q-accent/[.14]'
                }`}
            >
                <span className="text-base">{root.icon}</span>
                <span className="font-mono text-[7.5px] text-q-accent-fg">{root.name}</span>
            </div>
            <div className="h-0.5 w-2 shrink-0 bg-q-line" />
            <div className="my-3 w-0.5 shrink-0 self-stretch bg-q-line" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {items.map((c) => (
                    <ChildPill key={c.id} skill={c} />
                ))}
            </div>
        </div>
    )
}

export function SkillTreeSummary() {
    const skills = useSkills()
    if (!skills.data) return null

    const all = skills.data
    const roots = all
        .filter((s) => s.parent_id === null)
        .sort((a, b) => a.position - b.position)
    const childrenOf = (id: string) =>
        all.filter((s) => s.parent_id === id).sort((a, b) => a.position - b.position)

    const unlocked = all.filter((s) => s.mastery !== 'locked').length
    const learning = all.filter((s) => s.mastery === 'learning').length

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-[18px] !py-4 ring-1 ring-q-border">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-[5px] font-mono text-[10px] tracking-[0.1em] text-q-accent">
                        SKILL TREE
                    </div>
                    <div className="text-[15px] font-semibold text-q-fg">
                        {unlocked} of {all.length} skills unlocked
                    </div>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-q-accent/[.12] px-2.5 py-[3px] font-mono text-[11.5px] text-q-accent-bright">
                    {learning} learning
                </span>
            </div>

            <div className="flex flex-wrap items-stretch gap-x-3 gap-y-4">
                {roots.map((root) => (
                    <Branch key={root.id} root={root} items={childrenOf(root.id)} />
                ))}
            </div>
        </Card>
    )
}

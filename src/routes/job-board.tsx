import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { JobApplication, JobStatus } from '@/data/types'
import { useProgress } from '@/data/useProgress'
import { useJobApplications } from '@/data/queries'
import { JobCard } from '@/components/job-board/JobCard'
import { JobForm } from '@/components/job-board/JobForm'
import { FANTASY, Medallion } from '@/components/ui/talent'
import { useIsAdmin } from '@/auth/useIsAdmin'

export const Route = createFileRoute('/job-board')({
    component: JobBoard,
})

const COLUMNS: { status: JobStatus; label: string }[] = [
    { status: 'applied', label: 'Applied' },
    { status: 'screening', label: 'Screening' },
    { status: 'interview', label: 'Interview' },
    { status: 'offer', label: 'Offer' },
    { status: 'rejected', label: 'Rejected' },
    { status: 'ghosted', label: 'Ghosted' },
]

function JobBoard() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const jobs = useJobApplications()

    const isAdmin = useIsAdmin()
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<JobApplication | null>(null)

    if (isLoading) {
        return (
            <div
                className="p-6 font-mono text-sm tracking-wide"
                style={{ color: FANTASY.goldDim }}
            >
                Mustering the guild board…
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

    const apps = jobs.data ?? []

    // Editing a card and the add form share the right panel — keep exclusive.
    const openAdd = () => {
        setAdding(true)
        setEditing(null)
    }
    const openEdit = (app: JobApplication) => {
        setEditing(app)
        setAdding(false)
    }
    const closePanel = () => {
        setAdding(false)
        setEditing(null)
    }

    const panelOpen = adding || editing !== null

    return (
        <div className="flex h-[calc(100svh-64px)] flex-col p-4 text-left">
            <div className="flex items-center gap-2.5">
                <Medallion metal="gold" size={34}>
                    💼
                </Medallion>
                <div className="leading-tight">
                    <p
                        className="font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        Career
                    </p>
                    <h1
                        className="font-serif font-semibold leading-tight"
                        style={{
                            fontSize: '2rem',
                            margin: 0,
                            color: FANTASY.goldText,
                            textShadow: '0 1px 2px rgba(0,0,0,.6)',
                        }}
                    >
                        Job Board
                    </h1>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="ml-auto rounded-md border border-[#db5f10]/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70"
                        style={{ color: FANTASY.emberText }}
                    >
                        ＋ Application
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
                    {apps.length === 0 ? (
                        <div
                            className="flex h-full items-center justify-center font-serif text-sm"
                            style={{ color: FANTASY.goldFaint }}
                        >
                            No applications yet.
                        </div>
                    ) : (
                        <div className="flex h-full gap-3 p-4">
                            {COLUMNS.map((col) => {
                                const colApps = apps.filter(
                                    (a) => a.status === col.status,
                                )
                                return (
                                    <div
                                        key={col.status}
                                        className="flex min-w-0 flex-1 flex-col"
                                    >
                                        <div className="mb-2 flex items-center justify-between px-1 font-mono text-xs uppercase tracking-wider">
                                            <span style={{ color: FANTASY.goldText }}>
                                                {col.label}
                                            </span>
                                            <span style={{ color: FANTASY.goldDim }}>
                                                {colApps.length}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 overflow-y-auto">
                                            {colApps.map((a) => (
                                                <JobCard
                                                    key={a.id}
                                                    app={a}
                                                    onEdit={openEdit}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {panelOpen && (
                    <div className="w-80 shrink-0">
                        <JobForm
                            key={editing ? editing.id : 'new'}
                            app={editing ?? undefined}
                            onClose={closePanel}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

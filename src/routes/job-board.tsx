import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { JobApplication, JobStatus } from '@/data/types'
import { useProgress } from '@/data/useProgress'
import { useJobApplications } from '@/data/queries'
import { JobCard } from '@/components/job-board/JobCard'
import { JobForm } from '@/components/job-board/JobForm'
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
        return <div className="p-6 text-muted-foreground">Loading…</div>
    }
    if (isError || !snapshot) {
        return (
            <div className="p-6 text-destructive">
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
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">Job Board</h1>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={openAdd}
                        className="ml-auto rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
                    >
                        ＋ Application
                    </button>
                )}
            </div>

            <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border">
                <div className="min-w-0 flex-1 overflow-x-auto">
                    {apps.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No applications yet.
                        </div>
                    ) : (
                        <div className="flex h-full gap-4 p-4">
                            {COLUMNS.map((col) => {
                                const colApps = apps.filter(
                                    (a) => a.status === col.status,
                                )
                                return (
                                    <div
                                        key={col.status}
                                        className="flex w-64 shrink-0 flex-col"
                                    >
                                        <div className="mb-2 flex items-center justify-between px-1 text-sm font-semibold text-foreground">
                                            <span>{col.label}</span>
                                            <span className="text-muted-foreground">
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

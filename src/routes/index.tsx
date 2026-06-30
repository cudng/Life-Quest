import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { getLevelProgress, getCompletionPercent } from '@/engine/progress'
import { useMilestones } from '@/data/queries'
import { XpBar } from '@/components/XpBar'
import { DailyQuests } from '@/components/DailyQuests'
import { RecentAchievements } from '@/components/RecentAchievements'
import { Teasers } from '@/components/Teasers'
import { localToday } from '@/lib/date'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const milestones = useMilestones()

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

    const progress = getLevelProgress(snapshot)
    const completion = getCompletionPercent(milestones.data ?? [])
    const today = localToday()

    return (
        <div className="mx-auto max-w-3xl p-6 text-left">
            <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Level
                        </div>
                        <div className="text-4xl font-semibold text-foreground">
                            {progress.level}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Total XP
                        </div>
                        <div className="text-2xl font-semibold text-foreground">
                            {progress.totalXp}
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <XpBar
                        ratio={progress.ratio}
                        intoLevel={progress.intoLevel}
                        span={progress.span}
                    />
                </div>

                <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Roadmap completion</span>
                        <span>{Math.round(completion)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>
            </section>

            <div className="mt-6">
                <DailyQuests snapshot={snapshot} today={today} />
            </div>

            <div className="mt-6">
                <RecentAchievements />
            </div>

            <div className="mt-6">
                <Teasers snapshot={snapshot} />
            </div>
        </div>
    )
}

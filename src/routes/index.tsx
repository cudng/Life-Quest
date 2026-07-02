import { createFileRoute } from '@tanstack/react-router'
import { useProgress } from '@/data/useProgress'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { localToday } from '@/lib/date'
import { HudBanner } from '@/components/home/HudBanner'
import { ActiveQuestline } from '@/components/home/ActiveQuestline'
import { SkillTreeSummary } from '@/components/home/SkillTreeSummary'
import { QuestLog } from '@/components/home/QuestLog'
import { StreakCard } from '@/components/home/StreakCard'
import { AttributesCard } from '@/components/home/AttributesCard'
import { AchievementsCarousel } from '@/components/home/AchievementsCarousel'
import { CharacterAdminDialog } from '@/components/home/CharacterAdminDialog'
import { HomeSkeleton } from '@/components/home/HomeSkeleton'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const { snapshot, isLoading, isError, error, refetch } = useProgress()
    const isAdmin = useIsAdmin()

    if (isLoading) {
        return <HomeSkeleton />
    }
    if (isError || !snapshot) {
        return (
            <div className="mx-auto max-w-[1180px] px-6 py-5">
                <div className="flex flex-col items-start gap-3 rounded-2xl bg-q-panel px-5 py-4 ring-1 ring-q-border">
                    <div className="text-[14px] font-semibold text-q-fg">
                        Failed to load your progress
                    </div>
                    <div className="text-[12.5px] text-q-muted">
                        {error?.message ?? 'Unknown error'}
                    </div>
                    <button
                        type="button"
                        onClick={refetch}
                        className="rounded-lg border border-q-border px-3 py-1.5 text-[12px] font-medium text-q-fg-2 transition-colors hover:bg-q-overlay"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const today = localToday()

    return (
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3.5 px-6 py-5">
            {isAdmin && (
                <div className="flex justify-end">
                    <CharacterAdminDialog />
                </div>
            )}

            <HudBanner snapshot={snapshot} />

            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_340px] lg:items-start">
                <div className="flex min-w-0 flex-col gap-3.5">
                    <ActiveQuestline />
                    <SkillTreeSummary />
                </div>
                <div className="flex flex-col gap-3.5">
                    <QuestLog snapshot={snapshot} today={today} />
                    <StreakCard snapshot={snapshot} today={today} />
                    <AttributesCard />
                </div>
            </div>

            <AchievementsCarousel snapshot={snapshot} />
        </div>
    )
}

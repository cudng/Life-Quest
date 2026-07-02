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

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const { snapshot, isLoading, isError, error } = useProgress()
    const isAdmin = useIsAdmin()

    if (isLoading) {
        return <div className="p-6 text-q-muted">Loading…</div>
    }
    if (isError || !snapshot) {
        return (
            <div className="p-6 text-red-500">
                Failed to load: {error?.message ?? 'unknown error'}
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

            <AchievementsCarousel />
        </div>
    )
}

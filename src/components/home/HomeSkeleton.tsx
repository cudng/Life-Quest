/** Pulsing placeholder that mirrors the Home layout while queries load. */

function Block({ className }: { className: string }) {
    return <div className={`rounded-2xl bg-q-panel ring-1 ring-q-border ${className}`} />
}

export function HomeSkeleton() {
    return (
        <div className="mx-auto flex max-w-[1180px] animate-pulse flex-col gap-3.5 px-6 py-5">
            {/* HudBanner */}
            <div className="flex items-center gap-[22px] rounded-2xl bg-q-panel px-[22px] py-[18px] ring-1 ring-q-border">
                <div className="h-[66px] w-[60px] shrink-0 rounded-[14px] bg-q-overlay" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-q-overlay" />
                    <div className="h-3 w-24 rounded bg-q-overlay" />
                </div>
                <div className="hidden flex-1 space-y-2 px-1.5 sm:block">
                    <div className="h-3 w-full rounded bg-q-overlay" />
                    <div className="h-3 w-2/3 rounded bg-q-overlay" />
                </div>
                <div className="hidden shrink-0 gap-2 sm:flex">
                    <div className="h-[52px] w-[66px] rounded-[10px] bg-q-overlay" />
                    <div className="h-[52px] w-[66px] rounded-[10px] bg-q-overlay" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_340px] lg:items-start">
                <div className="flex min-w-0 flex-col gap-3.5">
                    <Block className="h-[280px]" /> {/* ActiveQuestline */}
                    <Block className="h-[200px]" /> {/* SkillTreeSummary */}
                </div>
                <div className="flex flex-col gap-3.5">
                    <Block className="h-[210px]" /> {/* QuestLog */}
                    <Block className="h-[86px]" /> {/* StreakCard */}
                    <Block className="h-[170px]" /> {/* AttributesCard */}
                </div>
            </div>

            <Block className="h-[92px]" /> {/* AchievementsCarousel */}
        </div>
    )
}

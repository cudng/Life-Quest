import type { ProgressSnapshot } from '@/engine/progress'
import { Card } from '@/components/ui/card'
import { CHEST_DAY, LOGIN_REWARD_XP, nextCycleDay } from '@/engine/loginRewards'
import { useClaimLoginReward } from '@/data/mutations'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { announce, flyXp } from '@/lib/fx'
import { fireDailyClear } from '@/lib/reward'
import { playFanfare, playTick } from '@/lib/sound'
import { FANTASY } from '@/components/ui/talent'

interface LoginRewardCardProps {
    snapshot: ProgressSnapshot
    today: string
}

export function LoginRewardCard({ snapshot, today }: LoginRewardCardProps) {
    const claim = useClaimLoginReward()
    const isAdmin = useIsAdmin()

    const last = snapshot.lastLoginReward
    const claimedToday = last?.claimedOn === today
    const cycleDay =
        last && last.claimedOn === today
            ? last.cycleDay
            : nextCycleDay(today, last?.claimedOn ?? null, last?.cycleDay ?? 0)
    const doneCount = claimedToday ? cycleDay : cycleDay - 1
    const xp = LOGIN_REWARD_XP[cycleDay - 1] ?? 0

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-4 !py-[15px] ring-1 ring-q-border">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                    <span
                        className="font-mono text-[9px] tracking-[0.1em]"
                        style={{ color: FANTASY.eyebrow }}
                    >
                        LOGIN REWARDS
                    </span>
                    <span
                        className="font-mono text-[8.5px]"
                        style={{ color: FANTASY.goldFaint }}
                    >
                        day {cycleDay}/7
                    </span>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        disabled={claimedToday || claim.isPending}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            playTick()
                            flyXp(`+${xp} XP`, rect)
                            if (cycleDay === CHEST_DAY) {
                                fireDailyClear()
                                announce('CHEST OPENED!')
                                playFanfare()
                            }
                            claim.mutate({ today, cycleDay, xp })
                        }}
                        className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors hover:bg-[rgba(217,96,16,.12)] disabled:opacity-50 disabled:hover:bg-transparent"
                        style={{
                            color: FANTASY.goldLink,
                            boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.4)',
                        }}
                    >
                        {claimedToday
                            ? 'Claimed today'
                            : `Claim day ${cycleDay} (+${xp} XP)`}
                    </button>
                )}
            </div>

            <div className="flex justify-between gap-1">
                {LOGIN_REWARD_XP.map((amount, i) => {
                    const day = i + 1
                    const done = day <= doneCount
                    const current = day === cycleDay && !claimedToday
                    // completed = gold reward, current = live ember, future = cold obsidian
                    const cellStyle = done
                        ? {
                              background: 'rgba(217,160,65,.14)',
                              boxShadow: 'inset 0 0 0 1px rgba(217,160,65,.45)',
                              color: FANTASY.goldText,
                          }
                        : current
                          ? {
                                background: 'rgba(217,96,16,.12)',
                                boxShadow: 'inset 0 0 0 1px rgba(217,120,40,.6)',
                                color: FANTASY.emberText,
                            }
                          : {
                                background: 'linear-gradient(#100c08,#0a0705)',
                                boxShadow: 'inset 0 0 0 1px rgba(160,120,50,.2)',
                                color: FANTASY.goldFaint,
                            }
                    return (
                        <div
                            key={day}
                            className="flex flex-1 flex-col items-center gap-1"
                        >
                            <div
                                className="flex h-[26px] w-full items-center justify-center rounded-[6px] font-mono text-[9px]"
                                style={cellStyle}
                            >
                                {done ? '✓' : day === CHEST_DAY ? '🎁' : `+${amount}`}
                            </div>
                            <span
                                className="font-mono text-[7px] leading-none"
                                style={{ color: FANTASY.goldFaint }}
                            >
                                D{day}
                            </span>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

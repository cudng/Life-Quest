import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useSession } from '@/auth/session'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { signOut } from '@/auth/auth'
import { RewardsLayer } from '@/components/rewards/RewardsLayer'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useProgress } from '@/data/useProgress'
import { getLevelProgress } from '@/engine/progress'

const NAV_LINKS = [
    { to: '/', label: 'Home', exact: true },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/skill-tree', label: 'Skill Tree' },
    { to: '/job-board', label: 'Job Board' },
    { to: '/achievements', label: 'Achievements' },
] as const

const NAV_LINK_CLASS =
    'dq-nav-link rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-q-muted transition-colors ' +
    '[&.active]:bg-q-accent/14 [&.active]:text-q-fg [&.active]:ring-1 [&.active]:ring-inset [&.active]:ring-q-accent/30'

/** Two-letter avatar initials from an email local-part, fallback LQ. */
function initialsFromEmail(email: string | undefined): string {
    if (!email) return 'LQ'
    const local = email.split('@')[0].replace(/[^a-zA-Z]/g, '')
    return (local.slice(0, 2) || 'LQ').toUpperCase()
}

const Logo = () => (
    <Link to="/" className="flex items-center gap-2.5">
        <span className="grid size-[26px] place-items-center rounded-[7px] bg-gradient-to-br from-q-accent to-q-accent-bright shadow-[var(--q-glow-md)]">
            <span className="size-[9px] rotate-45 rounded-[1px] bg-white" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-q-fg">
            Life Quest
        </span>
    </Link>
)

const AuthStatus = () => {
    const session = useSession()
    const isAdmin = useIsAdmin()

    if (isAdmin) {
        return (
            <div className="flex items-center gap-2">
                <span className="hidden text-xs text-q-muted sm:inline">
                    {session?.user.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => void signOut()}>
                    Sign out
                </Button>
            </div>
        )
    }

    return (
        <Button variant="ghost" size="sm" render={<Link to="/login">Sign in</Link>} />
    )
}

const HudBar = () => {
    const session = useSession()
    const { snapshot } = useProgress()
    const level = snapshot ? getLevelProgress(snapshot).level : null
    const streak = snapshot?.streak.count ?? null

    return (
        <nav className="sticky top-0 z-20 flex h-[58px] items-center justify-between gap-6 border-b border-q-border bg-q-bg/70 px-6 backdrop-blur-md">
            <div className="flex min-w-[180px] items-center">
                <Logo />
            </div>

            <div className="flex items-center gap-0.5">
                {NAV_LINKS.map((l) => (
                    <Link
                        key={l.to}
                        to={l.to}
                        activeOptions={l.exact ? { exact: true } : undefined}
                        className={NAV_LINK_CLASS}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>

            <div className="flex min-w-[180px] items-center justify-end gap-3">
                {streak !== null && (
                    <Badge className="h-7 gap-1.5 rounded-lg border-q-flame/25 bg-q-flame/10 px-2.5 text-[13px] text-q-flame-bright">
                        <span>🔥</span>
                        <span className="font-semibold">{streak}</span>
                    </Badge>
                )}
                {level !== null && (
                    <Badge className="h-7 rounded-md border-q-accent-bright/40 bg-gradient-to-br from-q-accent/25 to-q-accent-bright/15 px-2.5 font-mono text-xs font-semibold text-q-accent-fg">
                        Lv {level}
                    </Badge>
                )}
                <ModeToggle />
                <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-q-line to-q-track text-xs font-semibold text-q-fg-2">
                        {initialsFromEmail(session?.user.email)}
                    </AvatarFallback>
                </Avatar>
                <AuthStatus />
            </div>
        </nav>
    )
}

const RootLayout = () => (
    <div className="q-page flex min-h-svh flex-col">
        <HudBar />
        <main className="flex-1">
            <Outlet />
        </main>
        <RewardsLayer />
        <TanStackRouterDevtools />
    </div>
)

export const Route = createRootRoute({ component: RootLayout })

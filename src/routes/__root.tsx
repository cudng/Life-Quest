import { useState } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { useSession } from '@/auth/session'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { signOut } from '@/auth/auth'
import { RewardsLayer } from '@/components/rewards/RewardsLayer'
import { ModeToggle } from '@/components/mode-toggle'
import { SoundToggle } from '@/components/SoundToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CharacterAdminDialog } from '@/components/home/CharacterAdminDialog'
import { METAL, FANTASY } from '@/components/ui/talent'

const NAV_LINKS = [
    { to: '/', label: 'Home', exact: true },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/skill-tree', label: 'Skill Tree' },
    { to: '/job-board', label: 'Job Board' },
    { to: '/achievements', label: 'Achievements' },
] as const

// Gold-on-obsidian nav links; active reads as an allocated (ember-tinted) node.
const NAV_LINK_CLASS =
    'dq-nav-link rounded-md px-3 py-1.5 font-serif text-[13.5px] tracking-wide text-[#9a7c48] transition-colors ' +
    '[&.active]:text-[#e8d4a8] [&.active]:bg-[rgba(217,96,16,.10)] [&.active]:ring-1 [&.active]:ring-inset [&.active]:ring-[rgba(217,120,40,.35)]'

/** Recessed obsidian socket shared by the logo rune and avatar. */
const SOCKET = 'radial-gradient(circle at 50% 32%, #241a0e, #0c0803)'

/** Two-letter avatar initials from an email local-part, fallback LQ. */
function initialsFromEmail(email: string | undefined): string {
    if (!email) return 'LQ'
    const local = email.split('@')[0].replace(/[^a-zA-Z]/g, '')
    return (local.slice(0, 2) || 'LQ').toUpperCase()
}

const Logo = () => (
    <Link to="/" className="flex items-center gap-2.5">
        <span
            className="grid size-[30px] place-items-center rounded-full p-[2px]"
            style={{
                background: METAL.gold.ring,
                boxShadow: [
                    'inset 0 1.5px 1px rgba(255,244,214,.55)',
                    'inset 0 -2px 4px rgba(0,0,0,.55)',
                    METAL.gold.glow,
                ].join(', '),
            }}
        >
            <span
                className="grid size-full place-items-center rounded-full text-[13px] leading-none"
                style={{
                    background: SOCKET,
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,.85)',
                }}
            >
                ⚔️
            </span>
        </span>
        <span
            className="font-serif text-[16px] font-semibold tracking-tight"
            style={{
                color: FANTASY.goldText,
                textShadow: '0 1px 2px rgba(0,0,0,.6)',
            }}
        >
            Life Quest
        </span>
    </Link>
)

/** Avatar dropdown: email, admin tools and sign in/out in one place. */
const UserMenu = () => {
    const session = useSession()
    const isAdmin = useIsAdmin()
    const [editOpen, setEditOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            type="button"
                            aria-label="Account menu"
                            className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
                        >
                            <Avatar>
                                <AvatarFallback
                                    className="font-mono text-xs font-semibold"
                                    style={{
                                        background: SOCKET,
                                        color: FANTASY.goldText,
                                        boxShadow:
                                            'inset 0 2px 6px rgba(0,0,0,.85), inset 0 0 0 1px rgba(160,120,50,.4)',
                                    }}
                                >
                                    {initialsFromEmail(session?.user.email)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    }
                />
                <DropdownMenuContent align="end" className="w-56">
                    {session && (
                        <>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="truncate">
                                    {session.user.email}
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    {isAdmin && (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <HugeiconsIcon icon={PencilEdit02Icon} />
                            Edit character
                        </DropdownMenuItem>
                    )}
                    {session ? (
                        <DropdownMenuItem onClick={() => void signOut()}>
                            Sign out
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem render={<Link to="/login" />}>
                            Sign in
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {isAdmin && (
                <CharacterAdminDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}
        </>
    )
}

const HudBar = () => {
    return (
        <nav
            className="sticky top-0 z-20 flex h-[58px] items-center justify-between gap-6 px-6 backdrop-blur-md"
            style={{
                background:
                    'linear-gradient(180deg, rgba(20,16,11,.92), rgba(12,9,6,.92))',
                boxShadow:
                    'inset 0 -1px 0 rgba(160,120,50,.22), 0 2px 10px rgba(0,0,0,.5)',
            }}
        >
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
                <SoundToggle />
                <ModeToggle />
                <UserMenu />
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

import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useSession } from '@/auth/session'
import { useIsAdmin } from '@/auth/useIsAdmin'
import { signOut } from '@/auth/auth'
import { RewardsLayer } from '@/components/rewards/RewardsLayer'

const AuthStatus = () => {
    const session = useSession()
    const isAdmin = useIsAdmin()

    if (isAdmin) {
        return (
            <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600">{session?.user.email}</span>
                <button
                    type="button"
                    onClick={() => void signOut()}
                    className="border rounded px-2 py-0.5 text-sm"
                >
                    Sign out
                </button>
            </div>
        )
    }

    return (
        <Link to="/login" className="ml-auto [&.active]:font-bold">
            Sign in
        </Link>
    )
}

const RootLayout = () => (
    <>
        <div className="p-2 flex gap-2 items-center">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>{' '}
            <Link to="/roadmap" className="[&.active]:font-bold">
                Roadmap
            </Link>
            <Link to="/job-board" className="[&.active]:font-bold">
                Job Board
            </Link>
            <Link to="/skill-tree" className="[&.active]:font-bold">
                Skill Tree
            </Link>
            <Link to="/achievements" className="[&.active]:font-bold">
                Achievements
            </Link>
            <AuthStatus />
        </div>
        <hr />
        <Outlet />
        <RewardsLayer />
        <TanStackRouterDevtools />
    </>
)

export const Route = createRootRoute({ component: RootLayout })
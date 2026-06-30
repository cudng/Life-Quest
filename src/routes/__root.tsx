import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const RootLayout = () => (
    <>
        <QueryClientProvider client={queryClient}>
        <div className="p-2 flex gap-2">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>{' '}
            <Link to="/roadmap" className="[&.active]:font-bold">
                Roadmap
            </Link>
            <Link to="/joab-board" className="[&.active]:font-bold">
                Joab Board
            </Link>
            <Link to="/skill-tree" className="[&.active]:font-bold">
                Skill Tree
            </Link>
            <Link to="/achievements" className="[&.active]:font-bold">
                Achievements
            </Link>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
        </QueryClientProvider>
    </>
)

export const Route = createRootRoute({ component: RootLayout })
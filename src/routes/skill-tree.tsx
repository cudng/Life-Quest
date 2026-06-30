import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/skill-tree')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/skill-tree"!</div>
}

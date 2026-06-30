import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/joab-board')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/joab-board"!</div>
}

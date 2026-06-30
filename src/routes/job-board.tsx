import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/job-board')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/job-board"!</div>
}

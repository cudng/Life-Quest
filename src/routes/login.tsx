import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { signIn } from '@/auth/auth'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await signIn(email, password)
            await navigate({ to: '/' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign in failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-sm mx-auto p-4">
            <h1 className="text-lg font-bold mb-4">Admin sign in</h1>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-2 py-1"
                />
                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-2 py-1"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    className="border rounded px-2 py-1 disabled:opacity-50"
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    )
}
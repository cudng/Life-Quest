import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'lq-theme'
const DEFAULT_THEME: Theme = 'dark'

interface ThemeProviderState {
    theme: Theme
    /** The theme actually applied to the DOM (system resolved to dark/light). */
    resolvedTheme: 'dark' | 'light'
    setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

function readStoredTheme(): Theme {
    if (typeof window === 'undefined') return DEFAULT_THEME
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored
    }
    return DEFAULT_THEME
}

function systemPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme)
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() =>
        readStoredTheme() === 'light' ? 'light' : 'dark',
    )

    useEffect(() => {
        const root = window.document.documentElement

        const apply = () => {
            const resolved =
                theme === 'system'
                    ? systemPrefersDark()
                        ? 'dark'
                        : 'light'
                    : theme
            root.classList.toggle('dark', resolved === 'dark')
            setResolvedTheme(resolved)
        }

        apply()

        if (theme !== 'system') return
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', apply)
        return () => media.removeEventListener('change', apply)
    }, [theme])

    const setTheme = (next: Theme) => {
        window.localStorage.setItem(STORAGE_KEY, next)
        setThemeState(next)
    }

    return (
        <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export function useTheme(): ThemeProviderState {
    const context = useContext(ThemeProviderContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

import { HugeiconsIcon } from '@hugeicons/react'
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme, type Theme } from '@/components/theme-provider'

const OPTIONS: { value: Theme; label: string; icon: typeof Sun03Icon }[] = [
    { value: 'light', label: 'Light', icon: Sun03Icon },
    { value: 'dark', label: 'Dark', icon: Moon02Icon },
    { value: 'system', label: 'Auto', icon: ComputerIcon },
]

export function ModeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" aria-label="Toggle theme">
                        <HugeiconsIcon
                            icon={resolvedTheme === 'dark' ? Moon02Icon : Sun03Icon}
                        />
                    </Button>
                }
            />
            <DropdownMenuContent align="end">
                {OPTIONS.map(({ value, label, icon }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setTheme(value)}
                        data-active={theme === value}
                        className="data-[active=true]:font-medium"
                    >
                        <HugeiconsIcon icon={icon} />
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

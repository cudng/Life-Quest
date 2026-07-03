import { useSyncExternalStore } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { VolumeHighIcon, VolumeOffIcon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { isMuted, playTick, setMuted, subscribeMuted } from '@/lib/sound'

export function SoundToggle() {
    const muted = useSyncExternalStore(subscribeMuted, isMuted)

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            onClick={() => {
                setMuted(!muted)
                // Audible confirmation when switching sound back on.
                if (muted) playTick()
            }}
        >
            <HugeiconsIcon icon={muted ? VolumeOffIcon : VolumeHighIcon} />
        </Button>
    )
}

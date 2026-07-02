import { Card } from '@/components/ui/card'
import { useAttributes } from '@/data/queries'

export function AttributesCard() {
    const attributes = useAttributes()
    if (!attributes.data) return null

    return (
        <Card className="gap-0 rounded-2xl border-0 bg-q-panel px-4 !py-[15px] ring-1 ring-q-border">
            <div className="mb-3 font-mono text-[10px] tracking-[0.1em] text-q-accent">
                ATTRIBUTES
            </div>
            <div className="flex flex-col gap-[11px]">
                {attributes.data.map((a) => (
                    <div key={a.id}>
                        <div className="mb-1.5 flex items-baseline justify-between">
                            <span className="text-[11.5px] text-q-fg-2">{a.name}</span>
                            <span className="font-mono text-[10.5px] text-q-accent-bright">
                                {a.value}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-q-track">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-q-accent-deep to-q-accent-bright"
                                style={{ width: `${a.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

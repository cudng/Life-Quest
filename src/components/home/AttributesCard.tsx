import { useAttributes } from '@/data/queries'
import { FANTASY } from '@/components/ui/talent'

/** Bare section — rendered inside the HUD banner's profile column. */
export function AttributesCard() {
    const attributes = useAttributes()
    if (!attributes.data) return null

    return (
        <div className="flex flex-col">
            <div
                className="mb-2 font-mono text-[9px] tracking-[0.1em]"
                style={{ color: FANTASY.eyebrow }}
            >
                ATTRIBUTES
            </div>
            <div className="flex flex-col gap-2">
                {attributes.data.map((a) => (
                    <div key={a.id} data-attr-anchor={a.id}>
                        <div className="mb-1 flex items-baseline justify-between">
                            <span
                                className="text-[10.5px]"
                                style={{ color: FANTASY.goldText }}
                            >
                                {a.name}
                            </span>
                            <span
                                className="font-mono text-[9.5px]"
                                style={{ color: FANTASY.emberText }}
                            >
                                {a.value}
                            </span>
                        </div>
                        <div
                            className="h-1 overflow-hidden rounded-full"
                            style={{
                                background: 'linear-gradient(#0a0704,#141009)',
                                boxShadow:
                                    'inset 0 1px 2px rgba(0,0,0,.9), inset 0 0 0 1px rgba(160,120,50,.14)',
                            }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${a.value}%`,
                                    background:
                                        'linear-gradient(90deg,#db5f10,#f8b45a,#ffe0a0)',
                                    boxShadow: '0 0 8px rgba(220,96,16,.5)',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

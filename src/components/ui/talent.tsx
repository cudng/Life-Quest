// Dark-fantasy "talent tree" primitives shared across the app (Home skill
// tree, roadmap questline, and any future progression map). The look is forged
// from four metals that read as progression at a glance and an obsidian slab
// they sit on. Keep every progression surface built from these pieces so the
// game UI stays one coherent style. See PROJECT.md → "Dark-fantasy UI".

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Metal = 'gold' | 'bronze' | 'ember' | 'iron'

interface MetalSpec {
    ring: string
    glow: string
}

export const METAL: Record<Metal, MetalSpec> = {
    // mastered / completed — polished gold, the reward state
    gold: {
        ring: 'linear-gradient(150deg, #ffe7a6 0%, #d99f36 46%, #8a5c17 100%)',
        glow: '0 0 18px rgba(232,180,80,.55), 0 2px 5px rgba(0,0,0,.6)',
    },
    // proficient / partial — aged bronze
    bronze: {
        ring: 'linear-gradient(150deg, #cd9a52 0%, #8a5c22 48%, #533713 100%)',
        glow: '0 0 10px rgba(180,120,44,.4), 0 2px 5px rgba(0,0,0,.6)',
    },
    // in progress / active — living ember (pair with `pulse`)
    ember: {
        ring: 'linear-gradient(150deg, #f8b45a 0%, #db5f10 48%, #7c2f07 100%)',
        glow: '0 0 16px rgba(220,96,16,.55), 0 2px 5px rgba(0,0,0,.6)',
    },
    // locked — cold iron (pair with `dim`)
    iron: {
        ring: 'linear-gradient(150deg, #4c4c55 0%, #2a2a30 50%, #17171b 100%)',
        glow: '0 2px 4px rgba(0,0,0,.6)',
    },
}

// Medallion diameter for the Home preview cards (roadmap + talent tree). Kept
// as one shared constant so both previews render nodes at identical size.
export const HOME_NODE_SIZE = 46

// Shared text tones (hex, theme-independent — the slab is always dark).
export const FANTASY = {
    goldText: '#e8d4a8',
    goldLink: '#d9a341',
    goldDim: '#9a7c48',
    goldFaint: '#7a6440',
    emberText: '#f0b85e',
    eyebrow: '#c9922f',
} as const

interface MedallionProps {
    metal: Metal
    /** rune / glyph shown in the recessed socket */
    children: ReactNode
    /** corner sigil, e.g. '♛' for a crowned node or '🔒' for locked */
    badge?: string
    /** desaturate + fade the rune (locked nodes) */
    dim?: boolean
    /** slow ember breathing (active / learning nodes) */
    pulse?: boolean
    size?: number
}

/** A forged metal medallion with a beveled rim and recessed rune socket. */
export function Medallion({
    metal,
    children,
    badge,
    dim,
    pulse,
    size = 62,
}: MedallionProps) {
    const spec = METAL[metal]
    const ringStyle: CSSProperties = {
        width: size,
        height: size,
        background: spec.ring,
        boxShadow: [
            'inset 0 1.5px 1px rgba(255,244,214,.55)',
            'inset 0 -2px 4px rgba(0,0,0,.55)',
            spec.glow,
        ].join(', '),
    }
    const crowned = badge === '♛'
    return (
        <div
            className={`relative rounded-full p-[3px] ${
                pulse
                    ? 'animate-[pulse_2.4s_ease-in-out_infinite] motion-reduce:animate-none'
                    : ''
            }`}
            style={ringStyle}
        >
            <div
                className="flex size-full items-center justify-center rounded-full"
                style={{
                    background: 'radial-gradient(circle at 50% 32%, #241a0e, #0c0803)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,.85)',
                }}
            >
                <span
                    className="leading-none"
                    style={{
                        fontSize: size * 0.35,
                        ...(dim
                            ? { filter: 'grayscale(1) brightness(.7)', opacity: 0.5 }
                            : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.7))' }),
                    }}
                >
                    {children}
                </span>
            </div>
            {badge && (
                <span
                    className="absolute -right-1 -top-1 flex size-[17px] items-center justify-center rounded-full text-[9px] leading-none text-[#1a1105]"
                    style={{
                        background: crowned
                            ? 'linear-gradient(150deg,#ffe7a6,#c9922f)'
                            : '#26262c',
                        boxShadow:
                            '0 1px 3px rgba(0,0,0,.7), inset 0 1px 1px rgba(255,255,255,.3)',
                    }}
                >
                    {badge}
                </span>
            )}
        </div>
    )
}

/** An engraved channel between two nodes; glows gold when the path is allocated. */
export function Conduit({
    active,
    grow,
    nodeSize = 62,
}: {
    active: boolean
    grow?: boolean
    /** diameter of the flanking medallions, so the channel lines up with their centers */
    nodeSize?: number
}) {
    return (
        <div
            className={`h-[7px] shrink-0 self-start rounded-full ${
                grow ? 'min-w-3 flex-1' : 'w-7'
            }`}
            style={{
                marginTop: (nodeSize + 6) / 2 - 3.5,
                background: 'linear-gradient(#0a0704,#141009)',
                boxShadow:
                    'inset 0 1px 2px rgba(0,0,0,.9), inset 0 -1px 0 rgba(120,90,40,.2)',
            }}
        >
            <div
                className="mx-[3px] mt-[2px] h-[3px] rounded-full"
                style={
                    active
                        ? {
                              background: 'linear-gradient(90deg,#d99f36,#ffe0a0)',
                              boxShadow: '0 0 7px rgba(224,168,72,.75)',
                          }
                        : {
                              backgroundImage:
                                  'repeating-linear-gradient(90deg,#3a3a42 0 3px,transparent 3px 7px)',
                          }
                }
            />
        </div>
    )
}

export type PipState = 'lit' | 'ember' | 'off'

/** A row of gem pips (ranks / child mastery). */
export function Pips({ states }: { states: PipState[] }) {
    return (
        <div className="flex items-center gap-[3px]">
            {states.map((s, i) => (
                <span
                    key={i}
                    className="size-[7px] rotate-45"
                    style={{
                        background:
                            s === 'lit'
                                ? 'linear-gradient(150deg,#ffe7a6,#c9922f)'
                                : s === 'ember'
                                  ? 'linear-gradient(150deg,#f6a94c,#c8560e)'
                                  : '#33333a',
                        boxShadow:
                            s === 'lit'
                                ? '0 0 5px rgba(220,170,70,.7)'
                                : s === 'ember'
                                  ? '0 0 5px rgba(210,90,20,.55)'
                                  : 'inset 0 0 2px rgba(0,0,0,.8)',
                    }}
                />
            ))}
        </div>
    )
}

/** The recessed obsidian slab the medallions sit on, with gold corner brackets. */
export function TalentSlab({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn('relative flex items-start rounded-xl px-3 py-5', className)}
            style={{
                background:
                    'radial-gradient(130% 110% at 50% 0%, #1b1712 0%, #100c08 60%, #0a0705 100%)',
                boxShadow:
                    'inset 0 2px 14px rgba(0,0,0,.7), inset 0 0 0 1px rgba(160,120,50,.16)',
            }}
        >
            <CornerBrackets />
            {children}
        </div>
    )
}

function CornerBrackets() {
    const base = 'pointer-events-none absolute size-3 border-[#a9803a]/45'
    return (
        <>
            <span className={`${base} left-1.5 top-1.5 border-l border-t`} />
            <span className={`${base} right-1.5 top-1.5 border-r border-t`} />
            <span className={`${base} bottom-1.5 left-1.5 border-b border-l`} />
            <span className={`${base} bottom-1.5 right-1.5 border-b border-r`} />
        </>
    )
}

"use client"

import { useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// People and AiMY, told apart at a glance.
// - A person: their photo with Sales' face ring (.b-face: a 1px edge outside
//   and a faint highlight inside), or their initials on the avatar gradient
//   when there is no photo or it fails to load.
// - AiMY: the mark on Knowledge's AiMY tile (.aimy-av-tile). AiMY's actions
//   are never shown with a person's face.
const SIZES = {
  xs: "size-6 text-2xs", // 24
  sm: "size-7 text-2xs", // 28: the topnav
  md: "size-8 text-xs", // 32
  lg: "size-11 text-xs", // 44
} as const

type Size = keyof typeof SIZES

type AvatarProps = {
  /** The person's name: used for the initials and the accessible name. */
  name: string
  src?: string
  size?: Size
  className?: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase()
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const showPhoto = src && !broken
  return (
    <span
      data-slot="avatar"
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-pill font-bold text-on-brand",
        "bg-[image:var(--grad-avatar)] shadow-[0_0_0_1px_var(--card-border)]",
        SIZES[size],
        className
      )}
    >
      {showPhoto ? (
        <>
          <img src={src} alt="" className="absolute inset-0 size-full object-cover" onError={() => setBroken(true)} />
          <span aria-hidden="true" className="absolute inset-0 rounded-pill shadow-[inset_0_0_0_1px_var(--w16)]" />
        </>
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}

const MARK = { xs: "size-3", sm: "size-3.5", md: "size-4", lg: "size-6" } as const

export function AimyAvatar({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <span
      data-slot="aimy-avatar"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-lg border border-[var(--aimy-tile-edge)] bg-[image:var(--aimy-tile)]",
        SIZES[size],
        className
      )}
    >
      <AimyMark className={MARK[size]} />
    </span>
  )
}

type AvatarGroupProps = {
  people: { name: string; src?: string }[]
  /** How many faces to show before "+N". */
  max?: number
  size?: Size
  className?: string
}

export function AvatarGroup({ people, max = 4, size = "md", className }: AvatarGroupProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <span data-slot="avatar-group" className={cn("inline-flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} {...p} size={size} className={cn("ring-2 ring-card", i > 0 && "-ml-2.5")} />
      ))}
      {rest > 0 ? (
        <span
          className={cn(
            "-ml-2.5 inline-grid shrink-0 place-items-center rounded-pill bg-raised font-bold text-ink-secondary ring-2 ring-card",
            SIZES[size]
          )}
        >
          +{rest}
          <span className="sr-only"> more</span>
        </span>
      ) : null}
    </span>
  )
}

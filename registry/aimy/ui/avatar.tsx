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
  /** The person's photo. Without one, or when it fails to load, their initials. */
  src?: string
  size?: Size
  className?: string
}

// A generation or honour after the name is not a surname: "Bartholomew
// Fitzgerald-Montgomery III" is BF, not BI.
const SUFFIX = /^(?:i{2,3}|iv|jr|sr)\.?,?$/i

/** The first letter as a person reads it: a whole grapheme, so É or a combined letter never splits. */
function firstLetter(word: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    for (const { segment } of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(word)) return segment
    return ""
  }
  return Array.from(word)[0] ?? ""
}

/** The first and last word's first letters ("Jo" keeps one), with suffixes such as III or Jr. and asides in brackets dropped. */
export function initials(name: string) {
  // Asides in brackets ("(Contractor)", "(she/her)") and words that don't start with a letter
  // (an emoji, a dash) are not part of the name.
  const parts = name
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
  while (parts.length > 1 && SUFFIX.test(parts.at(-1)!)) parts.pop()
  // A name with no letters at all (only an emoji) still shows what it has.
  if (!parts.length) return firstLetter(name.trim())
  const first = firstLetter(parts[0] ?? "")
  const last = parts.length > 1 ? firstLetter(parts.at(-1)!) : ""
  // Not toLocaleUpperCase: the server and the browser may differ in locale, and hydration must match.
  return (first + last).toUpperCase()
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
          {/* A photo that failed before the page came alive fired its error with nobody listening,
              so the ref checks it once on mount; onError covers the rest. */}
          <img
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setBroken(true)
            }}
            src={src}
            alt=""
            className="absolute inset-0 size-full object-cover"
            onError={() => setBroken(true)}
          />
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
          <span aria-hidden={rest > 99 || undefined}>{rest > 99 ? "99+" : `+${rest}`}</span>
          <span className="sr-only">{rest > 99 ? ` ${rest} more` : " more"}</span>
        </span>
      ) : null}
    </span>
  )
}

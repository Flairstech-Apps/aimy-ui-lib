"use client"

import { ChevronDown } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { cn } from "@/lib/utils"

// Sales' face stack (teamStack in bdr.js, .b-stack and .b-team-stack in
// bdr.css). Faces set over each other are one object, a group, which is what
// the stack says; faces set apart are a list of people. The first face sits on
// top, each carries a ring in the ground colour so the edges stay apart where
// they cross, and after four the rest is one more circle with the count.
//
// Two forms:
// - Faces only (`.b-team-stack`): the people on a card, at its foot.
// - A door (`.b-stack`, pass `menu`): the faces in a chip with a chevron, and
//   the menu it opens names the whole set, each with their job. The faces
//   can be the people who did not fit on the line; the menu is the roster.
//   With `onOpen` each name opens that person; without it the names are a
//   list to read.
//
//   <FaceStack people={team} />
//   <FaceStack people={rest} menu={{ label: "4 more people", cap: "The team", people: team, onOpen: openPerson }} />

export type FacePerson = {
  id: string
  name: string
  src?: string
  /** Under the name in the menu: their job. */
  sub?: string
}

type FaceStackProps = {
  /** The faces, in order; the first sits on top. */
  people: FacePerson[]
  /** How many faces before the count. 4, Sales'. */
  max?: number
  /** Makes it Sales' door: a chip that opens the whole set, named. */
  menu?: {
    /** The chip's name for screen readers: "4 more people". */
    label: string
    /** Over the names: "The team". */
    cap?: string
    /** The whole set, when the faces are only the overflow. The faces by default. */
    people?: FacePerson[]
    /** Each name opens that person. Without it the names are a list to read. */
    onOpen?: (person: FacePerson) => void
  }
  className?: string
}

export function FaceStack({ people, max = 4, menu, className }: FaceStackProps) {
  const shown = people.slice(0, max)
  const more = people.length - shown.length
  const faces = (
    <span className={cn("inline-flex items-center", menu ? "[--face-ring:var(--body-bg)]" : null)} aria-hidden={menu ? true : undefined}>
      {/* The first face on top: each one a step higher than the next (Sales does it with direction: rtl). */}
      {shown.map((p, i) => (
        <span
          key={p.id}
          className={cn("relative inline-flex rounded-pill", i > 0 && (menu ? "-ml-2" : "-ml-1.5"))}
          style={{ zIndex: shown.length - i }}
        >
          <Avatar name={p.name} src={p.src} size="xs" className="shadow-[0_0_0_2px_var(--face-ring,var(--card-bg))]" />
        </span>
      ))}
      {more > 0 ? (
        <span
          className={cn(
            "relative inline-grid size-6 shrink-0 place-items-center rounded-pill border border-edge bg-raised text-2xs font-bold text-ink tabular-nums",
            "shadow-[0_0_0_2px_var(--face-ring,var(--card-bg))]",
            menu ? "-ml-2" : "-ml-1.5"
          )}
        >
          +{more}
          {menu ? null : <span className="sr-only"> more</span>}
        </span>
      ) : null}
    </span>
  )

  if (!menu)
    return (
      <span data-slot="face-stack" role="group" aria-label={people.map((p) => p.name).join(", ")} className={className}>
        {faces}
      </span>
    )

  const roster = menu.people ?? people
  const chip = (
    <button
      type="button"
      data-slot="face-stack"
      aria-label={menu.label}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-edge bg-w05 py-0.5 pr-2 pl-1 text-ink-secondary",
        "transition-[background-color,border-color,color] duration-(--t-fast) ease-out hover:border-edge-hover hover:text-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className
      )}
    >
      {faces}
      <ChevronDown aria-hidden="true" strokeWidth={2.4} className="size-3 shrink-0" />
    </button>
  )
  const face = (p: FacePerson) => <Avatar name={p.name} src={p.src} size="xs" />

  if (menu.onOpen) {
    const open = menu.onOpen
    return (
      <Menu>
        <MenuTrigger asChild>{chip}</MenuTrigger>
        <MenuContent>
          {menu.cap ? <MenuLabel>{menu.cap}</MenuLabel> : null}
          {roster.map((p) => (
            <MenuItem key={p.id} leading={face(p)} description={p.sub} onSelect={() => open(p)}>
              {p.name}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    )
  }
  // Nothing behind a name: a list to read, so the rows do not light under the hand.
  return (
    <Popover>
      <PopoverTrigger asChild>{chip}</PopoverTrigger>
      <PopoverContent label={menu.cap ?? menu.label} className="w-auto min-w-[13.5rem] p-1.5">
        {menu.cap ? <p className="px-2.5 pt-1 pb-1.5 text-2xs font-semibold text-ink-secondary">{menu.cap}</p> : null}
        <ul className="flex flex-col gap-0.5">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5 px-2.5 py-2 text-xs">
              {face(p)}
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-ink">{p.name}</span>
                {p.sub ? <span className="truncate text-ink-secondary">{p.sub}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

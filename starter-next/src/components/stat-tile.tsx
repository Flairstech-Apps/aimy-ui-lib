import { ChevronRight } from "lucide-react"
import { Children } from "react"
import { cn } from "@/lib/utils"

// Sales' figure strip (.s-afs / .s-af): a caption, one figure, and a sub-line
// that says what the figure means. Divided by a hairline above, never boxed.
// There is no delta arrow: the change is said in words in the sub-line ("was
// 41 at signing"). A tone recolours the figure only. A tile with `onClick`
// is a door onto the set it counts: its sub-line turns accent and carries
// the arrow. Up to four sit in a row; they reflow to two, then one, on the
// strip's own width.
//
//   <StatTiles>
//     <StatTile label="Booked" value="€182,400" sub="was €140,000 at signing" />
//     <StatTile label="Callable" value="107" sub="38 you can call now" onClick={open} />
//   </StatTiles>

type Tone = "ok" | "warn" | "err"

export function StatTiles({
  rising,
  className,
  children,
}: {
  /** The tiles rise in once, as on Sales' exec page. */
  rising?: boolean
  className?: string
  children: React.ReactNode
}) {
  const n = Children.toArray(children).length
  return (
    <div className="s-afs-wrap" data-slot="stat-tiles">
      <div
        className={cn("s-afs", rising && "is-rising", className)}
        style={{ "--tiles": Math.min(Math.max(n, 1), 4) } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

type StatTileProps = {
  label: string
  value: React.ReactNode
  /** What the figure means, or how it changed, in words. */
  sub?: React.ReactNode
  tone?: Tone
  /** Makes the tile a door onto the set it counts. */
  onClick?: () => void
  className?: string
}

export function StatTile({ label, value, sub, tone, onClick, className }: StatTileProps) {
  const inner = (
    <>
      {/* The spaces keep the name read aloud as three things, not "Callable10738". */}
      <span className="s-af-cap">{label}</span> <span className={cn("s-af-val", tone && `tone-${tone}`)}>{value}</span>{" "}
      {sub ? (
        <span className="s-af-sub">
          {sub}
          {onClick ? <ChevronRight aria-hidden="true" /> : null}
        </span>
      ) : null}
    </>
  )
  if (onClick)
    return (
      <button type="button" className={cn("s-af b-af-door", className)} onClick={onClick} data-slot="stat-tile">
        {inner}
      </button>
    )
  return (
    <div className={cn("s-af", className)} data-slot="stat-tile">
      {inner}
    </div>
  )
}

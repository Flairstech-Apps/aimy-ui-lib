"use client"

import { ChevronRight, Download, Maximize2 } from "lucide-react"
import { useId } from "react"
import { Button } from "@/components/button"
import { IconButton } from "@/components/icon-button"
import { cn } from "@/lib/utils"

// What every widget AiMY draws inside a chat reply sits in (Nour's pick,
// 4 Nov, over an open layout and a result chip). The Knowledge app drew
// each one with its own header, corner, border and colours; this gives them
// one shape. A head that names the result and counts or orders it, with
// Open in the canvas and Download; the result; and a foot that opens the
// rest, in place of a paginator inside the reply. The doctrine sends long
// generated work to the canvas.
//
// It wears AiMY's bubble (Nour, 11 Nov): the see-through ground, edge and
// corners of a Message from AiMY, square corner top left. Put inside AiMY's
// bubble, it becomes a card on it, as Sales draws cards in an answer.
//
//   <WidgetFrame icon={<Users />} title="Recommended candidates" meta="Best match first"
//     onOpen={openCanvas} onDownload={download} more={{ label: "Show all candidates", onClick: openCanvas }}>
//     <CandidateCards candidates={list} … />
//   </WidgetFrame>

type WidgetFrameProps = {
  icon: React.ReactNode
  /** The result's name in sentence case: "Matched positions for Omar Nabil". */
  title: string
  /** A line that counts or orders it: "Best match first", "8 files". */
  meta?: React.ReactNode
  /** Shows Open in the canvas. */
  onOpen?: () => void
  /** Shows Download. */
  onDownload?: () => void
  /** More head actions, after the two above. */
  actions?: React.ReactNode
  /** The foot: one link that opens the rest. */
  more?: { label: string; onClick: () => void }
  /** No padding around the body, for rows and tables that run edge to edge. */
  flush?: boolean
  className?: string
  children: React.ReactNode
}

export function WidgetFrame({
  icon,
  title,
  meta,
  onOpen,
  onDownload,
  actions,
  more,
  flush,
  className,
  children,
}: WidgetFrameProps) {
  const titleId = useId()
  return (
    <section
      data-slot="widget-frame"
      aria-labelledby={titleId}
      // AiMY's bubble surface (ai.css .aimy-widget-frame): see-through in the
      // thread, a card when it sits inside AiMY's bubble.
      className={cn("aimy-widget-frame @container", className)}
    >
      {/* Under 26rem of its own width the head changes form instead of
          squeezing the name between the icon and the actions (Nour, 11 Nov,
          from a phone): the icon and the name keep the first row, the
          actions take a row of their own from the head's left edge, so their
          glyphs stand under the icon's (7px in against its 8px).
          The icon and the actions centre on the name's first line, so a name
          that wraps never pulls them off it: each sits in a box one line of
          the name tall. */}
      <header className="flex flex-wrap items-start gap-x-3 gap-y-1.5 border-b border-hairline px-4 py-3">
        <span className="flex h-[1lh] shrink-0 items-center text-xs">
          <span className="grid size-8 place-items-center rounded-lg bg-w05 text-ink-secondary [&_svg]:size-4">
            {icon}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-xs font-semibold text-ink">
            {title}
          </h3>
          {meta ? <p className="text-2xs text-ink-secondary">{meta}</p> : null}
        </div>
        {onOpen || onDownload || actions ? (
          <div className="flex h-[1lh] shrink-0 items-center gap-1 text-xs @max-[26rem]:h-auto @max-[26rem]:basis-full">
            {onOpen ? (
              <IconButton label="Open in the canvas" variant="toolbar" size="sm" onClick={onOpen}>
                <Maximize2 />
              </IconButton>
            ) : null}
            {onDownload ? (
              <IconButton label="Download" variant="toolbar" size="sm" onClick={onDownload}>
                <Download />
              </IconButton>
            ) : null}
            {actions}
          </div>
        ) : null}
      </header>
      <div className={flush ? undefined : "p-3"}>{children}</div>
      {more ? (
        <footer className="border-t border-hairline px-4 py-2.5">
          <Button variant="text" onClick={more.onClick}>
            {more.label}
            <ChevronRight aria-hidden="true" />
          </Button>
        </footer>
      ) : null}
    </section>
  )
}

import type { Metadata } from "next"
import { InlineEditDemo, ListboxDemo, ReorderDemo, ResizeDemo, SpansDemo, StickDemo, TreeDemo, ViewportDemo } from "@/components/docs/behavior-demos"
import { Code, CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Behaviours" }

const AREAS: [string, string, string[]][] = [
  ["Focus and keys", "One Tab stop per group and the arrows inside it; focus that survives the focused item being removed.", ["createFocusTrap", "createRovingFocus", "createGridFocus", "spatialMove", "createTypeahead", "createFocusRecovery", "keepFocus", "inputHints"]],
  ["Selection", "Shift for ranges, Ctrl or Cmd to add, a lasso, cell ranges, and copy and paste a spreadsheet understands.", ["createSelection", "createLasso", "createCellRange", "cellRangeMessage", "cellsToText", "textToCells", "bindCellClipboard"]],
  ["Drag and drop", "Every drag has a keyboard path: Space picks up, the arrows move, Space drops, Escape cancels.", ["bindDrag", "createReorder", "createTreeReorder", "createTransfer", "bindDragPreview", "createAutoScroll", "settleDraft"]],
  ["Move and resize", "Objects on a canvas, boxes from their edges, rows with actions behind them, ranges on tracks.", ["createMove", "createResize", "createSwipeActions", "bindHold", "bindRepeat", "createArea", "createSpans", "stackSpans", "createPreview"]],
  ["Lists", "The highlight model behind Select and Menu, long lists, logs that follow, editing in place.", ["createListbox", "createVirtualizer", "createStickToBottom", "bindScrollPicker", "createInlineEdit"]],
  ["Trees", "Parents, levels, visible rows with their ARIA, checks that roll up, the tree keyboard model.", ["createTreeCollection", "treeFromPaths", "visibleTreeRows", "treeCheckedStates", "createTreeNavigation"]],
  ["Transitions and gestures", "Panels that open to their height, hidden text find can reach, and the physics of a flick.", ["bindPanel", "hiddenAttrs", "bindFindable", "animateIn", "animateOut", "solveSpring", "rubberBand", "projectDistance", "sectorOf"]],
  ["Popups and layers", "Placement that flips and shifts, and a layer stack: Escape and a press outside reach only the top layer.", ["computePosition", "autoUpdate", "bindLayer", "bindPersistentLayer", "lockScroll", "hideOthers"]],
  ["Preferences", "A saved choice applied before first paint; the colour scheme on the key every AiMY product uses.", ["createPreference", "createColorScheme", "preferencesScript", "createPointerKind"]],
  ["Canvas", "Pan and zoom with screen-to-canvas conversion, and connecting ports by pointer or keyboard.", ["createViewport", "createConnect", "connectMessage"]],
]

export default function BehaviorsPage() {
  return (
    <>
      <PageHeader
        title="Behaviours"
        lead="How AiMY parts behave, written once: keyboard, focus, selection, dragging, layers and gestures, with what a screen reader hears at each step. The tokens give a part its look; the behaviours give it its manners. The popup parts (Dialog, Sheet, Popover, Tooltip, Menu, Select) are built on them."
      />
      <Section title="Install" lead="With the registry, or from the package. Each behaviour is plain TypeScript; each has a React hook.">
        <CodeBlock>{`npx shadcn@latest add @aimy/behaviors

import { createReorder, arrayMove } from "@/lib/behaviors"
import { useReorder, useTreeView } from "@/lib/behaviors-react"

// or, with the npm package
import { useReorder } from "@flairstech-aimy/ui/behaviors"`}</CodeBlock>
      </Section>

      <Section title="Reorder a list" lead="useReorder, with bindDrag for the pointer.">
        <ReorderDemo />
      </Section>
      <Section title="A tree with checks" lead="useTreeView over treeFromPaths, with treeCheckedStates rolling checks up to folders.">
        <TreeDemo />
      </Section>
      <Section title="Filter and choose" lead="useListbox: focus stays in the field and aria-activedescendant follows the highlight.">
        <ListboxDemo />
      </Section>
      <Section title="Rename in place" lead="useInlineEdit, with a check before it saves.">
        <InlineEditDemo />
      </Section>
      <Section title="Ranges on a track" lead="useSpans and stackSpans: a day of meetings in 15-minute steps.">
        <SpansDemo />
      </Section>
      <Section title="Resize" lead="useResize from a corner handle.">
        <ResizeDemo />
      </Section>
      <Section title="Pan and zoom" lead="useViewport.">
        <ViewportDemo />
      </Section>
      <Section title="A log that follows" lead="useStickToBottom: what AiMY's thread and step lists use.">
        <StickDemo />
      </Section>

      <Section title="Everything in the set" lead="Ten areas. Each name below is exported from @/lib/behaviors, and most have a use… hook in @/lib/behaviors-react.">
        <div className="grid gap-3 column:grid-cols-2">
          {AREAS.map(([name, what, fns]) => (
            <div key={name} className="rounded-xl border border-hairline p-5">
              <p className="text-meta font-semibold text-ink">{name}</p>
              <p className="mt-1 text-meta text-ink-secondary">{what}</p>
              <p className="mt-2 flex flex-wrap gap-1.5">
                {fns.map((f) => (
                  <Code key={f}>{f}</Code>
                ))}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Testing" lead="The testing kit presses keys and Tab the way a browser does, drags, and checks ARIA, returning problems as sentences.">
        <CodeBlock>{`import { press, tab, ariaProblems, singleTabStopProblems } from "@/lib/behaviors-testing"

press("ArrowDown")
expect(singleTabStopProblems(toolbar)).toEqual([])
expect(ariaProblems(container)).toEqual([])`}</CodeBlock>
      </Section>

      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Build a new part's behaviour from these, and its look from the tokens. A part an agent writes this way is on brand and accessible from the start."
            dontText="Hand-write keyboard handling, focus traps or outside-click code in a part. Each copy drifts."
          />
          <DoDont
            doText="Give every pointer gesture a keyboard path and let the behaviour announce it."
            dontText="Ship a drag, swipe or resize that only a mouse can do."
          />
        </div>
        <p className="mt-4 text-meta text-ink-secondary">
          Modelled on UI SDK (vercel-labs/ui, Apache-2.0): the same list of behaviours, written for AiMY and its React
          products.
        </p>
      </Section>
    </>
  )
}
